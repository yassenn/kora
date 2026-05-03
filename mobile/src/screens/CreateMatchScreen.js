import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { globalStyles, colors } from '../utils/styles';
import { createMatch, checkAvailability } from '../services/api';
import DatePicker from 'react-native-date-picker';
import { useAuth } from '../context/AuthContext';
import PitchPickerModal from '../components/PitchPickerModal';
import SelectionModal from '../components/SelectionModal';

const MATCH_TYPES = [
    { label: 'Public', value: 'public' },
    { label: 'Private', value: 'private' },
];

const MATCH_SIZES = [
    { label: '5 vs 5', value: '5v5' },
    { label: '6 vs 6', value: '6v6' },
    { label: '7 vs 7', value: '7v7' },
    { label: '8 vs 8', value: '8v8' },
    { label: '9 vs 9', value: '9v9' },
    { label: '11 vs 11', value: '11v11' },
];

const DURATION_OPTIONS = [
    { label: '60 Minutes', value: '60' },
    { label: '90 Minutes', value: '90' },
    { label: '120 Minutes', value: '120' },
];

const CreateMatchScreen = ({ navigation, route }) => {
    const { user } = useAuth();
    const [pitchId, setPitchId] = useState(route?.params?.pitchId || '');
    const [pitchName, setPitchName] = useState(route?.params?.pitchName || '');
    const [matchType, setMatchType] = useState('public');
    const [matchSize, setMatchSize] = useState('5v5');
    const [duration, setDuration] = useState('60');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(null); // String e.g. "14:00:00"
    
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [venueModalVisible, setVenueModalVisible] = useState(false);
    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [sizeModalVisible, setSizeModalVisible] = useState(false);
    const [durationModalVisible, setDurationModalVisible] = useState(false);
    const [timeModalVisible, setTimeModalVisible] = useState(false);
    
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [loading, setLoading] = useState(false);

    // Generate slots from 08:00 to 22:00
    const generateSlots = useCallback((occupied) => {
        const slots = [];
        const dur = parseInt(duration);
        
        for (let hour = 8; hour < 22; hour++) {
            for (let min of [0]) { // Changed from [0, 30] to [0] for hourly slots
                const timeString = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
                const start = new Date(selectedDate);
                start.setHours(hour, min, 0, 0);
                const end = new Date(start.getTime() + dur * 60000);
                
                const isOccupied = occupied.some(occ => {
                    const occStart = new Date(occ.match_date);
                    const occEnd = new Date(occStart.getTime() + occ.duration * 60000);
                    return start < occEnd && end > occStart;
                });

                if (!isOccupied) {
                    slots.push({
                        label: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')} (Ends ${end.getHours()}:${String(end.getMinutes()).padStart(2, '0')})`,
                        value: timeString
                    });
                }
            }
        }
        setAvailableSlots(slots);
    }, [duration, selectedDate]);

    const fetchAvailability = useCallback(async () => {
        if (!pitchId) return;
        setLoadingSlots(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const res = await checkAvailability(pitchId, dateStr);
            if (res.success) {
                generateSlots(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch availability', err);
        } finally {
            setLoadingSlots(false);
        }
    }, [pitchId, selectedDate, generateSlots]);

    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    const handleSelectPitch = (pitch) => {
        setPitchId(String(pitch.id));
        setPitchName(pitch.name);
        setSelectedTime(null); 
    };

    const handleCreateMatch = async () => {
        if (!pitchId || !selectedTime) {
            Alert.alert('Error', 'Please select a venue and an available time slot');
            return;
        }
        
        setLoading(true);
        // Use local date part YYYY-MM-DD instead of toISOString() which shifts to UTC
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const datePart = `${year}-${month}-${day}`;
        
        const fullMatchDate = `${datePart} ${selectedTime}`;

        const matchData = {
            pitch_id: String(pitchId),
            match_type: matchType,
            match_size: matchSize,
            duration: parseInt(duration, 10),
            match_date: fullMatchDate,
            creator_id: String(user?.id),
        };

        console.log('[CreateMatch] Sending data:', matchData);

        try {
            const result = await createMatch(matchData);
            console.log('[CreateMatch] API Result:', result);
            if (result.success) {
                Alert.alert('Success', 'Match organized successfully!', [
                    { text: 'Great!', onPress: () => navigation.goBack() },
                ]);
            } else {
                const errorMsg = result.message || 'Failed to create match';
                const details = result.data ? JSON.stringify(result.data) : '';
                Alert.alert('Error', `${errorMsg}\n${details}`);
            }
        } catch (error) {
            console.error('[CreateMatch] Unexpected error:', error);
            Alert.alert('Error', `An unexpected error occurred: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <ScrollView contentContainerStyle={globalStyles.content}>
                <Text style={globalStyles.title}>Organize Match</Text>
                
                <View style={globalStyles.formCard}>
                    <Text style={styles.label}>Venue</Text>
                    <TouchableOpacity 
                        style={styles.pickerButton}
                        onPress={() => setVenueModalVisible(true)}
                    >
                        <Text style={pitchName ? styles.pickerValue : styles.placeholder}>
                            {pitchName || 'Select a Pitch'}
                        </Text>
                        <Text style={styles.chevron}>▼</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <View style={[globalStyles.formCard, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Type</Text>
                        <TouchableOpacity 
                            style={styles.pickerButton}
                            onPress={() => setTypeModalVisible(true)}
                        >
                            <Text style={styles.pickerValue}>
                                {MATCH_TYPES.find(t => t.value === matchType)?.label}
                            </Text>
                            <Text style={styles.chevron}>▼</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[globalStyles.formCard, { flex: 1, marginLeft: 10 }]}>
                        <Text style={styles.label}>Size</Text>
                        <TouchableOpacity 
                            style={styles.pickerButton}
                            onPress={() => setSizeModalVisible(true)}
                        >
                            <Text style={styles.pickerValue}>
                                {MATCH_SIZES.find(s => s.value === matchSize)?.label}
                            </Text>
                            <Text style={styles.chevron}>▼</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={globalStyles.formCard}>
                    <Text style={styles.label}>Duration</Text>
                    <TouchableOpacity 
                        style={styles.pickerButton}
                        onPress={() => setDurationModalVisible(true)}
                    >
                        <Text style={styles.pickerValue}>
                            {DURATION_OPTIONS.find(d => d.value === duration)?.label}
                        </Text>
                        <Text style={styles.chevron}>▼</Text>
                    </TouchableOpacity>
                </View>

                <View style={globalStyles.formCard}>
                    <Text style={styles.label}>Select Date</Text>
                    <TouchableOpacity onPress={() => setDatePickerOpen(true)} style={styles.pickerButton}>
                        <Text style={styles.pickerValue}>{selectedDate.toLocaleDateString()}</Text>
                        <Text style={styles.chevron}>▼</Text>
                    </TouchableOpacity>
                </View>

                <View style={globalStyles.formCard}>
                    <Text style={styles.label}>Available Start Times</Text>
                    <TouchableOpacity 
                        style={[styles.pickerButton, !pitchId && { opacity: 0.5 }]}
                        onPress={() => pitchId && setTimeModalVisible(true)}
                        disabled={!pitchId || loadingSlots}
                    >
                        {loadingSlots ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <>
                                <Text style={selectedTime ? styles.pickerValue : styles.placeholder}>
                                    {selectedTime ? availableSlots.find(s => s.value === selectedTime)?.label : 'Pick a time slot'}
                                </Text>
                                <Text style={styles.chevron}>▼</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <DatePicker
                    modal
                    mode="date"
                    open={datePickerOpen}
                    date={selectedDate}
                    minimumDate={new Date()}
                    onConfirm={(date) => {
                        setDatePickerOpen(false);
                        setSelectedDate(date);
                        setSelectedTime(null);
                    }}
                    onCancel={() => setDatePickerOpen(false)}
                />

                <Button 
                    title="Create Match" 
                    onPress={handleCreateMatch} 
                    disabled={loading || !selectedTime}
                    style={{ marginTop: 20 }}
                />

                <PitchPickerModal 
                    visible={venueModalVisible}
                    onClose={() => setVenueModalVisible(false)}
                    onSelectPitch={handleSelectPitch}
                    selectedValue={pitchId}
                />

                <SelectionModal
                    visible={typeModalVisible}
                    title="Match Type"
                    data={MATCH_TYPES}
                    selectedValue={matchType}
                    onSelect={setMatchType}
                    onClose={() => setTypeModalVisible(false)}
                />

                <SelectionModal
                    visible={sizeModalVisible}
                    title="Match Size"
                    data={MATCH_SIZES}
                    selectedValue={matchSize}
                    onSelect={setMatchSize}
                    onClose={() => setSizeModalVisible(false)}
                />

                <SelectionModal
                    visible={durationModalVisible}
                    title="Match Duration"
                    data={DURATION_OPTIONS}
                    selectedValue={duration}
                    onSelect={(val) => { setDuration(val); setSelectedTime(null); }}
                    onClose={() => setDurationModalVisible(false)}
                />

                <SelectionModal
                    visible={timeModalVisible}
                    title="Select Start Time"
                    data={availableSlots}
                    selectedValue={selectedTime}
                    onSelect={setSelectedTime}
                    onClose={() => setTimeModalVisible(false)}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pickerButton: {
        height: 56,
        backgroundColor: colors.surface,
        borderRadius: 16,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pickerValue: {
        fontSize: 17,
        color: colors.text,
    },
    placeholder: {
        fontSize: 17,
        color: colors.gray,
    },
    chevron: {
        fontSize: 12,
        color: colors.gray,
    },
    calendarIcon: {
        fontSize: 18,
    }
});

export default CreateMatchScreen;

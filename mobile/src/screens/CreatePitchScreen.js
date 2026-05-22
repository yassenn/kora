import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DatePicker from 'react-native-date-picker';
import Button from '../components/Button';
import { globalStyles, colors } from '../utils/styles';
import { createPitch, updatePitch } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CreatePitchScreen = ({ navigation, route }) => {
    const { user } = useAuth();
    const existingPitch = route.params?.pitch;
    
    const [name, setName] = useState(existingPitch?.name || '');
    const [location, setLocation] = useState(existingPitch?.location || '');
    const [price, setPrice] = useState(existingPitch?.price_per_hour?.toString() || '');
    const [contact, setContact] = useState(existingPitch?.contact_number || '');
    
    // Parse existing opening_hours if available
    // Expected format: "S, M, T | 08:00 - 22:00"
    const initialDays = existingPitch?.opening_hours?.split('|')[0]?.split(',')?.map(d => d.trim())?.filter(d => d) || [];
    const initialTimes = existingPitch?.opening_hours?.split('|')[1]?.split('-')?.map(t => t.trim()) || [];
    
    const [selectedDays, setSelectedDays] = useState(initialDays);
    
    const parseTime = (timeStr) => {
        if (!timeStr) return new Date();
        const [h, m] = timeStr.split(':');
        const d = new Date();
        d.setHours(parseInt(h), parseInt(m), 0, 0);
        return d;
    };

    const [startTime, setStartTime] = useState(parseTime(initialTimes[0]));
    const [endTime, setEndTime] = useState(parseTime(initialTimes[1] || '23:59'));
    
    const [openStart, setOpenStart] = useState(false);
    const [openEnd, setOpenEnd] = useState(false);
    const [loading, setLoading] = useState(false);

    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const handleSavePitch = async () => {
        if (!name || !location) {
            Alert.alert('Error', 'Name and Location are required');
            return;
        }

        if (selectedDays.length === 0) {
            Alert.alert('Error', 'Please select at least one day of operation');
            return;
        }

        const openingHours = `${selectedDays.join(', ')} | ${formatTime(startTime)} - ${formatTime(endTime)}`;

        const pitchData = {
            name: name.trim(),
            location: location.trim(),
            price_per_hour: parseFloat(price) || 0,
            contact_number: contact.trim(),
            opening_hours: openingHours,
            owner_id: user?.id,
        };

        setLoading(true);
        try {
            let result;
            if (existingPitch?.id) {
                result = await updatePitch(existingPitch.id, pitchData);
            } else {
                result = await createPitch(pitchData);
            }
            
            if (result.success) {
                Alert.alert('Success', `Pitch ${existingPitch ? 'updated' : 'registered'} successfully!`, [
                    { text: 'Great!', onPress: () => navigation.goBack() },
                ]);
            } else {
                Alert.alert('Error', result.message || 'Action failed');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <ScrollView contentContainerStyle={globalStyles.content}>
                <Text style={globalStyles.title}>{existingPitch ? 'Edit Pitch' : 'Register Venue'}</Text>
                
                <View style={styles.formSection}>
                    <Text style={styles.label}>Pitch Name</Text>
                    <TextInput 
                        style={globalStyles.input} 
                        placeholder="e.g. Wembley Stadium" 
                        value={name} 
                        onChangeText={setName}
                        placeholderTextColor={colors.gray}
                    />
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.label}>Location</Text>
                    <TextInput 
                        style={globalStyles.input} 
                        placeholder="Street, City" 
                        value={location} 
                        onChangeText={setLocation}
                        placeholderTextColor={colors.gray}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.formSection, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Price/hr ($)</Text>
                        <TextInput 
                            style={globalStyles.input} 
                            placeholder="0.00" 
                            value={price} 
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            placeholderTextColor={colors.gray}
                        />
                    </View>
                    <View style={[styles.formSection, { flex: 1, marginLeft: 10 }]}>
                        <Text style={styles.label}>Contact</Text>
                        <TextInput 
                            style={globalStyles.input} 
                            placeholder="Phone Number" 
                            value={contact} 
                            onChangeText={setContact}
                            keyboardType="phone-pad"
                            placeholderTextColor={colors.gray}
                        />
                    </View>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.label}>Available Days</Text>
                    <View style={styles.daysContainer}>
                        {DAYS.map((day, index) => {
                            const isSelected = selectedDays.includes(FULL_DAYS[index]);
                            return (
                                <TouchableOpacity 
                                    key={index} 
                                    style={[
                                        styles.dayButton, 
                                        isSelected && styles.dayButtonSelected
                                    ]}
                                    onPress={() => toggleDay(FULL_DAYS[index])}
                                >
                                    <Text style={[
                                        styles.dayText,
                                        isSelected && styles.dayTextSelected
                                    ]}>{day}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={[styles.formSection, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Start Time</Text>
                        <TouchableOpacity 
                            style={styles.timeDisplay}
                            onPress={() => setOpenStart(true)}
                        >
                            <Text style={styles.timeValue}>{formatTime(startTime)}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.formSection, { flex: 1, marginLeft: 10 }]}>
                        <Text style={styles.label}>End Time</Text>
                        <TouchableOpacity 
                            style={styles.timeDisplay}
                            onPress={() => setOpenEnd(true)}
                        >
                            <Text style={styles.timeValue}>{formatTime(endTime)}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <DatePicker
                    modal
                    mode="time"
                    open={openStart}
                    date={startTime}
                    onConfirm={(date) => {
                        setOpenStart(false);
                        setStartTime(date);
                    }}
                    onCancel={() => setOpenStart(false)}
                />

                <DatePicker
                    modal
                    mode="time"
                    open={openEnd}
                    date={endTime}
                    onConfirm={(date) => {
                        setOpenEnd(false);
                        setEndTime(date);
                    }}
                    onCancel={() => setOpenEnd(false)}
                />
                
                <Button 
                    title={existingPitch ? "Save Changes" : "Register Pitch"} 
                    onPress={handleSavePitch}
                    disabled={loading}
                    style={{ marginTop: 20 }}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    formSection: {
        marginBottom: 20,
    },
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
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    dayButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: colors.gray,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    dayButtonSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    dayText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    dayTextSelected: {
        color: colors.white,
    },
    timeDisplay: {
        height: 56,
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    }
});

export default CreatePitchScreen;

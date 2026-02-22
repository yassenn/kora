import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Button from '../components/Button';
import { globalStyles } from '../utils/styles';
import { createMatch } from '../services/api';
import DatePicker from 'react-native-date-picker';
import { useAuth } from '../context/AuthContext';
import PitchPickerModal from '../components/PitchPickerModal';

const CreateMatchScreen = ({ navigation, route }) => {
    const { user } = useAuth();
    const [pitchId, setPitchId] = useState(route?.params?.pitchId || '');
    const [pitchName, setPitchName] = useState('');
    const [matchType, setMatchType] = useState('public');
    const [matchSize, setMatchSize] = useState('5v5');
    const [duration, setDuration] = useState('60');
    const [date, setDate] = useState(new Date());
    const [open, setOpen] = useState(false);
    const [pickerModalVisible, setPickerModalVisible] = useState(false);

    const handleSelectPitch = (pitch) => {
        setPitchId(String(pitch.id));
        setPitchName(pitch.name);
    };

    const handleCreateMatch = async () => {
        // Input validation
        if (!pitchId) {
            Alert.alert('Error', 'Please select a pitch.');
            return;
        }
        if (!matchSize) {
            Alert.alert('Error', 'Please select match size.');
            return;
        }
        if (!duration || isNaN(duration) || parseInt(duration, 10) <= 0) {
            Alert.alert('Error', 'Please enter a valid duration in minutes.');
            return;
        }
        if (date < new Date()) {
            Alert.alert('Error', 'Match date cannot be in the past.');
            return;
        }

        const matchData = {
            pitch_id: pitchId,
            match_type: matchType,
            match_size: matchSize,
            duration: parseInt(duration, 10),
            match_date: date.toISOString().slice(0, 19).replace('T', ' '),
            creator_id: user?.id || 1,
        };

        try {
            const result = await createMatch(matchData);
            if (result.success || result.message === 'Match Created') {
                Alert.alert('Success', 'Match created successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                Alert.alert('Error', result.message || 'Failed to create match.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    };

    return (
        <ScrollView contentContainerStyle={globalStyles.container}>
            <Text style={globalStyles.title}>Create a Match</Text>
            
            <TouchableOpacity 
                style={globalStyles.input}
                onPress={() => setPickerModalVisible(true)}
            >
                <Text>{pitchName || 'Select a Pitch'}</Text>
            </TouchableOpacity>
            
            <PitchPickerModal 
                visible={pickerModalVisible}
                onClose={() => setPickerModalVisible(false)}
                onSelectPitch={handleSelectPitch}
            />
            
            <TextInput 
                style={globalStyles.input} 
                placeholder="Match Type (public/private)" 
                value={matchType} 
                onChangeText={setMatchType} 
            />
            <TextInput style={globalStyles.input} placeholder="Match Size (5v5, 7v7, etc.)" value={matchSize} onChangeText={setMatchSize} />
            <TextInput style={globalStyles.input} placeholder="Duration (60, 90, 120 min)" value={duration} onChangeText={setDuration} keyboardType="numeric" />

            <TouchableOpacity onPress={() => setOpen(true)} style={globalStyles.input}>
                <Text>{date.toLocaleString()}</Text>
            </TouchableOpacity>

            <DatePicker
                modal
                open={open}
                date={date}
                onConfirm={(selectedDate) => {
                    setOpen(false);
                    setDate(selectedDate);
                }}
                onCancel={() => {
                    setOpen(false);
                }}
            />
            
            <Button title="Create Match" onPress={handleCreateMatch} />
        </ScrollView>
    );
};

export default CreateMatchScreen;
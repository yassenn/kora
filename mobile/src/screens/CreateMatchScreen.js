import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import Button from '../components/Button';
import { globalStyles } from '../utils/styles';
import { createMatch } from '../services/api';
import DatePicker from 'react-native-date-picker';

const CreateMatchScreen = ({ navigation }) => {
    const [pitchId, setPitchId] = useState('');
    const [matchType, setMatchType] = useState('public');
    const [matchSize, setMatchSize] = useState('5v5');
    const [duration, setDuration] = useState('60');
    const [date, setDate] = useState(new Date());
    const [open, setOpen] = useState(false);

    const handleCreateMatch = async () => {
        if (!pitchId || !date) {
            Alert.alert('Error', 'Please fill all required fields.');
            return;
        }

        const matchData = {
            pitch_id: pitchId,
            match_type: matchType,
            match_size: matchSize,
            duration: parseInt(duration, 10),
            match_date: date.toISOString().slice(0, 19).replace('T', ' '),
            organizer_id: 1, // Assuming a logged-in user with ID 1 for now
        };

        try {
            const result = await createMatch(matchData);
            if (result.success) {
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
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Create a Match</Text>
            {/* TODO: Replace with a picker */}
            <TextInput style={globalStyles.input} placeholder="Pitch ID" value={pitchId} onChangeText={setPitchId} />
            <TextInput style={globalStyles.input} placeholder="Match Type (public/private)" value={matchType} onChangeText={setMatchType} />
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
        </View>
    );
};

export default CreateMatchScreen;
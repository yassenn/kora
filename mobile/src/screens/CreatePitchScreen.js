import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import Button from '../components/Button';
import { globalStyles } from '../utils/styles';
import { createPitch } from '../services/api';

const CreatePitchScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');

    const handleCreatePitch = async () => {
        if (!name || !location) {
            Alert.alert('Error', 'Please fill all fields.');
            return;
        }

        const pitchData = {
            name,
            location,
            owner_id: 1, // Assuming a logged-in user with ID 1 for now
        };

        try {
            const result = await createPitch(pitchData);
            if (result.success) {
                Alert.alert('Success', 'Pitch created successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                Alert.alert('Error', result.message || 'Failed to create pitch.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    };

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Create a Pitch</Text>
            <TextInput style={globalStyles.input} placeholder="Pitch Name" value={name} onChangeText={setName} />
            <TextInput style={globalStyles.input} placeholder="Location" value={location} onChangeText={setLocation} />
            <Button title="Create Pitch" onPress={handleCreatePitch} />
        </View>
    );
};

export default CreatePitchScreen;
import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView } from 'react-native';
import Button from '../components/Button';
import { globalStyles } from '../utils/styles';
import { createPitch } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreatePitchScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreatePitch = async () => {
        // Input validation
        if (!name || !name.trim()) {
            Alert.alert('Error', 'Please enter a pitch name.');
            return;
        }
        if (!location || !location.trim()) {
            Alert.alert('Error', 'Please enter a location.');
            return;
        }

        const pitchData = {
            name: name.trim(),
            location: location.trim(),
            owner_id: user?.id || 1,
        };

        setLoading(true);
        try {
            const result = await createPitch(pitchData);
            setLoading(false);
            
            // Check for success - handle both old and new response formats
            const isSuccess = result.success || result.message === 'Pitch created successfully';
            if (isSuccess) {
                Alert.alert('Success', 'Pitch created successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                Alert.alert('Error', result.message || 'Failed to create pitch.');
            }
        } catch (error) {
            setLoading(false);
            console.error('Error creating pitch:', error);
            Alert.alert('Error', error.message || 'An unexpected error occurred.');
        }
    };

    return (
        <ScrollView contentContainerStyle={globalStyles.container}>
            <Text style={globalStyles.title}>Create a Pitch</Text>
            
            <TextInput 
                style={globalStyles.input} 
                placeholder="Pitch Name" 
                value={name} 
                onChangeText={setName}
                editable={!loading}
            />
            
            <TextInput 
                style={globalStyles.input} 
                placeholder="Location" 
                value={location} 
                onChangeText={setLocation}
                editable={!loading}
            />
            
            <Button 
                title={loading ? "Creating..." : "Create Pitch"} 
                onPress={handleCreatePitch}
                disabled={loading}
            />
        </ScrollView>
    );
};

export default CreatePitchScreen;
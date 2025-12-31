import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const CreateMatchScreen = ({ navigation }) => {
    const [pitchId, setPitchId] = useState('');
    const [matchType, setMatchType] = useState('public');
    const [matchSize, setMatchSize] = useState('5v5');
    const [duration, setDuration] = useState('60');
    const [matchDate, setMatchDate] = useState('');

    const handleCreateMatch = () => {
        // TODO: Implement create match logic
        console.log('Create Match pressed');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create a Match</Text>
            {/* TODO: Replace with a picker */}
            <TextInput style={styles.input} placeholder="Pitch ID" value={pitchId} onChangeText={setPitchId} />
            <TextInput style={styles.input} placeholder="Match Type (public/private)" value={matchType} onChangeText={setMatchType} />
            <TextInput style={styles.input} placeholder="Match Size (5v5, 7v7, etc.)" value={matchSize} onChangeText={setMatchSize} />
            <TextInput style={styles.input} placeholder="Duration (60, 90, 120 min)" value={duration} onChangeText={setDuration} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD HH:MM)" value={matchDate} onChangeText={setMatchDate} />
            
            <Button title="Create Match" onPress={handleCreateMatch} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        padding: 10,
    },
});

export default CreateMatchScreen;

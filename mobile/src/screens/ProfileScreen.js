import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const ProfileScreen = ({ navigation }) => {
    const [userStats, setUserStats] = useState(null);
    const userId = '1'; // Hardcoded for now

    useEffect(() => {
        // TODO: Fetch user stats from API
        const dummyStats = {
            matches_played: 10,
            total_goals: 5,
            total_assists: 8,
        };
        setUserStats(dummyStats);
    }, [userId]);

    const handleLogout = () => {
        // TODO: Implement logout logic
        console.log('Logout pressed');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Stats</Text>
            {userStats ? (
                <View>
                    <Text style={styles.stat}>Matches Played: {userStats.matches_played}</Text>
                    <Text style={styles.stat}>Total Goals: {userStats.total_goals}</Text>
                    <Text style={styles.stat}>Total Assists: {userStats.total_assists}</Text>
                </View>
            ) : (
                <Text>Loading stats...</Text>
            )}
            <Button title="Logout" onPress={handleLogout} />
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
        marginBottom: 20,
    },
    stat: {
        fontSize: 18,
        marginBottom: 10,
    }
});

export default ProfileScreen;

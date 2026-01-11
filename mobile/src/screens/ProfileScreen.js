import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import Button from '../components/Button';
import { globalStyles } from '../utils/styles';
import { getUserStats } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user, logout } = useAuth();
    const userId = user?.id;

    useEffect(() => {
        let mounted = true;
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getUserStats(userId);
                if (!mounted) return;
                if (res && !res.message) setUserStats(res);
                else setError(res?.message || 'Stats not found');
            } catch (err) {
                if (!mounted) return;
                setError(err.message || 'Network error');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        if (userId) fetchStats();
        return () => { mounted = false; };
    }, [userId]);

    const handleLogout = async () => {
        await logout();
        Alert.alert('Logout', 'You have been logged out.');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Your Stats</Text>
            {userStats ? (
                <View style={globalStyles.card}>
                    <Text style={globalStyles.stat}>Matches Played: {userStats.matches_played}</Text>
                    <Text style={globalStyles.stat}>Total Goals: {userStats.total_goals}</Text>
                    <Text style={globalStyles.stat}>Total Assists: {userStats.total_assists}</Text>
                </View>
            ) : (
                <Text>Loading stats...</Text>
            )}
            <Button title="Create Pitch" onPress={() => navigation.navigate('CreatePitch')} />
            <Button title="Logout" onPress={handleLogout} />
        </View>
    );
};

export default ProfileScreen;
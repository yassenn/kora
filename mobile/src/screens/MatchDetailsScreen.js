import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import Button from '../components/Button';
import { globalStyles } from '../utils/styles';
import { getMatchDetails, joinMatch } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MatchDetailsScreen = ({ route, navigation }) => {
    const { matchId } = route.params;
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const fetchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getMatchDetails(matchId);
                if (!mounted) return;
                if (res && !res.message) setMatch(res);
                else setError(res?.message || 'Match not found');
            } catch (err) {
                if (!mounted) return;
                setError(err.message || 'Network error');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchDetails();
        return () => { mounted = false; };
    }, [matchId]);

    const { user } = useAuth();

    const handleJoinMatch = async () => {
        const playerId = user?.id;
        if (!playerId) {
            Alert.alert('Login required', 'Please login to join matches');
            return;
        }
        try {
            const res = await joinMatch(matchId, playerId);
            if (res && res.message) {
                Alert.alert('Info', res.message);
                // refetch details to show updated players
                const updated = await getMatchDetails(matchId);
                if (updated && !updated.message) setMatch(updated);
            } else {
                Alert.alert('Joined', 'You joined the match');
                const updated = await getMatchDetails(matchId);
                if (updated && !updated.message) setMatch(updated);
            }
        } catch (err) {
            Alert.alert('Error', err.message || 'Could not join match');
        }
    };

    if (loading) {
        return (
            <View style={globalStyles.container}>
                <ActivityIndicator style={{ marginTop: 20 }} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={globalStyles.container}>
                <Text style={{ color: 'red', margin: 16 }}>{error}</Text>
            </View>
        );
    }

    if (!match) {
        return (
            <View style={globalStyles.container}>
                <Text>No match data</Text>
            </View>
        );
    }

    return (
        <View style={globalStyles.container}>
            <View style={globalStyles.card}>
                <Text style={globalStyles.cardTitle}>{match.pitch_name}</Text>
                <Text>{new Date(match.match_date).toLocaleString()}</Text>
                <Text>Size: {match.match_size}</Text>
                <Text>Type: {match.match_type}</Text>
                <Text>Duration: {match.duration} minutes</Text>
            </View>

            <View style={globalStyles.card}>
                <Text style={globalStyles.cardTitle}>Players</Text>
                <FlatList
                    data={match.players}
                    renderItem={({ item }) => <Text style={globalStyles.stat}>{item.username}</Text>}
                    keyExtractor={item => item.id}
                />
            </View>

            <Button title="Join Match" onPress={handleJoinMatch} />
        </View>
    );
};

export default MatchDetailsScreen;
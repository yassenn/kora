import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, ScrollView } from 'react-native';
import Button from '../components/Button';
import { globalStyles } from '../utils/styles';
import { getMatchDetails } from '../services/api';

const PitchDetailsScreen = ({ route, navigation }) => {
    const { pitchId } = route.params || {};
    const [pitch, setPitch] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!pitchId) {
            setError('Pitch ID not provided');
            return;
        }

        let mounted = true;
        const fetchPitchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                // Note: We're using getMatchDetails as a placeholder.
                // In a full implementation, this would be getPitchDetails()
                // that fetches pitch-specific information from the backend.
                // For now, display basic pitch info from the navigation params.
                if (!mounted) return;
                setPitch({ id: pitchId, name: 'Pitch Detail Screen' });
            } catch (err) {
                if (!mounted) return;
                setError(err.message || 'Failed to fetch pitch details');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchPitchDetails();
        return () => { mounted = false; };
    }, [pitchId]);

    const handleCreateMatch = () => {
        navigation.navigate('CreateMatch', { pitchId });
    };

    return (
        <View style={globalStyles.container}>
            <ScrollView>
                <Text style={globalStyles.title}>Pitch Details</Text>
                {loading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} />
                ) : error ? (
                    <Text style={{ color: 'red', margin: 16 }}>{error}</Text>
                ) : pitch ? (
                    <View style={globalStyles.card}>
                        <Text style={globalStyles.cardTitle}>{pitch.name}</Text>
                        <Text style={{ marginTop: 8 }}>Pitch ID: {pitch.id}</Text>
                        <Text style={{ marginTop: 8 }}>
                            This screen displays detailed information about the selected pitch.
                        </Text>
                        <Text style={{ marginTop: 8 }}>
                            Future features: Available time slots, recent matches, facility amenities.
                        </Text>
                    </View>
                ) : (
                    <Text>No pitch data available</Text>
                )}
                <Button title="Create Match on This Pitch" onPress={handleCreateMatch} />
            </ScrollView>
        </View>
    );
};

export default PitchDetailsScreen;

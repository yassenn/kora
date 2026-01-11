import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { globalStyles } from '../utils/styles';
import { getPitches } from '../services/api';

const PitchesListScreen = ({ navigation }) => {
    const [pitches, setPitches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const fetchPitches = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getPitches();
                if (!mounted) return;
                if (Array.isArray(res)) setPitches(res);
                else setError(res?.message || 'Unexpected response from server');
            } catch (err) {
                if (!mounted) return;
                setError(err.message || 'Network error');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchPitches();
        return () => { mounted = false; };
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('PitchDetails', { pitchId: item.id })}>
            <View style={globalStyles.card}>
                <Text style={globalStyles.cardTitle}>{item.name}</Text>
                <Text>{item.location}</Text>
                <Text>Status: {item.status}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={globalStyles.container}>
            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
            ) : error ? (
                <Text style={{ color: 'red', margin: 16 }}>{error}</Text>
            ) : (
                <FlatList
                    data={pitches}
                    renderItem={renderItem}
                    keyExtractor={item => String(item.id)}
                />
            )}
        </View>
    );
};

export default PitchesListScreen;

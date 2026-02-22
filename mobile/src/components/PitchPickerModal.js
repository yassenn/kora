import React, { useState, useEffect } from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { globalStyles } from '../utils/styles';
import { getPitches } from '../services/api';

const PitchPickerModal = ({ visible, onClose, onSelectPitch }) => {
    const [pitches, setPitches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (visible) {
            fetchPitches();
        }
    }, [visible]);

    const fetchPitches = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getPitches();
            if (Array.isArray(res)) {
                setPitches(res);
            } else {
                setError(res?.message || 'Failed to fetch pitches');
            }
        } catch (err) {
            setError(err.message || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPitch = (pitch) => {
        onSelectPitch(pitch);
        onClose();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[globalStyles.card, { marginVertical: 8 }]}
            onPress={() => handleSelectPitch(item)}
        >
            <Text style={globalStyles.cardTitle}>{item.name}</Text>
            <Text style={{ marginTop: 4 }}>{item.location}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <View style={{ flex: 1, backgroundColor: 'white', marginTop: 50 }}>
                    <Text style={[globalStyles.title, { margin: 16 }]}>Select a Pitch</Text>
                    {loading ? (
                        <ActivityIndicator style={{ marginTop: 20 }} size="large" />
                    ) : error ? (
                        <Text style={{ color: 'red', margin: 16 }}>{error}</Text>
                    ) : (
                        <FlatList
                            data={pitches}
                            renderItem={renderItem}
                            keyExtractor={item => String(item.id)}
                            contentContainerStyle={{ padding: 16 }}
                        />
                    )}
                    <TouchableOpacity
                        style={[globalStyles.card, { margin: 16, padding: 16, backgroundColor: '#f0f0f0' }]}
                        onPress={onClose}
                    >
                        <Text style={{ textAlign: 'center', fontSize: 16 }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default PitchPickerModal;

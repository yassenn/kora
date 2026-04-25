import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../utils/styles';
import { getPitches } from '../services/api';

const PitchPickerModal = ({ visible, onClose, onSelectPitch, selectedValue }) => {
    const [pitches, setPitches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPitches = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getPitches();
            if (res && res.success && Array.isArray(res.data)) {
                const approved = res.data.filter(p => p.status === 'approved');
                setPitches(approved);
            } else if (Array.isArray(res)) {
                const approved = res.filter(p => p.status === 'approved');
                setPitches(approved);
            } else {
                setError(res?.message || 'Failed to fetch pitches');
            }
        } catch (err) {
            setError(err.message || 'Network error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (visible) {
            fetchPitches();
        }
    }, [visible, fetchPitches]);

    const handleSelectPitch = (pitch) => {
        onSelectPitch(pitch);
        onClose();
    };

    const renderItem = ({ item }) => {
        const isSelected = String(item.id) === String(selectedValue);
        return (
            <TouchableOpacity
                style={[
                    styles.itemCard, 
                    isSelected && styles.selectedItem
                ]}
                onPress={() => handleSelectPitch(item)}
                activeOpacity={0.7}
            >
                <View style={{ flex: 1 }}>
                    <Text style={[styles.pitchName, isSelected && styles.selectedText]}>
                        {item.name}
                    </Text>
                    <Text style={globalStyles.caption}>{item.location}</Text>
                    <Text style={[styles.price, isSelected && styles.selectedText]}>
                        ${item.price_per_hour}/hr
                    </Text>
                </View>
                {isSelected && <Text style={styles.checkIcon}>✓</Text>}
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={globalStyles.subtitle}>Select Venue</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {loading ? (
                        <View style={globalStyles.centered}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    ) : error ? (
                        <View style={globalStyles.centered}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity onPress={fetchPitches} style={{ marginTop: 20 }}>
                                <Text style={{ color: colors.primary, fontWeight: '700' }}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            data={pitches}
                            renderItem={renderItem}
                            keyExtractor={item => String(item.id)}
                            contentContainerStyle={{ padding: 24 }}
                            ListEmptyComponent={
                                <View style={styles.empty}>
                                    <Text style={globalStyles.caption}>No approved pitches available.</Text>
                                </View>
                            }
                        />
                    )}
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        maxHeight: '80%',
        backgroundColor: colors.surface,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 10,
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 16,
        backgroundColor: colors.background,
        marginBottom: 12,
    },
    selectedItem: {
        backgroundColor: colors.primary + '15',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    pitchName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    price: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '700',
        color: colors.success,
    },
    selectedText: {
        color: colors.primary,
    },
    checkIcon: {
        color: colors.primary,
        fontSize: 18,
        fontWeight: '900',
        marginLeft: 12,
    },
    closeIcon: {
        fontSize: 20,
        color: colors.textSecondary,
        fontWeight: '700',
    },
    errorText: {
        color: colors.danger,
        textAlign: 'center',
    },
    empty: {
        alignItems: 'center',
        marginTop: 40,
    }
});

export default PitchPickerModal;

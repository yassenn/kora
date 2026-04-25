import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { globalStyles, colors } from '../utils/styles';
import { getPitches } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const MyPitchesScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [pitches, setPitches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyPitches = useCallback(async () => {
        if (!user) return;
        try {
            const res = await getPitches();
            if (res && res.success) {
                // Filter pitches owned by the current user
                const myPitches = res.data.filter(p => p.owner_id === user.id);
                setPitches(myPitches);
            }
        } catch (err) {
            console.error('Failed to fetch my pitches:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMyPitches();
    }, [fetchMyPitches]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyPitches();
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return { backgroundColor: colors.success };
            case 'pending': return { backgroundColor: colors.warning };
            case 'denied': return { backgroundColor: colors.danger };
            default: return { backgroundColor: colors.gray };
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={globalStyles.card}
            onPress={() => navigation.navigate('PitchDetails', { id: item.id })}
            activeOpacity={0.8}
        >
            <View style={[globalStyles.row, globalStyles.justifyBetween]}>
                <Text style={styles.pitchName}>{item.name}</Text>
                <View style={[globalStyles.badge, getStatusStyle(item.status)]}>
                    <Text style={globalStyles.badgeText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>
            <Text style={globalStyles.caption}>{item.location}</Text>
            <View style={styles.details}>
                <Text style={styles.price}>${item.price_per_hour}/hr</Text>
            </View>
            <View style={styles.actions}>
                <Button 
                    title="Edit" 
                    onPress={() => navigation.navigate('CreatePitch', { pitch: item })}
                    variant="secondary"
                    style={styles.actionButton}
                />
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={globalStyles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={globalStyles.container}>
            <FlatList
                contentContainerStyle={globalStyles.content}
                data={pitches}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={globalStyles.subtitle}>No pitches yet</Text>
                        <Text style={[globalStyles.caption, { textAlign: 'center', marginBottom: 20 }]}>
                            You haven't registered any pitches. Start earning by adding your first soccer pitch!
                        </Text>
                        <Button title="Register a Pitch" onPress={() => navigation.navigate('CreatePitch')} />
                    </View>
                }
                ListHeaderComponent={
                    pitches.length > 0 && (
                        <Button 
                            title="+ Add New Pitch" 
                            onPress={() => navigation.navigate('CreatePitch')} 
                            style={{ marginBottom: 20 }}
                        />
                    )
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    pitchName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
    },
    details: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
    },
    actions: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
        paddingTop: 12,
    },
    actionButton: {
        height: 40,
        marginVertical: 0,
    },
    empty: {
        alignItems: 'center',
        marginTop: 60,
    }
});

export default MyPitchesScreen;

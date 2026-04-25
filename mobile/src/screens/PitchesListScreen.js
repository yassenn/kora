import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../utils/styles';
import { getPitches } from '../services/api';
import Button from '../components/Button';

const PitchesListScreen = ({ navigation }) => {
    const [pitches, setPitches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPitches = useCallback(async () => {
        try {
            const res = await getPitches();
            if (res && res.success) {
                // Show only approved pitches to players
                setPitches(res.data.filter(p => p.status === 'approved'));
            }
        } catch (err) {
            console.error('Failed to fetch pitches:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPitches();
    }, [fetchPitches]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPitches();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={globalStyles.card}
            onPress={() => navigation.navigate('PitchDetails', { id: item.id })}
            activeOpacity={0.8}
        >
            <View style={[globalStyles.row, globalStyles.justifyBetween]}>
                <Text style={styles.pitchName}>{item.name}</Text>
                <Text style={styles.price}>${item.price_per_hour}/hr</Text>
            </View>
            
            <View style={[globalStyles.row, { marginTop: 8 }]}>
                <Text style={styles.icon}>📍</Text>
                <Text style={globalStyles.caption}>{item.location}</Text>
            </View>
            
            <View style={styles.footer}>
                <Text style={styles.hours}>🕒 {item.opening_hours || 'Open 24/7'}</Text>
                <Text style={styles.bookNow}>Book Now →</Text>
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
        <SafeAreaView style={globalStyles.container}>
            <FlatList
                contentContainerStyle={globalStyles.content}
                data={pitches}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
                ListHeaderComponent={
                    <Text style={[globalStyles.subtitle, { marginBottom: 20 }]}>Available Pitches</Text>
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={globalStyles.caption}>No pitches available in your area.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    pitchName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.success,
    },
    icon: {
        fontSize: 14,
        marginRight: 6,
    },
    footer: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    hours: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    bookNow: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.primary,
    },
    empty: {
        alignItems: 'center',
        marginTop: 60,
    }
});

export default PitchesListScreen;

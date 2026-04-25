import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../utils/styles';
import { getPitches, updatePitchStatus } from '../services/api';
import Button from '../components/Button';

const AdminPitchesScreen = () => {
    const [pitches, setPitches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPitches = useCallback(async () => {
        try {
            const res = await getPitches();
            if (res && res.success) {
                setPitches(res.data);
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

    const handleUpdateStatus = async (id, status) => {
        try {
            const res = await updatePitchStatus(id, status);
            if (res && res.success) {
                Alert.alert('Success', `Pitch ${status} successfully`);
                fetchPitches();
            } else {
                Alert.alert('Error', res?.message || 'Action failed');
            }
        } catch (err) {
            Alert.alert('Error', err.message || 'An unexpected error occurred');
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchPitches();
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return { borderColor: colors.success, borderWidth: 1 };
            case 'pending': return { borderColor: colors.warning, borderWidth: 1 };
            case 'denied': return { borderColor: colors.danger, borderWidth: 1 };
            default: return { borderColor: 'rgba(0,0,0,0.05)', borderWidth: 1 };
        }
    };

    const getStatusTextColor = (status) => {
        switch (status) {
            case 'approved': return { color: colors.success };
            case 'pending': return { color: colors.warning };
            case 'denied': return { color: colors.danger };
            default: return { color: colors.gray };
        }
    };

    const renderItem = ({ item }) => (
        <View style={[globalStyles.card, getStatusStyle(item.status)]}>
            <View style={[globalStyles.row, globalStyles.justifyBetween]}>
                <Text style={styles.pitchName}>{item.name}</Text>
                <View>
                    <Text style={[styles.statusText, getStatusTextColor(item.status)]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>
            <Text style={globalStyles.caption}>{item.location}</Text>
            
            {item.status === 'pending' && (
                <View style={styles.actions}>
                    <Button 
                        title="Approve" 
                        onPress={() => handleUpdateStatus(item.id, 'approved')}
                        style={[styles.actionButton, { backgroundColor: colors.success, flex: 1, marginRight: 8 }]}
                    />
                    <Button 
                        title="Deny" 
                        onPress={() => handleUpdateStatus(item.id, 'denied')}
                        variant="secondary"
                        style={[styles.actionButton, { borderColor: colors.danger, flex: 1, marginLeft: 8 }]}
                    />
                </View>
            )}
        </View>
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={globalStyles.container}>
                <View style={globalStyles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
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
                    <Text style={globalStyles.title}>Pitch Approvals</Text>
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={globalStyles.caption}>No pitches found.</Text>
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
    statusText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    actions: {
        flexDirection: 'row',
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
        paddingTop: 16,
    },
    actionButton: {
        height: 44,
        marginVertical: 0,
    },
    empty: {
        alignItems: 'center',
        marginTop: 60,
    }
});

export default AdminPitchesScreen;

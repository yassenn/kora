import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../utils/styles';
import { getInvitations, respondToInvitation } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const InvitationsScreen = () => {
    const { user } = useAuth();
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchInvitations = useCallback(async () => {
        if (!user) return;
        try {
            const res = await getInvitations(user.id);
            if (res && res.success) {
                setInvitations(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch invitations:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    const handleResponse = async (id, status) => {
        try {
            const res = await respondToInvitation(id, status);
            if (res && res.success) {
                Alert.alert('Success', `Invitation ${status}`);
                setInvitations(prev => prev.filter(i => i.id !== id));
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to respond to invitation');
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchInvitations();
    };

    const renderItem = ({ item }) => (
        <View style={globalStyles.card}>
            <Text style={styles.inviterName}>{item.inviter_name} invited you to a match!</Text>
            <View style={styles.matchInfo}>
                <Text style={styles.pitchName}>{item.pitch_name}</Text>
                <Text style={globalStyles.caption}>{new Date(item.match_date).toLocaleString()}</Text>
            </View>
            <View style={[globalStyles.row, { marginTop: 16 }]}>
                <Button 
                    title="Accept" 
                    onPress={() => handleResponse(item.id, 'accepted')}
                    style={[styles.actionButton, { backgroundColor: colors.success, flex: 1, marginRight: 8 }]}
                />
                <Button 
                    title="Decline" 
                    onPress={() => handleResponse(item.id, 'declined')}
                    variant="secondary"
                    style={[styles.actionButton, { borderColor: colors.danger, flex: 1, marginLeft: 8 }]}
                />
            </View>
        </View>
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
                data={invitations}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={globalStyles.caption}>No pending invitations.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    inviterName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    matchInfo: {
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
    },
    pitchName: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    actionButton: {
        height: 44,
        marginVertical: 0,
    },
    empty: {
        alignItems: 'center',
        marginTop: 40,
    }
});

export default InvitationsScreen;

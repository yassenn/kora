import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../utils/styles';
import { getNotifications, markNotificationRead } from '../services/api';
import { useAuth } from '../context/AuthContext';

const NotificationsScreen = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await getNotifications(user.id);
            if (res && res.success) {
                setNotifications(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
            );
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={[styles.notificationCard, item.is_read ? styles.read : styles.unread]}
            onPress={() => !item.is_read && handleMarkAsRead(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.dotContainer}>
                {!item.is_read && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.content}>
                <Text style={[styles.message, !item.is_read && styles.bold]}>{item.message}</Text>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
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
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={globalStyles.caption}>No notifications yet.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: colors.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    unread: {
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    read: {
        opacity: 0.8,
    },
    dotContainer: {
        width: 12,
        justifyContent: 'center',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
    content: {
        flex: 1,
        marginLeft: 8,
    },
    message: {
        fontSize: 16,
        color: colors.text,
        marginBottom: 4,
    },
    bold: {
        fontWeight: '700',
    },
    date: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    empty: {
        alignItems: 'center',
        marginTop: 40,
    }
});

export default NotificationsScreen;

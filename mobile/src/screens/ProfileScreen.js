import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { globalStyles, colors } from '../utils/styles';
import { getUserStats, switchUserRole } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user, logout, updateUser } = useAuth();

    const fetchStats = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await getUserStats(user.id);
            if (res && res.success) {
                setStats(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Logout', 
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    }
                }
            ]
        );
    };

    const handleSwitchRole = async (newRole) => {
        try {
            const res = await switchUserRole(user.id, newRole);
            if (res.success) {
                const updatedUser = { ...user, user_type: newRole };
                await updateUser(updatedUser);
                Alert.alert('Success', `Switched to ${newRole.replace('_', ' ')} mode`);
            } else {
                Alert.alert('Error', res.message || 'Failed to switch role');
            }
        } catch (err) {
            Alert.alert('Error', err.message || 'An unexpected error occurred');
        }
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <ScrollView contentContainerStyle={globalStyles.content}>
                <View style={styles.header}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.username}>{user?.username}</Text>
                    <Text style={globalStyles.caption}>{user?.email}</Text>
                    <View style={[globalStyles.badge, { backgroundColor: colors.primary, marginTop: 12, alignSelf: 'center' }]}>
                        <Text style={globalStyles.badgeText}>{user?.user_type?.replace('_', ' ').toUpperCase()}</Text>
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats?.matches_played || 0}</Text>
                        <Text style={styles.statLabel}>Matches</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats?.total_goals || 0}</Text>
                        <Text style={styles.statLabel}>Goals</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats?.total_assists || 0}</Text>
                        <Text style={styles.statLabel}>Assists</Text>
                    </View>
                </View>

                <View style={{ marginTop: 20 }}>
                    <Text style={[globalStyles.subtitle, { marginBottom: 16 }]}>Account Actions</Text>
                    
                    {user?.user_type === 'pitch_owner' && (
                        <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('Manage')}
                        >
                            <Text style={styles.menuItemText}>🏟️ Manage My Pitches</Text>
                            <Text style={styles.chevron}>→</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('HomeTab', { screen: 'Notifications' })}
                    >
                        <Text style={styles.menuItemText}>🔔 Notifications</Text>
                        <Text style={styles.chevron}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('HomeTab', { screen: 'Invitations' })}
                    >
                        <Text style={styles.menuItemText}>✉️ Match Invitations</Text>
                        <Text style={styles.chevron}>→</Text>
                    </TouchableOpacity>

                    {user?.user_type === 'admin' && (
                        <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('Admin')}
                        >
                            <Text style={styles.menuItemText}>🛡️ Admin Control Panel</Text>
                            <Text style={styles.chevron}>→</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ marginTop: 30 }}>
                    <Text style={[globalStyles.subtitle, { marginBottom: 16 }]}>Dev Tools: Switch Role</Text>
                    <View style={styles.roleSwitcher}>
                        <TouchableOpacity 
                            style={[styles.roleButton, user?.user_type === 'player' && styles.activeRole]} 
                            onPress={() => handleSwitchRole('player')}
                        >
                            <Text style={[styles.roleButtonText, user?.user_type === 'player' && styles.activeRoleText]}>Player</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.roleButton, user?.user_type === 'pitch_owner' && styles.activeRole]} 
                            onPress={() => handleSwitchRole('pitch_owner')}
                        >
                            <Text style={[styles.roleButtonText, user?.user_type === 'pitch_owner' && styles.activeRoleText]}>Owner</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.roleButton, user?.user_type === 'admin' && styles.activeRole]} 
                            onPress={() => handleSwitchRole('admin')}
                        >
                            <Text style={[styles.roleButtonText, user?.user_type === 'admin' && styles.activeRoleText]}>Admin</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Button 
                        title="Sign Out" 
                        onPress={handleLogout} 
                        variant="secondary"
                        style={{ borderColor: colors.danger }}
                    />
                    <Text style={[globalStyles.caption, { textAlign: 'center', marginTop: 20 }]}>
                        Kora Version 1.0.0
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '800',
        color: colors.primary,
    },
    username: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginHorizontal: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.primary,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: 18,
        borderRadius: 16,
        marginBottom: 12,
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    chevron: {
        fontSize: 18,
        color: colors.gray,
    },
    roleSwitcher: {
        flexDirection: 'row',
        backgroundColor: colors.lightGray,
        padding: 4,
        borderRadius: 14,
        justifyContent: 'space-between',
    },
    roleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeRole: {
        backgroundColor: colors.white,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    roleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    activeRoleText: {
        color: colors.primary,
    },
    footer: {
        marginTop: 40,
        marginBottom: 20,
    }
});

export default ProfileScreen;

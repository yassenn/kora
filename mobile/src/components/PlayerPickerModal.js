import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../utils/styles';
import { getFriends } from '../services/api';

const PlayerPickerModal = ({ visible, onClose, onInvitePlayer, alreadyInvitedIds }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getFriends();
            if (res && res.success && Array.isArray(res.data)) {
                setUsers(res.data);
            } else {
                setError(res?.message || 'Failed to fetch friends');
            }
        } catch (err) {
            setError(err.message || 'Network error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (visible) {
            fetchUsers();
        }
    }, [visible, fetchUsers]);

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const renderItem = ({ item }) => {
        const isInvited = alreadyInvitedIds?.includes(item.id);
        
        return (
            <View style={styles.itemCard}>
                <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.userName} numberOfLines={1}>{item.username}</Text>
                    <Text style={globalStyles.caption} numberOfLines={1}>{item.email}</Text>
                </View>
                {isInvited ? (
                    <View style={[styles.inviteButton, { backgroundColor: colors.lightGray }]}>
                        <Text style={styles.invitedText}>Invited</Text>
                    </View>
                ) : (
                    <TouchableOpacity 
                        style={styles.inviteButton}
                        onPress={() => onInvitePlayer(item.id)}
                    >
                        <Text style={styles.inviteButtonText}>Invite</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={globalStyles.subtitle}>Invite Players</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name or email..."
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                    
                    {loading ? (
                        <View style={globalStyles.centered}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    ) : error ? (
                        <View style={globalStyles.centered}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity onPress={fetchUsers} style={{ marginTop: 20 }}>
                                <Text style={{ color: colors.primary, fontWeight: '700' }}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredUsers}
                            renderItem={renderItem}
                            keyExtractor={item => String(item.id)}
                            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
                            ListEmptyComponent={
                                <View style={styles.empty}>
                                    <Text style={globalStyles.caption}>No players found.</Text>
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
        height: '85%',
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
    searchContainer: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    searchInput: {
        backgroundColor: colors.background,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.lightGray,
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 2,
    },
    inviteButton: {
        backgroundColor: colors.primary,
        width: 80,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inviteButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    invitedText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '700',
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

export default PlayerPickerModal;
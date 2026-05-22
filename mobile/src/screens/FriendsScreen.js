import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../utils/styles';
import { getFriends, getPendingFriends, acceptFriendRequest } from '../services/api';

const FriendsScreen = ({ navigation }) => {
    const [friends, setFriends] = useState([]);
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [fRes, pRes] = await Promise.all([
                getFriends(),
                getPendingFriends()
            ]);
            if (fRes.success) setFriends(fRes.data);
            if (pRes.success) setPending(pRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAccept = async (id) => {
        try {
            const res = await acceptFriendRequest(id);
            if (res.success) {
                Alert.alert('Success', 'Friend request accepted!');
                loadData();
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to accept request');
        }
    };

    const renderFriend = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.name}>{item.username}</Text>
                <Text style={styles.role}>{item.user_type}</Text>
            </View>
        </View>
    );

    const renderPending = ({ item }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.username}</Text>
                <Text style={globalStyles.caption}>Sent {new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.id)}>
                <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={globalStyles.container}>
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={globalStyles.container}>
            <View style={globalStyles.content}>
                <View style={[globalStyles.row, globalStyles.justifyBetween, { alignItems: 'center', marginBottom: 20 }]}>
                    <Text style={globalStyles.title}>My Friends</Text>
                    <TouchableOpacity 
                        style={styles.addFriendBtn} 
                        onPress={() => navigation.navigate('PlayerSearch')}
                    >
                        <Text style={styles.addFriendText}>+ Find</Text>
                    </TouchableOpacity>
                </View>
                
                {pending.length > 0 && (
                    <>
                        <Text style={[globalStyles.subtitle, { marginBottom: 10 }]}>Pending Requests ({pending.length})</Text>
                        <FlatList
                            data={pending}
                            keyExtractor={item => 'p' + item.id}
                            renderItem={renderPending}
                            scrollEnabled={false}
                            style={{ marginBottom: 20 }}
                        />
                    </>
                )}

                <Text style={[globalStyles.subtitle, { marginBottom: 10 }]}>Friend List</Text>
                <FlatList
                    data={friends}
                    keyExtractor={item => 'f' + item.id}
                    renderItem={renderFriend}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={globalStyles.body}>No friends yet. Start inviting!</Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    role: {
        fontSize: 12,
        color: colors.textSecondary,
        textTransform: 'capitalize',
    },
    acceptBtn: {
        backgroundColor: colors.success,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    acceptText: {
        color: colors.white,
        fontWeight: '700',
        fontSize: 13,
    },
    addFriendBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 10,
    },
    addFriendText: {
        color: colors.white,
        fontWeight: '700',
    },
    empty: {
        marginTop: 40,
        alignItems: 'center',
    }
});

export default FriendsScreen;

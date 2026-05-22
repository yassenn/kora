import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../utils/styles';
import { getUsers, sendFriendRequest, getFriends } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PlayerSearchScreen = ({ navigation }) => {
    const { user: currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const [players, setPlayers] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async (searchTerm = '') => {
        setLoading(true);
        try {
            const uRes = await getUsers(searchTerm);
            if (uRes.success) {
                // If backend already filters current user when searching, 
                // we only need to filter if it's the initial "all users" fetch 
                // (if the backend getUsers() doesn't filter)
                setPlayers(uRes.data.filter(u => u.id !== currentUser.id));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentUser.id]);

    const loadFriends = useCallback(async () => {
        try {
            const fRes = await getFriends();
            if (fRes.success) setFriends(fRes.data.map(f => f.id));
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        loadFriends();
        loadData(); // Initial load of all users
    }, [loadFriends, loadData]);

    const handleSearch = () => {
        loadData(search);
    };

    const handleAddFriend = async (id) => {
        try {
            const res = await sendFriendRequest(id);
            if (res.success) {
                Alert.alert('Success', 'Friend request sent!');
            } else {
                Alert.alert('Notice', res.message);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to send request');
        }
    };

    const renderPlayer = ({ item }) => {
        const isFriend = friends.includes(item.id);
        
        return (
            <View style={styles.card}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.name}>{item.username}</Text>
                    <Text style={styles.role}>{item.user_type}</Text>
                </View>
                {isFriend ? (
                    <Text style={styles.friendText}>Friend ✓</Text>
                ) : (
                    <TouchableOpacity style={styles.addBtn} onPress={() => handleAddFriend(item.id)}>
                        <Text style={styles.addText}>Add Friend</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <View style={globalStyles.content}>
                <Text style={globalStyles.title}>Find Players</Text>
                
                <View style={styles.searchContainer}>
                    <TextInput
                        style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
                        placeholder="Search by username..."
                        value={search}
                        onChangeText={setSearch}
                    />
                    <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                        <Text style={styles.searchBtnText}>Search</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                    <FlatList
                        data={players}
                        keyExtractor={item => String(item.id)}
                        renderItem={renderPlayer}
                        ListEmptyComponent={<Text style={{textAlign:'center', marginTop: 20}}>No players found.</Text>}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    searchBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: 15,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    searchBtnText: {
        color: colors.white,
        fontWeight: 'bold',
    },
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
        backgroundColor: colors.gray,
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
    },
    addBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    addText: {
        color: colors.white,
        fontWeight: '700',
        fontSize: 12,
    },
    friendText: {
        color: colors.success,
        fontWeight: '700',
        fontSize: 12,
    }
});

export default PlayerSearchScreen;

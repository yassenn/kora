import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../utils/styles';
import { getPublicMatches } from '../services/api';
import Button from '../components/Button';

const MatchesListScreen = ({ navigation }) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMatches = useCallback(async () => {
        try {
            const res = await getPublicMatches();
            if (res && res.success) {
                setMatches(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch matches:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchMatches();
    }, [fetchMatches]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMatches();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={globalStyles.card}
            onPress={() => navigation.navigate('MatchDetails', { id: item.id })}
            activeOpacity={0.8}
        >
            <View style={[globalStyles.row, { marginBottom: 4 }]}>
                <Text style={styles.pitchName}>{item.pitch_name}</Text>
                <Text style={[styles.sizeText, { marginLeft: 8 }]}>{item.match_size}</Text>
            </View>
            
            <View style={[globalStyles.row, { marginTop: 12 }]}>
                <Text style={globalStyles.body}>
                    📅 {new Date(item.match_date).toLocaleDateString()}  •  {new Date(item.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            
            <View style={[globalStyles.row, { marginTop: 8 }]}>
                <Text style={globalStyles.body}>⏱️ {item.duration} minutes</Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.matchType}>{item.match_type.toUpperCase()}</Text>
                <Text style={styles.viewDetails}>View Details →</Text>
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
                data={matches}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={globalStyles.subtitle}>Public Matches</Text>
                        <Button 
                            title="+ Create Match" 
                            onPress={() => navigation.navigate('Matches', { screen: 'CreateMatch' })}
                            style={{ height: 44, paddingHorizontal: 20 }}
                        />
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={globalStyles.caption}>No public matches available.</Text>
                        <Button 
                            title="Host a Match" 
                            onPress={() => navigation.navigate('CreateMatch')}
                            variant="secondary"
                            style={{ marginTop: 20 }}
                        />
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    pitchName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
    },
    sizeText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    icon: {
        fontSize: 16,
        marginRight: 8,
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
    matchType: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.textSecondary,
        letterSpacing: 1,
    },
    viewDetails: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.primary,
    },
    empty: {
        alignItems: 'center',
        marginTop: 60,
    }
});

export default MatchesListScreen;

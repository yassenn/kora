import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../utils/styles';
import { useAuth } from '../context/AuthContext';
import { getUserStats, getUpcomingMatches, getRecentPitches } from '../services/api';

const HomeScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [upcomingMatches, setUpcomingMatches] = useState([]);
    const [recentPitches, setRecentPitches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            const [statsRes, matchesRes, pitchesRes] = await Promise.all([
                getUserStats(user.id),
                getUpcomingMatches(user.id),
                getRecentPitches(3)
            ]);

            if (statsRes && statsRes.success) setStats(statsRes.data);
            if (matchesRes && matchesRes.success) setUpcomingMatches(matchesRes.data || []);
            if (pitchesRes && pitchesRes.success) setRecentPitches(pitchesRes.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading && !refreshing) {
        return (
            <View style={globalStyles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={globalStyles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <ScrollView 
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
            >
                <View style={globalStyles.content}>
                    <View style={styles.header}>
                        <View>
                            <Text style={globalStyles.caption}>Good day,</Text>
                            <Text style={styles.welcomeText}>{user?.username}!</Text>
                        </View>
                        <View style={globalStyles.row}>
                            <TouchableOpacity 
                                style={styles.iconButton} 
                                onPress={() => navigation.navigate('Notifications')}
                            >
                                <View style={styles.badgeCount} />
                                <Text style={styles.iconText}>🔔</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.iconButton} 
                                onPress={() => navigation.navigate('Invitations')}
                            >
                                <Text style={styles.iconText}>✉️</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Stats Summary */}
                    <View style={globalStyles.card}>
                        <Text style={globalStyles.subtitle}>Performance</Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats?.matches_played || 0}</Text>
                                <Text style={globalStyles.caption}>Matches</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats?.total_goals || 0}</Text>
                                <Text style={globalStyles.caption}>Goals</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats?.total_assists || 0}</Text>
                                <Text style={globalStyles.caption}>Assists</Text>
                            </View>
                        </View>
                    </View>

                    {/* Upcoming Matches */}
                    <View style={[globalStyles.row, globalStyles.justifyBetween, { marginBottom: 16 }]}>
                        <Text style={globalStyles.subtitle}>Next Games</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Matches')}>
                            <Text style={styles.seeAll}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {upcomingMatches.length > 0 ? (
                        upcomingMatches.map((match) => (
                            <TouchableOpacity 
                                key={match.id} 
                                style={globalStyles.card}
                                onPress={() => navigation.navigate('Matches', { screen: 'MatchDetails', params: { id: match.id } })}
                                activeOpacity={0.8}
                            >
                                <View style={[globalStyles.row, globalStyles.justifyBetween]}>
                                    <Text style={styles.itemName}>{match.pitch_name}</Text>
                                    <View>
                                        <Text style={styles.sizeText}>{match.match_size}</Text>
                                    </View>
                                </View>
                                <View style={[globalStyles.row, { marginTop: 8 }]}>
                                    <Text style={styles.cardIcon}>📅</Text>
                                    <Text style={globalStyles.caption}>
                                        {new Date(match.match_date).toLocaleDateString()}
                                    </Text>
                                    <Text style={[styles.cardIcon, { marginLeft: 12 }]}>🕒</Text>
                                    <Text style={globalStyles.caption}>
                                        {new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyCard}>
                            <Text style={globalStyles.caption}>No upcoming matches. Start exploring!</Text>
                        </View>
                    )}

                    {/* Recent Pitches */}
                    <View style={[globalStyles.row, globalStyles.justifyBetween, { marginBottom: 16, marginTop: 10 }]}>
                        <Text style={globalStyles.subtitle}>New Venues</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Pitches')}>
                            <Text style={styles.seeAll}>Discover</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {recentPitches.length > 0 ? (
                        recentPitches.map((pitch) => (
                            <TouchableOpacity 
                                key={pitch.id} 
                                style={globalStyles.card}
                                onPress={() => navigation.navigate('Pitches', { screen: 'PitchDetails', params: { id: pitch.id } })}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.itemName}>{pitch.name}</Text>
                                <Text style={globalStyles.caption}>{pitch.location}</Text>
                                <View style={[globalStyles.row, { marginTop: 8 }]}>
                                    <Text style={styles.priceText}>${pitch.price_per_hour}/hr</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyCard}>
                            <Text style={globalStyles.caption}>No new pitches found.</Text>
                        </View>
                    )}
                    
                    <View style={{ height: 30 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    iconText: {
        fontSize: 20,
    },
    badgeCount: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.danger,
        zIndex: 1,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: 2,
    },
    seeAll: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.primary,
    },
    itemName: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.text,
    },
    cardIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.success,
    },
    sizeText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    emptyCard: {
        padding: 30,
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: colors.gray,
    }
});

export default HomeScreen;

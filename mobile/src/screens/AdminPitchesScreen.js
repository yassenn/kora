import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { globalStyles, colors } from '../utils/styles';
import { getPitches, updatePitchStatus, getPublicMatches, getUsers } from '../services/api';
import Button from '../components/Button';

const AdminPitchesScreen = () => {
    const navigation = useNavigation();
    const [pitches, setPitches] = useState([]);
    const [matches, setMatches] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [adminStats, setAdminStats] = useState(null);
    const [showStats, setShowStats] = useState(true);
    const [showApprovals, setShowApprovals] = useState(true);

    const calculateStats = (allPitches, allMatches, allUsers) => {
        if (!Array.isArray(allPitches) || !Array.isArray(allMatches) || !Array.isArray(allUsers)) {
            console.warn('[AdminStats] Missing data for calculation');
            return;
        }

        const stats = {
            totalMatches: allMatches.length,
            totalPitches: allPitches.length,
            totalOwners: allUsers.filter(u => u && u.user_type === 'pitch_owner').length,
            totalPlayers: allUsers.filter(u => u && u.user_type === 'player').length,
            totalRevenue: 0,
            totalFees: 0,
            pitchStats: []
        };

        allPitches.forEach(pitch => {
            if (!pitch) return;
            const pitchMatches = allMatches.filter(m => m && m.pitch_id === pitch.id);
            const pricePerHour = parseFloat(pitch.price_per_hour) || 0;
            
            let pitchRevenue = 0;
            let pitchFees = 0;

            pitchMatches.forEach(match => {
                const duration = parseInt(match.duration) || 60;
                const matchRevenue = (pricePerHour / 60) * duration;
                pitchRevenue += matchRevenue;
                // Fee is 10% if revenue is 5€ or more
                if (matchRevenue >= 5) {
                    pitchFees += matchRevenue * 0.1;
                }
            });

            stats.totalRevenue += pitchRevenue;
            stats.totalFees += pitchFees;
            stats.pitchStats.push({
                id: pitch.id,
                name: pitch.name || 'Unknown Pitch',
                revenue: pitchRevenue,
                fees: pitchFees,
                matchCount: pitchMatches.length
            });
        });

        setAdminStats(stats);
    };

    const fetchData = useCallback(async () => {
        try {
            const [pitchesRes, matchesRes, usersRes] = await Promise.all([
                getPitches(),
                getPublicMatches(),
                getUsers()
            ]);

            if (pitchesRes?.success) setPitches(pitchesRes.data);
            if (matchesRes?.success) setMatches(matchesRes.data);
            if (usersRes?.success) setUsers(usersRes.data);

            if (pitchesRes?.success && matchesRes?.success && usersRes?.success) {
                calculateStats(pitchesRes.data, matchesRes.data, usersRes.data);
            }
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateStatus = async (id, status) => {
        try {
            const res = await updatePitchStatus(id, status);
            if (res && res.success) {
                Alert.alert('Success', `Pitch ${status} successfully`);
                fetchData();
            } else {
                Alert.alert('Error', res?.message || 'Action failed');
            }
        } catch (err) {
            Alert.alert('Error', err.message || 'An unexpected error occurred');
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const renderStatsHeader = () => {
        if (!adminStats) return null;

        return (
            <View style={styles.statsContainer}>
                <View style={[globalStyles.row, globalStyles.justifyBetween, globalStyles.alignCenter, { marginBottom: 12 }]}>
                    <Text style={styles.sectionTitle}>Application Dashboard</Text>
                    <TouchableOpacity onPress={() => setShowStats(!showStats)}>
                        <Text style={{ fontSize: 12, color: colors.primary, padding: 5 }}>{showStats ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                </View>

                {showStats && (
                    <>
                        <View style={styles.statsGrid}>
                            <View style={styles.statBox}>
                                <Text style={styles.statNumber}>{adminStats.totalMatches}</Text>
                                <Text style={styles.statLabel}>Matches</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statNumber}>{adminStats.totalPitches}</Text>
                                <Text style={styles.statLabel}>Pitches</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statNumber}>{adminStats.totalOwners}</Text>
                                <Text style={styles.statLabel}>Owners</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statNumber}>{adminStats.totalPlayers}</Text>
                                <Text style={styles.statLabel}>Players</Text>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={styles.securityAuditCard}
                            onPress={() => navigation.navigate('AdminSuspicious')}
                        >
                            <View style={globalStyles.row}>
                                <Text style={{ fontSize: 24, marginRight: 12 }}>🛡️</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.securityTitle}>Security Audit</Text>
                                    <Text style={styles.securitySubtitle}>Monitor suspicious activity and invalid data attempts.</Text>
                                </View>
                                <Text style={{ fontSize: 18, color: colors.primary }}>›</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.revenueCard}>
                            <View style={[globalStyles.row, globalStyles.justifyBetween, { marginBottom: 12 }]}>
                                <View>
                                    <Text style={styles.revLabel}>Total Revenue</Text>
                                    <Text style={styles.revValue}>€{adminStats.totalRevenue.toFixed(2)}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.revLabel}>App Fees (10%)</Text>
                                    <Text style={[styles.revValue, { color: colors.success }]}>€{adminStats.totalFees.toFixed(2)}</Text>
                                </View>
                            </View>
                            
                            <Text style={[styles.revLabel, { marginTop: 8, marginBottom: 4 }]}>Revenue by Pitch</Text>
                            {adminStats.pitchStats.filter(p => p.revenue > 0).map(pitch => (
                                <View key={pitch.id} style={styles.pitchRevRow}>
                                    <Text style={styles.pitchRevName} numberOfLines={1}>{pitch.name}</Text>
                                    <Text style={styles.pitchRevAmount}>€{pitch.revenue.toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}
                
                <View style={[globalStyles.row, globalStyles.justifyBetween, globalStyles.alignCenter, { marginTop: 24, marginBottom: 16 }]}>
                    <Text style={styles.sectionTitle}>Pitch Approvals</Text>
                    <TouchableOpacity onPress={() => setShowApprovals(!showApprovals)}>
                        <Text style={{ fontSize: 12, color: colors.primary, padding: 5 }}>{showApprovals ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
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
                data={showApprovals ? pitches : []}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
                ListHeaderComponent={renderStatsHeader}
                ListEmptyComponent={
                    showApprovals ? (
                        <View style={styles.empty}>
                            <Text style={globalStyles.caption}>No pitches found.</Text>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.text,
    },
    statsContainer: {
        marginBottom: 10,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statBox: {
        width: '48%',
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.lightGray,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.primary,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
        fontWeight: '600',
    },
    revenueCard: {
        backgroundColor: colors.text,
        padding: 20,
        borderRadius: 20,
        marginBottom: 10,
    },
    revLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '600',
    },
    revValue: {
        color: colors.white,
        fontSize: 22,
        fontWeight: '800',
        marginTop: 4,
    },
    pitchRevRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    pitchRevName: {
        color: colors.white,
        fontSize: 14,
        flex: 1,
        marginRight: 10,
    },
    pitchRevAmount: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '700',
    },
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
    securityAuditCard: {
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.lightGray,
        borderLeftWidth: 5,
        borderLeftColor: colors.danger,
    },
    securityTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.text,
    },
    securitySubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    empty: {
        alignItems: 'center',
        marginTop: 60,
    }
});

export default AdminPitchesScreen;

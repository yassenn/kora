import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../utils/styles';
import { getPitches, getMatches, getPitchReviews, getUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import PitchScheduleCalendar from '../components/PitchScheduleCalendar';

const METRIC_INFO = {
    'netEarnings': { title: 'Net Earnings', desc: 'The total amount you receive. Platform fees (10%) are added on top of your set price and are paid by the players.' },
    'grossRevenue': { title: 'Gross Revenue', desc: 'The total amount paid by players, including your set price and platform fees.' },
    'platformFees': { title: 'Platform Fees', desc: 'The total amount collected from players that is paid to the platform (10% on top of your set price).' },
    'arpu': { title: 'ARPU', desc: 'Average Revenue Per User. Total revenue divided by the total number of unique player bookings.' },
    'lostRevenue': { title: 'Lost (Canc.)', desc: 'Potential revenue lost due to cancelled matches.' },
    'revPAH': { title: 'RevPAH', desc: 'Revenue Per Available Hour. Total revenue divided by the total opening hours across all your pitches.' },
    'occupancyRate': { title: 'Occupancy', desc: 'The percentage of your total available opening hours that were successfully booked for matches.' },
    'cancellationRate': { title: 'Cancellations', desc: 'The percentage of scheduled matches that were cancelled.' },
    'avgLeadTime': { title: 'Avg Lead Time', desc: 'How many days in advance players typically book your pitches.' },
    'publicRatio': { title: 'Public Match %', desc: 'Percentage of matches that are open to the public vs. private bookings.' },
    'deadHour': { title: 'Dead Time', desc: 'The specific hour of the day with the lowest historical demand for your pitches.' },
    'busyBookingWindow': { title: 'Busiest Booking Window', desc: 'The time of day when players are most active in creating new match bookings.' },
    'fillRate': { title: 'Fill Rate', desc: 'For a specific format (e.g., 7v7), what percentage of the required player slots are typically filled.' }
};

const MetricLabel = ({ label, metricKey, onPress, style = styles.miniLabel }) => (
    <TouchableOpacity 
        onPress={() => onPress(metricKey)} 
        style={{ flexDirection: 'row', alignItems: 'center' }}
        activeOpacity={0.7}
    >
        <Text style={style}>{label}</Text>
        <View style={{ 
            marginLeft: 4, 
            width: 14, 
            height: 14, 
            borderRadius: 7, 
            backgroundColor: colors.lightGray, 
            alignItems: 'center', 
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.05)'
        }}>
            <Text style={{ fontSize: 9, fontWeight: '800', color: colors.primary }}>?</Text>
        </View>
    </TouchableOpacity>
);

const MyPitchesScreen = ({ navigation }) => {
    const { user } = useAuth();
    // ... existing states ...
    const [pitches, setPitches] = useState([]);
    const [allMatches, setAllMatches] = useState([]);
    const [allReviews, setAllReviews] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timeFilter, setTimeFilter] = useState('month'); 
    const [showDashboard, setShowDashboard] = useState(true);
    const [dashboardTab, setDashboardTab] = useState('financial'); // 'financial', 'operational', 'customer', 'opportunities'

    const showMetricInfo = (key) => {
        const info = METRIC_INFO[key];
        if (info) {
            Alert.alert(info.title, info.desc);
        }
    };

    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            const pitchesRes = await getPitches();
            if (pitchesRes && pitchesRes.success) {
                const myPitches = pitchesRes.data.filter(p => p.owner_id == user.id);
                setPitches(myPitches);

                const [matchesRes, usersRes, ...reviewsPromises] = await Promise.all([
                    getMatches(),
                    getUsers(),
                    ...myPitches.map(p => getPitchReviews(p.id))
                ]);

                if (matchesRes && matchesRes.success) {
                    setAllMatches(matchesRes.data.filter(m => myPitches.some(p => p.id == m.pitch_id)));
                }

                if (usersRes && usersRes.success) {
                    setAllUsers(usersRes.data);
                }

                const reviews = [];
                reviewsPromises.forEach(res => {
                    if (res && res.success) {
                        reviews.push(...res.data);
                    }
                });
                setAllReviews(reviews);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
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

    const dashboardStats = useMemo(() => {
        if (!pitches.length) return null;

        const now = new Date();
        let startDate = new Date();
        let prevStartDate = new Date();
        let daysCount = 30;
        
        if (timeFilter === 'day') {
            startDate.setHours(0, 0, 0, 0);
            prevStartDate.setDate(now.getDate() - 1);
            prevStartDate.setHours(0, 0, 0, 0);
            daysCount = 1;
        } else if (timeFilter === 'week') {
            startDate.setDate(now.getDate() - 7);
            prevStartDate.setDate(now.getDate() - 14);
            daysCount = 7;
        } else if (timeFilter === 'month') {
            startDate.setDate(now.getDate() - 30);
            prevStartDate.setDate(now.getDate() - 60);
            daysCount = 30;
        } else if (timeFilter === 'quarter') {
            startDate.setDate(now.getDate() - 90);
            prevStartDate.setDate(now.getDate() - 180);
            daysCount = 90;
        }

        const currentMatches = allMatches.filter(m => new Date(m.match_date) >= startDate);
        const previousMatches = allMatches.filter(m => {
            const date = new Date(m.match_date);
            return date >= prevStartDate && date < startDate;
        });

        const currentReviews = allReviews.filter(r => new Date(r.created_at) >= startDate);
        const previousReviews = allReviews.filter(r => {
            const date = new Date(r.created_at);
            return date >= prevStartDate && date < startDate;
        });

        const getDailyAvailableHours = (pitch) => {
            if (!pitch.opening_hours) return 12; 
            try {
                const times = pitch.opening_hours.match(/(\d{2}:\d{2})/g);
                if (times && times.length >= 2) {
                    const [start, end] = times;
                    return parseInt(end.split(':')[0], 10) - parseInt(start.split(':')[0], 10);
                }
            } catch(e) {}
            return 12;
        };

        const totalAvailableHours = pitches.reduce((sum, p) => sum + (getDailyAvailableHours(p) * daysCount), 0);

        const processMatches = (matchesList) => {
            let rev = 0, dur = 0, canc = 0, comp = 0, bks = 0, lead = 0, lostRev = 0;
            let pubCount = 0, privCount = 0;
            const formatStats = {}; // { '7v7': { totalSlots: 0, filledSlots: 0, count: 0 } }
            const createHours = {}; // Hour when match was created
            const usedSlots = new Set(); // To find "Dead Time"

            matchesList.forEach(m => {
                const pitch = pitches.find(p => p.id == m.pitch_id);
                const price = parseFloat(pitch?.price_per_hour) || 0;
                const matchDuration = parseInt(m.duration, 10) || 60;
                const matchRevenue = (price / 60) * matchDuration;
                
                const createdDate = new Date(m.created_at);
                createHours[createdDate.getHours()] = (createHours[createdDate.getHours()] || 0) + 1;

                if (m.status === 'cancelled') {
                    canc++;
                    lostRev += matchRevenue;
                } else {
                    rev += matchRevenue;
                    dur += matchDuration;
                    const pCount = parseInt(m.player_count, 10) || 0;
                    bks += pCount;
                    comp++;

                    const matchDate = new Date(m.match_date);
                    lead += (matchDate - createdDate) / (1000 * 60 * 60 * 24);
                    
                    if (m.match_type === 'public') pubCount++; else privCount++;

                    // Format stats
                    const sizeParts = m.match_size.split('v');
                    const slots = sizeParts.length === 2 ? (parseInt(sizeParts[0], 10) + parseInt(sizeParts[1], 10)) : 0;
                    if (!formatStats[m.match_size]) formatStats[m.match_size] = { total: 0, filled: 0, count: 0 };
                    formatStats[m.match_size].total += slots;
                    formatStats[m.match_size].filled += pCount;
                    formatStats[m.match_size].count += 1;

                    // Occupancy tracking (date_hour_pitch)
                    const hour = matchDate.getHours();
                    usedSlots.add(`${matchDate.toDateString()}_${hour}_${m.pitch_id}`);
                }
            });

            return { rev, dur, canc, comp, bks, lead, lostRev, pubCount, privCount, formatStats, createHours, usedSlots };
        };

        const currentP = processMatches(currentMatches);
        const prevP = processMatches(previousMatches);

        // Player Leaderboards
        const playerMatches = {}; // { pid: count }
        const playerGoals = {}; // { pid: goals }

        currentMatches.forEach(m => {
            if (m.status === 'cancelled' || !m.player_stats) return;
            const stats = m.player_stats.split(',');
            stats.forEach(s => {
                if (!s) return;
                const [pid, goals] = s.split(':');
                if (pid) {
                    playerMatches[pid] = (playerMatches[pid] || 0) + 1;
                    playerGoals[pid] = (playerGoals[pid] || 0) + parseInt(goals || 0, 10);
                }
            });
        });

        const getTopPlayer = (statObj) => {
            const top = Object.entries(statObj).sort((a, b) => b[1] - a[1])[0];
            if (!top) return 'N/A';
            const user = allUsers.find(u => u.id == top[0]);
            return user ? `${user.username} (${top[1]})` : `User #${top[0]} (${top[1]})`;
        };

        // Dead Time calculation (simplistic: hours with least bookings across all pitches)
        const hourBookings = {};
        currentMatches.forEach(m => {
            if (m.status === 'cancelled') return;
            const h = new Date(m.match_date).getHours();
            hourBookings[h] = (hourBookings[h] || 0) + 1;
        });
        const deadHour = Object.entries(hourBookings).sort((a, b) => a[1] - b[1])[0]?.[0] || 'N/A';

        const busyWindow = Object.entries(currentP.createHours).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        const curRating = currentReviews.length > 0 ? currentReviews.reduce((s, r) => s + parseInt(r.rating, 10), 0) / currentReviews.length : 0;
        const prevRating = previousReviews.length > 0 ? previousReviews.reduce((s, r) => s + parseInt(r.rating, 10), 0) / previousReviews.length : 0;

        return {
            financial: {
                netEarnings: currentP.rev,
                grossRevenue: currentP.rev * 1.1,
                platformFees: currentP.rev * 0.1,
                growth: prevP.rev > 0 ? ((currentP.rev - prevP.rev) / prevP.rev * 100).toFixed(1) : '100',
                revPAH: totalAvailableHours > 0 ? (currentP.rev / totalAvailableHours).toFixed(2) : 0,
                lostRevenue: currentP.lostRev,
                arpu: currentP.bks > 0 ? (currentP.rev / currentP.bks).toFixed(2) : 0,
            },
            operational: {
                occupancyRate: totalAvailableHours > 0 ? ((currentP.dur / 60) / totalAvailableHours * 100).toFixed(1) : 0,
                cancellationRate: currentMatches.length > 0 ? (currentP.canc / currentMatches.length * 100).toFixed(1) : 0,
                avgLeadTime: currentP.comp > 0 ? (currentP.lead / currentP.comp).toFixed(1) : 0,
                publicRatio: currentP.comp > 0 ? (currentP.pubCount / currentP.comp * 100).toFixed(0) : 0,
                deadHour: deadHour !== 'N/A' ? `${deadHour}:00` : 'N/A',
                busyBookingWindow: busyWindow !== 'N/A' ? `${busyWindow}:00` : 'N/A',
            },
            customer: {
                totalPlayers: Object.keys(playerMatches).length,
                activePlayer: getTopPlayer(playerMatches),
                topScorer: getTopPlayer(playerGoals),
                avgRating: curRating.toFixed(1),
                ratingTrend: (curRating - prevRating).toFixed(1),
            },
            formats: Object.entries(currentP.formatStats).map(([name, data]) => ({
                name,
                fillRate: (data.filled / data.total * 100).toFixed(0)
            }))
        };
    }, [pitches, allMatches, allReviews, allUsers, timeFilter]);

    const renderDashboard = () => {
        if (!dashboardStats) return null;
        const { financial, operational, customer, formats } = dashboardStats;

        return (
            <View style={styles.dashboardContainer}>
                <View style={[globalStyles.row, globalStyles.justifyBetween, globalStyles.alignCenter, { marginBottom: 16 }]}>
                    <Text style={styles.sectionTitle}>Insights Dashboard</Text>
                    <TouchableOpacity onPress={() => setShowDashboard(!showDashboard)}>
                        <Text style={styles.toggleText}>{showDashboard ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                </View>

                {showDashboard && (
                    <>
                        <View style={styles.filterContainer}>
                            {['day', 'week', 'month', 'quarter'].map(f => (
                                <TouchableOpacity key={f} style={[styles.filterBtn, timeFilter === f && styles.filterBtnActive]} onPress={() => setTimeFilter(f)}>
                                    <Text style={[styles.filterBtnText, timeFilter === f && styles.filterBtnTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
                            {['schedule', 'financial', 'operational', 'customer', 'opportunities'].map(t => (
                                <TouchableOpacity key={t} onPress={() => setDashboardTab(t)} style={[styles.tab, dashboardTab === t && styles.activeTab]}>
                                    <Text style={[styles.tabText, dashboardTab === t && styles.activeTabText]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {dashboardTab === 'schedule' && (
                            <PitchScheduleCalendar pitches={pitches} matches={allMatches} />
                        )}

                        {dashboardTab === 'financial' && (
                            <View style={styles.statsCard}>
                                <View style={styles.revHighlight}>
                                    <MetricLabel label="Net Earnings" metricKey="netEarnings" onPress={showMetricInfo} style={styles.revLabel} />
                                    <Text style={styles.revValue}>€{financial.netEarnings.toFixed(2)}</Text>
                                    <Text style={[styles.growthText, { color: parseFloat(financial.growth) >= 0 ? colors.success : colors.danger }]}>
                                        {parseFloat(financial.growth) >= 0 ? '↑' : '↓'} {financial.growth}% vs prev
                                    </Text>
                                </View>
                                <View style={styles.gridRow}>
                                    <View style={styles.gridItem}>
                                        <MetricLabel label="ARPU" metricKey="arpu" onPress={showMetricInfo} />
                                        <Text style={styles.miniValue}>€{financial.arpu}</Text>
                                    </View>
                                    <View style={styles.gridItem}>
                                        <MetricLabel label="Platform Fees" metricKey="platformFees" onPress={showMetricInfo} />
                                        <Text style={[styles.miniValue, { color: colors.warning }]}>€{financial.platformFees.toFixed(2)}</Text>
                                    </View>
                                </View>
                                <View style={styles.gridRow}>
                                    <View style={styles.gridItem}>
                                        <MetricLabel label="Lost (Canc.)" metricKey="lostRevenue" onPress={showMetricInfo} />
                                        <Text style={[styles.miniValue, { color: colors.danger }]}>€{financial.lostRevenue.toFixed(2)}</Text>
                                    </View>
                                    <View style={styles.gridItem}>
                                        <MetricLabel label="RevPAH" metricKey="revPAH" onPress={showMetricInfo} />
                                        <Text style={styles.miniValue}>€{financial.revPAH}</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {dashboardTab === 'operational' && (
                            <View style={styles.statsGrid}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>{operational.occupancyRate}%</Text>
                                    <MetricLabel label="Occupancy" metricKey="occupancyRate" onPress={showMetricInfo} style={styles.statLabel} />
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>{operational.cancellationRate}%</Text>
                                    <MetricLabel label="Cancellations" metricKey="cancellationRate" onPress={showMetricInfo} style={styles.statLabel} />
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>{operational.publicRatio}%</Text>
                                    <MetricLabel label="Public Match %" metricKey="publicRatio" onPress={showMetricInfo} style={styles.statLabel} />
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>{operational.avgLeadTime}d</Text>
                                    <MetricLabel label="Avg Lead Time" metricKey="avgLeadTime" onPress={showMetricInfo} style={styles.statLabel} />
                                </View>
                            </View>
                        )}

                        {dashboardTab === 'customer' && (
                            <View style={styles.statsGrid}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>{customer.activePlayer}</Text>
                                    <Text style={styles.statLabel}>Most Active Player</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>{customer.topScorer}</Text>
                                    <Text style={styles.statLabel}>Venue Top Scorer</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>{customer.avgRating}⭐</Text>
                                    <Text style={styles.statLabel}>Rating ({customer.ratingTrend >= 0 ? '+' : ''}{customer.ratingTrend})</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>{customer.totalPlayers}</Text>
                                    <Text style={styles.statLabel}>Unique Visitors</Text>
                                </View>
                            </View>
                        )}

                        {dashboardTab === 'opportunities' && (
                            <View style={styles.statsCard}>
                                <MetricLabel label="Busiest Booking Window (Match Created)" metricKey="busyBookingWindow" onPress={showMetricInfo} />
                                <Text style={[styles.statValue, { marginBottom: 12, textAlign: 'left' }]}>{operational.busyBookingWindow}</Text>
                                
                                <MetricLabel label="Dead Time (Lowest Demand)" metricKey="deadHour" onPress={showMetricInfo} />
                                <Text style={[styles.statValue, { marginBottom: 12, color: colors.warning, textAlign: 'left' }]}>{operational.deadHour}</Text>
                                
                                <MetricLabel label="Fill Rate by Format" metricKey="fillRate" onPress={showMetricInfo} style={[styles.miniLabel, { marginBottom: 8 }]} />
                                {formats.map(f => (
                                    <View key={f.name} style={[globalStyles.row, globalStyles.justifyBetween, { marginBottom: 4 }]}>
                                        <Text style={styles.miniValue}>{f.name}</Text>
                                        <Text style={[styles.miniValue, { color: colors.primary }]}>{f.fillRate}% Full</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                )}
                
                <View style={[globalStyles.row, globalStyles.justifyBetween, globalStyles.alignCenter, { marginTop: 24, marginBottom: 16 }]}>
                    <Text style={styles.sectionTitle}>My Venues</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('CreatePitch')}><Text style={{ color: colors.primary, fontWeight: '700' }}>+ Add New</Text></TouchableOpacity>
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
        <TouchableOpacity style={[globalStyles.card, getStatusStyle(item.status)]} onPress={() => navigation.navigate('PitchDetails', { id: item.id })} activeOpacity={0.8}>
            <View style={[globalStyles.row, globalStyles.justifyBetween]}>
                <Text style={styles.pitchName}>{item.name}</Text>
                <View style={[globalStyles.badge, { backgroundColor: 'transparent' }]}><Text style={[globalStyles.badgeText, getStatusTextColor(item.status)]}>{item.status.toUpperCase()}</Text></View>
            </View>
            <Text style={globalStyles.caption}>{item.location}</Text>
            <View style={styles.details}><Text style={styles.price}>€{item.price_per_hour}/hr</Text></View>
            <View style={styles.actions}><Button title="Edit Details" onPress={() => navigation.navigate('CreatePitch', { pitch: item })} variant="secondary" style={styles.actionButton}/></View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) return <SafeAreaView style={globalStyles.container}><View style={globalStyles.centered}><ActivityIndicator size="large" color={colors.primary}/></View></SafeAreaView>;

    return (
        <SafeAreaView style={globalStyles.container} edges={['top']}>
            <FlatList contentContainerStyle={globalStyles.content} data={pitches} renderItem={renderItem} keyExtractor={item => item.id.toString()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
                ListHeaderComponent={renderDashboard}
                ListEmptyComponent={<View style={styles.empty}><Text style={globalStyles.subtitle}>No pitches yet</Text><Button title="Register a Pitch" onPress={() => navigation.navigate('CreatePitch')} /></View>}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    sectionTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
    toggleText: { fontSize: 12, color: colors.primary, fontWeight: '600', padding: 5 },
    dashboardContainer: { marginBottom: 10 },
    filterContainer: { flexDirection: 'row', backgroundColor: colors.lightGray, padding: 4, borderRadius: 12, marginBottom: 16 },
    filterBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
    filterBtnActive: { backgroundColor: colors.white, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    filterBtnText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
    filterBtnTextActive: { color: colors.primary },
    tabContainer: { flexDirection: 'row', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
    tab: { marginRight: 20, paddingBottom: 8 },
    activeTab: { borderBottomWidth: 2, borderBottomColor: colors.primary },
    tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    activeTabText: { color: colors.primary },
    statsCard: { backgroundColor: colors.white, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: colors.lightGray, marginBottom: 12 },
    revHighlight: { alignItems: 'center' },
    revLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
    revValue: { fontSize: 32, fontWeight: '800', color: colors.text, marginTop: 4 },
    growthText: { fontSize: 13, fontWeight: '700', marginTop: 4 },
    gridRow: { flexDirection: 'row', marginTop: 16, borderTopWidth: 1, borderTopColor: colors.lightGray, paddingTop: 16 },
    gridItem: { flex: 1, alignItems: 'center' },
    miniLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase' },
    miniValue: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 2 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    statBox: { width: '48%', backgroundColor: colors.white, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.lightGray, alignItems: 'center' },
    statValue: { fontSize: 16, fontWeight: '800', color: colors.text, textAlign: 'center' },
    statLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 4, fontWeight: '600', textAlign: 'center', textTransform: 'uppercase' },
    pitchName: { fontSize: 18, fontWeight: '700', color: colors.text, flex: 1 },
    details: { marginTop: 12, flexDirection: 'row', alignItems: 'center' },
    price: { fontSize: 16, fontWeight: '600', color: colors.primary },
    actions: { marginTop: 16, borderTopWidth: 1, borderTopColor: colors.lightGray, paddingTop: 12 },
    actionButton: { height: 40, marginVertical: 0 },
    empty: { alignItems: 'center', marginTop: 60 }
});

export default MyPitchesScreen;

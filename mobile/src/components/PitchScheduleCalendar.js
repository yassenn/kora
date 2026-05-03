import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { colors, globalStyles } from '../utils/styles';

const HOUR_CELL_HEIGHT = 60;
const TIME_COLUMN_WIDTH = 60;

const PitchScheduleCalendar = ({ pitches, matches }) => {
    const { width } = useWindowDimensions();
    const [selectedPitchId, setSelectedPitchId] = useState(pitches[0]?.id);

    React.useEffect(() => {
        if (!selectedPitchId && pitches.length > 0) {
            setSelectedPitchId(pitches[0].id);
        }
    }, [pitches, selectedPitchId]);

    const selectedPitch = useMemo(() => pitches.find(p => p.id == selectedPitchId), [pitches, selectedPitchId]);

    const DAY_COLUMN_WIDTH = useMemo(() => {
        const availableWidth = width - TIME_COLUMN_WIDTH - 48;
        return Math.max(100, availableWidth / 3);
    }, [width]);

    const dates = useMemo(() => {
        const arr = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Include 7 days in the past and 14 days in the future
        for (let i = -7; i <= 21; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            arr.push(d);
        }
        return arr;
    }, []);

    const hours = useMemo(() => {
        const h = [];
        for (let i = 0; i < 24; i++) h.push(i);
        return h;
    }, []);

    const getMatchForSlot = (date, hour) => {
        if (!selectedPitchId) return null;
        return matches.find(m => {
            if (m.pitch_id != selectedPitchId || m.status === 'cancelled') return false;
            const mDate = new Date(m.match_date);
            return mDate.toDateString() === date.toDateString() && mDate.getHours() === hour;
        });
    };

    const isWithinOpeningHours = (hour) => {
        if (!selectedPitch?.opening_hours) return true;
        try {
            const times = selectedPitch.opening_hours.match(/(\d{2}:\d{2})/g);
            if (times && times.length >= 2) {
                const startHour = parseInt(times[0].split(':')[0], 10);
                const endHour = parseInt(times[1].split(':')[0], 10);
                return hour >= startHour && hour < endHour;
            }
        } catch (e) {}
        return true;
    };

    if (!pitches.length) return null;

    return (
        <View style={styles.container}>
            {/* Pitch Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pitchSelector}>
                {pitches.map(p => (
                    <TouchableOpacity 
                        key={p.id} 
                        onPress={() => setSelectedPitchId(p.id)}
                        style={[styles.pitchTab, selectedPitchId == p.id && styles.activePitchTab]}
                    >
                        <Text style={[styles.pitchTabText, selectedPitchId == p.id && styles.activePitchTabText]}>
                            {p.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: colors.primary }]} />
                    <Text style={styles.legendText}>Booked</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: colors.white, borderStyle: 'dashed' }]} />
                    <Text style={styles.legendText}>Available</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: colors.lightGray }]} />
                    <Text style={styles.legendText}>Closed</Text>
                </View>
            </View>

            {/* Calendar Grid */}
            <View style={styles.gridWrapper}>
                {/* Fixed Time Column */}
                <View style={styles.timeColumn}>
                    <View style={styles.headerSpacer} />
                    {hours.map(h => (
                        <View key={h} style={styles.timeCell}>
                            <Text style={styles.timeText}>{`${h.toString().padStart(2, '0')}:00`}</Text>
                        </View>
                    ))}
                </View>

                {/* Scrollable Days */}
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                    <View>
                        {/* Day Headers */}
                        <View style={styles.daysHeader}>
                            {dates.map((d, i) => {
                                const isToday = d.toDateString() === new Date().toDateString();
                                return (
                                    <View key={i} style={[styles.dayHeaderCell, { width: DAY_COLUMN_WIDTH }, isToday && styles.todayHeader]}>
                                        <Text style={[styles.dayName, isToday && styles.todayText]}>
                                            {d.toLocaleDateString('en-US', { weekday: 'short' })}
                                        </Text>
                                        <Text style={[styles.dayDate, isToday && styles.todayText]}>
                                            {d.getDate()}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Slots Grid */}
                        <View style={styles.slotsContainer}>
                            {hours.map(h => (
                                <View key={h} style={styles.hourRow}>
                                    {dates.map((d, i) => {
                                        const match = getMatchForSlot(d, h);
                                        const open = isWithinOpeningHours(h);
                                        const isPast = d < new Date().setHours(0,0,0,0);
                                        
                                        return (
                                            <View 
                                                key={i} 
                                                style={[
                                                    styles.slotCell, 
                                                    { width: DAY_COLUMN_WIDTH },
                                                    !open && styles.closedSlot,
                                                    match && styles.bookedSlot,
                                                    isPast && !match && { opacity: 0.5 }
                                                ]}
                                            >
                                                {match && (
                                                    <View style={styles.matchIndicator}>
                                                        <Text style={styles.matchText} numberOfLines={1}>
                                                            {match.match_size}
                                                        </Text>
                                                        <Text style={styles.matchStatus} numberOfLines={1}>
                                                            {match.player_count} players
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.lightGray,
        marginBottom: 20,
        minHeight: 400,
    },
    pitchSelector: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    pitchTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: colors.lightGray,
    },
    activePitchTab: {
        backgroundColor: colors.primary,
    },
    pitchTabText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    activePitchTabText: {
        color: colors.white,
    },
    legend: {
        flexDirection: 'row',
        padding: 12,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    legendBox: {
        width: 12,
        height: 12,
        borderRadius: 3,
        marginRight: 6,
        borderWidth: 1,
        borderColor: colors.border,
    },
    legendText: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    gridWrapper: {
        flexDirection: 'row',
    },
    timeColumn: {
        width: TIME_COLUMN_WIDTH,
        backgroundColor: colors.background,
        borderRightWidth: 1,
        borderRightColor: colors.lightGray,
    },
    headerSpacer: {
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    timeCell: {
        height: HOUR_CELL_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    timeText: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    daysHeader: {
        flexDirection: 'row',
        height: 50,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    dayHeaderCell: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: colors.lightGray,
    },
    todayHeader: {
        backgroundColor: 'rgba(0, 122, 255, 0.05)',
    },
    todayText: {
        color: colors.primary,
        fontWeight: '800',
    },
    dayName: {
        fontSize: 10,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    dayDate: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    slotsContainer: {
        width: '100%',
    },
    hourRow: {
        flexDirection: 'row',
    },
    slotCell: {
        height: HOUR_CELL_HEIGHT,
        borderRightWidth: 1,
        borderRightColor: colors.lightGray,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
        backgroundColor: colors.white,
    },
    closedSlot: {
        backgroundColor: colors.lightGray,
    },
    bookedSlot: {
        backgroundColor: colors.primary,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    matchIndicator: {
        flex: 1,
        padding: 4,
        justifyContent: 'center',
    },
    matchText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: '800',
        textAlign: 'center',
    },
    matchStatus: {
        color: colors.white,
        fontSize: 8,
        textAlign: 'center',
        opacity: 0.9,
    }
});

export default PitchScheduleCalendar;

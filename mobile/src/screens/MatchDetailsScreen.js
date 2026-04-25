import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, StyleSheet, Image, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import PlayerPickerModal from '../components/PlayerPickerModal';
import { globalStyles, colors } from '../utils/styles';
import { getMatchDetails, joinMatch, leaveMatch, sendInvitation } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MatchDetailsScreen = ({ route, navigation }) => {
    const matchId = route.params?.id || route.params?.matchId;
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [inviteModalVisible, setInviteModalVisible] = useState(false);
    const { user } = useAuth();

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getMatchDetails(matchId);
            if (res && res.success) {
                setMatch(res.data);
            } else {
                setError(res?.message || 'Match not found');
            }
        } catch (err) {
            setError(err.message || 'Network error');
        } finally {
            setLoading(false);
        }
    }, [matchId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const isPlayerInMatch = match?.players?.some(p => p.id === user?.id);
    const isOrganizer = match?.creator_id === user?.id;

    const handleInvitePlayer = async (inviteeId) => {
        try {
            const res = await sendInvitation({
                match_id: matchId,
                inviter_id: user.id,
                invitee_id: inviteeId
            });
            if (res && res.success) {
                Alert.alert('Success', 'Invitation sent!');
            } else {
                Alert.alert('Error', res?.message || 'Could not send invitation');
            }
        } catch (err) {
            Alert.alert('Error', err.message || 'Could not send invitation');
        }
    };

    const handleJoinMatch = async () => {
        if (!user?.id) {
            Alert.alert('Login required', 'Please login to join matches');
            return;
        }
        try {
            const res = await joinMatch(matchId, user.id);
            if (res && res.success) {
                Alert.alert('Success', 'You joined the match');
                fetchDetails();
            } else {
                Alert.alert('Error', res?.message || 'Could not join match');
            }
        } catch (err) {
            Alert.alert('Error', err.message || 'Could not join match');
        }
    };

    const handleLeaveMatch = async () => {
        Alert.alert(
            'Leave Match',
            'Are you sure you want to leave this match?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Leave', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const res = await leaveMatch(matchId, user.id);
                            if (res && res.success) {
                                Alert.alert('Success', 'You left the match');
                                fetchDetails();
                            } else {
                                Alert.alert('Error', res?.message || 'Could not leave match');
                            }
                        } catch (err) {
                            Alert.alert('Error', err.message || 'Could not leave match');
                        }
                    }
                }
            ]
        );
    };

    const handleShare = async () => {
        try {
            const shareUrl = `kora://match/${matchId}`;
            await Share.share({
                message: `Join me for a soccer match at ${match.pitch_name}! Join here: ${shareUrl}`,
                url: shareUrl,
            });
        } catch (error) {
            Alert.alert('Error', 'Could not share match');
        }
    };

    if (loading && !match) {
        return (
            <SafeAreaView style={globalStyles.container}>
                <View style={globalStyles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={globalStyles.container}>
                <View style={globalStyles.centered}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Button title="Go Back" onPress={() => navigation.goBack()} />
                </View>
            </SafeAreaView>
        );
    }

    if (!match) return null;

    return (
        <SafeAreaView style={globalStyles.container}>
            <ScrollView contentContainerStyle={globalStyles.content}>
                <View style={globalStyles.card}>
                    <Text style={globalStyles.title}>{match.pitch_name}</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Date:</Text>
                        <Text style={styles.value}>{new Date(match.match_date).toLocaleString()}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Size:</Text>
                        <Text style={styles.value}>{match.match_size}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Type:</Text>
                        <Text style={styles.value}>{match.match_type}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Duration:</Text>
                        <Text style={styles.value}>{match.duration} minutes</Text>
                    </View>
                </View>

                <View style={globalStyles.card}>
                    <View style={[globalStyles.row, globalStyles.justifyBetween, { marginBottom: 16 }]}>
                        <Text style={styles.subtitle}>Players ({match.players?.length || 0})</Text>
                        <View style={globalStyles.row}>
                            <TouchableOpacity 
                                style={styles.shareIconButton} 
                                onPress={handleShare}
                            >
                                <Text style={styles.iconText}>🔗</Text>
                            </TouchableOpacity>
                            {isOrganizer && (
                                <TouchableOpacity 
                                    style={styles.inviteButton} 
                                    onPress={() => setInviteModalVisible(true)}
                                >
                                    <Text style={styles.inviteButtonText}>+ Invite</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    {match.players && match.players.length > 0 ? (
                        [...match.players]
                            .sort((a, b) => a.id === match.creator_id ? -1 : b.id === match.creator_id ? 1 : 0)
                            .map((item) => (
                            <View key={item.id.toString()} style={styles.playerItem}>
                                <View style={styles.avatarSmall}>
                                    {item.profile_picture_url ? (
                                        <Image source={{ uri: item.profile_picture_url }} style={styles.avatarImage} />
                                    ) : (
                                        <Text style={styles.avatarPlaceholder}>
                                            {item.username ? item.username.charAt(0).toUpperCase() : '?'}
                                        </Text>
                                    )}
                                </View>
                                <Text style={styles.playerName}>{item.username}</Text>
                                {item.id === match.creator_id && (
                                    <View style={[styles.youBadge, { backgroundColor: colors.warning }]}>
                                        <Text style={styles.youBadgeText}>Organizer</Text>
                                    </View>
                                )}
                                {item.id === user?.id && (
                                    <View style={styles.youBadge}>
                                        <Text style={styles.youBadgeText}>You</Text>
                                    </View>
                                )}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No players yet. Be the first!</Text>
                    )}
                </View>

                <View style={styles.footer}>
                    {isPlayerInMatch ? (
                        <Button 
                            title="Leave Match" 
                            onPress={handleLeaveMatch} 
                            style={{ backgroundColor: colors.danger }} 
                        />
                    ) : (
                        <Button 
                            title="Join Match" 
                            onPress={handleJoinMatch} 
                        />
                    )}
                </View>
            </ScrollView>
            <PlayerPickerModal 
                visible={inviteModalVisible}
                onClose={() => setInviteModalVisible(false)}
                onInvitePlayer={handleInvitePlayer}
                alreadyInvitedIds={match.players?.map(p => p.id)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    errorText: {
        color: colors.danger,
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        color: colors.text,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        fontWeight: '600',
        width: 80,
        color: colors.textSecondary,
    },
    value: {
        color: colors.text,
        flex: 1,
    },
    playerItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
        alignItems: 'center',
    },
    avatarSmall: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.primary,
    },
    playerName: {
        fontSize: 16,
        color: colors.text,
        flex: 1,
    },
    youBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 10,
    },
    youBadgeText: {
        color: colors.white,
        fontSize: 11,
        fontWeight: '700',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    footer: {
        paddingTop: 10,
    },
    inviteButton: {
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    inviteButtonText: {
        color: colors.primary,
        fontWeight: '700',
        fontSize: 14,
    },
    shareIconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    iconText: {
        fontSize: 18,
    }
});

export default MatchDetailsScreen;

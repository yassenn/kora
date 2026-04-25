import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { globalStyles, colors } from '../utils/styles';
import { getPitches, getPitchReviews, submitReview } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PitchDetailsScreen = ({ route, navigation }) => {
    const pitchId = route.params?.id || route.params?.pitchId;
    const { user } = useAuth();
    
    const [pitch, setPitch] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [pitchRes, reviewsRes] = await Promise.all([
                getPitches(), // Get all and filter for now as there's no single pitch GET with full details yet
                getPitchReviews(pitchId)
            ]);

            if (pitchRes.success) {
                const found = pitchRes.data.find(p => p.id === pitchId);
                setPitch(found);
            }
            if (reviewsRes.success) {
                setReviews(reviewsRes.data);
            }
        } catch (err) {
            setError('Failed to load details');
        } finally {
            setLoading(false);
        }
    }, [pitchId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddReview = async () => {
        if (!newComment) return;
        setSubmitting(true);
        try {
            const res = await submitReview({
                pitch_id: pitchId,
                player_id: user.id,
                rating: newRating,
                comment: newComment
            });
            if (res.success) {
                setNewComment('');
                fetchData();
                Alert.alert('Success', 'Review submitted!');
            }
        } catch (err) {
            Alert.alert('Error', 'Could not submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !pitch) {
        return (
            <SafeAreaView style={globalStyles.container}>
                <View style={globalStyles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!pitch) return null;

    return (
        <SafeAreaView style={globalStyles.container}>
            <ScrollView>
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.imageText}>📸 Pitch Photo</Text>
                </View>
                
                <View style={globalStyles.content}>
                    <View style={styles.header}>
                        <Text style={globalStyles.title}>{pitch.name}</Text>
                        <View style={[globalStyles.badge, { backgroundColor: colors.success }]}>
                            <Text style={globalStyles.badgeText}>APPROVED</Text>
                        </View>
                    </View>
                    
                    <Text style={[globalStyles.body, { color: colors.textSecondary, marginBottom: 20 }]}>
                        📍 {pitch.location}
                    </Text>

                    <View style={globalStyles.card}>
                        <Text style={globalStyles.subtitle}>Information</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Price:</Text>
                            <Text style={styles.value}>${pitch.price_per_hour}/hr</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Contact:</Text>
                            <Text style={styles.value}>{pitch.contact_number || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Hours:</Text>
                            <Text style={styles.value}>{pitch.opening_hours || 'Flexible'}</Text>
                        </View>
                    </View>

                    <Button 
                        title="Schedule a Match" 
                        onPress={() => navigation.navigate('Matches', { screen: 'CreateMatch', params: { pitchId: pitch.id, pitchName: pitch.name } })} 
                    />

                    <Text style={[globalStyles.subtitle, { marginTop: 30 }]}>Reviews</Text>
                    
                    {/* Add Review */}
                    <View style={[globalStyles.card, { marginTop: 10 }]}>
                        <Text style={styles.label}>Rate this pitch</Text>
                        <View style={globalStyles.row}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <TouchableOpacity key={star} onPress={() => setNewRating(star)}>
                                    <Text style={{ fontSize: 24, marginRight: 8 }}>
                                        {star <= newRating ? '⭐' : '☆'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            style={[globalStyles.input, { height: 80, marginTop: 15 }]}
                            placeholder="Write your experience..."
                            multiline
                            value={newComment}
                            onChangeText={setNewComment}
                        />
                        <Button 
                            title="Submit Review" 
                            onPress={handleAddReview} 
                            disabled={submitting || !newComment}
                            style={{ height: 44, marginTop: 10 }}
                        />
                    </View>

                    {reviews.map(review => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={[globalStyles.row, globalStyles.justifyBetween]}>
                                <Text style={styles.reviewUser}>{review.username}</Text>
                                <Text>{'⭐'.repeat(review.rating)}</Text>
                            </View>                            <Text style={styles.reviewComment}>{review.comment}</Text>
                            <Text style={globalStyles.caption}>{new Date(review.created_at).toLocaleDateString()}</Text>
                        </View>
                    ))}
                    
                    {reviews.length === 0 && (
                        <Text style={styles.emptyText}>No reviews yet. Be the first!</Text>
                    )}
                    
                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    imagePlaceholder: {
        height: 200,
        backgroundColor: colors.gray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '700',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    label: {
        width: 80,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    value: {
        flex: 1,
        color: colors.text,
        fontWeight: '500',
    },
    reviewCard: {
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.lightGray,
    },
    reviewUser: {
        fontWeight: '700',
        color: colors.text,
    },
    reviewComment: {
        marginVertical: 8,
        color: colors.text,
        lineHeight: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontStyle: 'italic',
        marginTop: 20,
    }
});

export default PitchDetailsScreen;

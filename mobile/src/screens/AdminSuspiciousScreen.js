import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    StyleSheet, 
    TouchableOpacity, 
    ActivityIndicator, 
    ScrollView,
    Modal,
    Alert
} from 'react-native';
import { getSuspiciousUsers, getUserSuspiciousActivity } from '../services/api';
import { globalStyles } from '../utils/styles';

const AdminSuspiciousScreen = () => {
    const [loading, setLoading] = useState(true);
    const [suspiciousUsers, setSuspiciousUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userActivity, setUserActivity] = useState([]);
    const [loadingActivity, setLoadingActivity] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadSuspiciousUsers();
    }, []);

    const loadSuspiciousUsers = async () => {
        setLoading(true);
        try {
            const res = await getSuspiciousUsers();
            if (res.success) {
                setSuspiciousUsers(res.data);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to load suspicious users');
        } finally {
            setLoading(false);
        }
    };

    const handleUserPress = async (user) => {
        setSelectedUser(user);
        setLoadingActivity(true);
        setShowModal(true);
        try {
            const res = await getUserSuspiciousActivity(user.id);
            if (res.success) {
                setUserActivity(res.data);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to load user activity');
        } finally {
            setLoadingActivity(false);
        }
    };

    const renderUserItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.userItem} 
            onPress={() => handleUserPress(item)}
        >
            <View>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.email}>{item.email}</Text>
            </View>
            <View style={styles.flagBadge}>
                <Text style={styles.flagText}>SUSPICIOUS</Text>
            </View>
        </TouchableOpacity>
    );

    const renderActivityItem = (activity) => {
        const metadata = JSON.parse(activity.metadata || '{}');
        const attemptedData = JSON.parse(activity.attempted_data || '{}');

        return (
            <View key={activity.id} style={styles.activityCard}>
                <Text style={styles.activityType}>{activity.activity_type}</Text>
                <Text style={styles.timestamp}>{new Date(activity.created_at).toLocaleString()}</Text>
                
                <View style={styles.metaSection}>
                    <Text style={styles.metaLabel}>Location:</Text>
                    <Text style={styles.metaValue}>{metadata.geo_location}</Text>
                </View>
                <View style={styles.metaSection}>
                    <Text style={styles.metaLabel}>IP Address:</Text>
                    <Text style={styles.metaValue}>{activity.ip_address}</Text>
                </View>
                <View style={styles.metaSection}>
                    <Text style={styles.metaLabel}>Device:</Text>
                    <Text style={styles.metaValue}>{metadata.phone_model || 'Unknown'} ({metadata.os} {metadata.android_version})</Text>
                </View>
                <View style={styles.metaSection}>
                    <Text style={styles.metaLabel}>IMEI:</Text>
                    <Text style={styles.metaValue}>{metadata.imei_serial}</Text>
                </View>

                <Text style={styles.dataLabel}>Attempted Data:</Text>
                <View style={styles.dataContainer}>
                    <Text style={styles.dataText}>{JSON.stringify(attemptedData, null, 2)}</Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Suspicious Users</Text>
            {suspiciousUsers.length === 0 ? (
                <View style={styles.centered}>
                    <Text>No suspicious users found.</Text>
                </View>
            ) : (
                <FlatList
                    data={suspiciousUsers}
                    renderItem={renderUserItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                />
            )}

            <Modal
                visible={showModal}
                animationType="slide"
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            Activity: {selectedUser?.username}
                        </Text>
                        <TouchableOpacity onPress={() => setShowModal(false)}>
                            <Text style={styles.closeButton}>Close</Text>
                        </TouchableOpacity>
                    </View>

                    {loadingActivity ? (
                        <View style={styles.centered}>
                            <ActivityIndicator size="large" color="#007AFF" />
                        </View>
                    ) : (
                        <ScrollView contentContainerStyle={styles.modalContent}>
                            {userActivity.map(renderActivityItem)}
                        </ScrollView>
                    )}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        padding: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1C1C1E',
    },
    list: {
        paddingBottom: 20,
    },
    userItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    username: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    email: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 2,
    },
    flagBadge: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    flagText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        color: '#007AFF',
        fontSize: 16,
    },
    modalContent: {
        padding: 16,
    },
    activityCard: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#FF3B30',
    },
    activityType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF3B30',
    },
    timestamp: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 12,
    },
    metaSection: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    metaLabel: {
        width: 100,
        fontSize: 13,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    metaValue: {
        flex: 1,
        fontSize: 13,
        color: '#3A3A3C',
    },
    dataLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1C1C1E',
        marginTop: 12,
        marginBottom: 6,
    },
    dataContainer: {
        backgroundColor: '#F2F2F7',
        padding: 8,
        borderRadius: 6,
    },
    dataText: {
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#3A3A3C',
    }
});

export default AdminSuspiciousScreen;
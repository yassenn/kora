import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Logo from '../components/Logo';
import Banner from '../components/Banner';
import SelectionModal from '../components/SelectionModal';
import { globalStyles, colors } from '../utils/styles';
import { register } from '../services/api';

const USER_TYPES = [
    { label: 'Player', value: 'player' },
    { label: 'Organizer', value: 'organizer' },
    { label: 'Pitch Owner', value: 'pitch_owner' },
];

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('player');
    
    const [roleModalVisible, setRoleModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: 'error' });

    const handleRegister = async () => {
        setFeedback({ message: '', type: 'error' });
        if (!username || !email || !password) {
            setFeedback({ message: 'Please fill in all fields', type: 'error' });
            return;
        }
        setLoading(true);
        try {
            const res = await register({ username, email, password, user_type: userType });
            if (res && res.success) {
                setFeedback({ message: res.message || 'Registration successful! Redirecting to login...', type: 'success' });
                setTimeout(() => {
                    navigation.navigate('Login');
                }, 2000);
            } else {
                setFeedback({ message: res.message || 'Check your details', type: 'error' });
            }
        } catch (error) {
            setFeedback({ message: error.message || 'An error occurred during registration', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <ScrollView contentContainerStyle={globalStyles.content}>
                <View style={styles.header}>
                    <Logo size={60} />
                    <Text style={[globalStyles.title, { marginTop: 16, marginBottom: 8 }]}>Join Kora</Text>
                    <Text style={globalStyles.caption}>Start organizing your soccer matches today</Text>
                </View>

                <Banner 
                    visible={!!feedback.message} 
                    message={feedback.message} 
                    type={feedback.type} 
                    onClose={() => setFeedback({ ...feedback, message: '' })} 
                />

                <View style={globalStyles.inputContainer}>
                    <Text style={globalStyles.inputLabel}>Username</Text>
                    <TextInput
                        style={globalStyles.input}
                        placeholder="Choose a username"
                        value={username}
                        onChangeText={setUsername}
                        placeholderTextColor={colors.gray}
                    />
                </View>

                <View style={globalStyles.inputContainer}>
                    <Text style={globalStyles.inputLabel}>Email</Text>
                    <TextInput
                        style={globalStyles.input}
                        placeholder="your@email.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor={colors.gray}
                    />
                </View>

                <View style={globalStyles.inputContainer}>
                    <Text style={globalStyles.inputLabel}>Password</Text>
                    <TextInput
                        style={globalStyles.input}
                        placeholder="Minimum 6 characters"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor={colors.gray}
                    />
                </View>

                <View style={globalStyles.inputContainer}>
                    <Text style={globalStyles.inputLabel}>Role</Text>
                    <TouchableOpacity 
                        style={styles.pickerButton}
                        onPress={() => setRoleModalVisible(true)}
                    >
                        <Text style={styles.pickerValue}>
                            {USER_TYPES.find(r => r.value === userType)?.label}
                        </Text>
                        <Text style={styles.chevron}>▼</Text>
                    </TouchableOpacity>
                </View>

                <Button title="Create Account" onPress={handleRegister} disabled={loading} style={{ marginTop: 20 }} />

                <View style={styles.footer}>
                    <Text style={globalStyles.caption}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.link}>Login</Text>
                    </TouchableOpacity>
                </View>

                <SelectionModal
                    visible={roleModalVisible}
                    title="Select Your Role"
                    data={USER_TYPES}
                    selectedValue={userType}
                    onSelect={setUserType}
                    onClose={() => setRoleModalVisible(false)}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    pickerButton: {
        height: 56,
        backgroundColor: colors.surface,
        borderRadius: 16,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pickerValue: {
        fontSize: 17,
        color: colors.text,
    },
    chevron: {
        fontSize: 12,
        color: colors.gray,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    link: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.primary,
    }
});

export default RegisterScreen;

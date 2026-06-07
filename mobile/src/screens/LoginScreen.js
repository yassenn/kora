import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Logo from '../components/Logo';
import Banner from '../components/Banner';
import { globalStyles, colors } from '../utils/styles';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login: authLogin } = useAuth();

    const handleLogin = async () => {
        setError('');
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const result = await authLogin(email, password);
            if (result && result.needsVerification) {
                navigation.navigate('Verify', { userId: result.userId, email });
                return;
            }
            // AppNavigator handles navigation via user state
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={globalStyles.centered}
            >
                <View style={[globalStyles.content, { width: '100%' }]}>
                    <View style={styles.header}>
                        <Logo size={80} />
                        <Text style={[globalStyles.title, { marginTop: 20, marginBottom: 8 }]}>Welcome back</Text>
                        <Text style={globalStyles.caption}>Login to your Kora account</Text>
                    </View>

                    <Banner 
                        visible={!!error} 
                        message={error} 
                        type="error" 
                        onClose={() => setError('')} 
                    />

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
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor={colors.gray}
                        />
                    </View>

                    <Button title="Login" onPress={handleLogin} disabled={loading} />
                    
                    <View style={styles.footer}>
                        <Text style={globalStyles.caption}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.link}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    link: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.primary,
    }
});

export default LoginScreen;

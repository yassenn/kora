import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Logo from '../components/Logo';
import Banner from '../components/Banner';
import { globalStyles, colors } from '../utils/styles';
import { useAuth } from '../context/AuthContext';

const VerifyScreen = ({ navigation, route }) => {
    const { userId, email } = route.params;
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { verify } = useAuth();

    const handleVerify = async () => {
        setError('');
        if (code.length < 6) {
            setError('Please enter the 6-digit code');
            return;
        }
        
        setLoading(true);
        try {
            await verify(userId, code);
            // AuthContext will update user state and trigger navigation
        } catch (err) {
            setError(err.message || 'Verification failed. Please check the code.');
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
                        <Text style={[globalStyles.title, { marginTop: 20, marginBottom: 8 }]}>Verify Email</Text>
                        <Text style={globalStyles.caption}>
                            We've sent a 6-digit code to:{"\n"}
                            <Text style={styles.emailText}>{email}</Text>
                        </Text>
                    </View>

                    <Banner 
                        visible={!!error} 
                        message={error} 
                        type="error" 
                        onClose={() => setError('')} 
                    />

                    <View style={globalStyles.inputContainer}>
                        <Text style={globalStyles.inputLabel}>Verification Code</Text>
                        <TextInput
                            style={[globalStyles.input, styles.codeInput]}
                            placeholder="000000"
                            value={code}
                            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').substring(0, 6))}
                            keyboardType="number-pad"
                            maxLength={6}
                            placeholderTextColor={colors.gray}
                            autoFocus
                        />
                    </View>

                    <Button title="Verify" onPress={handleVerify} disabled={loading || code.length < 6} />
                    
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                    >
                        <Text style={styles.backText}>Back to Login</Text>
                    </TouchableOpacity>
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
    emailText: {
        fontWeight: '700',
        color: colors.text,
    },
    codeInput: {
        textAlign: 'center',
        fontSize: 24,
        letterSpacing: 8,
        fontWeight: '700',
    },
    backButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    backText: {
        fontSize: 15,
        color: colors.primary,
        fontWeight: '600',
    }
});

export default VerifyScreen;

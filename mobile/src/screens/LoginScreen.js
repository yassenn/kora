import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import Button from '../components/Button';
import { globalStyles, colors } from '../utils/styles';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { login: authLogin } = useAuth();

    const handleLogin = async () => {
        try {
            const response = await authLogin(email, password);
            if (response && response.id) {
                navigation.navigate('Main');
            }
        } catch (error) {
            Alert.alert('Login Failed', error.message || 'Invalid email or password');
        }
    };

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Kora</Text>
            <TextInput
                style={globalStyles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.gray}
            />
            <TextInput
                style={globalStyles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={colors.gray}
            />
            <Button title="Login" onPress={handleLogin} />
            <Button title="Go to Register" onPress={() => navigation.navigate('Register')} />
        </View>
    );
};

export default LoginScreen;

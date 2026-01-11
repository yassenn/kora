import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Button from '../components/Button';
import { globalStyles, colors } from '../utils/styles';
import { register } from '../services/api';

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('player');

    const handleRegister = async () => {
        try {
            const response = await register({ username, email, password, user_type: userType });
            if (response && response.message === 'User registered') {
                Alert.alert('Registration Successful', 'You can now log in.', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') },
                ]);
            } else if (response) {
                Alert.alert('Registration Failed', response.message || JSON.stringify(response));
            } else {
                Alert.alert('Registration Failed', 'No response from server');
            }
        } catch (error) {
            Alert.alert('Registration Error', error.message || 'An error occurred during registration.');
        }
    };

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Register</Text>
            <TextInput
                style={globalStyles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                placeholderTextColor={colors.gray}
            />
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
            <Picker
                selectedValue={userType}
                style={globalStyles.input}
                onValueChange={(itemValue, itemIndex) => setUserType(itemValue)}
            >
                <Picker.Item label="Player" value="player" />
                <Picker.Item label="Pitch Owner" value="pitch_owner" />
            </Picker>
            <Button title="Register" onPress={handleRegister} />
            <Button title="Go to Login" onPress={() => navigation.navigate('Login')} />
        </View>
    );
};

export default RegisterScreen;
import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../utils/styles';

const HomeScreen = () => {
    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Home Screen</Text>
        </View>
    );
};

export default HomeScreen;
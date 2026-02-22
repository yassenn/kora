import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { globalStyles } from '../utils/styles';

const Button = ({ title, onPress, disabled = false }) => {
    return (
        <TouchableOpacity 
            style={[globalStyles.button, disabled && { opacity: 0.6 }]} 
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={globalStyles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

export default Button;

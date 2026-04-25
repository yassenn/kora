import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { globalStyles, colors } from '../utils/styles';

const Button = ({ title, onPress, disabled = false, variant = 'primary', style }) => {
    const isPrimary = variant === 'primary';
    
    return (
        <TouchableOpacity 
            style={[
                isPrimary ? globalStyles.button : globalStyles.buttonSecondary, 
                disabled && { opacity: 0.5 },
                style
            ]} 
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <Text style={isPrimary ? globalStyles.buttonText : globalStyles.buttonTextSecondary}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

export default Button;

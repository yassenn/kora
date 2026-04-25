import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/styles';

const Logo = ({ size = 100 }) => {
    const fontSize = size * 0.4;
    
    return (
        <View style={[styles.container, { width: size, height: size, borderRadius: size * 0.22 }]}>
            <View style={[styles.innerCircle, { width: size * 0.7, height: size * 0.7, borderRadius: size * 0.35 }]}>
                <Text style={[styles.kText, { fontSize }]}>K</Text>
            </View>
            <Text style={styles.ballIcon}>⚽</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    innerCircle: {
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    kText: {
        color: colors.white,
        fontWeight: '900',
    },
    ballIcon: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        fontSize: 20,
    }
});

export default Logo;

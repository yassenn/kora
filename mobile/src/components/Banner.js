import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { colors } from '../utils/styles';

const Banner = ({ message, type = 'error', visible, onClose }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto-close after 5 seconds for info/success, but maybe keep error visible
            if (type !== 'error') {
                const timer = setTimeout(() => {
                    handleClose();
                }, 5000);
                return () => clearTimeout(timer);
            }
        } else {
            fadeAnim.setValue(0);
            slideAnim.setValue(-20);
        }
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -20,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (onClose) onClose();
        });
    };

    if (!visible && fadeAnim._value === 0) return null;

    const getBackgroundColor = () => {
        switch (type) {
            case 'success': return colors.success + '15'; // 15% opacity
            case 'warning': return colors.warning + '15';
            case 'error': return colors.danger + '10';
            default: return colors.primary + '10';
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success': return colors.success + '40';
            case 'warning': return colors.warning + '40';
            case 'error': return colors.danger + '30';
            default: return colors.primary + '40';
        }
    };

    const getTextColor = () => {
        switch (type) {
            case 'success': return colors.success;
            case 'warning': return colors.warning;
            case 'error': return colors.danger;
            default: return colors.primary;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return '✓';
            case 'warning': return '⚠';
            case 'error': return '✕';
            default: return 'ℹ';
        }
    };

    return (
        <Animated.View 
            style={[
                styles.container, 
                { 
                    backgroundColor: getBackgroundColor(),
                    borderColor: getBorderColor(),
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <View style={styles.content}>
                <View style={[styles.iconCircle, { backgroundColor: getTextColor() + '20' }]}>
                    <Text style={[styles.icon, { color: getTextColor() }]}>{getIcon()}</Text>
                </View>
                <Text style={[styles.message, { color: getTextColor() }]}>{message}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={[styles.closeText, { color: getTextColor() }]}>✕</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 20,
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    message: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
        lineHeight: 20,
    },
    closeButton: {
        padding: 4,
        marginLeft: 10,
    },
    closeText: {
        fontSize: 16,
        fontWeight: '600',
        opacity: 0.7,
    },
});

export default Banner;

import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { colors } from '../utils/styles';

const { width } = Dimensions.get('window');

const FeedbackContext = createContext();

export const FeedbackProvider = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState({
        title: '',
        message: '',
        type: 'success', // 'success', 'error', 'info'
        onPress: null
    });

    const showFeedback = useCallback((title, message, type = 'success', onPress = null) => {
        setConfig({ title, message, type, onPress });
        setVisible(true);
    }, []);

    const hideFeedback = useCallback(() => {
        setVisible(false);
        if (config.onPress) {
            config.onPress();
        }
    }, [config]);

    const getIcon = () => {
        switch (config.type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    };

    const getColor = () => {
        switch (config.type) {
            case 'success': return colors.success;
            case 'error': return colors.danger;
            case 'warning': return colors.warning;
            default: return colors.primary;
        }
    };

    return (
        <FeedbackContext.Provider value={{ showFeedback }}>
            {children}
            <Modal
                transparent
                visible={visible}
                animationType="fade"
                onRequestClose={hideFeedback}
            >
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        <View style={[styles.iconContainer, { backgroundColor: getColor() + '15' }]}>
                            <Text style={styles.iconText}>{getIcon()}</Text>
                        </View>
                        
                        <Text style={styles.title}>{config.title}</Text>
                        <Text style={styles.message}>{config.message}</Text>
                        
                        <TouchableOpacity 
                            style={[styles.button, { backgroundColor: getColor() }]} 
                            onPress={hideFeedback}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>Dismiss</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </FeedbackContext.Provider>
    );
};

export const useFeedback = () => {
    const context = useContext(FeedbackContext);
    if (!context) {
        throw new Error('useFeedback must be used within a FeedbackProvider');
    }
    return context;
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    modalContainer: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 28,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconText: {
        fontSize: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.white,
    }
});

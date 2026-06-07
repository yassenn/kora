import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../utils/styles';

const { width } = Dimensions.get('window');

const FeedbackContext = createContext();

export const FeedbackProvider = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState({
        title: '',
        message: '',
        type: 'success', // 'success', 'error', 'info', 'warning'
        onPress: null
    });

    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(-100))[0];

    const hideFeedback = useCallback(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setVisible(false);
            if (config.onPress) {
                config.onPress();
            }
        });
    }, [fadeAnim, slideAnim, config]);

    const showFeedback = useCallback((title, message, type = 'success', onPress = null) => {
        setConfig({ title, message, type, onPress });
        setVisible(true);
        
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

        // Auto-hide after 4 seconds
        const timer = setTimeout(() => {
            hideFeedback();
        }, 4000);
        return () => clearTimeout(timer);
    }, [fadeAnim, slideAnim, hideFeedback]);

    const getIcon = () => {
        switch (config.type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            default: return 'ℹ';
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
            {visible && (
                <View style={styles.bannerWrapper} pointerEvents="box-none">
                    <SafeAreaView edges={['top']} pointerEvents="box-none">
                        <Animated.View 
                            style={[
                                styles.banner, 
                                { 
                                    backgroundColor: colors.surface,
                                    borderColor: getColor() + '40',
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }]
                                }
                            ]}
                        >
                            <View style={[styles.indicator, { backgroundColor: getColor() }]} />
                            <View style={styles.content}>
                                <View style={[styles.iconCircle, { backgroundColor: getColor() + '15' }]}>
                                    <Text style={[styles.iconText, { color: getColor() }]}>{getIcon()}</Text>
                                </View>
                                <View style={styles.textContainer}>
                                    {config.title ? <Text style={styles.title}>{config.title}</Text> : null}
                                    <Text style={styles.message}>{config.message}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={hideFeedback} style={styles.closeButton}>
                                <Text style={styles.closeText}>✕</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </SafeAreaView>
                </View>
            )}
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
    bannerWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        paddingHorizontal: 16,
    },
    banner: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
        borderWidth: 1,
        marginTop: 10,
    },
    indicator: {
        position: 'absolute',
        left: 0,
        top: 20,
        bottom: 20,
        width: 4,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 2,
    },
    message: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    closeButton: {
        padding: 4,
        marginLeft: 8,
    },
    closeText: {
        fontSize: 16,
        color: colors.gray,
        fontWeight: '600',
    }
});

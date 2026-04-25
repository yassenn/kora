import React from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../utils/styles';

const SelectionModal = ({ visible, onClose, onSelect, data, title, selectedValue }) => {
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.itemCard, 
                selectedValue === item.value && styles.selectedItem
            ]}
            onPress={() => {
                onSelect(item.value);
                onClose();
            }}
            activeOpacity={0.7}
        >
            <Text style={[
                styles.itemText,
                selectedValue === item.value && styles.selectedItemText
            ]}>
                {item.label}
            </Text>
            {selectedValue === item.value && <Text style={styles.checkIcon}>✓</Text>}
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={globalStyles.subtitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <FlatList
                        data={data}
                        renderItem={renderItem}
                        keyExtractor={item => item.value}
                        contentContainerStyle={{ padding: 24 }}
                    />
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        maxHeight: '60%',
        backgroundColor: colors.surface,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 10,
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 20, // Aligned with modern radius
        backgroundColor: colors.background,
        marginBottom: 12,
    },
    selectedItem: {
        backgroundColor: colors.primary + '15', // Light primary tint
        borderWidth: 1,
        borderColor: colors.primary,
    },
    itemText: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text,
    },
    selectedItemText: {
        color: colors.primary,
    },
    checkIcon: {
        color: colors.primary,
        fontSize: 18,
        fontWeight: '900',
    },
    closeIcon: {
        fontSize: 20,
        color: colors.textSecondary,
        fontWeight: '700',
    },
});

export default SelectionModal;

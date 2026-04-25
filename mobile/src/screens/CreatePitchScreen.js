import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { globalStyles, colors } from '../utils/styles';
import { createPitch, updatePitch } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreatePitchScreen = ({ navigation, route }) => {
    const { user } = useAuth();
    const existingPitch = route.params?.pitch;
    
    const [name, setName] = useState(existingPitch?.name || '');
    const [location, setLocation] = useState(existingPitch?.location || '');
    const [price, setPrice] = useState(existingPitch?.price_per_hour?.toString() || '');
    const [contact, setContact] = useState(existingPitch?.contact_number || '');
    const [hours, setHours] = useState(existingPitch?.opening_hours || '');
    const [loading, setLoading] = useState(false);

    const handleSavePitch = async () => {
        if (!name || !location) {
            Alert.alert('Error', 'Name and Location are required');
            return;
        }

        const pitchData = {
            name: name.trim(),
            location: location.trim(),
            price_per_hour: parseFloat(price) || 0,
            contact_number: contact.trim(),
            opening_hours: hours.trim(),
            owner_id: user?.id,
        };

        setLoading(true);
        try {
            let result;
            if (existingPitch?.id) {
                result = await updatePitch(existingPitch.id, pitchData);
            } else {
                result = await createPitch(pitchData);
            }
            
            if (result.success) {
                Alert.alert('Success', `Pitch ${existingPitch ? 'updated' : 'registered'} successfully!`, [
                    { text: 'Great!', onPress: () => navigation.goBack() },
                ]);
            } else {
                Alert.alert('Error', result.message || 'Action failed');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <ScrollView contentContainerStyle={globalStyles.content}>
                <Text style={globalStyles.title}>{existingPitch ? 'Edit Pitch' : 'Register Venue'}</Text>
                
                <View style={styles.formSection}>
                    <Text style={styles.label}>Pitch Name</Text>
                    <TextInput 
                        style={globalStyles.input} 
                        placeholder="e.g. Wembley Stadium" 
                        value={name} 
                        onChangeText={setName}
                        placeholderTextColor={colors.gray}
                    />
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.label}>Location</Text>
                    <TextInput 
                        style={globalStyles.input} 
                        placeholder="Street, City" 
                        value={location} 
                        onChangeText={setLocation}
                        placeholderTextColor={colors.gray}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.formSection, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Price/hr ($)</Text>
                        <TextInput 
                            style={globalStyles.input} 
                            placeholder="0.00" 
                            value={price} 
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            placeholderTextColor={colors.gray}
                        />
                    </View>
                    <View style={[styles.formSection, { flex: 1, marginLeft: 10 }]}>
                        <Text style={styles.label}>Contact</Text>
                        <TextInput 
                            style={globalStyles.input} 
                            placeholder="Phone Number" 
                            value={contact} 
                            onChangeText={setContact}
                            keyboardType="phone-pad"
                            placeholderTextColor={colors.gray}
                        />
                    </View>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.label}>Opening Hours</Text>
                    <TextInput 
                        style={[globalStyles.input, { height: 100, textAlignVertical: 'top', paddingTop: 15 }]} 
                        placeholder="e.g. Mon-Fri: 08:00 - 22:00" 
                        value={hours} 
                        onChangeText={setHours}
                        multiline
                        placeholderTextColor={colors.gray}
                    />
                </View>
                
                <Button 
                    title={existingPitch ? "Save Changes" : "Register Pitch"} 
                    onPress={handleSavePitch}
                    disabled={loading}
                    style={{ marginTop: 20 }}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    formSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
});

export default CreatePitchScreen;

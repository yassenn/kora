import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const MatchesListScreen = ({ navigation }) => {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        // TODO: Fetch public matches from API
        const dummyMatches = [
            { id: '1', pitch_name: 'Pitch A', match_date: '2025-12-20 18:00', match_size: '5v5' },
            { id: '2', pitch_name: 'Pitch B', match_date: '2025-12-21 19:00', match_size: '7v7' },
        ];
        setMatches(dummyMatches);
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('MatchDetails', { matchId: item.id })}>
            <View style={styles.item}>
                <Text style={styles.pitchName}>{item.pitch_name}</Text>
                <Text>{new Date(item.match_date).toLocaleString()}</Text>
                <Text>{item.match_size}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={matches}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    item: {
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    pitchName: {
        fontSize: 24,
    },
});

export default MatchesListScreen;

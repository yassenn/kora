import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList } from 'react-native';

const MatchDetailsScreen = ({ route, navigation }) => {
    const { matchId } = route.params;
    const [match, setMatch] = useState(null);

    useEffect(() => {
        // TODO: Fetch match details from API
        const dummyMatch = {
            id: matchId,
            pitch_name: 'Pitch A',
            match_date: '2025-12-20 18:00',
            match_size: '5v5',
            match_type: 'public',
            duration: 60,
            players: [
                { id: '1', username: 'player1' },
                { id: '2', username: 'player2' },
            ]
        };
        setMatch(dummyMatch);
    }, [matchId]);

    const handleJoinMatch = () => {
        // TODO: Implement join match logic
        console.log('Join match pressed');
    };

    if (!match) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.pitchName}>{match.pitch_name}</Text>
            <Text>{new Date(match.match_date).toLocaleString()}</Text>
            <Text>Size: {match.match_size}</Text>
            <Text>Type: {match.match_type}</Text>
            <Text>Duration: {match.duration} minutes</Text>

            <Text style={styles.playersTitle}>Players</Text>
            <FlatList
                data={match.players}
                renderItem={({ item }) => <Text style={styles.playerItem}>{item.username}</Text>}
                keyExtractor={item => item.id}
            />

            <Button title="Join Match" onPress={handleJoinMatch} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    pitchName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    playersTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    playerItem: {
        fontSize: 16,
        marginVertical: 4,
    }
});

export default MatchDetailsScreen;

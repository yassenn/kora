<?php
class SoccerMatch {
    private $db;

    public function __construct() {
        $this->db = new Database;
    }

    /**
     * Validate match creation data
     */
    public function getCreationErrors($data) {
        $errors = [];

        if (empty($data['pitch_id']) || !is_numeric($data['pitch_id']) || intval($data['pitch_id']) <= 0) {
            $errors['pitch_id'] = 'Valid pitch ID is required';
        }

        if (empty($data['creator_id']) || !is_numeric($data['creator_id']) || intval($data['creator_id']) <= 0) {
            $errors['creator_id'] = 'Valid creator ID is required';
        }

        if (empty($data['match_type']) || !in_array($data['match_type'], ['public', 'private'])) {
            $errors['match_type'] = 'Match type must be public or private';
        }

        if (empty($data['match_size'])) {
            $errors['match_size'] = 'Match size is required';
        }

        if (empty($data['duration']) || !is_numeric($data['duration']) || intval($data['duration']) <= 0) {
            $errors['duration'] = 'Duration must be a positive number';
        }

        if (empty($data['match_date']) || !$this->validateDateTime($data['match_date'])) {
            $errors['match_date'] = 'Match date must be in valid datetime format (YYYY-MM-DD HH:MM:SS)';
        }

        return $errors;
    }

    /**
     * Validate datetime format
     */
    private function validateDateTime($dateTime) {
        $d = \DateTime::createFromFormat('Y-m-d H:i:s', $dateTime);
        return $d && $d->format('Y-m-d H:i:s') === $dateTime;
    }

    // Get all matches
    public function getMatches() {
        $this->db->query("SELECT m.*, p.name as pitch_name, (SELECT COUNT(*) FROM match_players mp WHERE mp.match_id = m.id) as player_count, (SELECT GROUP_CONCAT(CONCAT(player_id, ':', goals)) FROM match_players mp WHERE mp.match_id = m.id) as player_stats FROM matches m JOIN pitches p ON m.pitch_id = p.id WHERE m.match_date >= NOW() ORDER BY m.match_date ASC");
        return $this->db->resultSet();
    }
    
    // Get all public matches
    public function getPublicMatches() {
        $this->db->query("SELECT m.*, p.name as pitch_name, (SELECT COUNT(*) FROM match_players mp WHERE mp.match_id = m.id) as player_count, (SELECT GROUP_CONCAT(CONCAT(player_id, ':', goals)) FROM match_players mp WHERE mp.match_id = m.id) as player_stats FROM matches m JOIN pitches p ON m.pitch_id = p.id WHERE m.match_type = 'public' AND m.status = 'scheduled' AND m.match_date >= NOW() ORDER BY m.match_date ASC");
        return $this->db->resultSet();
    }

    // Get match by ID
    public function getMatchById($id) {
        $this->db->query("SELECT m.*, p.name as pitch_name, (SELECT COUNT(*) FROM match_players mp WHERE mp.match_id = m.id) as player_count, (SELECT GROUP_CONCAT(CONCAT(player_id, ':', goals)) FROM match_players mp WHERE mp.match_id = m.id) as player_stats FROM matches m JOIN pitches p ON m.pitch_id = p.id WHERE m.id = :id");
        $this->db->bind(':id', $id);
        return $this->db->single();
    }

    // Get players for a given match
    public function getMatchPlayers($match_id) {
        $this->db->query('SELECT u.id, u.username, u.profile_picture_url FROM users u JOIN match_players mp ON u.id = mp.player_id WHERE mp.match_id = :match_id');
        $this->db->bind(':match_id', $match_id);
        return $this->db->resultSet();
    }

    // Create a new match
    public function createMatch($data) {
        $this->db->query('INSERT INTO matches (pitch_id, creator_id, match_type, match_size, duration, match_date) VALUES (:pitch_id, :creator_id, :match_type, :match_size, :duration, :match_date)');
        // Bind values
        $this->db->bind(':pitch_id', $data['pitch_id']);
        $this->db->bind(':creator_id', $data['creator_id']);
        $this->db->bind(':match_type', $data['match_type']);
        $this->db->bind(':match_size', $data['match_size']);
        $this->db->bind(':duration', $data['duration']);
        $this->db->bind(':match_date', $data['match_date']);

        // Execute
        error_log("Match data: " . json_encode($data));
        if ($this->db->execute()) {
            $match_id = $this->db->lastInsertId();

            // Automatically add creator as the first player
            $this->db->query('INSERT INTO match_players (match_id, player_id) VALUES (:match_id, :player_id)');
            $this->db->bind(':match_id', $match_id);
            $this->db->bind(':player_id', $data['creator_id']);
            $this->db->execute();

            return true;
        } else {
            return false;
        }
    }

    // Join a match
    public function joinMatch($data) {
        $this->db->query('INSERT INTO match_players (match_id, player_id) VALUES (:match_id, :player_id)');
        // Bind values
        $this->db->bind(':match_id', $data['match_id']);
        $this->db->bind(':player_id', $data['player_id']);

        // Execute
        error_log("Match data: " . json_encode($data));
        if ($this->db->execute()) {
            return true;
        } else {
            return false;
        }
    }

    // Leave a match
    public function leaveMatch($match_id, $player_id) {
        $this->db->query('DELETE FROM match_players WHERE match_id = :match_id AND player_id = :player_id');
        $this->db->bind(':match_id', $match_id);
        $this->db->bind(':player_id', $player_id);

        error_log("Match data: " . json_encode($data));
        if ($this->db->execute()) {
            return true;
        } else {
            return false;
        }
    }

    // Update player stats for a match
    public function updatePlayerStats($data) {
        $this->db->query('UPDATE match_players SET goals = :goals, assists = :assists WHERE match_id = :match_id AND player_id = :player_id');
        // Bind values
        $this->db->bind(':match_id', $data['match_id']);
        $this->db->bind(':player_id', $data['player_id']);
        $this->db->bind(':goals', $data['goals']);
        $this->db->bind(':assists', $data['assists']);

        // Execute
        error_log("Match data: " . json_encode($data));
        if ($this->db->execute()) {
            return true;
        } else {
            return false;
        }
    }

    // Get upcoming matches for a specific user
    public function getUserUpcomingMatches($user_id) {
        $this->db->query("SELECT DISTINCT m.*, p.name as pitch_name 
                          FROM matches m 
                          JOIN pitches p ON m.pitch_id = p.id 
                          LEFT JOIN match_players mp ON m.id = mp.match_id 
                          WHERE (m.creator_id = :user_id OR mp.player_id = :user_id) 
                          AND m.match_date >= NOW() 
                          AND m.status = 'scheduled'
                          ORDER BY m.match_date ASC");
        $this->db->bind(':user_id', $user_id);
        return $this->db->resultSet();
    }

    // Get occupied slots for a pitch on a specific date
    public function getOccupiedSlots($pitch_id, $date) {
        $this->db->query("SELECT match_date, duration FROM matches 
                          WHERE pitch_id = :pitch_id 
                          AND DATE(match_date) = :date 
                          AND status = 'scheduled'");
        $this->db->bind(':pitch_id', $pitch_id);
        $this->db->bind(':date', $date);
        return $this->db->resultSet();
    }

    // Update a match
    public function updateMatch($id, $data) {
        $this->db->query('UPDATE matches SET pitch_id = :pitch_id, match_type = :match_type, match_size = :match_size, duration = :duration, match_date = :match_date, status = :status WHERE id = :id');
        $this->db->bind(':id', $id);
        $this->db->bind(':pitch_id', $data['pitch_id']);
        $this->db->bind(':match_type', $data['match_type']);
        $this->db->bind(':match_size', $data['match_size']);
        $this->db->bind(':duration', $data['duration']);
        $this->db->bind(':match_date', $data['match_date']);
        $this->db->bind(':status', $data['status'] ?? 'scheduled');

        return $this->db->execute();
    }

    // Delete a match
    public function deleteMatch($id) {
        // match_players will be deleted by ON DELETE CASCADE if set up, 
        // but let's be explicit if not sure. (kickoff_db.sql didn't have cascade for matches initially)
        // Wait, kickoff_db.sql has CASCADE for match_invitations and others but NOT match_players.
        $this->db->query('DELETE FROM match_players WHERE match_id = :id');
        $this->db->bind(':id', $id);
        $this->db->execute();

        $this->db->query('DELETE FROM matches WHERE id = :id');
        $this->db->bind(':id', $id);
        return $this->db->execute();
    }
}
?>
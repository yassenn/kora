<?php
class Match {
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
        $this->db->query('SELECT m.*, p.name as pitch_name FROM matches m JOIN pitches p ON m.pitch_id = p.id');
        return $this->db->resultSet();
    }
    
    // Get all public matches
    public function getPublicMatches() {
        $this->db->query("SELECT m.*, p.name as pitch_name FROM matches m JOIN pitches p ON m.pitch_id = p.id WHERE m.match_type = 'public' AND m.status = 'scheduled'");
        return $this->db->resultSet();
    }

    // Get match by ID
    public function getMatchById($id) {
        $this->db->query('SELECT m.*, p.name as pitch_name FROM matches m JOIN pitches p ON m.pitch_id = p.id WHERE m.id = :id');
        $this->db->bind(':id', $id);
        return $this->db->single();
    }

    // Get players for a given match
    public function getMatchPlayers($match_id) {
        $this->db->query('SELECT u.id, u.username FROM users u JOIN match_players mp ON u.id = mp.player_id WHERE mp.match_id = :match_id');
        $this->db->bind(':match_id', $match_id);
        return $this->db->resultSet();
    }

    // Create a new match
    public function createMatch($data) {
        $this->db->query('INSERT INTO matches (pitch_id, creator_id, match_type, match_size, duration, match_date, status) VALUES (:pitch_id, :creator_id, :match_type, :match_size, :duration, :match_date, :status)');
        // Bind values
        $this->db->bind(':pitch_id', $data['pitch_id']);
        $this->db->bind(':creator_id', $data['creator_id']);
        $this->db->bind(':match_type', $data['match_type']);
        $this->db->bind(':match_size', $data['match_size']);
        $this->db->bind(':duration', $data['duration']);
        $this->db->bind(':match_date', $data['match_date']);
        $this->db->bind(':status', 'scheduled');

        // Execute
        if ($this->db->execute()) {
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
        if ($this->db->execute()) {
            return true;
        } else {
            return false;
        }
    }
}
?>
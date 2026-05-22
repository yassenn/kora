<?php
class Review {
    private $db;

    public function __construct() {
        $this->db = new Database;
    }

    public function getPitchReviews($pitch_id) {
        $this->db->query('SELECT r.*, u.username FROM pitch_reviews r JOIN users u ON r.player_id = u.id WHERE r.pitch_id = :pitch_id ORDER BY r.created_at DESC');
        $this->db->bind(':pitch_id', $pitch_id);
        return $this->db->resultSet();
    }

    public function addReview($data) {
        // Check if player has actually completed a match at this pitch
        $this->db->query("SELECT mp.id FROM match_players mp 
                          JOIN matches m ON mp.match_id = m.id 
                          WHERE mp.player_id = :player_id 
                          AND m.pitch_id = :pitch_id 
                          AND m.status = 'completed' 
                          LIMIT 1");
        $this->db->bind(':player_id', $data['player_id']);
        $this->db->bind(':pitch_id', $data['pitch_id']);
        $this->db->single();

        if ($this->db->rowCount() === 0) {
            throw new Exception("You can only review pitches where you have completed a match.");
        }

        // Prevent bypassing the platform
        if (isset($data['comment']) && hasContactInfo($data['comment'])) {
            throw new Exception("Please do not share contact information in your review.");
        }

        $this->db->query('INSERT INTO pitch_reviews (pitch_id, player_id, rating, comment) VALUES (:pitch_id, :player_id, :rating, :comment)');
        $this->db->bind(':pitch_id', $data['pitch_id']);
        $this->db->bind(':player_id', $data['player_id']);
        $this->db->bind(':rating', $data['rating']);
        $this->db->bind(':comment', $data['comment']);
        return $this->db->execute();
    }
}
?>
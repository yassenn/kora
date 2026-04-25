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
        $this->db->query('INSERT INTO pitch_reviews (pitch_id, player_id, rating, comment) VALUES (:pitch_id, :player_id, :rating, :comment)');
        $this->db->bind(':pitch_id', $data['pitch_id']);
        $this->db->bind(':player_id', $data['player_id']);
        $this->db->bind(':rating', $data['rating']);
        $this->db->bind(':comment', $data['comment']);
        return $this->db->execute();
    }
}
?>
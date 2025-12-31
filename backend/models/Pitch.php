<?php
class Pitch {
    private $db;

    public function __construct() {
        $this->db = new Database;
    }

    // Get all pitches
    public function getPitches() {
        $this->db->query('SELECT * FROM pitches');
        return $this->db->resultSet();
    }

    // Get pitch by ID
    public function getPitchById($id) {
        $this->db->query('SELECT * FROM pitches WHERE id = :id');
        $this->db->bind(':id', $id);
        return $this->db->single();
    }

    // Add a new pitch
    public function addPitch($data) {
        $this->db->query('INSERT INTO pitches (name, location, owner_id, status) VALUES (:name, :location, :owner_id, :status)');
        // Bind values
        $this->db->bind(':name', $data['name']);
        $this->db->bind(':location', $data['location']);
        $this->db->bind(':owner_id', $data['owner_id']);
        $this->db->bind(':status', $data['status']);

        // Execute
        if ($this->db->execute()) {
            return true;
        } else {
            return false;
        }
    }
}
?>
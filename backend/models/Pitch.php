<?php
class Pitch {
    private $db;

    public function __construct() {
        $this->db = new Database;
    }

    // Get all pitches (basic info for listing)
    public function getPitches() {
        $this->db->query('SELECT id, name, location, price_per_hour, opening_hours, status, owner_id FROM pitches');
        return $this->db->resultSet();
    }

    // Get pitch by ID
    public function getPitchById($id, $isAdmin = false) {
        $query = $isAdmin 
            ? 'SELECT * FROM pitches WHERE id = :id'
            : 'SELECT id, name, location, owner_id, status, price_per_hour, opening_hours, created_at FROM pitches WHERE id = :id';
        
        $this->db->query($query);
        $this->db->bind(':id', $id);
        return $this->db->single();
    }

    // Add a new pitch
    public function addPitch($data) {
        $this->db->query('INSERT INTO pitches (name, location, owner_id, status, price_per_hour, contact_number, opening_hours) VALUES (:name, :location, :owner_id, :status, :price_per_hour, :contact_number, :opening_hours)');
        // Bind values
        $this->db->bind(':name', $data['name']);
        $this->db->bind(':location', $data['location']);
        $this->db->bind(':owner_id', $data['owner_id']);
        $this->db->bind(':status', $data['status'] ?? 'pending');
        $this->db->bind(':price_per_hour', $data['price_per_hour'] ?? 0);
        $this->db->bind(':contact_number', $data['contact_number'] ?? null);
        $this->db->bind(':opening_hours', $data['opening_hours'] ?? null);

        // Execute
        if ($this->db->execute()) {
            // Notify Admins
            $userModel = new User();
            $notificationModel = new Notification();
            $admins = $userModel->getAdmins();
            
            $message = "New pitch request: " . $data['name'] . " at " . $data['location'];
            foreach ($admins as $admin) {
                $notificationModel->addNotification($admin->id, $message);
            }
            
            return true;
        } else {
            return false;
        }
    }

    /**
     * Get validation errors for pitch data
     */
    public function getValidationErrors($data) {
        $errors = [];
        if (empty($data['name'])) {
            $errors['name'] = 'Pitch name is required';
        }
        if (empty($data['location'])) {
            $errors['location'] = 'Pitch location is required';
        }
        if (empty($data['owner_id']) || !is_numeric($data['owner_id']) || intval($data['owner_id']) <= 0) {
            $errors['owner_id'] = 'Valid owner ID is required';
        }
        return $errors;
    }

    // Get recently added pitches
    public function getRecentPitches($limit = 5, $isAdmin = false) {
        $query = $isAdmin
            ? 'SELECT * FROM pitches WHERE status = "approved" ORDER BY created_at DESC LIMIT :limit'
            : 'SELECT id, name, location, owner_id, status, price_per_hour, opening_hours, created_at FROM pitches WHERE status = "approved" ORDER BY created_at DESC LIMIT :limit';
            
        $this->db->query($query);
        $this->db->bind(':limit', $limit);
        return $this->db->resultSet();
    }

    // Update a pitch
    public function updatePitch($id, $data) {
        $this->db->query('UPDATE pitches SET name = :name, location = :location, price_per_hour = :price_per_hour, contact_number = :contact_number, opening_hours = :opening_hours, status = :status WHERE id = :id');
        $this->db->bind(':id', $id);
        $this->db->bind(':name', $data['name']);
        $this->db->bind(':location', $data['location']);
        $this->db->bind(':price_per_hour', $data['price_per_hour'] ?? 0);
        $this->db->bind(':contact_number', $data['contact_number'] ?? null);
        $this->db->bind(':opening_hours', $data['opening_hours'] ?? null);
        $this->db->bind(':status', $data['status'] ?? 'pending');

        return $this->db->execute();
    }

    // Update only pitch status
    public function updatePitchStatus($id, $status) {
        $this->db->query('UPDATE pitches SET status = :status WHERE id = :id');
        $this->db->bind(':id', $id);
        $this->db->bind(':status', $status);
        return $this->db->execute();
    }

    // Delete a pitch
    public function deletePitch($id) {
        $this->db->query('DELETE FROM pitches WHERE id = :id');
        $this->db->bind(':id', $id);
        return $this->db->execute();
    }
}
?>
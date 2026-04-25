<?php
class Notification {
    private $db;

    public function __construct() {
        $this->db = new Database;
    }

    public function getNotifications($user_id) {
        $this->db->query('SELECT * FROM notifications WHERE user_id = :user_id ORDER BY created_at DESC');
        $this->db->bind(':user_id', $user_id);
        return $this->db->resultSet();
    }

    public function addNotification($user_id, $message) {
        $this->db->query('INSERT INTO notifications (user_id, message) VALUES (:user_id, :message)');
        $this->db->bind(':user_id', $user_id);
        $this->db->bind(':message', $message);
        return $this->db->execute();
    }

    public function markAsRead($id) {
        $this->db->query('UPDATE notifications SET is_read = TRUE WHERE id = :id');
        $this->db->bind(':id', $id);
        return $this->db->execute();
    }
}
?>
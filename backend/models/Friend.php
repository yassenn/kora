<?php
class Friend {
    private $db;

    public function __construct() {
        $this->db = new Database;
    }

    /**
     * Send a friend request
     */
    public function sendRequest($from_id, $to_id) {
        if ($from_id == $to_id) return false;

        // Ensure user_id1 is always smaller than user_id2 for consistency
        $u1 = min($from_id, $to_id);
        $u2 = max($from_id, $to_id);

        // Check if relationship already exists
        $this->db->query('SELECT * FROM friends WHERE user_id1 = :u1 AND user_id2 = :u2');
        $this->db->bind(':u1', $u1);
        $this->db->bind(':u2', $u2);
        $row = $this->db->single();

        if ($row) {
            // If already exists and is pending/accepted, do nothing or update if it was blocked by 'from_id'
            return false; 
        }

        $this->db->query('INSERT INTO friends (user_id1, user_id2, status, action_user_id) VALUES (:u1, :u2, "pending", :action_id)');
        $this->db->bind(':u1', $u1);
        $this->db->bind(':u2', $u2);
        $this->db->bind(':action_id', $from_id);

        if ($this->db->execute()) {
            // Notify recipient
            $userModel = new User();
            $sender = $userModel->findById($from_id);
            $senderName = $sender ? $sender->username : 'A player';
            
            $notificationModel = new Notification();
            $notificationModel->addNotification($to_id, "$senderName sent you a friend request.");
            return true;
        }
        return false;
    }

    /**
     * Accept a friend request
     */
    public function acceptRequest($user_id, $friend_id) {
        $u1 = min($user_id, $friend_id);
        $u2 = max($user_id, $friend_id);

        $this->db->query('UPDATE friends SET status = "accepted", action_user_id = :action_id WHERE user_id1 = :u1 AND user_id2 = :u2 AND status = "pending" AND action_user_id != :action_id');
        $this->db->bind(':u1', $u1);
        $this->db->bind(':u2', $u2);
        $this->db->bind(':action_id', $user_id);

        return $this->db->execute() && $this->db->rowCount() > 0;
    }

    /**
     * Get friends list
     */
    public function getFriends($user_id) {
        $this->db->query('SELECT u.id, u.username, u.user_type, u.profile_picture_url 
                          FROM users u 
                          JOIN friends f ON (u.id = f.user_id1 OR u.id = f.user_id2) 
                          WHERE (f.user_id1 = :user_id OR f.user_id2 = :user_id) 
                          AND u.id != :user_id 
                          AND f.status = "accepted"');
        $this->db->bind(':user_id', $user_id);
        return $this->db->resultSet();
    }

    /**
     * Get pending requests
     */
    public function getPendingRequests($user_id) {
        $this->db->query('SELECT u.id, u.username, f.created_at 
                          FROM users u 
                          JOIN friends f ON u.id = f.action_user_id 
                          WHERE (f.user_id1 = :user_id OR f.user_id2 = :user_id) 
                          AND f.action_user_id != :user_id 
                          AND f.status = "pending"');
        $this->db->bind(':user_id', $user_id);
        return $this->db->resultSet();
    }

    /**
     * Check if two users are friends
     */
    public function areFriends($u1, $u2) {
        $id1 = min($u1, $u2);
        $id2 = max($u1, $u2);
        $this->db->query('SELECT id FROM friends WHERE user_id1 = :u1 AND user_id2 = :u2 AND status = "accepted"');
        $this->db->bind(':u1', $id1);
        $this->db->bind(':u2', $id2);
        $this->db->single();
        return $this->db->rowCount() > 0;
    }
}
?>

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

    public function getNotificationById($id) {
        $this->db->query('SELECT * FROM notifications WHERE id = :id');
        $this->db->bind(':id', $id);
        return $this->db->single();
    }

    public function addNotification($user_id, $message) {
        $this->db->query('INSERT INTO notifications (user_id, message) VALUES (:user_id, :message)');
        $this->db->bind(':user_id', $user_id);
        $this->db->bind(':message', $message);
        
        if ($this->db->execute()) {
            // Send push notification
            $userModel = new User();
            $fcmToken = $userModel->getFcmToken($user_id);
            
            if ($fcmToken) {
                $notificationManager = new NotificationManager();
                $notificationManager->sendPushNotification(
                    $fcmToken,
                    'New Notification',
                    $message,
                    ['type' => 'general']
                );
            }
            return true;
        }
        return false;
    }

    public function markAsRead($id) {
        $this->db->query('UPDATE notifications SET is_read = TRUE WHERE id = :id');
        $this->db->bind(':id', $id);
        return $this->db->execute();
    }
}
?>
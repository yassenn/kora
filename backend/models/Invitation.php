<?php
class Invitation {
    private $db;

    public function __construct() {
        $this->db = new Database;
    }

    public function getUserInvitations($user_id) {
        $this->db->query('SELECT i.*, m.match_date, p.name as pitch_name, u.username as inviter_name 
                          FROM match_invitations i 
                          JOIN matches m ON i.match_id = m.id 
                          JOIN pitches p ON m.pitch_id = p.id
                          JOIN users u ON i.inviter_id = u.id
                          WHERE i.invitee_id = :user_id AND i.status = "pending"');
        $this->db->bind(':user_id', $user_id);
        return $this->db->resultSet();
    }

    public function getMatchInvitations($match_id) {
        $this->db->query("SELECT invitee_id, inviter_id, status FROM match_invitations WHERE match_id = :match_id");
        $this->db->bind(":match_id", $match_id);
        return $this->db->resultSet();
    }

    public function getInvitationById($id) {
        $this->db->query("SELECT * FROM match_invitations WHERE id = :id");
        $this->db->bind(":id", $id);
        return $this->db->single();
    }

    public function createInvitation($data) {
        // Restriction: Only friends can invite each other
        $friendModel = new Friend();
        if (!$friendModel->areFriends($data['inviter_id'], $data['invitee_id'])) {
            error_log("Friendship check failed for {$data['inviter_id']} and {$data['invitee_id']}");
            return false;
        }

        $this->db->query('INSERT INTO match_invitations (match_id, inviter_id, invitee_id) VALUES (:match_id, :inviter_id, :invitee_id)');
        $this->db->bind(':match_id', $data['match_id']);
        $this->db->bind(':inviter_id', $data['inviter_id']);
        $this->db->bind(':invitee_id', $data['invitee_id']);
        
        if ($this->db->execute()) {
            // Send push notification
            $userModel = new User();
            $fcmToken = $userModel->getFcmToken($data['invitee_id']);
            
            if ($fcmToken) {
                $inviter = $userModel->findById($data['inviter_id']);
                $inviterName = $inviter ? $inviter->username : 'Someone';
                
                $notificationManager = new NotificationManager();
                $notificationManager->sendPushNotification(
                    $fcmToken,
                    'New Match Invitation',
                    "You have a new match invitation from $inviterName.",
                    [
                        'type' => 'invitation',
                        'match_id' => $data['match_id']
                    ]
                );
            }
            return true;
        }
        return false;
    }

    public function updateStatus($id, $status) {
        $this->db->query('UPDATE match_invitations SET status = :status WHERE id = :id');
        $this->db->bind(':id', $id);
        $this->db->bind(':status', $status);
        return $this->db->execute();
    }
}
?>
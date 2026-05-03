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
        $this->db->query("SELECT invitee_id FROM match_invitations WHERE match_id = :match_id");
        $this->db->bind(":match_id", $match_id);
        return $this->db->resultSet();
    }

    public function createInvitation($data) {
        $this->db->query('INSERT INTO match_invitations (match_id, inviter_id, invitee_id) VALUES (:match_id, :inviter_id, :invitee_id)');
        $this->db->bind(':match_id', $data['match_id']);
        $this->db->bind(':inviter_id', $data['inviter_id']);
        $this->db->bind(':invitee_id', $data['invitee_id']);
        return $this->db->execute();
    }

    public function updateStatus($id, $status) {
        $this->db->query('UPDATE match_invitations SET status = :status WHERE id = :id');
        $this->db->bind(':id', $id);
        $this->db->bind(':status', $status);
        return $this->db->execute();
    }
}
?>
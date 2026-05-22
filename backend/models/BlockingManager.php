<?php
class BlockingManager {
    private $db;

    public function __construct() {
        $this->db = new Database;
    }

    public function isIpBlocked($ip) {
        $this->db->query('SELECT id FROM blocked_ips WHERE ip_address = :ip');
        $this->db->bind(':ip', $ip);
        $this->db->single();
        return $this->db->rowCount() > 0;
    }

    public function blockIp($ip, $reason = '', $admin_id = null) {
        $this->db->query('INSERT IGNORE INTO blocked_ips (ip_address, reason, blocked_by) VALUES (:ip, :reason, :admin_id)');
        $this->db->bind(':ip', $ip);
        $this->db->bind(':reason', $reason);
        $this->db->bind(':admin_id', $admin_id);
        return $this->db->execute();
    }

    public function unblockIp($ip) {
        $this->db->query('DELETE FROM blocked_ips WHERE ip_address = :ip');
        $this->db->bind(':ip', $ip);
        return $this->db->execute();
    }

    public function blockUser($user_id) {
        $this->db->query('UPDATE users SET is_blocked = 1 WHERE id = :user_id');
        $this->db->bind(':user_id', $user_id);
        return $this->db->execute();
    }

    public function unblockUser($user_id) {
        $this->db->query('UPDATE users SET is_blocked = 0 WHERE id = :user_id');
        $this->db->bind(':user_id', $user_id);
        return $this->db->execute();
    }
}
?>
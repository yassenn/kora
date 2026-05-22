<?php
class RefreshToken {
    private $db;

    public function __construct() {
        $this->db = new Database;
    }

    // Create a new refresh token
    public function create($user_id, $days = 7) {
        $token = bin2hex(random_bytes(32));
        $expires_at = date('Y-m-d H:i:s', time() + ($days * 24 * 60 * 60));

        $this->db->query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)');
        $this->db->bind(':user_id', $user_id);
        $this->db->bind(':token', $token);
        $this->db->bind(':expires_at', $expires_at);

        if ($this->db->execute()) {
            return $token;
        }
        return false;
    }

    // Validate and consume a refresh token
    public function validate($token) {
        $this->db->query('SELECT * FROM refresh_tokens WHERE token = :token AND expires_at > NOW()');
        $this->db->bind(':token', $token);
        $row = $this->db->single();

        if ($row) {
            return $row;
        }
        return false;
    }

    // Delete a refresh token
    public function delete($token) {
        $this->db->query('DELETE FROM refresh_tokens WHERE token = :token');
        $this->db->bind(':token', $token);
        return $this->db->execute();
    }

    // Delete all refresh tokens for a user (e.g., on logout or security reset)
    public function deleteAllForUser($user_id) {
        $this->db->query('DELETE FROM refresh_tokens WHERE user_id = :user_id');
        $this->db->bind(':user_id', $user_id);
        return $this->db->execute();
    }

    // Clean up expired tokens
    public function cleanup() {
        $this->db->query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
        return $this->db->execute();
    }
}
?>
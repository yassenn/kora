<?php
class User {
    private $db;

    public function __construct() {
        $this->db = new Database;
    }

    /**
     * Validate email format
     */
    private function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Validate password strength (minimum 6 characters)
     */
    private function validatePassword($password) {
        return strlen($password) >= 6;
    }

    /**
     * Validate username (not empty, alphanumeric + underscore)
     */
    private function validateUsername($username) {
        return !empty($username) && preg_match('/^[a-zA-Z0-9_]+$/', $username) && strlen($username) >= 3;
    }

    /**
     * Get validation errors for registration data
     */
    public function getRegistrationErrors($data) {
        $errors = [];

        if (empty($data['username'])) {
            $errors['username'] = 'Username is required';
        } elseif (!$this->validateUsername($data['username'])) {
            $errors['username'] = 'Username must be at least 3 characters and contain only letters, numbers, and underscores';
        }

        if (empty($data['email'])) {
            $errors['email'] = 'Email is required';
        } elseif (!$this->validateEmail($data['email'])) {
            $errors['email'] = 'Invalid email format';
        }

        if (empty($data['password'])) {
            $errors['password'] = 'Password is required';
        } elseif (!$this->validatePassword($data['password'])) {
            $errors['password'] = 'Password must be at least 6 characters';
        }

        if (empty($data['user_type']) || !in_array($data['user_type'], ['player', 'organizer', 'pitch_owner', 'admin'])) {
            $errors['user_type'] = 'Invalid user type';
        }

        return $errors;
    }

    // Register User
    public function register($data) {
        $this->db->query('INSERT INTO users (username, email, password, user_type) VALUES (:username, :email, :password, :user_type)');
        // Bind values
        $this->db->bind(':username', $data['username']);
        $this->db->bind(':email', $data['email']);
        $this->db->bind(':password', $data['password']);
        $this->db->bind(':user_type', $data['user_type']);

        // Execute
        if ($this->db->execute()) {
            return true;
        } else {
            return false;
        }
    }

    // Find user by email
    public function findUserByEmail($email) {
        $this->db->query('SELECT * FROM users WHERE email = :email');
        $this->db->bind(':email', $email);

        $row = $this->db->single();

        // Check row
        if ($this->db->rowCount() > 0) {
            return true;
        } else {
            return false;
        }
    }

    // Find user by username
    public function findUserByUsername($username) {
        $this->db->query('SELECT * FROM users WHERE username = :username');
        $this->db->bind(':username', $username);

        $row = $this->db->single();

        // Check row
        if ($this->db->rowCount() > 0) {
            return true;
        } else {
            return false;
        }
    }

    // Find user by ID
    public function findById($id) {
        $this->db->query('SELECT * FROM users WHERE id = :id');
        $this->db->bind(':id', $id);
        return $this->db->single();
    }

    // Login User
    public function login($email, $password) {
        $email = trim(strtolower($email));
        $this->db->query('SELECT * FROM users WHERE email = :email');
        $this->db->bind(':email', $email);

        $row = $this->db->single();

        if ($row) {
            // Check for active lockout
            if ($row->lockout_until && strtotime($row->lockout_until) > time()) {
                throw new Exception("Account is temporarily locked. Please try again later.");
            }

            if (password_verify($password, $row->password)) {
                $this->resetFailedAttempts($row->id);
                return $row;
            } else {
                $this->incrementFailedAttempts($row->id);
            }
        }
        return false;
    }

    private function incrementFailedAttempts($id) {
        $this->db->query('UPDATE users SET failed_attempts = failed_attempts + 1 WHERE id = :id');
        $this->db->bind(':id', $id);
        $this->db->execute();

        // Check if we should lock the account (e.g., after 5 attempts)
        $this->db->query('SELECT failed_attempts FROM users WHERE id = :id');
        $this->db->bind(':id', $id);
        $row = $this->db->single();

        if ($row && $row->failed_attempts >= 5) {
            $lockoutTime = date('Y-m-d H:i:s', time() + (30 * 60)); // 30 minutes lockout
            $this->db->query('UPDATE users SET lockout_until = :lockout WHERE id = :id');
            $this->db->bind(':id', $id);
            $this->db->bind(':lockout', $lockoutTime);
            $this->db->execute();
        }
    }

    private function resetFailedAttempts($id) {
        $this->db->query('UPDATE users SET failed_attempts = 0, lockout_until = NULL WHERE id = :id');
        $this->db->bind(':id', $id);
        $this->db->execute();
    }

    // Get User Stats
    public function getUserStats($user_id) {
        $this->db->query('SELECT 
            (SELECT COUNT(*) FROM match_players WHERE player_id = :user_id) as matches_played,
            SUM(goals) as total_goals,
            SUM(assists) as total_assists
            FROM match_players WHERE player_id = :user_id');
        
        $this->db->bind(':user_id', $user_id);
        
        $row = $this->db->single();
        
        return $row;
    }

    // Update User Role
    public function updateUserType($id, $type) {
        $this->db->query('UPDATE users SET user_type = :type WHERE id = :id');
        $this->db->bind(':id', $id);
        $this->db->bind(':type', $type);
        return $this->db->execute();
    }

    // Update FCM Token
    public function updateFcmToken($user_id, $fcm_token) {
        $this->db->query('UPDATE users SET fcm_token = :fcm_token WHERE id = :id');
        $this->db->bind(':id', $user_id);
        $this->db->bind(':fcm_token', $fcm_token);
        return $this->db->execute();
    }

    // Get FCM Token
    public function getFcmToken($user_id) {
        $this->db->query('SELECT fcm_token FROM users WHERE id = :id');
        $this->db->bind(':id', $user_id);
        $row = $this->db->single();
        return $row ? $row->fcm_token : null;
    }

    // Get all admins
    public function getAdmins() {
        $this->db->query("SELECT id FROM users WHERE user_type = 'admin'");
        return $this->db->resultSet();
    }

    // Delete User and all related data (GDPR)
    public function deleteUser($id) {
        // In a real app, you might want to wrap this in a transaction
        // Since the current Database class doesn't explicitly expose transaction methods,
        // we'll execute them sequentially.
        
        // 1. Delete from match_players
        $this->db->query('DELETE FROM match_players WHERE player_id = :id');
        $this->db->bind(':id', $id);
        $this->db->execute();

        // 2. Delete from reviews
        $this->db->query('DELETE FROM reviews WHERE user_id = :id');
        $this->db->bind(':id', $id);
        $this->db->execute();

        // 3. Delete from notifications
        $this->db->query('DELETE FROM notifications WHERE user_id = :id');
        $this->db->bind(':id', $id);
        $this->db->execute();

        // 4. Delete from invitations
        $this->db->query('DELETE FROM match_invitations WHERE inviter_id = :id OR invitee_id = :id');
        $this->db->bind(':id', $id);
        $this->db->execute();

        // 5. Delete from matches (where user is creator)
        $this->db->query('DELETE FROM matches WHERE creator_id = :id');
        $this->db->bind(':id', $id);
        $this->db->execute();

        // 6. Delete the user
        $this->db->query('DELETE FROM users WHERE id = :id');
        $this->db->bind(':id', $id);
        return $this->db->execute();
    }

    /**
     * Set verification code for a user
     */
    public function setVerificationCode($user_id, $code, $expiry) {
        $this->db->query('UPDATE users SET verification_code = :code, verification_expires_at = :expiry WHERE id = :id');
        $this->db->bind(':id', $user_id);
        $this->db->bind(':code', $code);
        $this->db->bind(':expiry', $expiry);
        return $this->db->execute();
    }

    /**
     * Verify OTP for a user
     */
    public function verifyOTP($user_id, $code) {
        $this->db->query('SELECT * FROM users WHERE id = :id AND verification_code = :code AND verification_expires_at > NOW()');
        $this->db->bind(':id', $user_id);
        $this->db->bind(':code', $code);
        
        $row = $this->db->single();
        
        if ($row) {
            // Set user as verified and clear the code
            $this->db->query('UPDATE users SET is_verified = 1, verification_code = NULL, verification_expires_at = NULL WHERE id = :id');
            $this->db->bind(':id', $user_id);
            return $this->db->execute();
        }
        
        return false;
    }

    // Search users by username
    public function searchUsers($query, $exclude_id = null) {
        if ($exclude_id) {
            $this->db->query('SELECT id, username, user_type FROM users WHERE username LIKE :query AND id != :exclude_id');
            $this->db->bind(":exclude_id", $exclude_id);
        } else {
            $this->db->query('SELECT id, username, user_type FROM users WHERE username LIKE :query');
        }
        $this->db->bind(":query", "%" . $query . "%");
        return $this->db->resultSet();
    }
}
?>

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

    // Get all users
    public function getUsers() {
        $this->db->query('SELECT id, username, email, user_type FROM users');
        return $this->db->resultSet();
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

    // Login User
    public function login($email, $password) {
        $email = trim(strtolower($email));
        $this->db->query('SELECT * FROM users WHERE email = :email');
        $this->db->bind(':email', $email);

        $row = $this->db->single();

        $hashed_password = $row->password;
        if (password_verify($password, $hashed_password)) {
            return $row;
        } else {
            return false;
        }
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

    // Get all admins
    public function getAdmins() {
        $this->db->query("SELECT id FROM users WHERE user_type = 'admin'");
        return $this->db->resultSet();
    }
}
?>
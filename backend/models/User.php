<?php
class User {
    private $db;

    public function __construct() {
        $this->db = new Database;
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

    // Login User
    public function login($email, $password) {
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
}
?>
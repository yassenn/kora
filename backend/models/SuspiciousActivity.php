<?php
class SuspiciousActivity {
    private $db;

    public function __construct() {
        $this->db = new Database;
    }

    public function log($activity_type, $attempted_data = null, $user_id = null) {
        $ip = $_SERVER['REMOTE_ADDR'];
        $user_agent = $_SERVER['HTTP_USER_AGENT'];
        
        // Capture headers sent by the mobile app
        $metadata = [
            'os' => $_SERVER['HTTP_X_OS'] ?? 'Unknown',
            'phone_model' => $_SERVER['HTTP_X_PHONE_MODEL'] ?? 'Unknown',
            'android_version' => $_SERVER['HTTP_X_ANDROID_VERSION'] ?? 'Unknown',
            'imei_serial' => $_SERVER['HTTP_X_IMEI'] ?? 'Unknown',
            'geo_location' => $this->getGeoLocation($ip)
        ];

        $this->db->query('INSERT INTO suspicious_activities (user_id, activity_type, attempted_data, ip_address, user_agent, metadata) 
                          VALUES (:user_id, :activity_type, :attempted_data, :ip, :user_agent, :metadata)');
        
        $this->db->bind(':user_id', $user_id);
        $this->db->bind(':activity_type', $activity_type);
        $this->db->bind(':attempted_data', json_encode($attempted_data));
        $this->db->bind(':ip', $ip);
        $this->db->bind(':user_agent', $user_agent);
        $this->db->bind(':metadata', json_encode($metadata));

        $this->db->execute();

        // Flag the user as suspicious if they are logged in
        if ($user_id) {
            $this->db->query('UPDATE users SET is_suspicious = 1 WHERE id = :user_id');
            $this->db->bind(':user_id', $user_id);
            $this->db->execute();
        }
    }

    public function getSuspiciousUsers() {
        $this->db->query('SELECT id, username, email, is_suspicious FROM users WHERE is_suspicious = 1');
        return $this->db->resultSet();
    }

    public function getUserActivity($user_id) {
        $this->db->query('SELECT * FROM suspicious_activities WHERE user_id = :user_id ORDER BY created_at DESC');
        $this->db->bind(':user_id', $user_id);
        return $this->db->resultSet();
    }

    private function getGeoLocation($ip) {
        // In a real production environment, you would use a service like ip-api.com or MaxMind
        // For now, we'll return a placeholder or attempt a quick fetch if possible
        try {
            $ctx = stream_context_create(['http' => ['timeout' => 2]]);
            $res = @file_get_contents("http://ip-api.com/json/$ip", false, $ctx);
            if ($res) {
                $data = json_decode($res, true);
                if ($data && $data['status'] === 'success') {
                    return $data['city'] . ', ' . $data['country'];
                }
            }
        } catch (Exception $e) {}
        return 'Unknown Location';
    }
}
?>
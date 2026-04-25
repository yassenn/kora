<?php
class Warning {
    private $db;

    public function __construct() {
        $this->db = new Database;
    }

    public function getPlayerWarnings($player_id) {
        $this->db->query('SELECT w.*, u.username as admin_name FROM warnings w JOIN users u ON w.admin_id = u.id WHERE w.player_id = :player_id');
        $this->db->bind(':player_id', $player_id);
        return $this->db->resultSet();
    }

    public function addWarning($data) {
        $this->db->query('INSERT INTO warnings (player_id, admin_id, reason) VALUES (:player_id, :admin_id, :reason)');
        $this->db->bind(':player_id', $data['player_id']);
        $this->db->bind(':admin_id', $data['admin_id']);
        $this->db->bind(':reason', $data['reason']);
        return $this->db->execute();
    }
}
?>
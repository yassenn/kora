<?php
include_once '../../core/initialize.php';

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

$warning = new Warning();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $player_id = $_GET['player_id'] ?? null;
        if (!$player_id) ApiResponse::error('player_id is required');
        $result = $warning->getPlayerWarnings($player_id);
        ApiResponse::success('Warnings retrieved', $result);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['player_id']) || empty($data['admin_id']) || empty($data['reason'])) {
            ApiResponse::error('player_id, admin_id, and reason are required');
        }
        if ($warning->addWarning($data)) {
            ApiResponse::success('Warning added successfully');
        } else {
            ApiResponse::error('Creation failed');
        }
        break;

    default:
        ApiResponse::error('Method not allowed', 405);
}
?>
<?php
require_once '../../core/initialize.php';

// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');

$match = new Match();
$method = $_SERVER['REQUEST_METHOD'];

// Route based on request method
switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $match_id = intval($_GET['id']);
            if ($match_id <= 0) {
                ApiResponse::validationError('Invalid match ID');
            }
            $match_data = $match->getMatchById($match_id);
            if ($match_data) {
                $match_data->players = $match->getMatchPlayers($match_id);
                ApiResponse::success('Match retrieved', $match_data);
            } else {
                ApiResponse::error('Match not found', 404);
            }
        } else {
            $result = $match->getPublicMatches();
            ApiResponse::success('Matches retrieved', $result);
        }
        break;

    case 'POST':
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"), true);

        // Validate data
        $errors = $match->getCreationErrors($data);
        if (!empty($errors)) {
            ApiResponse::validationError('Match creation validation failed', $errors);
        }

        if ($match->createMatch($data)) {
            ApiResponse::success('Match created successfully');
        } else {
            ApiResponse::error('Match creation failed', 500);
        }
        break;

    case 'PUT':
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['match_id']) || empty($data['player_id']) || !isset($data['goals']) || !isset($data['assists'])) {
            ApiResponse::validationError('match_id, player_id, goals, and assists are required');
        }

        if ($match->updatePlayerStats($data)) {
            ApiResponse::success('Player stats updated successfully');
        } else {
            ApiResponse::error('Player stats update failed', 500);
        }
        break;

    case 'PATCH':
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['match_id']) || empty($data['player_id'])) {
            ApiResponse::validationError('match_id and player_id are required');
        }

        if ($match->joinMatch($data)) {
            ApiResponse::success('Player joined match successfully');
        } else {
            ApiResponse::error('Could not join match', 500);
        }
        break;
    
    default:
        ApiResponse::error('Method not allowed', 405);
        break;

}
?>

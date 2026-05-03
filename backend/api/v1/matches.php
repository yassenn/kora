<?php
require_once '../../core/initialize.php';

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$match = new SoccerMatch();
$method = $_SERVER['REQUEST_METHOD'];

// Route based on request method
switch ($method) {
    case 'GET':
        if (isset($_GET['all'])) { $result = $match->getMatches(); ApiResponse::success('All matches retrieved', $result); } elseif (isset($_GET['id'])) {
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
        } elseif (isset($_GET['upcoming_for_user_id'])) {
            $user_id = intval($_GET['upcoming_for_user_id']);
            $result = $match->getUserUpcomingMatches($user_id);
            ApiResponse::success('Upcoming matches retrieved', $result);
        } elseif (isset($_GET['check_availability']) && isset($_GET['pitch_id']) && isset($_GET['date'])) {
            $result = $match->getOccupiedSlots($_GET['pitch_id'], $_GET['date']);
            ApiResponse::success('Occupied slots retrieved', $result);
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
        
        if (isset($data['type']) && $data['type'] == 'update_stats') {
            if (empty($data['match_id']) || empty($data['player_id']) || !isset($data['goals']) || !isset($data['assists'])) {
                ApiResponse::validationError('match_id, player_id, goals, and assists are required');
            }
            if ($match->updatePlayerStats($data)) {
                ApiResponse::success('Player stats updated successfully');
            } else {
                ApiResponse::error('Player stats update failed', 500);
            }
        } else {
            // General match update
            if (empty($data['id'])) {
                ApiResponse::validationError('Match ID is required');
            }
            if ($match->updateMatch($data['id'], $data)) {
                ApiResponse::success('Match updated successfully');
            } else {
                ApiResponse::error('Match update failed', 500);
            }
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

    case 'DELETE':
        // Get raw data
        $data = json_decode(file_get_contents("php://input"), true);
        
        $match_id = $data['id'] ?? $data['match_id'] ?? $_GET['id'] ?? $_GET['match_id'] ?? null;
        $player_id = $data['player_id'] ?? $_GET['player_id'] ?? null;

        if (!$match_id) {
            ApiResponse::validationError('match_id is required');
        }

        if ($player_id) {
            // Leave match
            if ($match->leaveMatch($match_id, $player_id)) {
                ApiResponse::success('Player left match successfully');
            } else {
                ApiResponse::error('Could not leave match', 500);
            }
        } else {
            // Delete match entirely
            if ($match->deleteMatch($match_id)) {
                ApiResponse::success('Match deleted successfully');
            } else {
                ApiResponse::error('Match deletion failed', 500);
            }
        }
        break;
    
    default:
        ApiResponse::error('Method not allowed', 405);
        break;

}
?>

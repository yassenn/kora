<?php
require_once '../../core/initialize.php';

// Rate Limiting: Max 60 requests per minute
$ip = $_SERVER['REMOTE_ADDR'];
if (!RateLimiter::check($_SERVER['SCRIPT_NAME'] . "_$ip", 60, 60)) {
    ApiResponse::error('Too many requests. Please try again later.', 429);
}

$match = new SoccerMatch();
$method = $_SERVER['REQUEST_METHOD'];

try {
    // Route based on request method
    switch ($method) {
        case 'GET':
            if (isset($_GET['all'])) { 
                requireBearerToken(); // Sensitive list
                $result = $match->getMatches(); 
                ApiResponse::success('All matches retrieved', $result); 
            } elseif (isset($_GET['id'])) {
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
                $decoded = requireBearerToken();
                $user_id = intval($_GET['upcoming_for_user_id']);
                
                if ($user_id !== $decoded->user_id && $decoded->user_type !== 'admin') {
                    ApiResponse::error('Unauthorized access to upcoming matches', 403);
                }

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
            $decoded = requireBearerToken();
            $data = getJsonInput();

            // Validate data
            $errors = $match->getCreationErrors($data);
            if (!empty($errors)) {
                ApiResponse::validationError('Match creation validation failed', $errors);
            }

            // Validate enums
            Validator::validateEnum($data['match_type'], ['public', 'private'], 'match_type');
            Validator::validateEnum($data['match_size'], ['5v5', '6v6', '7v7', '8v8', '9v9', '11v11'], 'match_size');

            // Ensure creator_id matches authenticated user
            $data['creator_id'] = $decoded->user_id;

            if ($match->createMatch($data)) {
                ApiResponse::success('Match created successfully');
            } else {
                ApiResponse::error('Match creation failed', 500);
            }
            break;

        case 'PUT':
            $decoded = requireBearerToken();
            $data = getJsonInput();
            
            if (isset($data['type']) && $data['type'] == 'update_stats') {
                if (empty($data['match_id']) || empty($data['player_id']) || !isset($data['goals']) || !isset($data['assists'])) {
                    ApiResponse::validationError('match_id, player_id, goals, and assists are required');
                }
                
                // Only admin or match creator can update stats
                $existing_match = $match->getMatchById($data['match_id']);
                if (!$existing_match || ($existing_match->creator_id != $decoded->user_id && $decoded->user_type !== 'admin')) {
                    ApiResponse::error('Unauthorized to update stats for this match', 403);
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
                
                // Authorization: check if user is the creator
                $existing_match = $match->getMatchById($data['id']);
                if (!$existing_match || ($existing_match->creator_id != $decoded->user_id && $decoded->user_type !== 'admin')) {
                    ApiResponse::error('Unauthorized to update this match', 403);
                }

                if (isset($data['match_type'])) Validator::validateEnum($data['match_type'], ['public', 'private'], 'match_type');
                if (isset($data['match_size'])) Validator::validateEnum($data['match_size'], ['5v5', '6v6', '7v7', '8v8', '9v9', '11v11'], 'match_size');
                if (isset($data['status'])) Validator::validateEnum($data['status'], ['scheduled', 'completed', 'cancelled'], 'status');

                if ($match->updateMatch($data['id'], $data)) {
                    ApiResponse::success('Match updated successfully');
                } else {
                    ApiResponse::error('Match update failed', 500);
                }
            }
            break;

        case 'PATCH':
            $decoded = requireBearerToken();
            $data = getJsonInput();

            if (empty($data['match_id']) || empty($data['player_id'])) {
                ApiResponse::validationError('match_id and player_id are required');
            }
            
            // Ensure player joining is the authenticated user
            if ($data['player_id'] != $decoded->user_id && $decoded->user_type !== 'admin') {
                ApiResponse::error('Unauthorized: You can only join for yourself', 403);
            }

            if ($match->joinMatch($data)) {
                ApiResponse::success('Player joined match successfully');
            } else {
                ApiResponse::error('Could not join match', 500);
            }
            break;

        case 'DELETE':
            $decoded = requireBearerToken();
            $data = getJsonInput();
            
            $match_id = $data['id'] ?? $data['match_id'] ?? $_GET['id'] ?? $_GET['match_id'] ?? null;
            $player_id = $data['player_id'] ?? $_GET['player_id'] ?? null;

            if (!$match_id) {
                ApiResponse::validationError('match_id is required');
            }

            if ($player_id) {
                // Leave match: Ensure player leaving is the authenticated user
                if ($player_id != $decoded->user_id && $decoded->user_type !== 'admin') {
                    ApiResponse::error('Unauthorized: You can only leave for yourself', 403);
                }

                if ($match->leaveMatch($match_id, $player_id)) {
                    ApiResponse::success('Player left match successfully');
                } else {
                    ApiResponse::error('Could not leave match', 500);
                }
            } else {
                // Delete match entirely: Ensure user is the creator
                $existing_match = $match->getMatchById($match_id);
                if (!$existing_match || ($existing_match->creator_id != $decoded->user_id && $decoded->user_type !== 'admin')) {
                    ApiResponse::error('Unauthorized to delete this match', 403);
                }

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
} catch (Exception $e) {
    ApiResponse::error('An unexpected error occurred: ' . $e->getMessage(), 500);
}
?>

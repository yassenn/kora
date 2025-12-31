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
            $match_id = $_GET['id'];
            $match_data = $match->getMatchById($match_id);
            if ($match_data) {
                $match_data->players = $match->getMatchPlayers($match_id);
                echo json_encode($match_data);
            } else {
                echo json_encode(['message' => 'Match not found']);
            }
        } else {
            $result = $match->getPublicMatches();
            echo json_encode($result);
        }
        break;

    case 'POST':
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"));

        if ($match->createMatch($data)) {
            echo json_encode(['message' => 'Match Created']);
        } else {
            echo json_encode(['message' => 'Match Not Created']);
        }
        break;

    case 'PUT':
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"));

        if ($match->updatePlayerStats($data)) {
            echo json_encode(['message' => 'Player stats updated']);
        } else {
            echo json_encode(['message' => 'Player stats not updated']);
        }
        break;

    case 'PATCH':
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"));

        if ($match->joinMatch($data)) {
            echo json_encode(['message' => 'Player joined match']);
        } else {
            echo json_encode(['message' => 'Could not join match']);
        }
        break;
    
    default:
        header('HTTP/1.0 405 Method Not Allowed');
        echo json_encode(['message' => 'Method not allowed']);
        break;

}

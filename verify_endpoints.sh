#!/bin/bash
API_URL="http://localhost/api/v1" # Adjust if your local server uses a different port

echo "Testing Users API..."
curl -s -X POST -H "Content-Type: application/json" -d '{"type":"login","email":"test@example.com","password":"password123"}' $API_URL/users.php

echo -e "\n\nTesting Matches API..."
curl -s $API_URL/matches.php

echo -e "\n\nTesting Pitches API..."
curl -s $API_URL/pitches.php

echo -e "\n\nTesting Notifications API (should fail without user_id)..."
curl -s $API_URL/notifications.php

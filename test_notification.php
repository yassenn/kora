<?php
require_once 'backend/core/initialize.php';

$userId = 1; // Admin user
$message = "Visible Test Notification at " . date('H:i:s');

echo "--- FCM TEST --- \n";
echo "1. Put your app in the BACKGROUND (go to home screen)\n";
echo "2. Waiting 5 seconds...\n";
sleep(5);

echo "Attempting to send notification to User ID $userId...\n";

$notification = new Notification();
if ($notification->addNotification($userId, $message)) {
    echo "SUCCESS: Notification sent through FCM.\n";
    echo "Check your phone's notification tray.\n";
} else {
    echo "FAILED: Could not send notification.\n";
}

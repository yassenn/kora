<?php
/**
 * NotificationManager
 * Handles sending push notifications via Firebase Cloud Messaging (FCM) HTTP v1 API.
 */
class NotificationManager {
    private $projectId;
    private $serviceAccountPath;

    public function __construct() {
        $this->projectId = getenv('FIREBASE_PROJECT_ID');
        $this->serviceAccountPath = APPROOT . '/' . (getenv('FIREBASE_SERVICE_ACCOUNT_JSON') ?: 'config/firebase_credentials.json');
    }

    /**
     * Send a push notification to a specific device token
     */
    public function sendPushNotification($deviceToken, $title, $body, $data = []) {
        if (empty($deviceToken)) return false;

        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            error_log("FCM Error: Could not fetch access token.");
            return false;
        }

        $url = "https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send";

        $payload = [
            'message' => [
                'token' => $deviceToken,
                'notification' => [
                    'title' => $title,
                    'body' => $body
                ],
                'android' => [
                    'priority' => 'high',
                    'notification' => [
                        'channel_id' => 'default_channel',
                        'click_action' => 'TOP_STORY_ACTIVITY',
                        'sound' => 'default'
                    ]
                ],
                'data' => array_map('strval', $data)
            ]
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            error_log("FCM Error: Push delivery failed with HTTP code $httpCode");
            return false;
        }

        return true;
    }

    /**
     * Mints a short-lived OAuth 2.0 access token using the service account JSON.
     * Note: In a production environment with high traffic, this token should be cached.
     */
    private function getAccessToken() {
        if (!file_exists($this->serviceAccountPath)) {
            error_log("FCM Error: Service account file missing");
            return null;
        }

        $json = json_decode(file_get_contents($this->serviceAccountPath), true);
        $privateKey = $json['private_key'];
        $clientEmail = $json['client_email'];

        $header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
        $now = time();
        $payload = json_encode([
            'iss' => $clientEmail,
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
            'aud' => 'https://oauth2.googleapis.com/token',
            'exp' => $now + 3600,
            'iat' => $now
        ]);

        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode($payload);

        openssl_sign($base64UrlHeader . "." . $base64UrlPayload, $signature, $privateKey, OPENSSL_ALGO_SHA256);
        $base64UrlSignature = $this->base64UrlEncode($signature);

        $jwt = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);
        return $data['access_token'] ?? null;
    }

    private function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }
}

<?php

class EmailManager {
    private static $apiKey;
    private static $fromEmail;

    public static function init() {
        self::$apiKey = getenv('SENDGRID_API_KEY');
        self::$fromEmail = getenv('SENDGRID_FROM_EMAIL');
    }

    private static function maskEmail($email) {
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            list($first, $last) = explode('@', $email);
            $len = strlen($first);
            $mask = ($len <= 2) ? $first : substr($first, 0, 1) . str_repeat('*', $len - 2) . substr($first, -1);
            return $mask . '@' . $last;
        }
        return '***@***.***';
    }

    public static function sendOTP($toEmail, $otp) {
        self::init();

        if (empty(self::$apiKey)) {
            $maskedEmail = self::maskEmail($toEmail);
            error_log("SENDGRID_API_KEY is missing. OTP delivery attempted for $maskedEmail");
            return true; // Return true as requested for testing
        }

        $url = 'https://api.sendgrid.com/v3/mail/send';
        $data = [
            'personalizations' => [
                [
                    'to' => [['email' => $toEmail]],
                    'subject' => 'Your Kora Verification Code'
                ]
            ],
            'from' => ['email' => self::$fromEmail, 'name' => 'Kora App'],
            'content' => [
                [
                    'type' => 'text/plain',
                    'value' => "Your 6-digit verification code is: $otp. It will expire in 15 minutes."
                ]
            ]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . self::$apiKey,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            return true;
        } else {
            error_log("SendGrid error ($httpCode): Delivery failed");
            $maskedEmail = self::maskEmail($toEmail);
            error_log("Fallback: OTP delivery failed for $maskedEmail");
            return false;
        }
    }
}

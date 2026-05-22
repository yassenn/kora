<?php
/**
 * Simple JWT Class
 * (For production, use firebase/php-jwt)
 */
class SimpleJWT {
    private static $secret;

    private static function init() {
        $secret = getenv('JWT_SECRET');
        if (empty($secret)) {
            throw new Exception('JWT_SECRET is not set in environment variables');
        }
        self::$secret = $secret;
    }

    public static function encode($payload) {
        self::init();
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode(json_encode($payload));
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function decode($jwt) {
        self::init();
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) !== 3) return false;
        
        $header = base64_decode(self::base64UrlDecode($tokenParts[0]));
        $payload = base64_decode(self::base64UrlDecode($tokenParts[1]));
        $signatureProvided = $tokenParts[2];

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        $signatureCheck = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret, true);
        $base64UrlSignatureCheck = self::base64UrlEncode($signatureCheck);

        if ($base64UrlSignatureCheck === $signatureProvided) {
            $payloadObj = json_decode($payload);
            if (isset($payloadObj->exp) && $payloadObj->exp < time()) {
                return false; // Expired
            }
            return $payloadObj;
        }

        return false;
    }

    private static function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private static function base64UrlDecode($data) {
        return str_replace(['-', '_'], ['+', '/'], $data);
    }
}

<?php
class RateLimiter {
    private static $storageDir = APPROOT . '/tmp/ratelimit';

    public static function check($key, $limit = 60, $period = 60) {
        if (!is_dir(self::$storageDir)) {
            mkdir(self::$storageDir, 0777, true);
        }

        $file = self::$storageDir . '/' . md5($key);
        $now = time();
        $requests = [];

        if (file_exists($file)) {
            $requests = json_decode(file_get_contents($file), true) ?: [];
        }

        // Filter requests within the period
        $requests = array_filter($requests, function($timestamp) use ($now, $period) {
            return $timestamp > ($now - $period);
        });

        if (count($requests) >= $limit) {
            return false;
        }

        $requests[] = $now;
        file_put_contents($file, json_encode($requests));
        return true;
    }
}

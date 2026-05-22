CREATE TABLE IF NOT EXISTS suspicious_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    activity_type VARCHAR(255) NOT NULL,
    attempted_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

ALTER TABLE users ADD COLUMN is_suspicious TINYINT DEFAULT 0;

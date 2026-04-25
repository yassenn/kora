-- Database Enhancements for Kora

USE kickoff_db;

-- 1. Standardize user_type and add missing types
ALTER TABLE users MODIFY COLUMN user_type ENUM('player', 'organizer', 'pitch_owner', 'admin') NOT NULL;

-- 2. Add notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Add pitch_reviews table
CREATE TABLE IF NOT EXISTS pitch_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pitch_id INT NOT NULL,
    player_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pitch_id) REFERENCES pitches(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Add pitch_images table
CREATE TABLE IF NOT EXISTS pitch_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pitch_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pitch_id) REFERENCES pitches(id) ON DELETE CASCADE
);

-- 5. Add refresh_tokens table for JWT
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Add pitch_details or expand pitches table
-- Adding columns to pitches table for simplicity as requested features are basic
ALTER TABLE pitches 
ADD COLUMN price_per_hour DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN contact_number VARCHAR(20),
ADD COLUMN opening_hours TEXT;

-- 7. Add match_invitations table
CREATE TABLE IF NOT EXISTS match_invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    inviter_id INT NOT NULL,
    invitee_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invitee_id) REFERENCES users(id) ON DELETE CASCADE
);

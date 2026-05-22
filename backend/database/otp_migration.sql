USE kickoff_db;

ALTER TABLE users 
ADD COLUMN is_verified TINYINT DEFAULT 0,
ADD COLUMN verification_code VARCHAR(10),
ADD COLUMN verification_expires_at DATETIME;

-- Production Database Optimizations for Kora

USE kickoff_db;

-- Index for filtering matches by date and status (Common in HomeScreen and MatchesList)
CREATE INDEX idx_matches_date_status ON matches(match_date, status);

-- Index for filtering pitches by status (Common in Admin and Public lists)
CREATE INDEX idx_pitches_status ON pitches(status);

-- Index for unread notifications (Common for badge counts)
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- Index for searching users by type
CREATE INDEX idx_users_type ON users(user_type);

-- Index for invitations status
CREATE INDEX idx_match_invitations_status ON match_invitations(status);

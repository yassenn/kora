USE kickoff_db;

-- Clear existing data (optional, but good for a clean state)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE match_players;
TRUNCATE TABLE match_invitations;
TRUNCATE TABLE pitch_reviews;
TRUNCATE TABLE pitch_images;
TRUNCATE TABLE notifications;
TRUNCATE TABLE warnings;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE matches;
TRUNCATE TABLE pitches;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Users
-- Password is 'password123'
SET @pass = '$2y$10$6MkE01T7.O44x7FEDmSwt.mmIIpMghv6Lgo/u6QOzxQPhe/ZT39Se';

INSERT INTO users (username, email, password, user_type) VALUES
('admin_user', 'admin@example.com', @pass, 'admin'),
('owner_john', 'john@owner.com', @pass, 'pitch_owner'),
('owner_sarah', 'sarah@owner.com', @pass, 'pitch_owner'),
('player_mike', 'mike@player.com', @pass, 'player'),
('player_david', 'david@player.com', @pass, 'player'),
('player_emma', 'emma@player.com', @pass, 'player'),
('player_alex', 'alex@player.com', @pass, 'player'),
('player_sofia', 'sofia@player.com', @pass, 'player');

-- Get IDs
SET @admin_id = (SELECT id FROM users WHERE username = 'admin_user');
SET @owner1_id = (SELECT id FROM users WHERE username = 'owner_john');
SET @owner2_id = (SELECT id FROM users WHERE username = 'owner_sarah');
SET @player1_id = (SELECT id FROM users WHERE username = 'player_mike');
SET @player2_id = (SELECT id FROM users WHERE username = 'player_david');
SET @player3_id = (SELECT id FROM users WHERE username = 'player_emma');
SET @player4_id = (SELECT id FROM users WHERE username = 'player_alex');
SET @player5_id = (SELECT id FROM users WHERE username = 'player_sofia');

-- Insert Pitches
INSERT INTO pitches (name, location, owner_id, status, price_per_hour, contact_number, opening_hours) VALUES
('Old Trafford Arena', 'Manchester, UK', @owner1_id, 'approved', 50.00, '+44 123 456 789', 'Mon-Sun: 08:00-22:00'),
('Anfield Sports Hub', 'Liverpool, UK', @owner1_id, 'approved', 45.00, '+44 987 654 321', 'Mon-Sun: 09:00-23:00'),
('Camp Nou Mini', 'Barcelona, Spain', @owner2_id, 'approved', 60.00, '+34 600 000 000', 'Mon-Sun: 07:00-21:00'),
('Bernabeu Turf', 'Madrid, Spain', @owner2_id, 'pending', 55.00, '+34 700 000 000', 'Mon-Fri: 10:00-22:00');

-- Get Pitch IDs
SET @pitch1_id = (SELECT id FROM pitches WHERE name = 'Old Trafford Arena');
SET @pitch2_id = (SELECT id FROM pitches WHERE name = 'Anfield Sports Hub');
SET @pitch3_id = (SELECT id FROM pitches WHERE name = 'Camp Nou Mini');

-- Insert Pitch Images (Placeholder URLs)
INSERT INTO pitch_images (pitch_id, image_url) VALUES
(@pitch1_id, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=500&q=60'),
(@pitch2_id, 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=500&q=60'),
(@pitch3_id, 'https://images.unsplash.com/photo-1431324155629-1a6eda1948a9?auto=format&fit=crop&w=500&q=60');

-- Insert Pitch Reviews
INSERT INTO pitch_reviews (pitch_id, player_id, rating, comment) VALUES
(@pitch1_id, @player1_id, 5, 'Amazing turf and great atmosphere!'),
(@pitch1_id, @player2_id, 4, 'Good pitch, but parking was a bit difficult.'),
(@pitch2_id, @player3_id, 5, 'Staff were very helpful. Will come again.'),
(@pitch3_id, @player4_id, 3, 'A bit expensive for the size.');

-- Insert Matches
INSERT INTO matches (pitch_id, creator_id, match_type, match_size, duration, match_date, status) VALUES
(@pitch1_id, @player1_id, 'public', '5v5', 60, DATE_ADD(NOW(), INTERVAL 1 DAY), 'scheduled'),
(@pitch1_id, @player1_id, 'public', '7v7', 90, DATE_ADD(NOW(), INTERVAL 3 DAY), 'scheduled'),
(@pitch2_id, @player2_id, 'private', '5v5', 60, DATE_ADD(NOW(), INTERVAL 2 DAY), 'scheduled'),
(@pitch3_id, @player3_id, 'public', '11v11', 120, DATE_ADD(NOW(), INTERVAL 5 DAY), 'scheduled'),
(@pitch1_id, @player4_id, 'public', '5v5', 60, DATE_SUB(NOW(), INTERVAL 2 DAY), 'completed');

-- Get Match IDs
SET @match1_id = (SELECT id FROM matches WHERE creator_id = @player1_id AND match_size = '5v5' AND status = 'scheduled' LIMIT 1);
SET @match2_id = (SELECT id FROM matches WHERE creator_id = @player1_id AND match_size = '7v7' LIMIT 1);
SET @match5_id = (SELECT id FROM matches WHERE status = 'completed' LIMIT 1);

-- Insert Match Players
INSERT INTO match_players (match_id, player_id, goals, assists) VALUES
(@match1_id, @player1_id, 0, 0),
(@match1_id, @player2_id, 0, 0),
(@match1_id, @player3_id, 0, 0),
(@match2_id, @player1_id, 0, 0),
(@match5_id, @player4_id, 2, 1),
(@match5_id, @player5_id, 1, 2);

-- Insert Match Invitations
INSERT INTO match_invitations (match_id, inviter_id, invitee_id, status) VALUES
(@match1_id, @player1_id, @player4_id, 'pending'),
(@match1_id, @player1_id, @player5_id, 'accepted');

-- Insert Notifications
INSERT INTO notifications (user_id, message, is_read) VALUES
(@player1_id, 'Your match at Old Trafford Arena is tomorrow!', 0),
(@player4_id, 'You have been invited to a match by mike@player.com', 0),
(@owner1_id, 'A new match has been scheduled at Old Trafford Arena', 1);


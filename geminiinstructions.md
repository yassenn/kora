# Gemini Instructions - Project Kora

## Current Status and Progress Log

### 2026-04-16
- [x] Initializing `geminiinstructions.md` and beginning project status check.
- [x] Explore backend structure and key files.
    - [x] Database configuration in `backend/config/database.php`.
    - [x] `User` model in `backend/models/User.php` with registration, login, and stats methods.
- [x] Explore mobile application structure and dependencies.
    - [x] React Native project with TypeScript support.
    - [x] API communication in `mobile/src/services/api.js`.
    - [x] Navigation in `mobile/src/navigation/AppNavigator.js` (AuthStack and MainTabs).
    - [x] Auth context with persistence in `mobile/src/context/AuthContext.js`.
- [x] Identify the main features and their current implementation status.
    - [x] Database schema is complete (`kickoff_db.sql`).
    - [x] Many mobile screens are implemented, but some (like `HomeScreen.js`) are minimal.
- [x] Security: Fixed 16 vulnerabilities (Critical/High/Moderate) in mobile dependencies using `overrides`.
- [x] Source Control: Configured SSH authentication for GitHub and pushed all pending changes.
- [ ] Pending Tasks:
    - [x] Backend: Fix `pitches.php` endpoint logic and error handling.
    - [x] Backend: Implement "Leave Match" functionality.
    - [x] Backend: Implement full CRUD for Pitches and Matches.
    - [x] Backend: Add Warnings, Notifications, Reviews, and Invitations APIs.
    - [x] Mobile: Modern UI Revamp with light, dynamic aesthetic.
    - [x] Mobile: Flesh out `HomeScreen.js` with dynamic dashboard.
    - [x] Mobile: Add "Leave Match" button and "Invite" logic in `MatchDetailsScreen.js`.
    - [x] Mobile: Implement "My Pitches" management for pitch owners.
    - [x] Mobile: New screens for Notifications, Invitations, and Pitch Reviews.
    - [x] Mobile: Move `API_URL` to `config.js` for centralized environment management.
    - [x] Testing: Verified all end-to-end flows on a physical Android device.
- [x] Database Enhancements:
    - [x] Add `notifications` table (id, user_id, message, is_read, created_at).
    - [x] Add `pitch_reviews` table (id, pitch_id, player_id, rating, comment, created_at).
    - [x] Add `pitch_images` table (id, pitch_id, image_url, created_at).
    - [x] Add `refresh_tokens` table (id, user_id, token, expires_at, created_at) for JWT.
    - [x] Expand `pitches` table or add `pitch_details` for price, contact, opening hours.
    - [x] Add `match_invitations` for private matches.
    - [x] Standardized `user_type` enum across DB and Model.
- [x] Admin Functionality:
    - [x] Backend: Verified Pitch model and API support for status updates.
    - [x] Mobile: Created `AdminPitchesScreen.js` for pitch approval management.
    - [x] Mobile: Integrated `AdminStack` into `AppNavigator.js` with role-based visibility.
    - [x] Mobile: Added Admin Control Panel link to `ProfileScreen.js`.
- [x] Authentication & Feedback Enhancements:
    - [x] Backend: Add check for existing username during registration.
    - [x] Backend: Refine error messages for 401 (Login) and 409 (Registration) conflicts.
    - [x] Frontend: Update `RegisterScreen.js` to display success/failure alerts from API.
    - [x] Frontend: Update `AuthContext.js` and `LoginScreen.js` to propagate and display backend credential errors.
- [x] UI & Logic Refinements:
    - [x] Mobile: Standardized all dropdowns to "Button + Modal" pattern using `SelectionModal.js`.
    - [x] Mobile: Applied "Modern Block" aesthetic (20pt radius, subtle borders) to all global cards.
    - [x] Mobile: Set global card background to white, with `CreateMatchScreen` as the grey-block exemption.
    - [x] Mobile: Restored intelligent hourly time-picking to `CreateMatchScreen`.
    - [x] Mobile: Updated `MatchesListScreen` with unified date/time text and standard icons.
    - [x] Mobile: Updated Admin approvals with thin colored borders for status instead of solid backgrounds.
    - [x] Mobile: Implemented `ModernModal.js` as a generic shell for future bottom-sheet UI.
    - [x] Mobile: Replaced deprecated `SafeAreaView` with robust `react-native-safe-area-context` version.
    - [x] Mobile: Improved modal animations to `fade` for immediate background overlay visibility.


## User Preferences & Architecture Mandates

### UI/UX Standards
- **Global Cards:** All content cards across the application MUST use a **white background** (`colors.white`).
- **CreateMatch Screen Exemption:** The `CreateMatchScreen.js` is the EXCLUSIVE exception to the global card standard. It MUST use the **grey block style** (`globalStyles.formCard`) to maintain its original aesthetic.
- **Dropdowns:** All dropdown-like selectors (Venue, Match Type, Size, Duration, Roles) MUST use the **"Button + Modal"** pattern (e.g., `SelectionModal.js`) instead of native pickers.
- **Safe Zones:** Every screen MUST be wrapped in a `SafeAreaView` to ensure content never overlaps with device notches.

### Business Logic
- **Intelligent Time Picking:** The `CreateMatchScreen` MUST fetch existing match data and only display available time slots.
- **Time Slotting:** Available times MUST be generated as **continuous hourly slots** (e.g., 08:00, 09:00) with no 30-minute gaps.
- **Role Switching:** The Profile page MUST include a "Dev Tools" role switcher for power users to toggle between Player, Owner, and Admin without re-authentication.








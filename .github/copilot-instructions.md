# Kora Project - AI Agent Instructions

## Project Overview

**Kora** is a soccer match organization mobile application with a React Native frontend and PHP backend. It enables users to discover, create, and join soccer matches, manage pitches, and track player statistics.

### Architecture
- **Mobile**: React Native (TypeScript) with React Navigation for iOS/Android
- **Backend**: PHP with MySQL database, RESTful API at `backend/api/v1/`
- **Communication**: HTTP requests via `fetch` API; `mobile/src/services/api.js` is the single integration point

## Setup & Installation Guide

### Prerequisites

#### Backend Requirements
- **PHP**: Version 7.4 or higher (8.0+ recommended)
- **MySQL**: Version 5.7 or higher (8.0+ recommended)
- **Web Server**: Apache with mod_rewrite or Nginx
- **Composer** (optional, for future dependency management)

#### Mobile Requirements
- **Node.js**: Version 20 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **React Native CLI**: Installed via npm
- **For Android**:
  - Android Studio (version 4.0+)
  - Android SDK (API level 31+)
  - Java Development Kit (JDK 11+)
  - ANDROID_HOME environment variable set
- **For iOS** (macOS only):
  - Xcode 12.0+
  - CocoaPods

### Step 1: Backend Setup

#### 1.1 Install PHP and MySQL

**macOS** (using Homebrew):
```bash
brew install php@8.2
brew install mysql@8.0
# Start MySQL service
brew services start mysql@8.0
```

**Ubuntu/Debian** (using apt):
```bash
sudo apt update
sudo apt install php php-mysql php-curl php-json
sudo apt install mysql-server
# Start MySQL service
sudo systemctl start mysql
```

**Windows**:
- Download and install XAMPP (includes Apache, PHP, and MySQL)
- Or install from individual sources: php.net, mysql.com, apache.org

#### 1.2 Create MySQL Database

```bash
# Connect to MySQL
mysql -u root -p

# Create database and user (in MySQL terminal)
CREATE DATABASE kickoff_db;
CREATE USER 'kora_user'@'localhost' IDENTIFIED BY 'kora_password';
GRANT ALL PRIVILEGES ON kickoff_db.* TO 'kora_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 1.3 Import Database Schema

```bash
# Navigate to project root
cd /path/to/kora

# Import the SQL schema
mysql -u kora_user -p kickoff_db < kickoff_db.sql
# When prompted, enter: kora_password
```

#### 1.4 Configure Backend Database Connection

Edit `backend/config/database.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'kora_user');
define('DB_PASS', 'kora_password');
define('DB_NAME', 'kickoff_db');
```

#### 1.5 Set Up Web Server

**Apache**:
```bash
# macOS: Create virtual host (edit /usr/local/etc/httpd/httpd.conf)
<VirtualHost *:80>
    ServerName kora.local
    DocumentRoot /path/to/kora/backend
    <Directory /path/to/kora/backend>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

# Add to /etc/hosts (macOS/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1 kora.local
```

**Nginx** (alternative):
```bash
# Edit /etc/nginx/sites-available/default or create new file
server {
    listen 80;
    server_name kora.local;
    root /path/to/kora/backend;
    index index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    location / {
        try_files $uri /index.php$is_args$args;
    }
}
```

**PHP Built-in Server** (for development):
```bash
cd /path/to/kora/backend
php -S localhost:8000
# API will be available at http://localhost:8000/api/v1/
```

#### 1.6 Verify Backend is Running

```bash
curl http://kora.local/api/v1/users.php
# Should return: {"success":true,"message":"Users retrieved","data":[]}
```

### Step 2: Mobile Setup

#### 2.1 Install Node.js and npm

**macOS** (using Homebrew):
```bash
brew install node@20
# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 9.x.x or higher
```

**Ubuntu/Debian** (using NodeSource):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows**:
- Download from nodejs.org and run installer
- Verify in PowerShell: `node --version` and `npm --version`

#### 2.2 Install React Native CLI and Android Studio (Android)

```bash
# Install React Native CLI globally
npm install -g react-native-cli

# For Android development, install Android Studio
# Download from https://developer.android.com/studio

# After Android Studio installation, set environment variables
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# For Windows, set via System Properties > Environment Variables
# ANDROID_HOME = C:\Users\<YourUsername>\AppData\Local\Android\sdk
```

#### 2.3 Install iOS Tools (macOS only)

```bash
# Install Xcode from App Store, then install command line tools
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods
```

#### 2.4 Install Mobile Dependencies

```bash
cd /path/to/kora/mobile

# Install npm packages
npm install

# For iOS, install Pod dependencies (macOS only)
cd ios
pod install
cd ..
```

#### 2.5 Configure API URL

Edit `mobile/src/services/api.js`:
```javascript
// Update the API_URL to match your backend server
const API_URL = 'http://10.70.155.141/api/v1';  // Replace with your server IP/domain
```

**Finding your server IP:**
- For local machine: `ipconfig getifaddr en0` (macOS) or `ipconfig` (Windows)
- For virtual machine: Use the host IP that's accessible from your device
- For deployed server: Use the domain or public IP

### Step 3: Running the Application

#### 3.1 Start Backend Server

**Using PHP Built-in Server**:
```bash
cd /path/to/kora/backend
php -S localhost:8000
# Backend is now running at http://localhost:8000/api/v1/
```

**Using Apache/Nginx**:
```bash
# Restart web server
sudo systemctl restart apache2  # Linux/Apache
# or
sudo systemctl restart nginx    # Linux/Nginx
# or
brew services restart httpd     # macOS/Apache
```

**Verify backend is working**:
```bash
# Test API endpoint
curl http://localhost:8000/api/v1/users.php

# Expected response:
# {"success":true,"message":"Users retrieved","data":[]}
```

#### 3.2 Run Mobile App on Android

```bash
cd /path/to/kora/mobile

# Start Metro bundler (in terminal 1)
npm start

# In a new terminal (terminal 2), build and run on Android
npm run android

# The app will build, compile, and launch on connected device/emulator
```

**Troubleshooting Android**:
- Ensure Android emulator is running: `emulator -list-avds` to see available devices
- Check device connection: `adb devices`
- If build fails, clear cache: `rm -rf android/build node_modules && npm install`

#### 3.3 Run Mobile App on iOS (macOS only)

```bash
cd /path/to/kora/mobile

# Install CocoaPods dependencies (if not already done)
cd ios && pod install && cd ..

# Start Metro bundler (in terminal 1)
npm start

# In a new terminal (terminal 2), build and run on iOS
npm run ios

# The app will build and launch on the iOS simulator
```

**Troubleshooting iOS**:
- If simulator doesn't start, run: `open -a Simulator`
- Clear build cache: `rm -rf ios/Pods node_modules && npm install && cd ios && pod install && cd ..`
- Ensure Xcode command line tools are installed: `xcode-select --install`

#### 3.4 Test the Application

**Quick Test Flow**:
1. App launches with Login screen
2. Register a new account:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
   - User Type: `player`
3. Log in with the created account
4. Navigate to "Matches" tab to view available matches
5. Navigate to "Pitches" tab to view available pitches
6. Go to "Profile" tab to view user statistics

**API Testing with curl**:
```bash
# Register user
curl -X POST http://localhost:8000/api/v1/users.php \
  -H "Content-Type: application/json" \
  -d '{
    "type": "register",
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "user_type": "player"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/users.php \
  -H "Content-Type: application/json" \
  -d '{
    "type": "login",
    "email": "test@example.com",
    "password": "password123"
  }'

# Get list of matches
curl http://localhost:8000/api/v1/matches.php

# Get list of pitches
curl http://localhost:8000/api/v1/pitches.php
```

### Step 4: Development Workflow

#### Running Tests

```bash
cd /path/to/kora/mobile

# Run Jest tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run ESLint for code quality
npm run lint
```

#### Monitoring Logs

**Backend (PHP)**:
```bash
# Check PHP error logs
tail -f /var/log/apache2/error.log  # Apache on Linux
tail -f /var/log/httpd/error_log    # Apache on macOS
tail -f /var/log/nginx/error.log    # Nginx on Linux
```

**Mobile**:
```bash
# View device logs
adb logcat  # Android
xcrun simctl spawn booted log stream --level debug  # iOS
```

### Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| **"Cannot find module" in mobile** | Run `npm install` in mobile directory and clear cache: `npm cache clean --force` |
| **PHP module not found error** | Enable required PHP modules: `php -m` to list, then enable missing ones |
| **MySQL connection refused** | Ensure MySQL is running: `mysql -u root -p` and check credentials in database.php |
| **Android build fails** | Clear gradle cache: `cd android && ./gradlew clean && cd ..` |
| **iOS build fails** | Remove pods and reinstall: `cd ios && rm -rf Pods Podfile.lock && pod install && cd ..` |
| **API URL not reachable** | Verify server is running and API_URL matches your backend address |
| **CORS errors** | Check CORS headers are set in backend endpoints (they should be) |
| **Port already in use** | Kill process: `lsof -ti:8000 | xargs kill -9` or use different port: `php -S localhost:8001` |

## Key Architectural Patterns

### Data Flow
1. Mobile screens dispatch API calls through `mobile/src/services/api.js` functions (e.g., `login()`, `createMatch()`)
2. API functions use `fetchJson()` helper which:
   - Sets `Authorization: Bearer` header if `AUTH_TOKEN` is set
   - Catches HTML error responses (common in PHP errors) and extracts readable snippets
   - Throws descriptive errors for debugging
3. Backend routes in `backend/api/v1/` receive requests, instantiate models, and return JSON
4. Models in `backend/models/` handle database operations via the `Database` PDO wrapper in `backend/config/database.php`

### Authentication Flow
- **Mobile**: `AuthContext` manages user state and token via `secureStorage` (encrypted device storage)
- After login, token is set globally via `setAuthToken()` in `api.js`
- Backend: Currently accepts user object from login response; token handling is incomplete
- **Important**: Backend does not yet validate tokens; implement Bearer token validation in API endpoints

### Navigation Structure
- `mobile/src/navigation/AppNavigator.js` defines three main stacks:
  - **MatchesStack**: Browse/create matches, view details
  - **ProfileStack**: User profile, create pitches
  - **PitchesListScreen**: Dedicated tab for discovering pitches
- Auth and main navigation are swapped based on `AuthContext.user` state

## Developer Workflows

### Backend Development
1. **Run Backend**: Deploy `backend/` folder to Apache/Nginx; API endpoints are at `backend/api/v1/`
2. **Database Setup**: Import `kickoff_db.sql` and configure credentials in `backend/config/database.php` (DB_HOST, DB_USER, DB_PASS, DB_NAME)
3. **Adding API Endpoints**: Create new `.php` file in `backend/api/v1/`, require `backend/core/initialize.php`, instantiate model, and use query pattern from existing endpoints

### Mobile Development
1. **Setup**: `cd mobile && npm install` (Node ≥20 required)
2. **Configure API**: Update `API_URL` in `mobile/src/services/api.js` to point to backend server
3. **Run**: `npm run android` or `npm run ios`
4. **Test**: `npm test` (Jest configured; see `jest.config.js`)
5. **Lint**: `npm run lint` (ESLint)

## Project-Specific Conventions

### PHP Backend Patterns
- **Request routing**: HTTP method (GET/POST/PATCH/PUT) + query parameters determine operation
  - Example: `users.php?stats_for_user_id=123` (GET) vs `users.php` with `type: 'login'` (POST)
- **Database class** (`backend/config/database.php`):
  - Use `$db->query()`, `$db->bind()`, `$db->execute()` for parameterized queries
  - Returns results via `$db->resultSet()` (array) or `$db->single()` (object)
- **CORS**: All endpoints set headers for CORS and JSON responses; maintain for cross-origin requests

### Mobile Patterns
- **API service layer**: All HTTP logic isolated in `api.js`; screens should not import `fetch` directly
- **Error handling**: Backend returns `{ message: 'error text' }` on failure; screens check response structure (e.g., `if (res.id)` for user objects)
- **Storage**: Use `secureStorage` (from `mobile/src/services/secureStorage.js`) for sensitive data, not React state
- **Navigation parameters**: Passed via `route.params`; see `MatchDetailsScreen` pattern

## Integration Points & Dependencies

### Mobile-Backend Contract
- **Base URL**: `const API_URL = 'http://10.70.155.141/api/v1'` (must match server IP/port)
- **Endpoints** (see `API_GUIDE.txt` for full details):
  - `users.php`: POST register/login, GET stats
  - `matches.php`: GET all/by ID, POST create, PATCH join, PUT update stats
  - `pitches.php`: POST create (GET list not yet implemented)
- **Auth Header**: `Authorization: Bearer <token>` (set after login; currently not validated by backend)

### React Native Key Dependencies
- Navigation: `@react-navigation/{bottom-tabs,stack,native}`
- State management: React Context (AuthContext)
- Storage: `react-native-encrypted-storage`
- Date picker: `react-native-date-picker` (used in match creation)
- Gesture handling: `react-native-gesture-handler`, `react-native-reanimated`

### Database Schema
- `users`: id, username, email, password (hashed), user_type
- `matches`: id, name, location, date_time, max_players, creator_id, status
- `pitches`: id, name, location, size, user_id
- See `kickoff_db.sql` for full schema and relationships

## Detailed TODO & Implementation Gaps

### Frontend (Mobile) Tasks
1. **Pitch Picker in CreateMatchScreen** ([CreateMatchScreen.js#L49](mobile/src/screens/CreateMatchScreen.js#L49))
   - Currently hardcoded TextInput for `pitchId`; replace with actual picker component listing available pitches
   - Should fetch pitches from API and display in dropdown/modal selection

2. **PitchDetailsScreen Missing**
   - [PitchesListScreen.js](mobile/src/screens/PitchesListScreen.js) navigates to `PitchDetails` route but screen doesn't exist
   - Needs to display pitch info, available times, and ability to create matches on that pitch

3. **Dynamic organizer_id in CreateMatch**
   - [CreateMatchScreen.js#L27](mobile/src/screens/CreateMatchScreen.js#L27) hardcodes `organizer_id: 1`
   - Should use `useAuth().user.id` to get logged-in user's ID

4. **Input Validation & Error Handling**
   - Screens lack comprehensive input validation (email format, password strength, etc.)
   - Error messages from backend (HTML snippets) need better user-friendly display

5. **Real-time Match Updates**
   - No polling or WebSocket for match status changes
   - Players joining/leaving matches won't update until screen refresh

### Backend (PHP) Tasks

1. **Bearer Token Validation Missing**
   - All API endpoints ([users.php](backend/api/v1/users.php), [matches.php](backend/api/v1/matches.php), [pitches.php](backend/api/v1/pitches.php)) ignore `Authorization` header
   - **Critical**: Implement middleware to verify Bearer tokens before processing requests
   - Currently `setAuthToken()` is called on mobile but never validated on backend

2. **CRUD Operations Incomplete**
   - **Matches**: No DELETE or UPDATE match details (only player stats update via PUT)
   - **Pitches**: No UPDATE or DELETE operations for pitches
   - **Pitch listing**: Incomplete - [PitchesListScreen.js](mobile/src/screens/PitchesListScreen.js) calls `getPitches()` which now works but screen state isn't complete

3. **Response Format Inconsistency**
   - Some endpoints return `{ message: 'text' }`, others return `{ success: true/false, message: 'text' }`
   - Mobile screens check `res.id` or `res.message` leading to fragile code
   - Standardize: Always return `{ success: bool, message: string, data: object }`

4. **Input Validation & Sanitization**
   - [users.php](backend/api/v1/users.php): No validation for email format, password strength
   - [matches.php](backend/api/v1/matches.php): No validation for match_date format, negative values
   - [pitches.php](backend/api/v1/pitches.php#L20): Checks for empty fields but doesn't validate field types

5. **Database Credentials in Source**
   - [backend/config/database.php](backend/config/database.php#L1-L5) hardcodes DB credentials
   - Should use environment variables (.env file) for secure deployment

### Cross-cutting Tasks

1. **Location Services Integration**
   - Not implemented; requires GPS integration in React Native
   - Needed for "nearby pitches" and location-based match discovery

2. **Push Notifications / Real-time Events**
   - No infrastructure for notifying players of match invitations, status changes, or player joins
   - Consider Firebase Cloud Messaging or similar service

3. **Authentication Flow Refinement**
   - Backend needs to return proper JWT tokens instead of relying on user object
   - Update [AuthContext.js](mobile/src/context/AuthContext.js) to work with token-based auth

4. **Testing Coverage**
   - Limited test files; mobile has basic test setup but no meaningful tests
   - Backend has no unit tests or integration tests

## Important Files Reference

| File | Purpose |
|------|---------|
| [mobile/src/services/api.js](mobile/src/services/api.js) | All API integration code; update for new endpoints |
| [backend/api/v1/](backend/api/v1/) | RESTful endpoints; new routes go here |
| [mobile/src/context/AuthContext.js](mobile/src/context/AuthContext.js) | Auth state & token management |
| [mobile/src/navigation/AppNavigator.js](mobile/src/navigation/AppNavigator.js) | Screen navigation structure |
| [backend/config/database.php](backend/config/database.php) | Database connection; update credentials here |
| [backend/models/](backend/models/) | Data models (User, Match, Pitch); add business logic here |
| [backend/core/auth.php](backend/core/auth.php) | Bearer token validation middleware |
| [backend/core/response.php](backend/core/response.php) | Standardized API response helper class |
| [kickoff_db.sql](kickoff_db.sql) | Database schema; import to set up MySQL |
| [API_GUIDE.txt](API_GUIDE.txt) | Detailed API endpoint documentation |

## Implementation Progress

The following TODO items have been completed:

### Frontend Implementations ✅

1. **Dynamic creator_id in CreateMatchScreen** - [CreateMatchScreen.js](mobile/src/screens/CreateMatchScreen.js)
   - Now uses `useAuth().user.id` instead of hardcoded organizer_id
   - Falls back to 1 if user context unavailable

2. **PitchDetailsScreen Created** - [PitchDetailsScreen.js](mobile/src/screens/PitchDetailsScreen.js)
   - New screen component with navigation integration
   - Displays pitch information and allows creating matches
   - Integrated into [AppNavigator.js](mobile/src/navigation/AppNavigator.js) with new PitchesStack

3. **Pitch Picker Modal Implemented** - [PitchPickerModal.js](mobile/src/components/PitchPickerModal.js)
   - Replaces hardcoded TextInput with interactive modal picker
   - Fetches pitches from API dynamically
   - Displays pitch name and location for selection
   - Integrated into CreateMatchScreen with proper pitch data flow

4. **Mobile Input Validation** - [CreateMatchScreen.js](mobile/src/screens/CreateMatchScreen.js)
   - Validates pitch selection, match size, duration, and date
   - Prevents match creation in the past
   - User-friendly error alerts

### Backend Implementations ✅

1. **Bearer Token Validation Middleware** - [backend/core/auth.php](backend/core/auth.php)
   - `validateBearerToken()`: Validates Authorization header format
   - `requireBearerToken()`: Enforces token presence or returns 401
   - Ready to be integrated into protected endpoints

2. **Standardized API Response Format** - [backend/core/response.php](backend/core/response.php)
   - `ApiResponse::success(message, data)`: Standard success response
   - `ApiResponse::error(message, httpCode)`: Standard error response
   - `ApiResponse::validationError(message, errors)`: Validation error response with detailed error map
   - Format: `{ success: bool, message: string, data: object/array/null }`

3. **User Model Input Validation** - [User.php](backend/models/User.php)
   - `validateEmail()`: RFC-compliant email format checking
   - `validatePassword()`: Minimum 6 characters
   - `validateUsername()`: 3+ chars, alphanumeric + underscore only
   - `getRegistrationErrors()`: Returns error map for validation failures

4. **Match Model Input Validation** - [Match.php](backend/models/Match.php)
   - `getCreationErrors()`: Validates pitch_id, creator_id, match_type, duration, date_time
   - `validateDateTime()`: Ensures proper YYYY-MM-DD HH:MM:SS format
   - Type checking for numeric fields

5. **Updated API Endpoints with Response Standardization**:
   - [users.php](backend/api/v1/users.php) - Uses new ApiResponse class, validates registration/login data
   - [matches.php](backend/api/v1/matches.php) - Validates creation/join/stats data, standardized responses
   - [pitches.php](backend/api/v1/pitches.php) - Validates pitch data, consistent response format

6. **Core Initialization Update** - [backend/core/initialize.php](backend/core/initialize.php)
   - Now includes auth.php and response.php for use across all endpoints

## Common Debugging Tips

- **PHP errors returning as HTML**: Check `fetchJson()` error extraction; server likely returning 500 with error page
- **Auth failures**: Verify `setAuthToken()` was called after login; check `Authorization` header in network inspector
- **API timeouts**: Confirm backend server is running and `API_URL` in `api.js` matches server address
- **Database errors**: Check `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` in `backend/config/database.php`
- **React Native build issues**: Clear `node_modules`, `npm install`, then `npm run android/ios` (or `npm start` first)
- **API validation errors**: Check response format is `{ success: false, message: string, data: {errors} }` when validation fails

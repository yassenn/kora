# Kora - Football Match Organization App

Kora is a comprehensive football match organization mobile application that enables users to discover, create, and join football matches, manage pitches, and track player statistics. It features a React Native frontend for iOS/Android and a PHP backend with a MySQL database.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Environment Preparation](#environment-preparation)
3. [Running the Project](#running-the-project)
4. [Project Details](#project-details)

---

## Project Overview

### Architecture

Kora is built with a separation of concerns between frontend and backend:

- **Mobile**: React Native (TypeScript) with React Navigation for iOS/Android
- **Backend**: PHP with MySQL database, RESTful API at `backend/api/v1/`
- **Communication**: HTTP requests via `fetch` API; `mobile/src/services/api.js` is the single integration point

### Key Technologies

- **Mobile**: React Native, React Navigation, React Context for state management
- **Backend**: PHP 8.0+, MySQL 5.7+, PDO for database access
- **Development**: Node.js 20+, npm 9+, Android Studio/Xcode for mobile builds

### Project Structure

```
kora/
├── mobile/                          # React Native application
│   ├── src/
│   │   ├── screens/                # App screens
│   │   ├── components/             # Reusable components
│   │   ├── services/               # API integration (api.js, secureStorage.js)
│   │   ├── context/                # React Context (AuthContext.js)
│   │   ├── navigation/             # Navigation structure
│   │   └── utils/                  # Utilities and styles
│   └── android/ & ios/             # Native build files
├── backend/                         # PHP backend
│   ├── api/v1/                     # RESTful API endpoints
│   ├── models/                     # Data models (User, Match, Pitch)
│   ├── config/                     # Configuration files
│   ├── core/                       # Core utilities (auth, response)
│   └── database.php                # Database connection
├── kickoff_db.sql                  # Database schema
└── API_GUIDE.txt                   # Detailed API documentation
```

---

## Environment Preparation

### Prerequisites

#### Backend Requirements
- **PHP**: 7.4 or higher (8.0+ recommended)
- **MySQL**: 5.7 or higher (8.0+ recommended)
- **Web Server**: Apache with mod_rewrite or Nginx
- **Composer** (optional, for future dependency management)

#### Mobile Requirements
- **Node.js**: Version 20 or higher
- **npm**: Version 9 or higher
- **React Native CLI**: Installed globally via npm
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

**PHP Built-in Server** (for development - recommended for quick setup):
```bash
cd /path/to/kora/backend
php -S localhost:8000
# API will be available at http://localhost:8000/api/v1/
```

**Apache** (for production):
```bash
# macOS: Edit /usr/local/etc/httpd/httpd.conf
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

#### 2.2 Install React Native CLI and Android Tools

```bash
# Install React Native CLI globally
npm install -g react-native-cli

# For Android development, download and install Android Studio
# Download from https://developer.android.com/studio

# Set environment variables (add to ~/.bashrc, ~/.zshrc, or equivalent):
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
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
const API_URL = 'http://192.168.1.149/api/v1';  // Replace with your server IP/domain
```

**Finding your server IP:**
- **Local machine**: `ipconfig getifaddr en0` (macOS) or `ipconfig` (Windows)
- **Virtual machine**: Use the host IP that's accessible from your device
- **Deployed server**: Use the domain or public IP

---

## Running the Project

### Start Backend Server

#### Option 1: PHP Built-in Server (Development)
```bash
cd /path/to/kora/backend
php -S localhost:8000
# Backend is now running at http://localhost:8000/api/v1/
```

#### Option 2: Apache/Nginx (Production)
```bash
# Restart web server
sudo systemctl restart apache2  # Linux/Apache
# or
sudo systemctl restart nginx    # Linux/Nginx
# or
brew services restart httpd     # macOS/Apache
```

#### Verify Backend is Working
```bash
curl http://localhost:8000/api/v1/users.php
# Expected response: {"success":true,"message":"Users retrieved","data":[]}
```

### Run Mobile App on Android

```bash
cd /path/to/kora/mobile

# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Build and run on Android (keep Metro running)
npm run android
```

**Troubleshooting Android**:
- Ensure Android emulator is running: `emulator -list-avds` to see available devices
- Check device connection: `adb devices`
- If build fails, clear cache: `rm -rf android/build node_modules && npm install`

### Run Mobile App on iOS (macOS only)

```bash
cd /path/to/kora/mobile

# Install CocoaPods dependencies (if not already done)
cd ios && pod install && cd ..

# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Build and run on iOS (keep Metro running)
npm run ios
```

**Troubleshooting iOS**:
- If simulator doesn't start: `open -a Simulator`
- Clear build cache: `rm -rf ios/Pods node_modules && npm install && cd ios && pod install && cd ..`
- Ensure Xcode command line tools: `xcode-select --install`

### Quick Test Flow

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

### API Testing with curl

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

### Running Tests and Linting

```bash
cd /path/to/kora/mobile

# Run Jest tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run ESLint for code quality
npm run lint
```

### Monitoring Logs

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
adb logcat                                        # Android
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
| **Port already in use** | Kill process: `lsof -ti:8000 \| xargs kill -9` or use different port: `php -S localhost:8001` |

---

## Project Details

### Architecture & Data Flow

#### Data Flow
1. Mobile screens dispatch API calls through `mobile/src/services/api.js` functions (e.g., `login()`, `createMatch()`)
2. API functions use `fetchJson()` helper which:
   - Sets `Authorization: Bearer` header if `AUTH_TOKEN` is set
   - Catches HTML error responses (common in PHP errors) and extracts readable snippets
   - Throws descriptive errors for debugging
3. Backend routes in `backend/api/v1/` receive requests, instantiate models, and return JSON
4. Models in `backend/models/` handle database operations via the `Database` PDO wrapper

#### Authentication Flow
- **Mobile**: `AuthContext` manages user state and token via `secureStorage` (encrypted device storage)
- After login, token is set globally via `setAuthToken()` in `api.js`
- **Backend**: Includes bearer token validation middleware in `backend/core/auth.php`

#### Navigation Structure
- `mobile/src/navigation/AppNavigator.js` defines main stacks:
  - **MatchesStack**: Browse/create matches, view details
  - **PitchesStack**: Browse pitches, view details
  - **ProfileStack**: User profile, create pitches
- Auth and main navigation are swapped based on `AuthContext.user` state

### Database Schema

| Table | Fields | Purpose |
|-------|--------|---------|
| `users` | id, username, email, password (hashed), user_type | Store user accounts and authentication |
| `matches` | id, pitch_id, creator_id, match_type, match_size, duration, match_date, status | Store match information |
| `pitches` | id, name, location, owner_id, status | Store pitch/venue information |
| `match_players` | match_id, player_id, goals, assists | Track player participation and stats |

See `kickoff_db.sql` for complete schema and relationships.

### Key Project Files

| File | Purpose |
|------|---------|
| `mobile/src/services/api.js` | All API integration code; single point for backend communication |
| `backend/api/v1/` | RESTful endpoints (users.php, matches.php, pitches.php) |
| `mobile/src/context/AuthContext.js` | Auth state & token management |
| `mobile/src/navigation/AppNavigator.js` | Screen navigation structure and stacks |
| `backend/config/database.php` | Database connection and PDO wrapper |
| `backend/models/` | Data models (User, Match, Pitch) |
| `backend/core/auth.php` | Bearer token validation middleware |
| `backend/core/response.php` | Standardized API response helper class |
| `kickoff_db.sql` | Database schema and initial data |
| `API_GUIDE.txt` | Detailed API endpoint documentation |

### Development Conventions

#### PHP Backend Patterns
- **Request routing**: HTTP method (GET/POST/PATCH/PUT) + query parameters determine operation
  - Example: `users.php?stats_for_user_id=123` (GET) vs `users.php` with `type: 'login'` (POST)
- **Database class**: Uses PDO with parameterized queries (`$db->query()`, `$db->bind()`, `$db->execute()`)
- **Response format**: All endpoints return standardized JSON: `{ success: bool, message: string, data: object/array/null }`
- **CORS**: All endpoints set headers for CORS and JSON responses

#### Mobile Patterns
- **API service layer**: All HTTP logic isolated in `api.js`; screens should not import `fetch` directly
- **Error handling**: Backend returns errors; screens check response structure appropriately
- **Storage**: Use `secureStorage` for sensitive data, not React state
- **Navigation**: Parameters passed via `route.params`

#### React Native Dependencies
- Navigation: `@react-navigation/{bottom-tabs,stack,native}`
- State management: React Context (AuthContext)
- Storage: `react-native-encrypted-storage`
- Date picker: `react-native-date-picker` (used in match creation)
- Gesture handling: `react-native-gesture-handler`, `react-native-reanimated`

### Implementation Progress

#### ✅ Completed Features

**Frontend (Mobile)**
1. **Dynamic creator_id in CreateMatchScreen** - Uses `useAuth().user.id` instead of hardcoded values
2. **PitchDetailsScreen** - New screen component for viewing pitch information
3. **Pitch Picker Modal** - Interactive modal for selecting pitches when creating matches
4. **Mobile Input Validation** - Comprehensive validation for pitch selection, match size, duration, and date
5. **Enhanced UI Components** - Button component with disabled state, improved screen layouts

**Backend (PHP)**
1. **Bearer Token Validation Middleware** (`backend/core/auth.php`)
   - `validateBearerToken()`: Validates Authorization header format
   - `requireBearerToken()`: Enforces token presence or returns 401
2. **Standardized API Response Format** (`backend/core/response.php`)
   - `ApiResponse::success()`: Standard success responses
   - `ApiResponse::error()`: Standard error responses
   - `ApiResponse::validationError()`: Validation error responses with detailed error maps
3. **User Model Input Validation** (`backend/models/User.php`)
   - Email format validation (RFC-compliant)
   - Password strength validation (minimum 6 characters)
   - Username validation (3+ chars, alphanumeric + underscore)
4. **Match Model Input Validation** (`backend/models/Match.php`)
   - Pitch ID, creator ID validation
   - Match type validation (public/private)
   - DateTime format validation (YYYY-MM-DD HH:MM:SS)
5. **Pitch Model Input Validation** (`backend/models/Pitch.php`)
   - Name and location validation
   - Owner ID validation
6. **Updated API Endpoints** - All endpoints now use standardized response format and validation

#### 📋 TODO & Remaining Tasks

**Frontend (Mobile) Tasks**
1. **Real-time Match Updates** - Implement polling or WebSocket for live match status changes
2. **Enhanced Error Handling** - Better user-friendly error messages from backend responses
3. **UI/UX Refinements** - Comprehensive design improvements for all screens
4. **Location Services** - GPS integration for location-based match discovery
5. **Push Notifications** - In-app and system notifications for match events

**Backend (PHP) Tasks**
1. **JWT Token Implementation** - Replace basic Bearer token with proper JWT tokens with expiration
2. **Complete CRUD Operations**:
   - **Matches**: DELETE and UPDATE match details endpoints
   - **Pitches**: UPDATE and DELETE operations for pitches
3. **Database Credentials Security** - Move hardcoded credentials to environment variables (.env file)
4. **Advanced Features**:
   - Match search and filtering
   - Player rating/review system
   - Match history and statistics
5. **Testing Coverage** - Add unit tests and integration tests for both mobile and backend

**Cross-cutting Tasks**
1. **Location Services Integration** - GPS integration in React Native for nearby pitches
2. **Push Notifications Infrastructure** - Firebase Cloud Messaging or similar service
3. **Authentication Refinement** - Full JWT-based authentication flow
4. **Testing Coverage** - Comprehensive unit and integration tests

### Common Debugging Tips

- **PHP errors returning as HTML**: Check `fetchJson()` error extraction; server likely returning 500 with error page
- **Auth failures**: Verify `setAuthToken()` was called after login; check `Authorization` header in network inspector
- **API timeouts**: Confirm backend server is running and `API_URL` in `api.js` matches server address
- **Database errors**: Check `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` in `backend/config/database.php`
- **React Native build issues**: Clear `node_modules`, run `npm install`, then `npm run android/ios` (or `npm start` first)
- **API validation errors**: Check response format is `{ success: false, message: string, data: {errors} }` when validation fails
*   **Comprehensive Testing:** Develop thorough unit, integration, and end-to-end tests for both the mobile and backend components.
*   **Deployment Automation:** Set up CI/CD pipelines for automated testing and deployment of both the mobile application and the backend.

## Recent Updates (2026-04-25)
- Fixed all security vulnerabilities in the mobile application.
- Fully synchronized the project with GitHub via SSH.
- Added new API endpoints and mobile screens for Invitations, Notifications, and Reviews.

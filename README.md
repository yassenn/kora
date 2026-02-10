# Project Kora

Kora is a mobile application designed for organizing and participating in soccer matches. This project consists of a React Native mobile application and a PHP backend.

## Technologies

*   **Mobile:** React Native
*   **Backend:** PHP, MySQL

## Architecture

The project is split into two main components:
*   `mobile/`: Contains the React Native application for both iOS and Android platforms.
*   `backend/`: Houses the PHP backend, which provides a RESTful API for the mobile application.

The mobile app communicates with the backend through HTTP requests to the defined API endpoints.

## Getting Started

Follow these steps to set up and run the Kora project locally.

### Backend Setup

1.  **Database:**
    *   Import `kickoff_db.sql` into your MySQL database.
    *   Update database credentials in `backend/config/database.php`.

2.  **Running the Backend:**
    *   Deploy the `backend/` directory on a web server (e.g., Apache, Nginx).
    *   API endpoints are located at `backend/api/v1/`.

### Mobile App Setup

1.  **Navigate to Mobile Directory:**
    ```bash
    cd mobile
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure API URL:**
    *   Edit `mobile/src/services/api.js` and update the `API_URL` constant to point to your backend server.

4.  **Run the App:**
    *   **Android:**
        ```bash
        npm run android
        ```
    *   **iOS:**
        ```bash
        npm run ios
        ```

## Testing

### Mobile App

To run tests for the mobile application:
```bash
cd mobile
npm test
```

## Development Conventions

### Backend

*   Follows a simple MVC-like pattern.
*   Database interactions are managed by `backend/config/database.php`.
*   Models are defined in the `backend/models/` directory.

### Mobile

*   Uses React Navigation for screen navigation (`mobile/src/navigation/AppNavigator.js`).
*   API requests are handled within `mobile/src/services/api.js`.
*   Employs a component-based architecture with screens in `mobile/src/screens/`.

## Development Status

### What Has Been Done

*   **Project Structure:** Basic setup for both the React Native mobile application and the PHP backend.
*   **Database:** Initial `kickoff_db.sql` schema and `backend/config/database.php` for database connection.
*   **Backend API:** Core API endpoints for `matches`, `pitches`, and `users` are defined in `backend/api/v1/`.
*   **Mobile Navigation:** Basic navigation structure is set up in `mobile/src/navigation/AppNavigator.js`.
*   **Mobile API Service:** A service layer for API requests is available in `mobile/src/services/api.js`.
*   **Mobile UI:** Several placeholder screens for different functionalities are present in `mobile/src/screens/`.

### What Still Needs To Be Done

*   **Authentication & Authorization:** Implement secure user login, registration, and session management on both mobile and backend.
*   **Complete CRUD Operations:** Ensure full Create, Read, Update, Delete (CRUD) functionality for all entities (matches, pitches, users, etc.) across both the mobile app and backend API.
*   **Real-time Features:** Implement real-time updates for match status, player availability, and chat (e.g., using WebSockets or push notifications).
*   **Location-Based Services:** Integrate location services for discovering nearby pitches or organizing matches based on geographical proximity.
*   **Push Notifications:** Set up push notifications for match reminders, invitations, and other important alerts.
*   **Robust Error Handling & Validation:** Enhance error handling and input validation on both the frontend and backend for a better user experience and system stability.
*   **UI/UX Refinements:** Comprehensive design and user experience improvements for all mobile screens.
*   **Comprehensive Testing:** Develop thorough unit, integration, and end-to-end tests for both the mobile and backend components.
*   **Deployment Automation:** Set up CI/CD pipelines for automated testing and deployment of both the mobile application and the backend.

# Project: Kora

This document provides a high-level overview of the Kora project, its structure, and how to get it up and running.

## Project Overview

Kora is a mobile application for organizing and participating in soccer matches. It consists of a React Native mobile application and a PHP backend.

**Technologies:**

*   **Mobile:** React Native
*   **Backend:** PHP with a MySQL database

**Architecture:**

The project is divided into two main parts:

*   `mobile/`: The React Native application for iOS and Android.
*   `backend/`: The PHP backend that provides a RESTful API for the mobile app.

The mobile app communicates with the backend via HTTP requests to the API endpoints.

## Building and Running

### Backend

1.  **Database Setup:**
    *   Import the `kickoff_db.sql` file into your MySQL database.
    *   Update the database credentials in `backend/config/database.php`.

2.  **Running the Backend:**
    *   The backend is a standard PHP application. You can run it on a web server like Apache or Nginx.
    *   The API endpoints are located in `backend/api/v1/`.

### Mobile

1.  **Install Dependencies:**
    ```bash
    cd mobile
    npm install
    ```

2.  **Configure API URL:**
    *   Update the `API_URL` constant in `mobile/src/services/api.js` to point to your backend server.

3.  **Run the App:**
    *   **Android:**
        ```bash
        npm run android
        ```
    *   **iOS:**
        ```bash
        npm run ios
        ```

### Testing

*   **Mobile App:**
    ```bash
    cd mobile
    npm test
    ```

## Development Conventions

### Backend

*   The backend follows a simple MVC-like pattern.
*   Database interactions are handled by the `Database` class in `backend/config/database.php`.
*   Models are defined in the `backend/models/` directory.

### Mobile

*   The mobile app uses React Navigation for screen navigation.
*   The navigation structure is defined in `mobile/src/navigation/AppNavigator.js`.
*   API requests are managed in `mobile/src/services/api.js`.
*   The app uses a component-based architecture with screens located in `mobile/src/screens/`.

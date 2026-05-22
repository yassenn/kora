# FCM Setup Guide for Kora

This guide explains how to complete the Firebase Cloud Messaging (FCM) setup for the Kora project.

## 1. Firebase Console Configuration

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project (or use an existing one).
3.  Add an Android app and an iOS app to the project.
    *   **Android:** Use package name `com.kora`.
    *   **iOS:** Use bundle ID `com.kora`.

## 2. Mobile App Configuration

### Android
1.  Download `google-services.json` from the Firebase Console.
2.  Place it at `mobile/android/app/google-services.json`.

### iOS
1.  Download `GoogleService-Info.plist` from the Firebase Console.
2.  Place it at `mobile/ios/mobile/GoogleService-Info.plist`.

## 3. Backend Configuration

### Service Account JSON
1.  In the Firebase Console, go to **Project Settings** > **Service accounts**.
2.  Click **Generate new private key**.
3.  Download the JSON file.
4.  Rename it to `firebase_credentials.json` (or any name you prefer).
5.  Place it at `backend/config/firebase_credentials.json`.
    *   *Note: Ensure this file is ignored by git if it contains sensitive keys (added to .gitignore).*

### Environment Variables
Update your `backend/.env` file with the following:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_JSON=config/firebase_credentials.json
```

## 4. Final Steps

1.  **Mobile:** Run `npm install` in the `mobile` directory to install the new Firebase dependencies.
2.  **iOS:** Run `cd mobile/ios && pod install`.
3.  **Build:** Rebuild the mobile apps (`npm run android` or `npm run ios`).

## How it works

- When a user logs in, the mobile app requests notification permissions.
- If granted, it fetches the FCM token and sends it to the backend via `POST /api/v1/users.php` (type: `update_fcm_token`).
- The backend stores the `fcm_token` in the `users` table.
- When an invitation is created or a notification is added, the backend uses `NotificationManager` to send a push notification to the user's device.

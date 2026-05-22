# Troubleshooting Log: Mobile Connectivity

## Type: Network Connectivity (Backend Reachability)

### Error: Network Error on Physical Device
**Description**: The mobile application displays a "Network Error" when attempting to communicate with the backend, despite `adb reverse` being executed.

### Possible Solutions
1. **Verify Backend Binding**: Ensure the PHP server is listening on `127.0.0.1` or `0.0.0.0` rather than just `localhost` (which can sometimes behave differently in containerized or mobile contexts).
2. **Re-apply Port Forwarding**: `adb reverse` can sometimes drop if the connection is unstable.
3. **Verify API URL in App**: Ensure the app is actually pointed at `http://localhost:8000/api/v1` and not a stale IP address.
4. **Check Host Firewall**: Ensure the host machine isn't blocking incoming connections on port 8000 (though `adb reverse` usually bypasses this as it's a local tunnel).
5. **USB Debugging Stability**: Verify the physical connection and authorization.

### Solutions Attempted
* [x] **Verify Backend Binding**: Found that binding to `0.0.0.0` caused "Empty reply" errors on some Android devices over `adb reverse`.
* [x] **Verify adb reverse persistence**: Confirmed rules exist and re-applied them.
* [x] **Android Cleartext Traffic**: Verified that `android:usesCleartextTraffic="true"` is enabled.
* [x] **API Request Verification**: Confirmed the app is targeting `localhost:8000`.
* [x] **IPv6 vs IPv4**: Switched `API_URL` from `localhost` to `127.0.0.1` in `.env.development`.
* [x] **Hardcoded Config**: Hardcoded `127.0.0.1` in `mobile/src/config.js` to ensure the change is applied.
* [x] **Apache Discovery**: Discovered that Apache2 is already configured to serve the backend on port 80.
* [x] **RateLimiter Permission Fix**: Identified a PHP Warning leaking into the JSON response due to `Permission denied` in `backend/tmp/ratelimit/`. Fixed by granting write permissions to the directory.
* [x] **Disable Error Display**: Disabled `display_errors` in `backend/core/initialize.php` to prevent PHP warnings from corrupting JSON responses and leaking system paths.
* [x] **Token Validation Robustness**: Updated `backend/core/auth.php` to handle `Authorization` headers more reliably across different server environments (checking both `getallheaders()` and `$_SERVER`).
* [x] **Auth Race Condition**: Fixed race conditions in `AuthContext.js` where navigation (via `setUser`) was triggered before the JWT token was globally set, both during **Login** and **App Startup** (session restoration).

### Verified Solutions
1. **Use Apache (Port 80)**: Since Apache is already configured for this project, it is the most stable way to serve the backend.
2. **Port Translation via ADB**: Mapping the device's port 8000 to the host's port 80 (`adb reverse tcp:8000 tcp:80`) allows the app to communicate with Apache without changing the app's internal configuration.
3. **Directory Permissions**: Ensuring the web server user (`www-data`) has write access to `backend/tmp/` is critical for the `RateLimiter` and session management.
4. **Token Handling**: Setting the JWT token *before* updating the user state in React Native (both in `login` and `restore` functions) ensures that any immediate network requests triggered by the new screen already have the correct `Authorization` header.
5. **Server Robustness**: Checking multiple sources for the `Authorization` header (`$_SERVER`, `getallheaders`, case-insensitivity) ensures compatibility with various Apache/PHP configurations.

### Implementation Steps for Verified Solutions
1. Ensure Apache is running: `sudo systemctl start apache2`
2. Apply port-translated reverse tunnel: `adb reverse tcp:8000 tcp:80`
3. Fix backend permissions: `chmod -R 777 backend/tmp`
4. Verify via device: `adb shell curl -I http://localhost:8000/api/v1/health.php`

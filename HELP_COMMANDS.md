# Kora Project: Developer Command Guide

This guide provides a detailed breakdown of every command used in the Kora project to help you understand the "why" behind each step.

---

## 1. Environment Status Checks
These commands use logic operators (`&&` for success, `||` for failure) to report the state of your services.

### Check MySQL Database
```bash
mysqladmin ping -u root --silent && echo "Database: UP" || echo "Database: DOWN"
```
*   **`mysqladmin ping`**: Sends a request to the MySQL server to see if it's alive.
*   **`--silent`**: Prevents the command from printing its own output.
*   **`&& echo "Database: UP"`**: Runs only if the ping succeeds.
*   **`|| echo "Database: DOWN"`**: Runs only if the ping fails.

### Check Backend or Metro (Ports 8000/8081)
```bash
lsof -i :8000 && echo "Backend: UP" || echo "Backend: DOWN"
```
*   **`lsof -i :8000`**: "List Open Files" - specifically looks for any process using port 8000.
*   **`&& / ||`**: Logic to print "UP" if a process is found, "DOWN" if the port is empty.

---

## 2. Backend Management (PHP & MySQL)

### Start Backend Server
```bash
php -S 0.0.0.0:8000
```
*   **`php -S`**: Starts the built-in PHP development web server.
*   **`0.0.0.0`**: Listens on all available network interfaces (WiFi, Ethernet, Localhost). This is required for physical phones to connect to your computer's API.
*   **`:8000`**: Sets the specific port the API will listen on.

### Reset Database
```bash
mysql -u root kickoff_db < kickoff_db.sql
```
*   **`-u root`**: Connects to MySQL using the 'root' user.
*   **`kickoff_db`**: Specifies the target database.
*   **`< kickoff_db.sql`**: Uses the "input redirect" operator to read the SQL file and execute all its commands (Table creation, data insertion) into the database.

---

## 3. Mobile Development (React Native)

### Install Dependencies
```bash
npm install
```
*   Reads `package.json` and downloads every required library into the `node_modules/` folder. Run this whenever you download new code or change branches.

### Start Metro Bundler
```bash
npm start
```
*   Starts the JavaScript packager that compiles your code in real-time and sends it to your phone. It must stay running while you develop.

### Run on Android
```bash
npm run android
```
*   Triggers the React Native CLI to: 1. Start the Android build process (Gradle). 2. Package the app into an APK. 3. Install it on your connected USB device. 4. Launch the app.

---

## 4. Physical Device Connectivity (USB)
These are critical when using a physical phone instead of an emulator.

### ADB Port Reversal
```bash
adb reverse tcp:8081 tcp:8081
```
*   **`adb reverse`**: Tells the Android Debug Bridge to redirect requests made *inside the phone* on port 8081 to *your computer's* port 8081. 
*   **Why?**: This allows the phone to "think" the Metro Bundler is running inside itself, even though it's actually on your PC.

---

## 5. Maintenance & Quality

### Run Unit Tests
```bash
npm test
```
*   Executes **Jest**, which runs all files ending in `.test.js`. It verifies that your logic (like calculating match revenue) is working as expected.

### Run Linter
```bash
npm run lint
```
*   Executes **ESLint**, which scans your code for syntax errors, unused variables, or bad formatting before you run the app.

---

## Agent Background Command (Reference)
If you see the agent run this complex command:
`pkill -f "react-native start" || true && npm start > /dev/null 2>&1 &`

1.  **`pkill -f ...`**: Force-stops any old bundlers to prevent "Port busy" errors.
2.  **`|| true`**: Ensures the script doesn't crash if no old bundler was found.
3.  **`> /dev/null 2>&1`**: Hides all logs so they don't block the agent's view.
4.  **`&`**: Pushes the process to the background so the agent can keep working.

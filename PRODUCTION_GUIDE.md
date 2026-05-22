# Kora Production Implementation Guide (2026 Edition)

This guide provides a deep dive into the 2026 industry-standard requirements for the Kora application. Use this as a companion to the `preparation_for_prod.md` checklist.

---

## Part 1: Advanced Backend & Security

### 1.1 Managed Secret Management
**What it is:** Moving beyond `.env` files to a secure, encrypted cloud vault.
**Why:** Plain text `.env` files on a server can be compromised. Tools like AWS Secrets Manager or HashiCorp Vault provide access logs and automatic rotation.
**How:** 
1. Choose a provider (e.g., AWS Secrets Manager).
2. Store your `DB_PASSWORD` and `JWT_SECRET` there.
3. Update your PHP code to fetch these via the provider's SDK (e.g., AWS SDK for PHP) during the application initialization phase (`initialize.php`).

### 1.2 Rate Limiting & WAF
**What it is:** A "bouncer" for your API that limits how many times a user can call it.
**Why:** Prevents "Brute Force" attacks where a hacker tries millions of passwords a minute, and protects against DDoS attacks.
**How:**
1. **Network Level:** Use a WAF (Web Application Firewall) like Cloudflare. It blocks known "bad" bots automatically.
2. **Application Level:** Use Redis to track requests per IP address. If an IP exceeds 100 requests per minute, return a `429 Too Many Requests` status code.

### 1.3 Asynchronous Workers (Background Jobs)
**What it is:** Doing heavy work "later" so the user doesn't have to wait.
**Why:** Sending an email takes 2 seconds. If a user has to wait 2 seconds for a "Join Match" request, the app feels slow.
**How:**
1. When a user joins a match, the API adds a "Job" (a small piece of JSON) to a Redis list.
2. A separate PHP script (a "Worker") runs in the background, watches that list, and sends the actual email.

### 1.4 Observability (The "Three Pillars")
**What it is:** Being able to see exactly what is happening inside your app at all times.
1. **Logs:** Centralized logs (using ELK or Datadog) let you search through errors from all servers in one place.
2. **Metrics:** Dashboards showing "Requests per second" and "Average response time."
3. **Tracing (OpenTelemetry):** Lets you follow a single request as it travels from the mobile app to the API and then to the Database, showing exactly where it got stuck.

---

## Part 2: Database Strategy & Compliance

### 2.1 Caching with Redis
**What it is:** A super-fast "short-term memory" for your database.
**Why:** Reading from a hard drive (MySQL) is slow. Reading from RAM (Redis) is nearly instant.
**How:** When someone asks for `getPitches`, first check Redis. If the data is there, return it. If not, get it from MySQL, save it in Redis for 10 minutes, then return it.

### 2.2 GDPR Compliance
**What it is:** Respecting user privacy laws (like GDPR in Europe).
**Why:** Legal requirement. Users must be able to delete their data.
**How:**
1. Create a "Delete Account" button in `ProfileScreen.js`.
2. The backend must trigger a script that deletes (or anonymizes) all records tied to that `user_id` across all tables.

---

## Part 3: Mobile Performance & Pipeline

### 3.1 CDN & Image Optimization
**What it is:** Delivering images from a server closest to the user.
**Why:** A user in Europe shouldn't have to download a pitch photo from a server in the US.
**How:** Use a service like **Cloudinary** or **Imgix**. You upload a photo once, and they automatically resize it and deliver it as a modern, small file (WebP/AVIF) based on the user's phone.

### 3.2 SSL Pinning
**What it is:** Telling the mobile app to ONLY trust one specific security certificate.
**Why:** Prevents "Man-in-the-Middle" attacks where a hacker intercepts the app's traffic on public Wi-Fi.
**How:** Use a library like `react-native-ssl-pinning` to hardcode the "fingerprint" of your server's SSL certificate into the app.

### 3.3 Fastlane & Build Automation
**What it is:** A tool that automates the boring parts of releasing an app.
**Why:** Manually uploading to the App Store and Google Play is slow and error-prone.
**How:** Create a `Fastfile`. With one command (`fastlane deploy`), it will bump the version number, build the app, and upload it for review.

---

## Part 4: Infrastructure as Code (IaC)

### 4.1 Terraform / Pulumi
**What it is:** Writing code to "build" your servers.
**Why:** Instead of clicking buttons in the AWS or DigitalOcean console, you write a script. If you need to build a second server for testing, you just run the script again.
**How:** 
1. Install **Terraform**.
2. Write a `main.tf` file that describes your Database, App Server, and Load Balancer.
3. Run `terraform apply` to create everything.

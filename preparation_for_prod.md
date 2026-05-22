# Preparation for Production Checklist: Kora (2026 Standard)

This document outlines the requirements for a resilient, secure, and scalable production deployment of the Kora application.

## 1. Backend Infrastructure & Security
- [ ] **Secret Management:**
    - Move from `.env` files to a managed Secret Manager (AWS Secrets Manager, HashiCorp Vault) for DB credentials and API keys.
- [ ] **Authentication & Authorization:**
    - [ ] Implement JWT with short-lived access tokens and secure refresh tokens.
    - [ ] Secure Login Response: Strictly filter User models to exclude `password_hash`.
- [ ] **Network Security:**
    - [ ] **Rate Limiting:** Implement per-IP and per-user rate limiting (e.g., using Redis or Nginx `limit_req`).
    - [ ] **CORS:** Transition from `*` to an explicit allow-list of production origins.
    - [ ] **WAF:** Deploy a Web Application Firewall (Cloudflare/AWS WAF) to block common exploits (SQLi, XSS).
- [ ] **Asynchronous Tasks:**
    - [ ] Offload notifications and emails to a background worker (Redis + Worker process).
- [ ] **Observability:**
    - [ ] **OpenTelemetry:** Integrate tracing for API requests.
    - [ ] **Centralized Logging:** Ship logs to a stack like ELK (Elasticsearch, Logstash, Kibana) or Datadog.
    - [ ] **Health Checks:** Implement a `/health` endpoint for load balancer heartbeat monitoring.

## 2. Database & Data Strategy
- [ ] **Optimization:**
    - [ ] Audit query execution plans and add indexes for all frequently searched columns (`match_date`, `pitch_id`, `user_id`).
    - [ ] Implement a caching layer (Redis) for high-traffic, low-volatility endpoints (e.g., `getPitches`).
- [ ] **Resilience:**
    - [ ] Enable Point-in-Time Recovery (PITR) for database backups.
    - [ ] Configure database connection pooling to handle concurrent mobile users.
- [ ] **Compliance:**
    - [ ] Implement data deletion hooks for GDPR "Right to be Forgotten."
    - [ ] Add a versioned Privacy Policy accessible within the app.

## 3. Mobile Application Readiness
- [ ] **Performance:**
    - [ ] **CDN & Image Optimization:** Serve all assets and user-uploaded pitch photos via a CDN with WebP/AVIF support.
    - [ ] **Offline Persistence:** Ensure critical data is cached locally for poor network conditions.
- [ ] **Security:**
    - [ ] **SSL Pinning:** (Optional but recommended) Implement SSL pinning to prevent Man-in-the-Middle attacks.
    - [ ] **Log Scrubbing:** Use Babel transforms to strip all console logs and breadcrumbs from production.
- [ ] **Build Pipeline:**
    - [ ] Automate version bumping and build distribution via Fastlane.
    - [ ] Enable ProGuard/R8 obfuscation for Android.

## 4. DevOps & QA
- [ ] **IaC (Infrastructure as Code):**
    - [ ] Define the server and database infrastructure using Terraform or Pulumi.
- [ ] **CI/CD:**
    - [ ] Require 80% test coverage before allowing production merges.
    - [ ] Implement automated "Smoke Tests" on a staging environment before final deployment.

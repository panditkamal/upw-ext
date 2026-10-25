# Upwork Job Alert Chrome Extension - Complete PRD (Updated)

**Created:** Oct 25, 2026  
**Target Market:** Freelancers on Upwork (India & Global)  
**Status:** Approved for Development (Architecture Hardened)  

---

## 1. OVERVIEW

### What This Extension Does
A lightweight, privacy-focused Chrome extension that monitors Upwork job feeds directly inside your authenticated browser session, filters jobs based on your skills and preferences, and sends instant notifications (Desktop + Telegram) when matching jobs appear—so you can submit proposals within the critical 15–30 minute golden window.

### Problem We're Solving
- **Freelancers miss high-ticket contracts:** By the time you manually refresh Upwork, 20–50 proposals have already been submitted.
- **Native email alerts are too slow:** Upwork batches notification emails, arriving hours late.
- **RSS feeds are dead:** Upwork permanently discontinued native RSS feeds, leaving freelancers without an easy way to automate alerts.
- **Connects cost real money:** At $0.15 per connect (10–16 connects per bid), applying late to saturated jobs wastes hard-earned capital.
- **Competitors are overpriced:** Tools like SnipeWork ($49/mo) and GigRadar ($80+/mo) are unaffordable for most Indian and emerging-market freelancers.

### Value Proposition
- Instant desktop alerts + mobile Telegram notifications the minute a job is posted.
- **Zero account ban risk:** Operates inside your natural browser session with human-like jitter; no headless bots or unauthorized scrapers.
- **Affordable pricing:** ₹199/month ($2.40) for India vs. $49/mo competitor pricing.

---

## 2. PHASE 1: MVP (What We Build First)

### MVP Goal
Launch a production-ready, Manifest V3 Chrome Extension that:
- ✅ Safely monitors Upwork search feeds using active session requests (every 2–5 min with randomized jitter).
- ✅ Extracts clean, structured job metadata directly (title, budget, client rating, posted timestamp, job link).
- ✅ Dispatches instant Chrome desktop notifications and optional real-time Telegram mobile alerts.
- ✅ Requires **zero backend servers** for MVP (direct Telegram Bot API webhook, zero hosting costs).
- ✅ Includes a clean dashboard popup showing today's matching jobs with "Apply" and "Mark Applied" tracking.

### MVP Scope Exclusions
- ❌ AI proposal generator (Phase 2)
- ❌ Automated bidding / auto-apply (strictly avoided to adhere to Upwork Terms of Service)
- ❌ Multi-seat team management (Phase 3)

---

## 3. TECH STACK & REVISED ARCHITECTURE

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                       CHROME BROWSER                            │
│                                                                 │
│  [1. Upwork Session (Tab / Content Script)]                     │
│   └─ Runs inside user's legitimate authenticated session        │
│   └─ Fetches clean JSON from Upwork search endpoint             │
│   └─ Applies randomized jitter (120s – 240s)                    │
│   └─ Checks chrome.idle to avoid polling when user is asleep   │
│                         │                                       │
│                         ▼ chrome.runtime.sendMessage            │
│  [2. Background Service Worker (background.js)]                 │
│   ├─ Manages alarms and state persistence (chrome.storage)      │
│   ├─ Prevents duplicates via unique job ciphertext/ID hash      │
│   ├─ Dispatches chrome.notifications (Desktop Alert)            │
│   └─ Sends direct HTTPS request to Telegram Bot API             │
│                         │                                       │
│                         ▼                                       │
│  [3. Extension Popup UI (popup.html / popup.js)]                │
│   └─ Displays recent jobs, status indicator, settings link      │
└─────────────────────────────────────────────────────────────────┘
```

### Key Technical Advantages of This Architecture
1. **Bypasses Cloudflare & Bot Detection:** Headless servers and raw `fetch` calls get blocked by Cloudflare Turnstile. Executing within the browser context using legitimate cookies and TLS headers ensures 100% reliability.
2. **Resilient to UI Layout Changes:** Instead of fragile CSS selectors (`.job-tile-title-xyz`) that break whenever Upwork updates its design, the extension reads structured API responses.
3. **Zero Backend Required for MVP:** Telegram notifications use Telegram's public Bot API directly via standard HTTPS POST, enabling global reach without server bills.

---

## 4. CORE FEATURES (MVP)

### Feature 1: Quick Setup & Search Configuration
- User pastes their preferred Upwork search URL or keyword (e.g. `https://www.upwork.com/nx/search/jobs/?q=react%20developer`).
- Sets minimum hourly rate or fixed-price budget.
- Sets refresh interval (default 3 minutes, with ±30s randomized jitter).

### Feature 2: Safe In-Session Polling
- Content script executes periodic checks when browser is active.
- If user is idle (system locked or away > 15 min), polling pauses automatically via `chrome.idle` to save CPU and simulate human browsing.
- Respects rate limits: automatically backs off if a 429/403 status is encountered.

### Feature 3: Instant Desktop & Sound Alerts
- Native Chrome desktop notification displays:
  - Job Title
  - Budget ($/hr or Fixed)
  - Client Rating & Total Spend
  - Direct 1-click link to open job and submit proposal.

### Feature 4: Direct Telegram Mobile Integration
- User creates a free Telegram bot via `@BotFather` and enters their Bot Token + Chat ID into the settings page.
- Extension sends instant rich Markdown alerts to their phone:
  ```
  🚨 New Upwork Job Match!
  💼 Python Backend Developer
  💰 $50/hr (Est. 30+ hrs/wk)
  ⭐ Client: 4.9★ ($20k+ spent)
  🔗 https://upwork.com/jobs/~01abc...
  ```
- Includes a "Test Telegram Alert" button in settings for immediate verification.

### Feature 5: Popup Dashboard & Application Tracker
- Badged icon showing number of new jobs found today.
- History log showing jobs detected in the last 24–48 hours.
- Quick "Mark as Applied" toggle to prevent bidding twice.
- Quick Pause/Resume monitoring toggle.

---

## 5. LOCAL STORAGE DATA SCHEMA

Stored securely in `chrome.storage.local`:
```json
{
  "settings": {
    "searchUrl": "https://www.upwork.com/nx/search/jobs/?q=fullstack",
    "intervalMinutes": 3,
    "minBudget": 25,
    "soundEnabled": true,
    "desktopNotifications": true,
    "telegramEnabled": false,
    "telegramBotToken": "",
    "telegramChatId": "",
    "monitoringActive": true
  },
  "seenJobIds": ["~0198abcde", "~0187defab"],
  "jobsToday": [
    {
      "id": "~0198abcde",
      "title": "Full Stack Next.js Developer",
      "budget": "$40-$60/hr",
      "client": "Payment Verified (4.9★)",
      "url": "https://www.upwork.com/jobs/~0198abcde",
      "detectedAt": 1729854000000,
      "applied": false
    }
  ]
}
```

---

## 6. PERMISSIONS & STORE COMPLIANCE

### Required Manifest Permissions
- `storage`: Save user preferences and job history locally.
- `alarms`: Schedule periodic monitoring intervals.
- `notifications`: Display native desktop alerts.
- `idle`: Detect when user is away from keyboard to pause polling safely.
- `host_permissions`:
  - `*://*.upwork.com/*`: Access Upwork search results.
  - `https://api.telegram.org/*`: Send notifications to user's Telegram bot.

### Chrome Web Store Single Purpose Policy
- **Purpose Statement:** *"Notifies freelancers in real time when new jobs matching their search criteria are published on Upwork."*
- **Privacy Compliance:** All data is processed and stored locally on the user's computer. No personal data, resumes, or Upwork credentials are collected, uploaded, or transmitted to any third-party server.

---

## 7. MONETIZATION STRATEGY (ROADMAP)

- **MVP (Current):** 100% Free / Open Beta to build initial user base, gather 5-star reviews on Chrome Web Store, and build community trust.
- **Pro Tier (Phase 2 - ₹199/month / $2.40):** Unlimited saved searches, multi-keyword tracking, Razorpay/UPI license activation.
- **Premium Tier (Phase 3 - ₹499/month / $6.00):** AI proposal draft generation, client red-flag scoring, multi-device Telegram relay.

---

## 8. RISKS & MITIGATION TABLE

| Risk | Likelihood | Impact | Built-in Mitigation |
| :--- | :---: | :---: | :--- |
| Upwork Cloudflare / Bot detection | Low | High | Runs inside genuine browser session with genuine cookies and randomized interval jitter (120–240s). |
| Upwork UI changes | Medium | Medium | Extracts data from network payloads/API rather than brittle DOM CSS classes. |
| Chrome Web Store rejection | Low | High | Full Manifest V3 compliance, minimal necessary permissions, strict single-purpose policy, local data only. |
| User account ban concern | Medium | Critical | Completely read-only monitoring; zero automated bidding or simulated button clicks. 100% compliant with safety standards. |

# Upwork Job Radar - Chrome Extension

> **Instant proposal alerts for Upwork freelancers.** Win more high-ticket contracts by submitting proposals within the first 15–30 minutes before jobs get saturated.

---

## 🚀 Key Features

- **⚡ Real-Time Feed Monitoring:** Checks your saved Upwork searches every 2–5 minutes without manual tab refreshing.
- **🔔 Instant Desktop Notifications:** Receive native desktop popups with direct links to apply.
- **📱 Telegram Mobile Alerts:** Get pinged on your phone instantly via your own Telegram bot—even when you're away from your desk.
- **🛡️ 100% Account Safe & Cloudflare Proof:** Runs inside your legitimate browser session with humanized interval jitter (±30s) and idle detection. Zero headless scrapers or bot flags.
- **💰 Smart Budget Filters:** Only get notified for contracts that match your minimum hourly rate or fixed budget.
- **📋 In-Popup Tracker:** Track today's matches and mark jobs as "Applied" so you never apply twice.
- **📊 Proposal Analytics & Action History:** Visual KPI dashboard showing scanned vs. applied jobs, average hourly rates, and verified client percentages.
- **📄 One-Click PDF Report Export:** Export clean, professional proposal activity summaries for weekly review, agency reporting, or tax records.

---

## 📂 Project Structure

```text
upworks-extension/
├── manifest.json              # Chrome Manifest V3 configuration
├── background.js              # Service worker (alarms, notifications, Telegram dispatch)
├── content.js                 # In-session content script (safe query parsing)
├── icons/
│   ├── icon-16.png            # 16x16 icon
│   ├── icon-48.png            # 48x48 icon
│   └── icon-128.png           # 128x128 icon
├── popup/
│   ├── popup.html             # Extension popup UI
│   ├── popup.css              # Modern UI styling
│   └── popup.js               # Popup controller & state sync
├── settings/
│   ├── settings.html          # Options page (Keywords, budget, scan frequency)
│   ├── settings.css           # Settings styling
│   └── settings.js            # Settings controller & live test triggers
├── dashboard/
│   ├── dashboard.html         # Proposal Analytics & History Dashboard
│   ├── dashboard.css          # Analytics styles + @media print PDF layout
│   └── dashboard.js           # Analytics stats calculation & PDF export
├── UPWORK_ALERT_EXTENSION_PRD.md  # Product Requirements Document
└── README.md                  # This documentation
```

---

## 🛠️ How to Install & Test Locally (Developer Mode)

### Step 1: Load the Extension in Chrome
1. Open Google Chrome.
2. In the URL address bar, navigate to:
   ```text
   chrome://extensions/
   ```
3. In the top-right corner, toggle **Developer mode** to **ON**.
4. In the top-left corner, click **Load unpacked**.
5. Select the `upworks-extension` folder (`/Users/apple/Documents/upworks-extension`).
6. The extension **"Upwork Job Radar"** will now appear in your extensions list! Pin it to your Chrome toolbar.

### Step 2: Configure Your Upwork Search Feed
1. Right-click the extension icon and click **Options** (or click the ⚙️ gear icon inside the popup).
2. Go to [Upwork.com](https://www.upwork.com) and search for your niche (e.g., *"Python FastAPI"*, *"Next.js Developer"*, *"Video Editor"*).
3. Apply any filters you want on Upwork (e.g., Client Payment Verified, 4.5+ stars, Hourly $40+).
4. Copy the entire URL from your browser address bar and paste it into the **Upwork Search URL or Keywords** field in Settings.
5. Set your minimum budget and scan interval (recommended: **3 minutes**).
6. Click **Save Settings**.

### Step 3: Test Notifications
- On the Settings page, click **Send Test Desktop Notification** to confirm native popups are working.
- Click **Scan Now** in the extension popup to trigger an immediate check.

### Step 4: (Optional) Set Up Free Telegram Mobile Alerts
1. Open Telegram on your phone or desktop and search for `@BotFather`.
2. Send `/newbot`, give your bot a name (e.g. *MyUpworkAlertBot*), and copy the **API Bot Token**.
3. Search for `@userinfobot` on Telegram and send `/start` to see your numeric **Id (Chat ID)**.
4. Open your bot's chat and press **Start**.
5. In the extension settings, enable **Receive Alerts on Telegram**, paste your **Bot Token** and **Chat ID**, and click **Test Telegram Connection**. You will receive an immediate test message on your phone!

---

## 🌐 How to Create a Chrome Developer Account & Publish to the Public

To publish the extension to the Chrome Web Store for all freelancers to download, follow these steps:

### 1. Register for a Chrome Web Store Developer Account
1. Visit the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Sign in with your Google account.
3. Pay the one-time registration fee of **$5 USD** (Google charges this to prevent spam accounts).
4. Accept the Developer Terms of Service and complete your developer profile.

### 2. Create the Distribution ZIP Package
In the project root folder, package all required files into a single `.zip` archive (excluding `.git` or local docs):
```bash
zip -r upwork-radar-v1.0.0.zip manifest.json background.js content.js icons popup settings
```

### 3. Upload & Fill Store Listing
1. In your Developer Dashboard, click **Add new item** and upload `upwork-radar-v1.0.0.zip`.
2. Fill in the Store Listing fields:
   - **Title:** `Upwork Job Radar - Real-Time Proposal Alerts`
   - **Summary:** `Get instant desktop and Telegram alerts when new jobs match your skills on Upwork. Apply in the first 15 minutes.`
   - **Detailed Description:** Explain the problem (Upwork killed RSS, competition is fierce, connects are valuable) and how this extension helps.
   - **Category:** `Productivity` or `Workflow & Planning`.
   - **Icon:** 128x128 PNG (use `icons/icon-128.png`).
   - **Screenshots:** At least one 1280x800 px screenshot of the popup and settings pages.
   - **Small Promo Tile:** 440x280 px PNG.

### 4. Privacy Practices Tab (Crucial for Approval)
Google requires clear answers to avoid rejection:
- **Single Purpose:** *"Monitors Upwork job searches and alerts freelancers in real-time when new matching jobs are published."*
- **Permission Justifications:**
  - `storage`: *"Used to save user preferences, search keywords, and job match history locally."*
  - `alarms`: *"Used to schedule periodic background job checks according to the user's chosen interval."*
  - `notifications`: *"Used to display instant desktop alerts when matching jobs appear."*
  - `idle`: *"Used to detect when the user is away from keyboard to pause polling safely."*
  - `host_permissions (*://*.upwork.com/*)`: *"Required to read Upwork job search feeds directly within the user's browser session."*
  - `host_permissions (https://api.telegram.org/*)`: *"Required to send real-time alerts to the user's private Telegram bot."*
- **Data Usage:** Check the boxes indicating that you **do not sell user data**, and that data is processed solely for the extension's primary purpose.

### 5. Submit for Review
Click **Submit for Review**. Review typically takes **1 to 3 business days**. Once approved, your extension will be live on the Chrome Web Store with a public link!

---

## 🔒 Security & Privacy Guarantee

- **Zero Credential Access:** The extension never asks for, reads, or transmits your Upwork password, email, or financial information.
- **Local-First Architecture:** All job history and settings are stored exclusively inside your local Chrome browser storage.
- **No Automated Bidding:** The extension is purely an alert tool. It does not automatically submit bids, click apply buttons, or generate fake clicks, ensuring 100% compliance with Upwork safety standards.

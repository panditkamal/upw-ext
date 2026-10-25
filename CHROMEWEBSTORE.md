# Chrome Web Store Listing — Job Radar for Upwork

> Last Updated: 2026-10-25

## Store Listing

**Extension Name** [REQUIRED]
Job Radar for Upwork - Real-Time Alerts

**Short Description** [REQUIRED]
Instant desktop alerts, client risk scoring, and AI proposal prompts when matching Upwork jobs are posted. Apply in 15 minutes.

**Detailed Description** [REQUIRED]
Be the first to apply to high-value Upwork jobs before dozens of proposals flood the listing.

Job Radar for Upwork monitors your targeted freelance skills and delivers instant desktop notifications the moment matching jobs are posted. With on-page client risk analysis and tailored proposal generation prompts, you can submit standout proposals in minutes.

KEY FEATURES
• Real-Time Job Radar: Get notified via desktop alerts and audio chimes within minutes of new job postings.
• 160+ Skill Tag Selector: Target specific IT and non-IT specializations (e.g. Python, React, UI/UX, Graphic Design, QA Testing, SEO, Copywriting).
• Live Active-Filter Sync: Automatically recognizes your open Upwork search tabs and filters without re-typing.
• Client Trust & Scam Shield: Evaluates client payment verification, hire rate, spending history, and flags high-risk or suspended accounts to protect your connects.
• 1-Click AI Proposal Prompts: Generates tailored, high-converting proposal prompts based on the job's exact deliverables, ready to paste into ChatGPT, Claude, or Gemini.
• Proposal Activity & Analytics: Track which jobs you viewed, saved, and applied to, and export your history to a clean PDF report.

HOW TO USE
1. Click the Job Radar icon in your Chrome toolbar or open Options to select your targeted skills.
2. Keep an Upwork search tab open in your browser while you work.
3. When a new job matches your skills, a desktop alert and audio chime notify you immediately.
4. Click "AI Bid Prompt" to review client safety scores and copy an expert proposal prompt for ChatGPT or Claude.
5. Apply early to maximize your interview conversion rate.

PRIVACY & SECURITY
Your privacy is our priority. Job Radar for Upwork does not collect, sell, or transmit any personal data. All preferences, search filters, and application history are stored locally on your device in your browser's private storage.

PERMISSIONS
• "Read and change your data on upwork.com" — Used solely to scan public job postings matching your selected filters and display client safety metrics on job pages.
• "Display notifications" — Delivers desktop alerts when new matching jobs are discovered.
• "Storage" — Saves your skill selections and local application history on your device.

SUPPORT
Have questions or suggestions? We are here to help.
Email: support@freelanceradar.app
Website: https://freelanceradar.app

Version 1.0.0 — Initial Release with real-time alerts, 160+ skills engine, client trust scoring, and 1-click AI proposal prompt generation.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Monitors Upwork for new jobs matching targeted skills, alerts freelancers with desktop notifications, and generates proposal prompts.

**Primary Language** [REQUIRED]
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|---|---|---|---|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `icons/icon128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 PNG | ⬜ Take screenshot of Popup Job Feed | `screenshot-feed.png` |
| Screenshot 2 [RECOMMENDED] | 1280×800 PNG | ⬜ Take screenshot of Settings Skills Selector | `screenshot-skills.png` |
| Screenshot 3 [RECOMMENDED] | 1280×800 PNG | ⬜ Take screenshot of On-Page Trust & AI Card | `screenshot-onpage.png` |
| Screenshot 4 [RECOMMENDED] | 1280×800 PNG | ⬜ Take screenshot of Proposal Analytics Dashboard | `screenshot-analytics.png` |
| Small Promo Tile [RECOMMENDED] | 440×280 PNG | ⬜ Ready to create in Canva | `promo-small-440x280.png` |
| Marquee Promo Tile | 1400×560 PNG | ⬜ Optional | `marquee-1400x560.png` |

---

## Permissions Justification

| Permission | Type | Justification |
|---|---|---|
| `*://*.upwork.com/*` | host_permissions | Required to inspect job listings and display client safety risk analysis and proposal prompts on Upwork detail pages. |
| `storage` | permissions | Required to save user skill preferences, alert settings, and local proposal tracking history on the user's local device. |
| `notifications` | permissions | Required to trigger system desktop alerts when new matching Upwork jobs are detected. |
| `alarms` | permissions | Required to schedule periodic checks for new jobs at the user's chosen interval (e.g. 1 to 10 minutes). |
| `idle` | permissions | Used to detect if the user's computer is locked or idle to pause alerts and avoid waking sleeping devices. |
| `tabs` | permissions | Used to detect if an Upwork tab is already open so the extension can reuse existing sessions and avoid opening duplicate tabs. |
| `scripting` | permissions | Used to scan the active Upwork tab's job list when the user clicks "Scan Now". |
| `activeTab` | permissions | Allows reading the current tab's active filters when the user opens the popup. |

---

## Privacy & Data Use

**Does the extension collect user data?** No.

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|---|---|---|---|---|
| Personally identifiable info | No | No | N/A | No |
| Health info | No | No | N/A | No |
| Financial info | No | No | N/A | No |
| Authentication info | No | No | N/A | No |
| Personal communications | No | No | N/A | No |
| Location | No | No | N/A | No |
| Web history | No | No | N/A | No |
| User activity | No | No | N/A | No |
| Website content | No | No | Evaluated locally on device only | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

---

## Privacy Policy

**Privacy Policy URL** [REQUIRED]
`https://your-username.github.io/upwork-job-radar/privacy.html` (See `PRIVACY_POLICY.md` in repository)

---

## Version History

| Version | Date | Changes | Status |
|---|---|---|---|
| 1.0.0 | 2026-10-25 | Initial release with real-time alerts, 160+ skills selector, client risk meter, on-page intelligence card, and proposal export dashboard. | Ready for Upload |

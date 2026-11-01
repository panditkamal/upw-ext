# Chrome Web Store Listing — Job Radar for Upwork

> Last Updated: 2026-11-01

## Store Listing

**Extension Name** [REQUIRED]
Job Radar for Upwork - Real-Time Alerts

**Short Description** [REQUIRED]
Instant desktop alerts, client risk scoring, webhook notifications, and AI proposal generation when matching Upwork jobs are posted.

**Detailed Description** [REQUIRED]
Be the first to apply to high-value Upwork jobs before dozens of proposals flood the listing.

Job Radar for Upwork monitors your targeted freelance skills and delivers instant notifications the moment matching jobs are posted. With on-page client risk analysis, Connects budget tracking, and tailored AI proposal generation, you can submit standout proposals in minutes and win more contracts.

KEY FEATURES
• Real-Time Job Radar: Get notified via desktop alerts and customizable audio chimes within minutes of new job postings.
• Multi-Skill Profile Engine: Target your exact freelance specializations with quick-add skill badges, custom keywords, or direct Upwork search URLs.
• In-App AI Proposal Generator: Connect your own API key (OpenAI, Claude, or OpenAI-compatible models like OpenRouter, Groq, and Gemini) to generate personalized proposals aligned with your professional title and experience.
• 1-Click AI Bid Prompts: Instantly copy comprehensive, deliverable-focused proposal prompts ready to paste into any AI writing tool.
• Client Trust & Scam Shield: Evaluates client payment verification, hire rate, spending history, and flags high-risk accounts or low-hire buyers to protect your Connects.
• Discord & Slack Webhooks: Automatically route new-job alerts to your private Discord channel or Slack workspace for seamless mobile notifications.
• Connects Budget Tracker: Monitor your monthly Connects expenditures against your target budget so you never overspend on bids.
• Smart Filters & Quiet Hours: Filter out unwanted keywords or specific countries, set minimum hourly and fixed budget floors, define minimum fit scores, and schedule quiet hours to avoid night-time interruptions.
• Proposal Snippets & History: Save reusable proposal templates (intros, pricing, portfolio links), track applied and saved jobs, and export your history as a clean report.

WHAT'S NEW IN VERSION 1.0.1
• Direct AI proposal generator supporting OpenAI, Anthropic Claude, and OpenRouter endpoints.
• Discord and Slack webhook alert integration.
• Monthly Connects tracker with real-time budget remaining indicators.
• Advanced negative keyword exclusions and client country filters.
• Configurable Quiet Hours and daily alert caps.
• Full-stack profile alignment with refreshed, responsive UI controls.

HOW TO USE
1. Click the Job Radar icon in your toolbar or open Options to configure your targeted skills and profile.
2. (Optional) Add your AI API key for instant proposal generation, or enter a Discord/Slack webhook URL for team alerts.
3. Keep an Upwork search tab open or let Job Radar monitor your feed in the background.
4. When a matching job appears, review its client safety metrics and click "AI Bid Prompt" to draft your tailored proposal.
5. Apply early to maximize your interview conversion rate.

PRIVACY & SECURITY
Your privacy is our priority. Job Radar for Upwork does not sell, track, or transmit your personal data. All preferences, filter criteria, and application histories are stored locally on your device in your browser's private extension storage. Your optional AI keys are kept strictly local and communicate directly with your selected AI provider.

PERMISSIONS
• "Read and change your data on upwork.com" — Used solely to scan public job postings matching your selected filters and display client safety metrics on job pages.
• "Display notifications" — Delivers desktop alerts when new matching jobs are discovered.
• "Storage" — Saves your skill selections and local application history on your device.
• "Alarms" — Schedules periodic background checks at your chosen frequency.

SUPPORT
Have questions or suggestions? We are here to help.
Email: support@freelanceradar.app
Website: https://github.com/panditkamal/upw-ext

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
| 1.0.0 | 2026-10-25 | Initial release with real-time alerts, 160+ skills selector, client risk meter, on-page intelligence card, and proposal export dashboard. | Published |
| 1.0.1 | 2026-11-01 | Bring-your-own-key AI proposal generator, Discord/Slack webhooks, Connects tracker, keyword/country exclusions, Quiet Hours, and UI refinements. | Ready for Upload |

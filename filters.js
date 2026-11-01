// filters.js - Pure job filtering & alert-gating helpers (service worker + node self-check)

// "Hourly: $20-$40" -> {type:'hourly', max:40}; "$500" / "Fixed-price: $500" -> {type:'fixed', max:500}
function parseBudget(budgetStr) {
  const s = budgetStr || '';
  const nums = (s.replace(/,/g, '').match(/\d+(?:\.\d+)?/g) || []).map(Number);
  if (nums.length === 0) return { type: null, max: 0 };
  return { type: /hr|hourly/i.test(s) ? 'hourly' : 'fixed', max: Math.max(...nums) };
}

// Unknown/unparseable budgets pass (never hide a job we can't judge).
function passesBudget(job, { minHourly = 0, minFixed = 0 } = {}) {
  const { type, max } = parseBudget(job.budget);
  if (type === 'hourly') return max >= minHourly;
  if (type === 'fixed') return max >= minFixed;
  return true;
}

const splitList = (v) => (Array.isArray(v) ? v : String(v || '').split(','))
  .map((s) => s.trim().toLowerCase()).filter(Boolean);

// Only real job postings: profile, agency and freelancer links also carry ~ids and must never be treated as jobs.
function isJobUrl(url) {
  const u = url || '';
  return /\/(?:jobs\/|nx\/search\/jobs\/details\/|nx\/find-work\/[^?]*\/details\/)/.test(u) &&
    !/\/(?:freelancers|ab\/profiles|agencies|fl|o)\//.test(u);
}

// Upwork hides client names, so the best stable identity is spent + rating + country.
// Returns '' when the job lacks a specific "$X spent" figure (too vague to block on).
function clientFingerprint(job) {
  const spent = ((job.client || '').match(/\$[\d,.]+[kKmM]?\s*spent/i) || [])[0];
  if (!spent) return '';
  const rating = ((job.client || '').match(/\d\.\d★/) || [''])[0];
  return [spent, rating, job.country || ''].join('|').replace(/\s+/g, ' ').toLowerCase();
}

// Slack incoming webhooks take {text}; Discord takes {content}.
function webhookBody(url, text) {
  return /hooks\.slack\.com/i.test(url || '') ? { text } : { content: text.slice(0, 1900) };
}

// Excluded keywords match title/description/skills; excluded countries match job.country only.
function isExcluded(job, { excludeKeywords = [], excludeCountries = [], blockedClients = [] } = {}) {
  const fp = clientFingerprint(job);
  if (fp && blockedClients.some((b) => b.fp === fp)) return true;
  const text = [job.title, job.description, (job.skillsRequired || []).join(' ')].join(' ').toLowerCase();
  if (splitList(excludeKeywords).some((k) => text.includes(k))) return true;
  const country = (job.country || '').toLowerCase();
  return !!country && splitList(excludeCountries).some((c) => country.includes(c));
}

// start/end "HH:MM"; window may wrap midnight (22:00 -> 07:00).
function inQuietHours({ quietHoursEnabled, quietStart, quietEnd } = {}, date = new Date()) {
  if (!quietHoursEnabled || !quietStart || !quietEnd) return false;
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
  const now = date.getHours() * 60 + date.getMinutes();
  const a = toMin(quietStart), b = toMin(quietEnd);
  if (a === b) return false;
  return a < b ? now >= a && now < b : now >= a || now < b;
}

// Pulls posted-time, proposal count (upper bound) and connects cost out of a job card's text.
function parseJobMeta(text, now = Date.now()) {
  const t = text || '';
  const meta = {};
  const p = t.match(/posted\s+(?:(\d+)\s+(second|minute|hour|day|week|month)s?\s+ago|(yesterday|last week|last month)|(just now))/i);
  if (p) {
    const unitMs = { second: 1e3, minute: 6e4, hour: 36e5, day: 864e5, week: 6048e5, month: 2592e6 };
    const ago = p[1] ? p[1] * unitMs[p[2].toLowerCase()]
      : p[3] ? { yesterday: 864e5, 'last week': 6048e5, 'last month': 2592e6 }[p[3].toLowerCase()] : 0;
    meta.postedAt = now - ago;
  }
  const pr = t.match(/proposals?:?\s*(?:less than\s*(\d+)|(\d+)\s*(?:to|-)\s*(\d+)|(\d+)\+)/i);
  if (pr) meta.proposals = Number(pr[1] || pr[3] || pr[4]);
  const c = t.match(/(\d+)\s*connects?\b/i) || t.match(/connects?:?\s*(\d+)/i);
  if (c) meta.connects = Number(c[1]);
  return meta;
}

// 0-100 fit: skills 40, budget 20, competition 20, recency 20. Unknown signals score neutral (0.5).
function scoreJob(job, settings = {}, now = Date.now()) {
  const meta = parseJobMeta(job.cardText, job.detectedAt || now);
  const postedAt = job.postedAt || meta.postedAt || job.detectedAt || now;
  const proposals = job.proposals ?? meta.proposals;

  const mine = splitList(settings.selectedSkills);
  const text = [job.title, job.description, (job.skillsRequired || []).join(' ')].join(' ').toLowerCase();
  const skills = mine.length ? Math.min(1, mine.filter((k) => text.includes(k)).length / 2) : 0.5;

  const { type, max } = parseBudget(job.budget);
  const budget = type === 'hourly' ? Math.min(1, max / 50) : type === 'fixed' ? Math.min(1, max / 1000) : 0.5;

  const competition = proposals == null ? 0.5 : Math.max(0, Math.min(1, 1 - (proposals - 5) / 45));
  const recency = 1 / (1 + Math.max(0, now - postedAt) / 6e4 / 60);

  const score = Math.round(40 * skills + 20 * budget + 20 * competition + 20 * recency);
  const label = score >= 70 ? 'Strong fit' : score >= 45 ? 'Decent fit' : 'Weak fit';
  return { score, label, proposals, connects: job.connects ?? meta.connects, postedAt };
}

// Sum of connects on jobs marked Applied in the same calendar month as `now`.
function connectsSpentThisMonth(history = [], now = new Date()) {
  return history
    .filter((h) => h.action === 'Applied' && new Date(h.actionTimestamp).getMonth() === now.getMonth()
      && new Date(h.actionTimestamp).getFullYear() === now.getFullYear())
    .reduce((sum, h) => sum + (h.connects || 0), 0);
}

// Client stats from a job page's "About the client" text (e.g. "85% hire rate", "6 jobs posted", "$50K total spent").
function parseClientStats(text) {
  const t = (text || '').replace(/\s+/g, ' ');
  const stats = {};
  const hr = t.match(/(\d+)%\s*hire rate/i);
  if (hr) stats.hireRate = Number(hr[1]);
  const jp = t.match(/(\d[\d,]*)\s*jobs?\s*posted/i);
  if (jp) stats.jobsPosted = Number(jp[1].replace(/,/g, ''));
  const hi = t.match(/(\d+)\s*hires?\b/i);
  if (hi) stats.hires = Number(hi[1]);
  const sp = t.match(/\$([\d.,]+)\s*([kKmM])?\+?\s*(?:total\s*)?spent/i);
  if (sp) stats.spent = parseFloat(sp[1].replace(/,/g, '')) * ({ k: 1e3, m: 1e6 }[(sp[2] || '').toLowerCase()] || 1);
  return stats;
}

const fmtMoney = (n) => (n >= 1e6 ? `$${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${+(n / 1e3).toFixed(1)}K` : `$${n}`);

// Green / yellow / red read on how likely this client is to actually hire. null = not enough data.
function classifyBuyer({ hireRate, jobsPosted, hires, spent } = {}) {
  if (hireRate == null && jobsPosted == null && spent == null) return null;
  const detail = [
    hireRate != null && `${hireRate}% hire rate`,
    hires != null && jobsPosted ? `${hires} hire${hires === 1 ? '' : 's'} out of ${jobsPosted} jobs` : jobsPosted != null && `${jobsPosted} jobs posted`,
    spent != null && `${fmtMoney(spent)} spent`
  ].filter(Boolean).join(', ');

  const posted = jobsPosted ?? 0;
  if (posted >= 3 && (hireRate === 0 || hires === 0 || (spent === 0 && (hireRate == null || hireRate <= 10)))) {
    return { level: 'ghost', label: 'Ghost Job', detail };
  }
  if (hireRate != null && hireRate >= 60) return { level: 'active', label: 'Active Buyer', detail };
  if (hireRate == null && spent >= 10000) return { level: 'active', label: 'Active Buyer', detail };
  if (hireRate != null && posted >= 2) return { level: 'window', label: 'Window Shopper', detail };
  return null;
}

if (typeof module !== 'undefined') {
  module.exports = { isJobUrl, parseClientStats, classifyBuyer, clientFingerprint, webhookBody, parseBudget, passesBudget, isExcluded, inQuietHours, parseJobMeta, scoreJob, connectsSpentThisMonth };
}

// background.js - Upwork Job Radar Service Worker
// Manifest V3 Compliant (Pure async/await, ephemeral state stored in chrome.storage)

importScripts('filters.js', 'ai_client.js', 'ai_analyzer.js');

const ALARM_NAME = 'UPWORK_MONITOR_ALARM';

const DEFAULT_SETTINGS = {
  jobProfile: 'Python Developer',
  searchQuery: 'python developer',
  searchUrl: 'https://www.upwork.com/nx/search/jobs/?q=python%20developer&sort=recency',
  intervalMinutes: 3,
  minBudget: 0,
  minHourly: 0,
  minFixed: 0,
  searches: [],
  excludeKeywords: '',
  excludeCountries: '',
  quietHoursEnabled: false,
  quietStart: '22:00',
  quietEnd: '07:00',
  dailyAlertCap: 0,
  minFitScore: 0,
  connectsPerProposal: 16,
  monthlyConnectsBudget: 0,
  webhookUrl: '',
  primaryColor: '#14a800',
  blockedClients: [],
  snippets: [],
  soundEnabled: true,
  soundChoice: 'chime',
  soundVolume: 70,
  desktopNotifications: true,
  telegramEnabled: false,
  telegramBotToken: '',
  telegramChatId: '',
  monitoringActive: true,
  pauseOnIdle: true,
  jitterEnabled: true
};

// --- Lifecycle Event Handlers ---

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Upwork Radar] Installed/Updated:', details.reason);

  const existing = await chrome.storage.local.get(['settings', 'seenJobIds', 'jobsToday']);
  if (!existing.settings) {
    await chrome.storage.local.set({
      settings: DEFAULT_SETTINGS,
      seenJobIds: [],
      jobsToday: [],
      unviewedCount: 0,
      lastCheckInfo: { timestamp: Date.now(), status: 'Initialized' }
    });
  }

  const settings = existing.settings || DEFAULT_SETTINGS;
  await configureTimers(settings);
  await updateBadge();
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('[Upwork Radar] Browser startup');
  const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
  await configureTimers(settings);
  await updateBadge();
});

// Configure Timer System using Chrome Alarms
async function configureTimers(settings) {
  await chrome.alarms.clear(ALARM_NAME);
  const interval = Math.max(1, Math.round(parseFloat(settings.intervalMinutes) || 3));
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: 1,
    periodInMinutes: interval
  });
  console.log(`[Upwork Radar] Alarm scheduled every ${interval} min`);
}

// Alarm Trigger Handler
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
  if (!settings.monitoringActive) {
    console.log('[Upwork Radar] Monitoring is paused, skipping check');
    return;
  }

  await runCycle(settings);
});

// Master Execution Cycle
async function runCycle(settings) {
  // Check user idle state
  if (settings.pauseOnIdle) {
    const idleState = await new Promise((resolve) => chrome.idle.queryState(300, resolve));
    if (idleState === 'locked') {
      console.log('[Upwork Radar] System locked/idle, skipping cycle');
      return;
    }
  }

  // Jitter (humanized timing)
  if (settings.jitterEnabled && settings.intervalMinutes > 0.5) {
    const jitterSeconds = Math.floor(Math.random() * 20);
    await new Promise((r) => setTimeout(r, jitterSeconds * 1000));
  }

  // Perform live check
  await performMonitoringCheck(settings);
}

// --- Monitoring Engine ---

// Primary search (skills picker + global budget) followed by any enabled extra searches.
function getSearches(settings) {
  const primary = {
    name: 'Primary',
    url: settings.searchUrl,
    minHourly: settings.minHourly ?? settings.minBudget ?? 0,
    minFixed: settings.minFixed ?? 0,
    color: settings.primaryColor,
    notify: true
  };
  return [primary, ...(settings.searches || []).filter((s) => s.enabled !== false && s.url)];
}

async function performMonitoringCheck(settings) {
  const statuses = [];
  const searches = getSearches(settings);
  for (let i = 0; i < searches.length; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 2000 + Math.random() * 3000));
    try {
      statuses.push(await scanSearch(settings, searches[i], i === 0));
    } catch (error) {
      console.error('[Upwork Radar] Monitoring check error:', error);
      statuses.push(`Error: ${error.message}`);
    }
  }
  await saveCheckLog(statuses.join(' | '));
}

async function scanSearch(settings, search, allowTab) {
  // 1. Primary search: reuse an already-open Upwork tab if one responds
  if (allowTab) {
    const tabs = await chrome.tabs.query({ url: '*://*.upwork.com/*' });
    if (tabs.length > 0) {
      try {
        const response = await chrome.tabs.sendMessage(tabs[0].id, { type: 'PERFORM_PAGE_CHECK', settings });
        if (response && response.jobs) {
          await processNewJobs(response.jobs, settings, search);
          return `Active Tab (${response.jobs.length} jobs scanned)`;
        }
      } catch (err) {
        // Tab not responsive yet, fallback to background fetch
      }
    }
  }

  // 2. Direct background fetch using user's authenticated session cookies
  const fetchedJobs = await fetchSearchFeedDirect(settings, search);
  return `${search.name}: Direct Scan (${fetchedJobs ? fetchedJobs.length : 0} scanned)`;
}

async function saveCheckLog(status) {
  await chrome.storage.local.set({
    lastCheckInfo: {
      timestamp: Date.now(),
      status: status
    }
  });
}

// Fetch search results directly with session credentials
async function fetchSearchFeedDirect(settings, search) {
  let targetUrl = search.url;
  if (!targetUrl || !targetUrl.includes('upwork.com')) {
    const q = encodeURIComponent(settings.jobProfile || settings.searchQuery || 'developer');
    targetUrl = `https://www.upwork.com/nx/search/jobs/?q=${q}&sort=recency`;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.warn(`[Upwork Radar] Upwork returned HTTP ${response.status}`);
      return [];
    }

    const text = await response.text();
    const jobs = parseJobsFromHtmlString(text);
    if (jobs && jobs.length > 0) {
      await processNewJobs(jobs, settings, search);
    }
    return jobs;
  } catch (err) {
    console.warn('[Upwork Radar] Network fetch error:', err.message);
    return [];
  }
}

// Robust Regex/String Parser for Upwork Job Payloads
function parseJobsFromHtmlString(html) {
  const jobs = [];

  // 1. Try to find embedded JSON state
  const jsonMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/) ||
                    html.match(/window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});<\/script>/);

  if (jsonMatch && jsonMatch[1]) {
    try {
      const data = JSON.parse(jsonMatch[1]);
      const extracted = extractJobsFromStateObject(data);
      if (extracted.length > 0) return extracted;
    } catch (e) {}
  }

  // 2. Extract job links via resilient regex patterns
  const jobLinkRegex = /href="(\/(?:nx\/search\/jobs\/details|jobs)\/(~[a-zA-Z0-9]+)[^"]*)"[^>]*>([^<]+)<\/a>/g;
  let match;
  const seenIds = new Set();

  while ((match = jobLinkRegex.exec(html)) !== null) {
    const rawUrl = match[1];
    const cipherText = match[2];
    const title = match[3].replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();

    if (!seenIds.has(cipherText) && title.length > 2) {
      seenIds.add(cipherText);

      const contextWindow = html.substring(match.index, match.index + 800);
      let budget = 'Competitive';
      const budgetMatch = contextWindow.match(/\$(\d+(?:\.\d+)?(?:\s*-\s*\$\d+(?:\.\d+)?)?(?:\s*\/\s*hr)?)/i) ||
                          contextWindow.match(/(Hourly:\s*\$\d+(?:-\$\d+)?|Fixed-price:\s*\$[\d,]+)/i);
      if (budgetMatch) {
        budget = budgetMatch[0];
      }

      jobs.push({
        id: cipherText,
        title: title,
        url: rawUrl.startsWith('http') ? rawUrl : `https://www.upwork.com${rawUrl}`,
        budget: budget,
        client: 'Upwork Client',
        cardText: contextWindow.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        detectedAt: Date.now(),
        applied: false
      });
    }
  }

  return jobs;
}

function extractJobsFromStateObject(obj) {
  const jobs = [];
  function search(node) {
    if (!node || typeof node !== 'object') return;
    if (node.ciphertext && node.title) {
      jobs.push({
        id: node.ciphertext,
        title: node.title,
        url: `https://www.upwork.com/jobs/${node.ciphertext}`,
        budget: node.amount?.amount ? `$${node.amount.amount}` : (node.hourlyBudgetText || 'Competitive'),
        client: node.client?.totalSpent ? `$${Math.round(node.client.totalSpent)} spent` : 'Client',
        country: node.client?.location?.country || '',
        detectedAt: Date.now(),
        applied: false
      });
      return;
    }
    for (const key of Object.keys(node)) {
      search(node[key]);
    }
  }
  search(obj);
  return jobs;
}

// --- Job Processing & Alerts ---

async function processNewJobs(incomingJobs, settings, search = getSearches(settings)[0]) {
  if (!incomingJobs || incomingJobs.length === 0) return;

  const storage = await chrome.storage.local.get(['notifiedJobIds', 'seenJobIds', 'jobsToday', 'unviewedCount']);
  const notifiedJobIds = new Set(storage.notifiedJobIds || storage.seenJobIds || []);
  let jobsToday = storage.jobsToday || [];
  let unviewedCount = storage.unviewedCount || 0;

  const newlyNotifiedJobs = [];
  const existingIdSet = new Set(jobsToday.map((j) => j.id));

  for (const job of incomingJobs) {
    if (!job.id || !isJobUrl(job.url)) continue;

    if (!passesBudget(job, search) || isExcluded(job, settings)) continue;
    job.search = search.name;
    job.searchColor = search.color || '#14a800';

    // ALWAYS ensure job is included in jobsToday list so user sees it in popup!
    if (!existingIdSet.has(job.id)) {
      existingIdSet.add(job.id);
      jobsToday.unshift(job);
    }

    // Only dispatch desktop notification if brand new (never notified before)
    if (!notifiedJobIds.has(job.id)) {
      notifiedJobIds.add(job.id);
      if (search.notify !== false && scoreJob(job, settings).score >= (settings.minFitScore || 0)) newlyNotifiedJobs.push(job);
    }
  }

  jobsToday = jobsToday.slice(0, 100);
  if (newlyNotifiedJobs.length > 0) {
    unviewedCount += newlyNotifiedJobs.length;
  }

  // Persist updated records
  await chrome.storage.local.set({
    notifiedJobIds: Array.from(notifiedJobIds).slice(-2000),
    seenJobIds: Array.from(notifiedJobIds).slice(-2000),
    jobsToday: jobsToday,
    unviewedCount: unviewedCount
  });

  await updateBadge(unviewedCount);

  // Quiet hours and daily cap gate alerts only; jobs still land in the popup list
  const { snoozeUntil = 0 } = await chrome.storage.local.get('snoozeUntil');
  if (inQuietHours(settings) || snoozeUntil > Date.now()) return;
  if (!settings.desktopNotifications && !settings.webhookUrl) return;
  const today = new Date().toDateString();
  let { alertCount } = await chrome.storage.local.get('alertCount');
  if (!alertCount || alertCount.date !== today) alertCount = { date: today, count: 0 };
  const cap = settings.dailyAlertCap > 0 ? settings.dailyAlertCap : Infinity;
  let alerted = 0;
  for (const job of newlyNotifiedJobs.slice(0, 2)) {
    if (alertCount.count >= cap) break;
    alerted++;
    if (settings.desktopNotifications) dispatchDesktopNotification(job, settings);
    if (settings.webhookUrl) await sendWebhook(settings.webhookUrl, job, settings);
    alertCount.count++;
  }
  await chrome.storage.local.set({ alertCount });
  if (alerted > 0) await playAlertSound(settings);
  // Badge takes the colour of the search that just fired
  const last = newlyNotifiedJobs[0];
  if (last && last.searchColor) await chrome.action.setBadgeBackgroundColor({ color: last.searchColor });
}

// Service workers can't play audio: delegate to the offscreen page. 'system' = OS notification sound.
async function playAlertSound(settings) {
  if (!settings.soundEnabled || settings.soundChoice === 'system') return;
  try {
    if (!(await chrome.offscreen.hasDocument())) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Play the alert sound for new job matches'
      });
    }
    await chrome.runtime.sendMessage({
      type: 'PLAY_SOUND',
      sound: settings.soundChoice || 'chime',
      volume: settings.soundVolume ?? 70
    });
  } catch (err) {
    console.warn('[Upwork Radar] Sound error:', err.message);
  }
}

async function sendWebhook(url, job, settings) {
  const text = `${job.title}\n${job.budget} | Fit ${scoreJob(job, settings).score}% | ${job.client}` +
    `${job.search ? ` | ${job.search}` : ''}\n${job.url}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookBody(url, text))
    });
    if (!res.ok) console.warn('[Upwork Radar] Webhook HTTP', res.status);
    return res.ok;
  } catch (err) {
    console.warn('[Upwork Radar] Webhook error:', err.message);
    return false;
  }
}

// Native Chrome Notification (Hardened with absolute icon URL and Mac support)
function dispatchDesktopNotification(job, settings = {}) {
  const notifId = `upwork_${job.id}_${Date.now()}`;
  const iconPath = chrome.runtime.getURL('icons/icon128.png');

  chrome.notifications.create(
    notifId,
    {
      type: 'basic',
      iconUrl: iconPath,
      title: `${job.search ? `[${job.search}] ` : ''}${job.title.substring(0, 40)}`,
      message: `${job.budget} | Fit ${scoreJob(job, settings).score}% | ${job.client}\nClick to view and apply!`,
      priority: 2,
      silent: !(settings.soundEnabled !== false && settings.soundChoice === 'system')
    },
    (createdId) => {
      if (chrome.runtime.lastError) {
        console.error('[Upwork Radar] Desktop notification error:', chrome.runtime.lastError.message);
      } else {
        console.log('[Upwork Radar] Desktop notification delivered successfully:', createdId);
      }
    }
  );

  // Save URL for notification click routing
  chrome.storage.local.set({ [`notif_${notifId}`]: job.url });
}

// Notification Click Handler - Directly opens the proposal page
chrome.notifications.onClicked.addListener(async (notifId) => {
  const key = `notif_${notifId}`;
  const data = await chrome.storage.local.get(key);
  const targetUrl = data[key] || 'https://www.upwork.com/nx/search/jobs/';
  await chrome.tabs.create({ url: targetUrl });
  chrome.notifications.clear(notifId);
  chrome.storage.local.remove(key);
});

// Badge Manager
async function updateBadge(count) {
  if (count === undefined) {
    const data = await chrome.storage.local.get('unviewedCount');
    count = data.unviewedCount || 0;
  }

  if (count > 0) {
    await chrome.action.setBadgeText({ text: String(count > 99 ? '99+' : count) });
    await chrome.action.setBadgeBackgroundColor({ color: '#14a800' });
  } else {
    await chrome.action.setBadgeText({ text: '' });
  }
}

// --- Message Listener for Popup and Settings ---

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    switch (message.type) {
      case 'TRIGGER_MANUAL_CHECK': {
        const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
        await runCycle(settings);
        sendResponse({ success: true });
        break;
      }

      case 'JOB_CLIENT_STATS': {
        const { jobsToday = [] } = await chrome.storage.local.get('jobsToday');
        await chrome.storage.local.set({
          jobsToday: jobsToday.map((j) => (j.id === message.id ? { ...j, clientStats: message.stats } : j))
        });
        sendResponse({ success: true });
        break;
      }

      case 'JOB_CONNECTS': {
        const { jobsToday = [] } = await chrome.storage.local.get('jobsToday');
        await chrome.storage.local.set({
          jobsToday: jobsToday.map((j) => (j.id === message.id ? { ...j, connects: message.connects } : j))
        });
        sendResponse({ success: true });
        break;
      }

      case 'NEW_JOBS_FROM_CONTENT': {
        const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
        if (message.jobs) {
          await processNewJobs(message.jobs, settings);
        }
        sendResponse({ success: true });
        break;
      }

      case 'AI_RUN': {
        try {
          const { aiConfig, settings = {} } = await chrome.storage.local.get(['aiConfig', 'settings']);
          let text;
          if (message.mode === 'ping') {
            text = await callAi(message.config || aiConfig, 'Reply with the single word OK.', 'ping');
          } else if (message.mode === 'analysis') {
            text = await callAi(aiConfig, 'You are a concise freelance career advisor.', buildJobAnalysisPrompt(message.job, settings));
          } else {
            text = await callAi(
              aiConfig,
              'You write winning Upwork proposals. Output only the proposal text, ready to paste, with no preamble or notes.',
              generateWinningProposalPrompt(message.job, settings)
            );
          }
          sendResponse({ ok: true, text });
        } catch (err) {
          sendResponse({ ok: false, error: err.message });
        }
        break;
      }

      case 'TEST_WEBHOOK': {
        const ok = await sendWebhook(message.url, {
          title: 'Job Radar webhook works', budget: 'Test', client: 'Test alert', url: 'https://www.upwork.com'
        }, {});
        sendResponse({ success: ok });
        break;
      }

      case 'TEST_NOTIFICATION': {
        const { settings: cur = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
        dispatchDesktopNotification({
          id: `verify_${Date.now()}`,
          title: 'Job Radar Active: Desktop Alerts Working',
          budget: 'Alert Verified',
          client: 'System Notification Working',
          url: 'https://www.upwork.com'
        }, cur);
        sendResponse({ success: true });
        break;
      }

      case 'UPDATE_ALARM_INTERVAL': {
        const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
        settings.intervalMinutes = message.intervalMinutes || 3;
        await configureTimers(settings);
        sendResponse({ success: true });
        break;
      }

      case 'CLEAR_BADGE': {
        await chrome.storage.local.set({ unviewedCount: 0 });
        await updateBadge(0);
        sendResponse({ success: true });
        break;
      }

      default:
        sendResponse({ error: 'Unknown message type' });
    }
  })();
  return true;
});

// --- Shortcuts & context menu ---

async function scanNow() {
  const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
  await performMonitoringCheck(settings);
}

async function openLatestJob() {
  const { jobsToday = [] } = await chrome.storage.local.get('jobsToday');
  if (jobsToday[0]) await chrome.tabs.create({ url: jobsToday[0].url });
}

const MENU_ACTIONS = { radar_scan: scanNow, radar_latest: openLatestJob };
const COMMAND_ACTIONS = { 'scan-now': scanNow, 'open-latest': openLatestJob };

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'radar_scan', title: 'Scan Upwork now', contexts: ['action'] });
    chrome.contextMenus.create({ id: 'radar_latest', title: 'Open latest matching job', contexts: ['action'] });
  });
});
chrome.contextMenus.onClicked.addListener((info) => MENU_ACTIONS[info.menuItemId]?.());
chrome.commands.onCommand.addListener((cmd) => COMMAND_ACTIONS[cmd]?.());

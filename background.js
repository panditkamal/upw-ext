// background.js - Upwork Job Radar Service Worker
// Manifest V3 Compliant (Pure async/await, ephemeral state stored in chrome.storage)

const ALARM_NAME = 'UPWORK_MONITOR_ALARM';
let shortIntervalTimer = null;

const DEFAULT_SETTINGS = {
  jobProfile: 'Python Developer',
  searchQuery: 'python developer',
  searchUrl: 'https://www.upwork.com/nx/search/jobs/?q=python%20developer&sort=recency',
  intervalMinutes: 3,
  minBudget: 0,
  soundEnabled: true,
  desktopNotifications: true,
  testSimulationMode: false,
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

// Configure Timer System (Supports both standard Alarms and 10s Fast Testing Loops)
async function configureTimers(settings) {
  // Clear any existing timer
  if (shortIntervalTimer) {
    clearInterval(shortIntervalTimer);
    shortIntervalTimer = null;
  }
  await chrome.alarms.clear(ALARM_NAME);

  const interval = parseFloat(settings.intervalMinutes) || 3;
  const isTestingMode = interval <= 0.25 || !!settings.testSimulationMode;

  if (isTestingMode) {
    console.log('[Upwork Radar] ⚡ Fast Testing Mode active: checking every 10 seconds');
    // Run immediate check
    runCycle(settings);
    // Set 10-second interval
    shortIntervalTimer = setInterval(async () => {
      const { settings: currentSettings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
      if (currentSettings.monitoringActive) {
        await runCycle(currentSettings);
      }
    }, 10000);
  } else {
    chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: 1,
      periodInMinutes: Math.max(1, Math.round(interval))
    });
    console.log(`[Upwork Radar] Standard Alarm scheduled every ${interval} min`);
  }
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
  if (settings.pauseOnIdle && !settings.testSimulationMode) {
    const idleState = await new Promise((resolve) => chrome.idle.queryState(300, resolve));
    if (idleState === 'locked') {
      console.log('[Upwork Radar] System locked/idle, skipping cycle');
      return;
    }
  }

  // Jitter (only in standard mode, disabled in fast testing mode)
  if (settings.jitterEnabled && !settings.testSimulationMode && settings.intervalMinutes > 0.5) {
    const jitterSeconds = Math.floor(Math.random() * 20);
    await new Promise((r) => setTimeout(r, jitterSeconds * 1000));
  }

  // 1. If Test Simulation Mode is ON, generate a mock job every cycle
  if (settings.testSimulationMode) {
    await simulateIncomingTestJob(settings);
  }

  // 2. Perform live check
  await performMonitoringCheck(settings);
}

// Simulated Job Generator (For live testing and verification)
const SAMPLE_MOCK_TITLES = [
  'Senior Python & AI Engineer (FastAPI / LangChain)',
  'Full Stack React & Node.js Specialist',
  'Lead Next.js Developer for High-Growth SaaS',
  'Python Data Pipeline & Web Scraper Architect',
  'UI/UX Product Designer for Web3 & AI Platform',
  'Senior Backend Go / Python Microservices Engineer'
];

async function simulateIncomingTestJob(settings) {
  const randomTitle = SAMPLE_MOCK_TITLES[Math.floor(Math.random() * SAMPLE_MOCK_TITLES.length)];
  const randomRate = 45 + Math.floor(Math.random() * 40);
  const mockId = `sim_${Date.now()}`;

  const mockJob = {
    id: mockId,
    title: `[TEST] ${randomTitle}`,
    url: 'https://www.upwork.com/nx/search/jobs/?sort=recency',
    budget: `$${randomRate}-$${randomRate + 25}/hr`,
    client: 'Payment Verified (5.0★ • $60k+ spent)',
    detectedAt: Date.now(),
    applied: false
  };

  console.log('[Upwork Radar] Generating test simulated job:', mockJob.title);
  await processNewJobs([mockJob], settings);
}

// --- Monitoring Engine ---

async function performMonitoringCheck(settings) {
  let statusText = 'OK';
  try {
    // 1. Check if an Upwork tab is already open
    const tabs = await chrome.tabs.query({ url: '*://*.upwork.com/*' });

    if (tabs.length > 0) {
      const targetTab = tabs[0];
      try {
        const response = await chrome.tabs.sendMessage(targetTab.id, {
          type: 'PERFORM_PAGE_CHECK',
          settings
        });
        if (response && response.jobs) {
          await processNewJobs(response.jobs, settings);
          statusText = `Active Tab (${response.jobs.length} jobs scanned)`;
          await saveCheckLog(statusText);
          return;
        }
      } catch (err) {
        // Tab not responsive yet, fallback to background fetch
      }
    }

    // 2. Direct background fetch using user's authenticated session cookies
    const fetchedJobs = await fetchSearchFeedDirect(settings);
    statusText = `Direct Scan (${fetchedJobs ? fetchedJobs.length : 0} scanned)`;
  } catch (error) {
    console.error('[Upwork Radar] Monitoring check error:', error);
    statusText = `Error: ${error.message}`;
  }

  await saveCheckLog(statusText);
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
async function fetchSearchFeedDirect(settings) {
  let targetUrl = settings.searchUrl;
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
      await processNewJobs(jobs, settings);
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

async function processNewJobs(incomingJobs, settings) {
  if (!incomingJobs || incomingJobs.length === 0) return;

  const storage = await chrome.storage.local.get(['notifiedJobIds', 'seenJobIds', 'jobsToday', 'unviewedCount']);
  const notifiedJobIds = new Set(storage.notifiedJobIds || storage.seenJobIds || []);
  let jobsToday = storage.jobsToday || [];
  let unviewedCount = storage.unviewedCount || 0;

  const newlyNotifiedJobs = [];
  const existingIdSet = new Set(jobsToday.map((j) => j.id));

  for (const job of incomingJobs) {
    if (!job.id) continue;

    // Filter by minimum budget if set
    if (settings.minBudget > 0) {
      const budgetNumbers = (job.budget || '').match(/\d+/g);
      if (budgetNumbers && budgetNumbers.length > 0) {
        const maxParsedBudget = Math.max(...budgetNumbers.map(Number));
        if (maxParsedBudget < settings.minBudget) {
          continue;
        }
      }
    }

    // ALWAYS ensure job is included in jobsToday list so user sees it in popup!
    if (!existingIdSet.has(job.id)) {
      existingIdSet.add(job.id);
      jobsToday.unshift(job);
    }

    // Only dispatch desktop notification if brand new (never notified before)
    if (!notifiedJobIds.has(job.id)) {
      notifiedJobIds.add(job.id);
      newlyNotifiedJobs.push(job);
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

  // Trigger Notifications for top new matches
  for (const job of newlyNotifiedJobs.slice(0, 2)) {
    if (settings.desktopNotifications) {
      dispatchDesktopNotification(job);
    }
  }
}

// Native Chrome Notification (Hardened with absolute icon URL and Mac support)
function dispatchDesktopNotification(job) {
  const notifId = `upwork_${job.id}_${Date.now()}`;
  const iconPath = chrome.runtime.getURL('icons/icon128.png');

  chrome.notifications.create(
    notifId,
    {
      type: 'basic',
      iconUrl: iconPath,
      title: `🚨 ${job.title.substring(0, 48)}`,
      message: `💰 Budget: ${job.budget} | Client: ${job.client}\nClick to view and apply!`,
      priority: 2,
      silent: false
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

      case 'NEW_JOBS_FROM_CONTENT': {
        const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
        if (message.jobs) {
          await processNewJobs(message.jobs, settings);
        }
        sendResponse({ success: true });
        break;
      }

      case 'TEST_NOTIFICATION': {
        dispatchDesktopNotification({
          id: `demo_${Date.now()}`,
          title: 'Senior Python & React Engineer ($65/hr)',
          budget: '$50-$75/hr',
          client: 'Payment Verified (5.0★ • $80k+ spent)',
          url: 'https://www.upwork.com'
        });
        sendResponse({ success: true });
        break;
      }

      case 'UPDATE_ALARM_INTERVAL': {
        const { settings = DEFAULT_SETTINGS } = await chrome.storage.local.get('settings');
        settings.intervalMinutes = message.intervalMinutes;
        settings.testSimulationMode = message.testSimulationMode;
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

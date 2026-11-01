// popup.js - Upwork Job Radar Popup Controller
// Features: Active-Tab Auto-Detection, Instant DOM Extraction, Live Skill Target Sync, Proposal Tracking

document.addEventListener('DOMContentLoaded', async () => {
  const monitoringToggle = document.getElementById('monitoringToggle');
  const toggleLabelText = document.getElementById('toggleLabelText');
  const statusBadge = document.getElementById('statusBadge');
  const scanNowBtn = document.getElementById('scanNowBtn');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const openAnalyticsBtn = document.getElementById('openAnalyticsBtn');
  const currentSearchLabel = document.getElementById('currentSearchLabel');
  const lastScanText = document.getElementById('lastScanText');
  const jobList = document.getElementById('jobList');
  const emptyState = document.getElementById('emptyState');
  const jobCountBadge = document.getElementById('jobCountBadge');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const connectsTracker = document.getElementById('connectsTracker');
  const tabStatus = document.getElementById('tabStatus');
  const snoozeSelect = document.getElementById('snoozeSelect');
  const snoozeStatus = document.getElementById('snoozeStatus');
  const resumeBtn = document.getElementById('resumeBtn');
  const snippetBox = document.getElementById('snippetBox');
  const snippetSelect = document.getElementById('snippetSelect');
  let snippets = [];
  let currentModalJob = null;
  const aiGenBtn = document.getElementById('aiGenBtn');
  const aiAnalyzeBtn = document.getElementById('aiAnalyzeBtn');
  const aiOutput = document.getElementById('aiOutput');
  const aiCopyBtn = document.getElementById('aiCopyBtn');
  const aiRunHint = document.getElementById('aiRunHint');

  async function runAi(mode) {
    aiGenBtn.disabled = aiAnalyzeBtn.disabled = true;
    aiRunHint.textContent = 'Thinking...';
    aiOutput.style.display = aiCopyBtn.style.display = 'none';
    const res = await chrome.runtime.sendMessage({ type: 'AI_RUN', mode, job: currentModalJob }).catch((e) => ({ ok: false, error: e.message }));
    aiGenBtn.disabled = aiAnalyzeBtn.disabled = false;
    if (res && res.ok) {
      aiRunHint.textContent = '';
      aiOutput.value = res.text;
      aiOutput.style.display = aiCopyBtn.style.display = '';
    } else {
      aiRunHint.textContent = `AI error: ${res && res.error}`;
    }
  }
  aiGenBtn.addEventListener('click', () => runAi('proposal'));
  aiAnalyzeBtn.addEventListener('click', () => runAi('analysis'));
  aiCopyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(aiOutput.value);
    aiCopyBtn.textContent = '✓ Copied';
    setTimeout(() => { aiCopyBtn.textContent = 'Copy result'; }, 2000);
  });

  document.getElementById('snippetCopyBtn').addEventListener('click', async () => {
    const sn = snippets[snippetSelect.value];
    if (sn) {
      await navigator.clipboard.writeText(sn.text);
      modalCopiedToast.textContent = '✓ Snippet copied!';
      modalCopiedToast.style.display = 'block';
      setTimeout(() => { modalCopiedToast.style.display = 'none'; }, 2500);
    }
  });

  snoozeSelect.addEventListener('change', async () => {
    const v = snoozeSelect.value;
    if (!v) return;
    let until;
    if (v === 'tomorrow') {
      until = new Date();
      until.setDate(until.getDate() + 1);
      until.setHours(7, 0, 0, 0);
      until = until.getTime();
    } else {
      until = Date.now() + Number(v) * 60000;
    }
    await chrome.storage.local.set({ snoozeUntil: until });
    snoozeSelect.value = '';
  });
  resumeBtn.addEventListener('click', () => chrome.storage.local.remove('snoozeUntil'));

  // AI Modal elements
  const aiModal = document.getElementById('aiModal');
  const closeAiModalBtn = document.getElementById('closeAiModalBtn');
  const modalTrustScore = document.getElementById('modalTrustScore');
  const modalTrustFlags = document.getElementById('modalTrustFlags');
  const modalPromptText = document.getElementById('modalPromptText');
  const modalCopyPromptBtn = document.getElementById('modalCopyPromptBtn');
  const modalCopiedToast = document.getElementById('modalCopiedToast');

  if (closeAiModalBtn) {
    closeAiModalBtn.addEventListener('click', () => {
      aiModal.style.display = 'none';
    });
  }

  if (modalCopyPromptBtn) {
    modalCopyPromptBtn.addEventListener('click', async () => {
      if (modalPromptText.value) {
        await navigator.clipboard.writeText(modalPromptText.value);
        modalCopiedToast.style.display = 'block';
        setTimeout(() => {
          modalCopiedToast.style.display = 'none';
        }, 3000);
      }
    });
  }

  // Clear unread badge counter on popup view
  chrome.runtime.sendMessage({ type: 'CLEAR_BADGE' }).catch(() => {});

  // Is an Upwork tab open with the content script responding?
  async function updateTabStatus() {
    let live = false;
    try {
      const tabs = await chrome.tabs.query({ url: '*://*.upwork.com/*' });
      for (const t of tabs) {
        const r = await chrome.tabs.sendMessage(t.id, { type: 'PING' }).catch(() => null);
        if (r && r.ok) { live = true; break; }
      }
    } catch (e) {}
    tabStatus.innerHTML = `<i class="dot ${live ? 'live' : 'idle'}"></i>${live
      ? 'Live monitor active. Upwork tab open and synced.'
      : 'Background polling. Open an Upwork tab for live sync.'}`;
  }
  updateTabStatus();
  setInterval(updateTabStatus, 5000);

  // Load and render initial state
  await reloadState();

  // Inspect active tab to detect current Upwork filters and skills
  await inspectActiveTabSkills();

  // Real-time listener for background updates
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.jobsToday || changes.settings || changes.lastCheckInfo || changes.snoozeUntil || changes.applicationHistory)) {
      reloadState();
    }
  });

  // Toggle monitoring on/off
  monitoringToggle.addEventListener('change', async () => {
    const active = monitoringToggle.checked;
    const { settings = {} } = await chrome.storage.local.get('settings');
    settings.monitoringActive = active;
    await chrome.storage.local.set({ settings });
    updateMonitoringUI(active);
  });

  // Open Analytics Dashboard
  if (openAnalyticsBtn) {
    openAnalyticsBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
    });
  }

  // Scan Now button (Directly extracts from active Upwork tab & immediately renders)
  scanNowBtn.addEventListener('click', async () => {
    const icon = scanNowBtn.querySelector('.spin-icon');
    icon.classList.add('rotating');
    scanNowBtn.disabled = true;

    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      let extractedData = null;

      if (activeTab && activeTab.url && activeTab.url.includes('upwork.com')) {
        const results = await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: extractJobsAndFiltersFromDOM
        });

        if (results && results[0] && results[0].result) {
          extractedData = results[0].result;
        }
      }

      if (extractedData && extractedData.jobs && extractedData.jobs.length > 0) {
        const scannedJobs = extractedData.jobs;
        console.log(`[Upwork Radar] Extracted ${scannedJobs.length} jobs directly from page.`);

        // 1. Immediately save to storage & render on screen!
        const { jobsToday = [] } = await chrome.storage.local.get('jobsToday');
        const existingMap = new Map(jobsToday.map((j) => [j.id, j]));

        scannedJobs.forEach((j) => {
          if (!existingMap.has(j.id)) {
            existingMap.set(j.id, j);
            jobsToday.unshift(j);
          }
        });

        const updatedList = jobsToday.filter((j) => isJobUrl(j.url)).slice(0, 100); // also purges stray profile entries
        await chrome.storage.local.set({
          jobsToday: updatedList,
          lastCheckInfo: {
            timestamp: Date.now(),
            status: `Extracted ${scannedJobs.length} jobs from page`
          }
        });

        // 2. Update active skills label if detected
        if (extractedData.activeSkills && extractedData.activeSkills.length > 0) {
          currentSearchLabel.textContent = extractedData.activeSkills.join(' • ');
          currentSearchLabel.title = `Active filters: ${extractedData.activeSkills.join(', ')}`;
        }

        renderJobs(updatedList, (await chrome.storage.local.get('settings')).settings);

        // 3. Notify background service worker
        await chrome.runtime.sendMessage({
          type: 'NEW_JOBS_FROM_CONTENT',
          jobs: scannedJobs
        }).catch(() => {});
      } else {
        // Fallback: trigger background check
        await chrome.runtime.sendMessage({ type: 'TRIGGER_MANUAL_CHECK' }).catch(() => {});
      }

      setTimeout(async () => {
        await reloadState();
        icon.classList.remove('rotating');
        scanNowBtn.disabled = false;
      }, 800);
    } catch (e) {
      console.warn('Scan failed:', e);
      icon.classList.remove('rotating');
      scanNowBtn.disabled = false;
    }
  });

  // Clear history
  clearHistoryBtn.addEventListener('click', async () => {
    if (confirm('Clear today’s job feed?')) {
      await chrome.storage.local.set({ jobsToday: [] });
      await reloadState();
    }
  });

  // Open settings
  openSettingsBtn.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      chrome.tabs.create({ url: chrome.runtime.getURL('settings/settings.html') });
    }
  });

  // --- Helper Functions ---

  async function inspectActiveTabSkills() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('upwork.com')) {
        // Inspect active tab DOM for skills
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const regex = /Skill:\s*([^<]+)/gi;
            const skills = [];
            let match;
            const html = document.body ? document.body.innerHTML : '';
            while ((match = regex.exec(html)) !== null) {
              const skillName = match[1].replace(/[\r\n\t✕×]/g, '').trim();
              if (skillName && !skills.includes(skillName) && skillName.length < 40) {
                skills.push(skillName);
              }
            }
            const qMatch = window.location.search.match(/[?&]q=([^&]+)/);
            const searchQ = qMatch ? decodeURIComponent(qMatch[1]).replace(/\+/g, ' ') : '';
            return { skills, searchQ };
          }
        });

        if (results && results[0] && results[0].result) {
          const { skills, searchQ } = results[0].result;
          if (skills && skills.length > 0) {
            currentSearchLabel.textContent = skills.join(' / ');
            currentSearchLabel.title = `Skills detected from active Upwork tab: ${skills.join(', ')}`;
            return;
          } else if (searchQ) {
            currentSearchLabel.textContent = `"${searchQ}"`;
            currentSearchLabel.title = `Search query: ${searchQ}`;
            return;
          }
        }
      }
    } catch (e) {}

    // Fallback to saved settings
    const { settings = {} } = await chrome.storage.local.get('settings');
    if (settings.selectedSkills && settings.selectedSkills.length > 0) {
      currentSearchLabel.textContent = `${settings.selectedSkills.join(' • ')}`;
    } else if (settings.jobProfile && !settings.jobProfile.includes('chrome://')) {
      currentSearchLabel.textContent = `${settings.jobProfile}`;
    } else {
      currentSearchLabel.textContent = 'Full Stack • React • Node.js • Python • Web Development';
    }
  }

  async function reloadState() {
    const { settings = {}, jobsToday = [], lastCheckInfo = {}, applicationHistory = [], snoozeUntil = 0 } =
      await chrome.storage.local.get(['settings', 'jobsToday', 'lastCheckInfo', 'applicationHistory', 'snoozeUntil']);

    const snoozed = snoozeUntil > Date.now();
    snoozeStatus.textContent = snoozed
      ? `Alerts snoozed until ${new Date(snoozeUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : '';
    resumeBtn.style.display = snoozed ? '' : 'none';
    snoozeSelect.style.display = snoozed ? 'none' : '';
    snippets = settings.snippets || [];

    const spent = connectsSpentThisMonth(applicationHistory);
    const budget = settings.monthlyConnectsBudget || 0;
    connectsTracker.textContent = budget
      ? `Connects ${spent}/${budget}${spent > budget ? ' over budget' : ''}`
      : `Connects ${spent} this month`;
    connectsTracker.style.color = budget && spent > budget ? 'var(--danger)' : '';

    // Set toggle state
    const isActive = settings.monitoringActive !== false;
    monitoringToggle.checked = isActive;
    updateMonitoringUI(isActive);

    // Last scan status
    if (lastCheckInfo && lastCheckInfo.timestamp) {
      const timeAgo = formatTimeAgo(lastCheckInfo.timestamp);
      lastScanText.textContent = `Scanned ${timeAgo} (${lastCheckInfo.status || 'OK'})`;
    } else {
      lastScanText.textContent = 'Ready to scan';
    }

    renderJobs(jobsToday.filter((j) => isJobUrl(j.url)), settings);
  }

  function updateMonitoringUI(isActive) {
    if (isActive) {
      statusBadge.textContent = 'Active';
      statusBadge.className = 'status-badge active';
      toggleLabelText.textContent = 'Radar Active';
    } else {
      statusBadge.textContent = 'Paused';
      statusBadge.className = 'status-badge';
      toggleLabelText.textContent = 'Monitoring Paused';
    }
  }

  function renderJobs(jobs, settings = {}) {
    jobList.innerHTML = '';
    jobCountBadge.textContent = String(jobs.length);

    if (!jobs || jobs.length === 0) {
      emptyState.style.display = 'flex';
      jobList.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    jobList.style.display = 'flex';

    jobs.forEach((job, idx) => {
      const card = document.createElement('div');
      card.className = `job-card ${job.applied ? 'applied' : ''}`;
      card.dataset.id = job.id;
      if (job.searchColor) card.style.borderLeft = `4px solid ${job.searchColor}`;

      const timeAgo = formatTimeAgo(job.detectedAt);
      const fit = scoreJob(job, settings);
      const cost = fit.connects ?? (settings.connectsPerProposal || 16);
      const buyer = job.clientStats ? classifyBuyer(job.clientStats) : null;

      const tier = fit.score >= 70 ? 'hi' : fit.score >= 45 ? 'mid' : 'lo';
      card.style.setProperty('--i', Math.min(idx, 8));
      card.innerHTML = `
        <div class="job-head">
          <span class="fit fit-${tier}" style="--p:${fit.score}" title="Fit ${fit.score} of 100: ${fit.label}. Skills 40, budget 20, competition 20, recency 20."><b>${fit.score}</b></span>
          <div class="job-head-main">
            <a href="${escapeHtml(job.url)}" target="_blank" class="job-title-link" title="${escapeHtml(job.title)}">${escapeHtml(job.title)}</a>
            <div class="job-sub">
              <span class="job-budget">${escapeHtml(job.budget || 'Competitive')}</span>
              <span class="job-client">${escapeHtml(job.client || 'Client')}</span>
              <span class="job-when">${timeAgo}</span>
            </div>
          </div>
        </div>
        <div class="job-tags">
          <span class="tag">${fit.label}</span>
          ${fit.proposals != null ? `<span class="tag">Up to ${fit.proposals} proposals</span>` : ''}
          ${buyer ? `<span class="tag tag-${buyer.level}" title="${escapeHtml(buyer.detail)}"><i class="dot"></i>${buyer.label}</span>` : ''}
          <span class="tag">${fit.connects == null ? '~' : ''}${cost} Connects</span>
        </div>
        <div class="job-action-row">
          <button class="applied-toggle-btn">${job.applied ? 'Applied' : 'Mark applied'}</button>
          <div class="job-actions-right">
            <button class="block-btn" title="Block this client (matched by spend + rating + country)">Block</button>
            <button class="ai-bid-btn" title="Client risk score and AI proposal prompt">AI bid</button>
            <a href="${escapeHtml(job.url)}" target="_blank" class="apply-btn">Apply</a>
          </div>
        </div>
      `;

      // AI Bid Prompt clicked -> Open Modal with Risk & Prompt
      const aiBidBtn = card.querySelector('.ai-bid-btn');
      if (aiBidBtn) {
        aiBidBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await openAiProposalModal(job);
        });
      }

      card.querySelector('.block-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        await blockClient(job);
      });

      // Apply link clicked -> Record in applicationHistory
      const applyBtn = card.querySelector('.apply-btn');
      applyBtn.addEventListener('click', async () => {
        await logJobAction(job, 'Clicked');
      });

      // Mark as Applied clicked -> Record in applicationHistory + toggle UI
      const appliedBtn = card.querySelector('.applied-toggle-btn');
      appliedBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await toggleJobApplied(job);
      });

      jobList.appendChild(card);
    });
  }

  async function blockClient(job) {
    const fp = clientFingerprint(job);
    if (!fp) {
      alert('Not enough client info on this job to block it reliably (needs a "$ spent" figure).');
      return;
    }
    if (!confirm(`Hide all future jobs from clients matching:\n${fp}\n\nUpwork hides client names, so this match is approximate.`)) return;
    const { settings = {}, jobsToday = [] } = await chrome.storage.local.get(['settings', 'jobsToday']);
    const blockedClients = [...(settings.blockedClients || [])];
    if (!blockedClients.some((b) => b.fp === fp)) blockedClients.push({ fp, label: fp.replace(/\|/g, ' · ') });
    await chrome.storage.local.set({
      settings: { ...settings, blockedClients },
      jobsToday: jobsToday.filter((j) => clientFingerprint(j) !== fp)
    });
  }

  async function toggleJobApplied(targetJob) {
    const { jobsToday = [], applicationHistory = [], settings = {} } = await chrome.storage.local.get(['jobsToday', 'applicationHistory', 'settings']);
    const connects = targetJob.connects ?? scoreJob(targetJob, settings).connects ?? (settings.connectsPerProposal || 16);

    let isNowApplied = false;
    const updatedJobs = jobsToday.map((j) => {
      if (j.id === targetJob.id) {
        isNowApplied = !j.applied;
        return { ...j, applied: isNowApplied };
      }
      return j;
    });

    let updatedHistory = [...applicationHistory];
    const existingIndex = updatedHistory.findIndex((h) => h.id === targetJob.id);

    if (existingIndex >= 0) {
      updatedHistory[existingIndex].action = isNowApplied ? 'Applied' : 'Saved';
      updatedHistory[existingIndex].connects = connects;
      updatedHistory[existingIndex].actionTimestamp = Date.now();
    } else {
      updatedHistory.unshift({
        id: targetJob.id,
        title: targetJob.title,
        url: targetJob.url,
        budget: targetJob.budget,
        client: targetJob.client,
        action: isNowApplied ? 'Applied' : 'Saved',
        connects,
        actionTimestamp: Date.now()
      });
    }

    await chrome.storage.local.set({
      jobsToday: updatedJobs,
      applicationHistory: updatedHistory.slice(0, 500)
    });

    await reloadState();
  }

  async function openAiProposalModal(job) {
    const { settings = {} } = await chrome.storage.local.get('settings');
    const skills = settings.selectedSkills || ['Web Development', 'Python'];

    // 1. Analyze Client Trust
    const trust = typeof analyzeClientTrust === 'function'
      ? analyzeClientTrust(job)
      : { score: 80, verdict: 'SAFE CLIENT', badgeColor: '#15803d', redFlags: [], greenFlags: ['Verified Employer'] };

    modalTrustScore.textContent = `${trust.score}% • ${trust.verdict}`;
    modalTrustScore.style.background = trust.badgeColor;

    // Render red/green flags
    let flagsHtml = '';
    trust.redFlags.forEach((flag) => {
      flagsHtml += `<div class="trust-flag-item red">${escapeHtml(flag)}</div>`;
    });
    trust.greenFlags.forEach((flag) => {
      flagsHtml += `<div class="trust-flag-item green">${escapeHtml(flag)}</div>`;
    });
    modalTrustFlags.innerHTML = flagsHtml;

    // 2. Generate Master AI Prompt tailored to this specific job
    const prompt = typeof generateWinningProposalPrompt === 'function'
      ? generateWinningProposalPrompt(job, settings)
      : `Write an elite proposal for: ${job.title}`;

    modalPromptText.value = prompt;
    currentModalJob = job;
    const { aiConfig } = await chrome.storage.local.get('aiConfig');
    const hasKey = !!(aiConfig && aiConfig.apiKey);
    aiGenBtn.disabled = aiAnalyzeBtn.disabled = !hasKey;
    aiRunHint.textContent = hasKey ? 'Sends this job and your profile to your chosen provider when you click.' : 'Add an API key in Settings > AI Assistant to enable.';
    aiOutput.style.display = aiCopyBtn.style.display = 'none';
    modalCopiedToast.style.display = 'none';
    modalCopiedToast.textContent = '✓ Copied to clipboard! Ready to paste into ChatGPT / Claude.';
    snippetBox.style.display = snippets.length ? '' : 'none';
    snippetSelect.innerHTML = snippets.map((s, i) => `<option value="${i}">${escapeHtml(s.name)}</option>`).join('');
    aiModal.style.display = 'flex';
  }

  async function logJobAction(targetJob, actionName) {
    const { applicationHistory = [] } = await chrome.storage.local.get('applicationHistory');
    const existing = applicationHistory.find((h) => h.id === targetJob.id);

    if (!existing) {
      const updated = [
        {
          id: targetJob.id,
          title: targetJob.title,
          url: targetJob.url,
          budget: targetJob.budget,
          client: targetJob.client,
          action: actionName,
          actionTimestamp: Date.now()
        },
        ...applicationHistory
      ].slice(0, 500);

      await chrome.storage.local.set({ applicationHistory: updated });
    }
  }

  function playChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      [
        { freq: 587.33, start: 0, dur: 0.15 },
        { freq: 880.00, start: 0.12, dur: 0.35 }
      ].forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0.2, now + start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur);
      });
    } catch (e) {}
  }

  function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Recently';
    const elapsedSec = Math.floor((Date.now() - timestamp) / 1000);
    if (elapsedSec < 60) return `${elapsedSec}s ago`;
    const elapsedMin = Math.floor(elapsedSec / 60);
    if (elapsedMin < 60) return `${elapsedMin}m ago`;
    const elapsedHours = Math.floor(elapsedMin / 60);
    if (elapsedHours < 24) return `${elapsedHours}h ago`;
    return '1d+ ago';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});

// Function injected dynamically into active Upwork tab to extract jobs & active filters
function extractJobsAndFiltersFromDOM() {
  const jobs = [];
  const seenIds = new Set();

  // Find all links matching Upwork job postings
  const anchors = Array.from(document.querySelectorAll('a[href*="/jobs/"], a[href*="/details/"]'));

  anchors.forEach((a) => {
    try {
      const href = a.getAttribute('href') || '';
      const idMatch = href.match(/~[a-zA-Z0-9]+/);
      if (!idMatch) return;
      // Only job postings: skip freelancer/agency profile links that also carry ~ids
      if (!/\/(?:jobs\/|nx\/search\/jobs\/details\/|nx\/find-work\/[^?]*\/details\/)/.test(href) ||
          /\/(?:freelancers|ab\/profiles|agencies|fl|o)\//.test(href)) return;

      const id = idMatch[0];
      if (seenIds.has(id)) return;

      const title = a.textContent.trim();
      if (!title || title.length < 5 || /^(apply|view job|proposals|save job)$/i.test(title)) return;

      seenIds.add(id);

      const card = a.closest('section, article, div.up-card-section, [data-test="JobTile"]') || a.parentElement?.parentElement;
      const text = card ? card.textContent : '';

      // Match budget
      let budget = 'Competitive';
      const bMatch = text.match(/Est\.\s*budget:\s*\$[\d,]+(?:\.\d+)?/i) ||
                    text.match(/Hourly:\s*\$[\d,]+(?:\.\d+)?(?:\s*-\s*\$[\d,]+(?:\.\d+)?)?/i) ||
                    text.match(/Fixed[- ]price[^\n\r$]*?\$[\d,]+(?:\.\d+)?/i) ||
                    text.match(/\$[\d,]+(?:\.\d+)?(?:\s*-\s*\$[\d,]+(?:\.\d+)?)?(?:\s*\/\s*hr)?/i);
      if (bMatch) budget = bMatch[0].replace(/\s+/g, ' ').trim();

      // Client info
      const clientParts = [];
      if (/payment verified/i.test(text)) clientParts.push('Verified Payment');
      else if (/payment unverified/i.test(text)) clientParts.push('Unverified');

      const ratingMatch = text.match(/(\d\.\d)★/);
      if (ratingMatch) clientParts.push(`${ratingMatch[1]}★`);

      const spentMatch = text.match(/\$[\d,]+[kKmM]?\s*spent/i);
      if (spentMatch) clientParts.push(spentMatch[0]);

      const countryMatch = text.match(/(United States|United Kingdom|Canada|Australia|India|Pakistan|South Africa|Germany|France|Nigeria|Philippines|Ukraine)/i);
      if (countryMatch) clientParts.push(countryMatch[1]);

      // Extract snippet / description from card
      let description = '';
      const descEl = card.querySelector(
        '[data-test="job-description-text"], [data-test="JobDescription"], .air3-line-clamp, .up-line-clamp-2, [data-test="description"], p.mb-0, p.text-body-sm'
      );
      if (descEl) {
        description = descEl.textContent.trim();
      } else {
        const p = Array.from(card.querySelectorAll('p, span')).find(
          (el) => el.textContent.trim().length > 35 && !el.textContent.includes('$') && !el.textContent.includes('★')
        );
        if (p) description = p.textContent.trim();
      }

      // Extract requested skills on the card
      const reqSkills = [];
      const tokens = card.querySelectorAll('.air3-token, [data-test="token"], [data-test="attr-item"], .skill-pill');
      tokens.forEach((t) => {
        const s = t.textContent.trim();
        if (s && s.length < 35 && !reqSkills.includes(s) && !s.includes('Connect') && !s.includes('Upwork')) {
          reqSkills.push(s);
        }
      });

      jobs.push({
        id,
        title,
        url: href.startsWith('http') ? href : `https://www.upwork.com${href}`,
        budget,
        client: clientParts.join(' • ') || 'Upwork Client',
        description: description || `Scope: ${title}`,
        skillsRequired: reqSkills,
        cardText: text.replace(/\s+/g, ' ').trim().slice(0, 800),
        detectedAt: Date.now(),
        applied: false
      });
    } catch (e) {}
  });

  // Extract active skill filter badges from the page
  const regex = /Skill:\s*([^<]+)/gi;
  const activeSkills = [];
  let match;
  const html = document.body ? document.body.innerHTML : '';
  while ((match = regex.exec(html)) !== null) {
    const sName = match[1].replace(/[\r\n\t✕×]/g, '').trim();
    if (sName && !activeSkills.includes(sName) && sName.length < 35) {
      activeSkills.push(sName);
    }
  }

  return { jobs, activeSkills };
}

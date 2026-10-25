// content.js - Upwork Job Radar In-Session Content Script
// Resiliently extracts jobs from active DOM and in-session API responses

console.log('[Upwork Radar] In-session monitor active on Upwork tab');

// Listen for background service worker or popup requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PERFORM_PAGE_CHECK' || request.type === 'EXTRACT_ACTIVE_TAB_JOBS') {
    handlePageCheck(request.settings)
      .then((jobs) => {
        sendResponse({ jobs, url: window.location.href, title: document.title });
      })
      .catch((err) => {
        console.error('[Upwork Radar] Page check error:', err);
        sendResponse({ jobs: [], error: err.message });
      });
    return true; // Keep async channel open
  }
});

// Master page check handler
async function handlePageCheck(settings) {
  // 1. If currently on any Upwork search or job listing page, scrape live DOM immediately
  const liveJobs = extractJobsFromDocument(document);
  if (liveJobs && liveJobs.length > 0) {
    console.log(`[Upwork Radar] Live DOM extracted ${liveJobs.length} jobs.`);
    return liveJobs;
  }

  // 2. Fallback: Query search URL using active session
  let targetUrl = settings?.searchUrl;
  if (!targetUrl || !targetUrl.includes('upwork.com')) {
    const q = encodeURIComponent(settings?.jobProfile || settings?.searchQuery || 'web development');
    targetUrl = `https://www.upwork.com/nx/search/jobs/?q=${q}&sort=recency`;
  }

  try {
    const res = await fetch(targetUrl, {
      credentials: 'include',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!res.ok) return [];

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return extractJobsFromDocument(doc);
  } catch (e) {
    console.warn('[Upwork Radar] In-session fetch failed:', e);
    return [];
  }
}

// Master DOM Extractor
function extractJobsFromDocument(doc) {
  const jobs = [];
  const seenIds = new Set();

  // Strategy 1: Find all anchors pointing to Upwork job postings
  // Matches: /jobs/Title-Slug_~01... and /nx/search/jobs/details/~01... and /jobs/~01...
  const allJobAnchors = doc.querySelectorAll('a[href*="/jobs/"], a[href*="/jobs/details/"]');

  allJobAnchors.forEach((anchor) => {
    try {
      const href = anchor.getAttribute('href') || '';
      const idMatch = href.match(/~[a-zA-Z0-9]+/);
      if (!idMatch) return;

      const id = idMatch[0];
      if (seenIds.has(id)) return;

      const title = (anchor.textContent || '').trim();
      // Skip empty links or navigation tabs
      if (!title || title.length < 4 || title.toLowerCase() === 'apply' || title.toLowerCase() === 'view job') {
        return;
      }

      seenIds.add(id);

      // Find the card container surrounding this job title
      const cardContainer = anchor.closest(
        'section[data-test="JobTile"], article, div[data-test="JobTile"], [data-ev-label="search_result_impression"], .up-card-section, div.job-tile'
      ) || anchor.parentElement?.parentElement?.parentElement || anchor.parentElement;

      const containerText = cardContainer ? cardContainer.textContent : '';

      // Extract budget
      let budget = 'Competitive';
      const budgetMatch = containerText.match(/Hourly:\s*\$[\d,]+(?:\.\d+)?(?:\s*-\s*\$[\d,]+(?:\.\d+)?)?/i) ||
                          containerText.match(/Fixed[- ]price(?:\s*-\s*Expert)?\s*-\s*Est\.\s*budget:\s*\$[\d,]+/i) ||
                          containerText.match(/\$[\d,]+(?:\.\d+)?(?:\s*-\s*\$[\d,]+(?:\.\d+)?)?(?:\s*\/\s*hr)?/i);
      if (budgetMatch) {
        budget = budgetMatch[0].replace(/\s+/g, ' ').trim();
      }

      // Extract client info (Payment verified, ratings, spent, country)
      const clientParts = [];
      if (/payment verified/i.test(containerText)) {
        clientParts.push('Verified Payment');
      } else if (/payment unverified/i.test(containerText)) {
        clientParts.push('Unverified');
      }

      const ratingMatch = containerText.match(/(\d\.\d)★/);
      if (ratingMatch) clientParts.push(`${ratingMatch[1]}★`);

      const spentMatch = containerText.match(/\$[\d,]+[kKmM]?\s*spent/i);
      if (spentMatch) clientParts.push(spentMatch[0]);

      const clientSummary = clientParts.length > 0 ? clientParts.join(' • ') : 'Client';

      // Extract job description / scope snippet from card
      let description = '';
      const descEl = cardContainer ? cardContainer.querySelector(
        '[data-test="job-description-text"], [data-test="JobDescription"], .air3-line-clamp, .up-line-clamp-2, [data-test="description"], p.mb-0, p.text-body-sm'
      ) : null;
      if (descEl) {
        description = descEl.textContent.trim();
      } else if (cardContainer) {
        const p = Array.from(cardContainer.querySelectorAll('p, span')).find(
          (el) => el.textContent.trim().length > 35 && !el.textContent.includes('$') && !el.textContent.includes('★')
        );
        if (p) description = p.textContent.trim();
      }

      // Extract requested skill tags on this card
      const reqSkills = [];
      if (cardContainer) {
        const tokens = cardContainer.querySelectorAll('.air3-token, [data-test="token"], [data-test="attr-item"], .skill-pill');
        tokens.forEach((t) => {
          const s = t.textContent.trim();
          if (s && s.length < 35 && !reqSkills.includes(s) && !s.includes('Connect') && !s.includes('Upwork')) {
            reqSkills.push(s);
          }
        });
      }

      // Full URL
      const fullUrl = href.startsWith('http') ? href : `https://www.upwork.com${href}`;

      jobs.push({
        id,
        title,
        url: fullUrl,
        budget,
        client: clientSummary,
        description: description || `Scope: ${title}`,
        skillsRequired: reqSkills,
        detectedAt: Date.now(),
        applied: false
      });
    } catch (e) {
      // Ignore individual element error
    }
  });

  // Strategy 2: If anchors were obfuscated, try __NEXT_DATA__
  if (jobs.length === 0) {
    const nextDataScript = doc.getElementById('__NEXT_DATA__');
    if (nextDataScript) {
      try {
        const parsed = JSON.parse(nextDataScript.textContent);
        const jsonJobs = extractJobsFromJson(parsed);
        if (jsonJobs && jsonJobs.length > 0) return jsonJobs;
      } catch (e) {}
    }
  }

  return jobs;
}

function extractJobsFromJson(root) {
  const jobs = [];
  function walk(node) {
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
      walk(node[key]);
    }
  }
  walk(root);
  return jobs;
}

// --- On-Page Job Details & Client Risk Inspector ---

function injectOnPageJobIntelligence() {
  // Check if we are viewing a job details slider or page
  const clientHeading = Array.from(document.querySelectorAll('h2, h3, h4, strong, div')).find((el) =>
    /^About the client/i.test(el.textContent.trim())
  );

  if (!clientHeading) return;

  const sidebarContainer = clientHeading.closest('aside, section, .job-details-sidebar, div.up-card') || clientHeading.parentElement;
  if (!sidebarContainer || document.getElementById('upwork-radar-side-card')) return;

  // Extract current job details from DOM
  const titleEl = document.querySelector('h1, h2.h3, [data-test="job-title"], .job-details-title');
  const title = titleEl ? titleEl.textContent.trim() : document.title.replace('- Upwork', '').trim();

  // Extract full description & deliverables
  let description = '';
  const descSelectors = [
    '[data-test="job-description-text"]',
    '[data-test="Description"]',
    '[data-test="job-description"]',
    '.air3-truncation',
    '.air3-truncation-content',
    'span.break',
    'div[itemprop="description"]',
    '.job-description',
    'section[data-test="JobDetails"] p'
  ];
  for (const sel of descSelectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent.trim().length > 25) {
      description = el.textContent.trim();
      break;
    }
  }

  // Extract skills required by client on this job page
  const skillsRequired = Array.from(
    document.querySelectorAll('.air3-token, [data-test="token"], [data-test="attr-item"], [data-test="skill"], a[href*="ontology_skill_uid"]')
  )
    .map((el) => el.textContent.trim())
    .filter((s) => s && s.length < 35 && !s.includes('Upwork') && !s.includes('Connect') && !s.includes('Apply'));

  // Extract client details text
  const clientText = sidebarContainer.textContent;
  const pageText = document.body ? document.body.textContent : '';

  // Check for suspended client notice (as seen in screenshot)
  const isSuspended = /client is suspended|feature is not available because the client is suspended/i.test(pageText);

  // Extract budget
  let budget = 'Competitive';
  const bMatch = pageText.match(/Est\.\s*budget:\s*\$[\d,]+(?:\.\d+)?/i) ||
                pageText.match(/Hourly:\s*\$[\d,]+(?:\.\d+)?(?:\s*-\s*\$[\d,]+(?:\.\d+)?)?/i) ||
                pageText.match(/\$[\d,]+(?:\.\d+)?(?:\s*-\s*\$[\d,]+(?:\.\d+)?)?(?:\s*\/\s*hr)?/i);
  if (bMatch) budget = bMatch[0].replace(/\s+/g, ' ').trim();

  const jobData = {
    title,
    budget,
    client: `${clientText} ${isSuspended ? 'client is suspended' : ''}`,
    description,
    skillsRequired,
    url: window.location.href
  };

  const trust = typeof analyzeClientTrust === 'function'
    ? analyzeClientTrust(jobData)
    : { score: 75, verdict: 'SAFE CLIENT', badgeColor: '#15803d', redFlags: [], greenFlags: ['Verified Employer'] };

  // Create Intelligence Card
  const card = document.createElement('div');
  card.id = 'upwork-radar-side-card';
  card.style.cssText = `
    background: #ffffff;
    border: 2px solid ${trust.badgeColor};
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #0f172a;
    transition: all 0.2s ease;
  `;

  let flagsHtml = '';
  trust.redFlags.forEach((flag) => {
    flagsHtml += `<div style="background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; font-size:12px; font-weight:600; padding:6px 10px; border-radius:6px; margin-bottom:6px; line-height:1.4;">${flag}</div>`;
  });
  trust.greenFlags.forEach((flag) => {
    flagsHtml += `<div style="background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; font-size:11.5px; padding:4px 8px; border-radius:6px; margin-bottom:4px;">${flag}</div>`;
  });

  card.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
      <span style="font-weight:700; font-size:13.5px; color:#1e293b; display:flex; align-items:center; gap:6px;">
        🧠 Radar Client & AI Score
      </span>
      <span style="background:${trust.badgeColor}; color:white; font-size:11px; font-weight:700; padding:3px 9px; border-radius:12px;">
        ${trust.score}% • ${trust.verdict}
      </span>
    </div>

    ${flagsHtml}

    <button id="injectedCopyAiPromptBtn" style="
      width: 100%;
      margin-top: 10px;
      background: #7c3aed;
      color: white;
      border: none;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);
      transition: background 0.15s ease;
    ">
      📋 Copy AI Winning Proposal Prompt
    </button>

    <div id="injectedCopiedToast" style="
      display: none;
      margin-top: 8px;
      background: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
      font-size: 11.5px;
      font-weight: 600;
      padding: 6px 10px;
      border-radius: 6px;
      text-align: center;
    ">
      ✓ Copied to clipboard! Ready to paste into ChatGPT, Claude or Gemini.
    </div>
  `;

  // Insert above the "About the client" section
  sidebarContainer.parentNode.insertBefore(card, sidebarContainer);

  // Copy prompt button handler
  const copyBtn = card.querySelector('#injectedCopyAiPromptBtn');
  const toast = card.querySelector('#injectedCopiedToast');

  copyBtn.addEventListener('click', async () => {
    try {
      const storage = await chrome.storage.local.get('settings');
      const userSettings = storage?.settings || { selectedSkills: ['Web Development', 'Full Stack Development'] };
      const prompt = typeof generateWinningProposalPrompt === 'function'
        ? generateWinningProposalPrompt(jobData, userSettings)
        : `Write an elite proposal for: ${jobData.title}`;

      await navigator.clipboard.writeText(prompt);
      toast.style.display = 'block';
      copyBtn.textContent = '✓ Prompt Copied!';
      setTimeout(() => {
        toast.style.display = 'none';
        copyBtn.textContent = '📋 Copy AI Winning Proposal Prompt';
      }, 3500);
    } catch (err) {
      console.warn('[Upwork Radar] Clipboard error:', err);
    }
  });
}

// Auto-run passive check and inject on-page intelligence
if (window.location.hostname.includes('upwork.com')) {
  setTimeout(() => {
    const found = extractJobsFromDocument(document);
    if (found.length > 0) {
      chrome.runtime.sendMessage({
        type: 'NEW_JOBS_FROM_CONTENT',
        jobs: found
      }).catch(() => {});
    }
    injectOnPageJobIntelligence();
  }, 1200);

  // Monitor DOM changes for dynamic slider opens
  const observer = new MutationObserver(() => {
    injectOnPageJobIntelligence();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

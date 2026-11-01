// settings.js - Upwork Job Radar Preferences Controller with Searchable Skills Engine

// Curated Database of 160+ High-Demand Upwork Skills across IT & Non-IT categories
const UPWORK_SKILLS_DATABASE = [
  // 1. Web & Full Stack Software Development (IT)
  { name: 'Web Development', category: 'Web & Software' },
  { name: 'Full Stack Development', category: 'Web & Software' },
  { name: 'Frontend Development', category: 'Web & Software' },
  { name: 'Backend Development', category: 'Web & Software' },
  { name: 'Python', category: 'Web & Software' },
  { name: 'JavaScript', category: 'Web & Software' },
  { name: 'TypeScript', category: 'Web & Software' },
  { name: 'React', category: 'Web & Software' },
  { name: 'Next.js', category: 'Web & Software' },
  { name: 'Node.js', category: 'Web & Software' },
  { name: 'PHP', category: 'Web & Software' },
  { name: 'WordPress', category: 'Web & Software' },
  { name: 'Shopify Development', category: 'Web & Software' },
  { name: 'Laravel', category: 'Web & Software' },
  { name: 'Django', category: 'Web & Software' },
  { name: 'FastAPI', category: 'Web & Software' },
  { name: 'Tailwind CSS', category: 'Web & Software' },
  { name: 'Vue.js', category: 'Web & Software' },
  { name: 'Angular', category: 'Web & Software' },
  { name: 'HTML5 & CSS3', category: 'Web & Software' },
  { name: 'GraphQL', category: 'Web & Software' },
  { name: 'PostgreSQL', category: 'Web & Software' },
  { name: 'MySQL', category: 'Web & Software' },
  { name: 'MongoDB', category: 'Web & Software' },
  { name: 'Supabase', category: 'Web & Software' },
  { name: 'Firebase', category: 'Web & Software' },
  { name: 'Web Scraping', category: 'Web & Software' },
  { name: 'Ruby on Rails', category: 'Web & Software' },
  { name: 'ASP.NET Core', category: 'Web & Software' },
  { name: 'API Integration', category: 'Web & Software' },

  // 2. Mobile App Development (IT)
  { name: 'Mobile App Development', category: 'Mobile Apps' },
  { name: 'Flutter', category: 'Mobile Apps' },
  { name: 'React Native', category: 'Mobile Apps' },
  { name: 'iOS App Development', category: 'Mobile Apps' },
  { name: 'Android App Development', category: 'Mobile Apps' },
  { name: 'Swift', category: 'Mobile Apps' },
  { name: 'Kotlin', category: 'Mobile Apps' },
  { name: 'Ionic Framework', category: 'Mobile Apps' },

  // 3. AI, Machine Learning & Automation (IT)
  { name: 'AI & Prompt Engineering', category: 'AI & Data Science' },
  { name: 'OpenAI API & ChatGPT Integration', category: 'AI & Data Science' },
  { name: 'LangChain & LlamaIndex', category: 'AI & Data Science' },
  { name: 'Machine Learning', category: 'AI & Data Science' },
  { name: 'Deep Learning', category: 'AI & Data Science' },
  { name: 'Python Automation', category: 'AI & Data Science' },
  { name: 'Data Scraping', category: 'AI & Data Science' },
  { name: 'Data Analytics & Power BI', category: 'AI & Data Science' },
  { name: 'Tableau', category: 'AI & Data Science' },
  { name: 'Computer Vision', category: 'AI & Data Science' },
  { name: 'Natural Language Processing (NLP)', category: 'AI & Data Science' },
  { name: 'Fine-Tuning LLMs', category: 'AI & Data Science' },

  // 4. Cloud, DevOps & Cybersecurity (IT)
  { name: 'DevOps Engineering', category: 'DevOps & Cloud' },
  { name: 'AWS Cloud Services', category: 'DevOps & Cloud' },
  { name: 'Docker & Kubernetes', category: 'DevOps & Cloud' },
  { name: 'CI/CD Pipelines', category: 'DevOps & Cloud' },
  { name: 'Linux System Administration', category: 'DevOps & Cloud' },
  { name: 'Terraform', category: 'DevOps & Cloud' },
  { name: 'Google Cloud Platform (GCP)', category: 'DevOps & Cloud' },
  { name: 'Microsoft Azure', category: 'DevOps & Cloud' },
  { name: 'Cybersecurity & Ethical Hacking', category: 'DevOps & Cloud' },
  { name: 'Penetration Testing', category: 'DevOps & Cloud' },

  // 5. QA, Software Testing & Game Dev (IT)
  { name: 'QA Software Testing', category: 'QA & Testing' },
  { name: 'QA Automation (Selenium / Cypress)', category: 'QA & Testing' },
  { name: 'Manual QA Testing', category: 'QA & Testing' },
  { name: 'Unity Game Development', category: 'Game Dev & Web3' },
  { name: 'Unreal Engine 5', category: 'Game Dev & Web3' },
  { name: 'Solidity & Smart Contracts', category: 'Game Dev & Web3' },
  { name: 'Blockchain Development', category: 'Game Dev & Web3' },

  // 6. Accounting, Bookkeeping & Finance (Non-IT)
  { name: 'Bookkeeping', category: 'Accounting & Finance' },
  { name: 'QuickBooks Online', category: 'Accounting & Finance' },
  { name: 'Xero Accounting', category: 'Accounting & Finance' },
  { name: 'Financial Modeling', category: 'Accounting & Finance' },
  { name: 'Financial Analysis', category: 'Accounting & Finance' },
  { name: 'Tax Preparation & Returns', category: 'Accounting & Finance' },
  { name: 'Payroll Management', category: 'Accounting & Finance' },
  { name: 'Bank Reconciliation', category: 'Accounting & Finance' },
  { name: 'US GAAP Compliance', category: 'Accounting & Finance' },
  { name: 'Accounts Payable & Receivable', category: 'Accounting & Finance' },
  { name: 'Fractional CFO Services', category: 'Accounting & Finance' },

  // 7. Virtual Assistance & Administration (Non-IT)
  { name: 'Virtual Assistant', category: 'Admin & Support' },
  { name: 'Executive Virtual Assistant', category: 'Admin & Support' },
  { name: 'Data Entry', category: 'Admin & Support' },
  { name: 'Email & Calendar Management', category: 'Admin & Support' },
  { name: 'Customer Service & Support', category: 'Admin & Support' },
  { name: 'Live Chat Support', category: 'Admin & Support' },
  { name: 'Zendesk Support', category: 'Admin & Support' },
  { name: 'Freshdesk Support', category: 'Admin & Support' },
  { name: 'Order Processing & Fulfillment', category: 'Admin & Support' },
  { name: 'Web Research & Data Mining', category: 'Admin & Support' },
  { name: 'Project Management (Asana / Trello)', category: 'Admin & Support' },

  // 8. Sales, Lead Generation & Cold Calling (Non-IT)
  { name: 'B2B Lead Generation', category: 'Sales & Marketing' },
  { name: 'Cold Calling', category: 'Sales & Marketing' },
  { name: 'Appointment Setting', category: 'Sales & Marketing' },
  { name: 'Cold Email Outreach', category: 'Sales & Marketing' },
  { name: 'LinkedIn Lead Generation', category: 'Sales & Marketing' },
  { name: 'HubSpot CRM Management', category: 'Sales & Marketing' },
  { name: 'Salesforce Administration', category: 'Sales & Marketing' },
  { name: 'Telemarketing', category: 'Sales & Marketing' },
  { name: 'Email Marketing (Klaviyo / Mailchimp)', category: 'Sales & Marketing' },
  { name: 'SEO Optimization', category: 'Sales & Marketing' },
  { name: 'Google Ads & PPC Management', category: 'Sales & Marketing' },
  { name: 'Facebook & Meta Ads', category: 'Sales & Marketing' },
  { name: 'Social Media Management', category: 'Sales & Marketing' },

  // 9. Writing, Copywriting & Translation (Non-IT)
  { name: 'Content Writing', category: 'Writing & Translation' },
  { name: 'SEO Blog Post Writing', category: 'Writing & Translation' },
  { name: 'Copywriting (Sales Pages & Ads)', category: 'Writing & Translation' },
  { name: 'Technical Writing', category: 'Writing & Translation' },
  { name: 'Ghostwriting (eBooks & Articles)', category: 'Writing & Translation' },
  { name: 'Academic Research & Writing', category: 'Writing & Translation' },
  { name: 'Grant Writing', category: 'Writing & Translation' },
  { name: 'Proofreading & Editing', category: 'Writing & Translation' },
  { name: 'English to Spanish Translation', category: 'Writing & Translation' },
  { name: 'English to French Translation', category: 'Writing & Translation' },
  { name: 'English to German Translation', category: 'Writing & Translation' },
  { name: 'English to Arabic Translation', category: 'Writing & Translation' },
  { name: 'Medical Transcription', category: 'Writing & Translation' },

  // 10. Video Editing, Motion & Audio (Non-IT/Creative)
  { name: 'Video Editing', category: 'Video & Audio' },
  { name: 'YouTube Video Editor', category: 'Video & Audio' },
  { name: 'TikTok, Reels & Shorts Editing', category: 'Video & Audio' },
  { name: 'Premiere Pro', category: 'Video & Audio' },
  { name: 'DaVinci Resolve', category: 'Video & Audio' },
  { name: 'CapCut Video Editor', category: 'Video & Audio' },
  { name: 'Podcast Audio Editing & Mixing', category: 'Video & Audio' },
  { name: 'Voiceover & Voice Acting', category: 'Video & Audio' },
  { name: 'Sound Design & Audio Mastering', category: 'Video & Audio' },

  // 10.5 Animation & Motion Graphics (High-Demand Creative)
  { name: '2D Animation', category: 'Animation & Motion' },
  { name: '3D Animation', category: 'Animation & Motion' },
  { name: 'Motion Graphics', category: 'Animation & Motion' },
  { name: 'Adobe After Effects', category: 'Animation & Motion' },
  { name: 'Character Animation', category: 'Animation & Motion' },
  { name: '3D Blender Animation', category: 'Animation & Motion' },
  { name: 'Whiteboard Animation', category: 'Animation & Motion' },
  { name: 'Explainer Video Animation', category: 'Animation & Motion' },
  { name: 'Cinema 4D', category: 'Animation & Motion' },
  { name: 'Maya 3D Animation', category: 'Animation & Motion' },
  { name: 'Logo Animation', category: 'Animation & Motion' },
  { name: 'Stop Motion Animation', category: 'Animation & Motion' },
  { name: 'Rigging (2D & 3D)', category: 'Animation & Motion' },
  { name: 'Kinetic Typography & Text Animation', category: 'Animation & Motion' },
  { name: 'Visual Effects (VFX)', category: 'Animation & Motion' },
  { name: 'Lottie & Web Animation', category: 'Animation & Motion' },
  { name: 'Anime & Character Illustration', category: 'Animation & Motion' },
  { name: 'Game Animation (Unity / Unreal)', category: 'Animation & Motion' },

  // 11. Design, UI/UX & Architecture (Non-IT/Creative)
  { name: 'UI/UX Design', category: 'Design & Creative' },
  { name: 'Figma Design', category: 'Design & Creative' },
  { name: 'Graphic Design', category: 'Design & Creative' },
  { name: 'Web Design', category: 'Design & Creative' },
  { name: 'Logo Design & Brand Identity', category: 'Design & Creative' },
  { name: 'Adobe Photoshop', category: 'Design & Creative' },
  { name: 'Adobe Illustrator', category: 'Design & Creative' },
  { name: 'Canva Designer', category: 'Design & Creative' },
  { name: 'Packaging & Label Design', category: 'Design & Creative' },
  { name: 'AutoCAD Drafting', category: 'Design & Creative' },
  { name: 'Revit & BIM Modeling', category: 'Design & Creative' },
  { name: 'Architectural Rendering', category: 'Design & Creative' },
  { name: 'Interior Design', category: 'Design & Creative' },
  { name: '3D Modeling & Blender', category: 'Design & Creative' },

  // 12. E-Commerce Operations & Amazon Management (Non-IT)
  { name: 'Amazon FBA Management', category: 'E-Commerce' },
  { name: 'Amazon PPC Advertising', category: 'E-Commerce' },
  { name: 'Shopify Store Management', category: 'E-Commerce' },
  { name: 'Dropshipping (AliExpress / CJ)', category: 'E-Commerce' },
  { name: 'Product Research & Sourcing', category: 'E-Commerce' },
  { name: 'eBay Store Management', category: 'E-Commerce' },
  { name: 'Walmart Marketplace Operations', category: 'E-Commerce' },
  { name: 'Etsy Shop Management', category: 'E-Commerce' },
  { name: 'E-Commerce Product Listing', category: 'E-Commerce' },

  // 13. HR, Recruiting & Legal (Non-IT)
  { name: 'Talent Acquisition & Recruiting', category: 'HR & Legal' },
  { name: 'Technical Recruiting', category: 'HR & Legal' },
  { name: 'Resume & CV Writing', category: 'HR & Legal' },
  { name: 'LinkedIn Profile Optimization', category: 'HR & Legal' },
  { name: 'Contract Drafting & Review', category: 'HR & Legal' },
  { name: 'Legal Research & Paralegal', category: 'HR & Legal' },
  { name: 'Trademark & Patent Filing', category: 'HR & Legal' }
];

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('settingsForm');
  const saveBtnTop = document.getElementById('saveBtnTop');
  const saveBanner = document.getElementById('saveBanner');

  const selectedTagsWrapper = document.getElementById('selectedTagsWrapper');
  const skillsSearchInput = document.getElementById('skillsSearchInput');
  const skillsDropdown = document.getElementById('skillsDropdown');
  const presetChipsContainer = document.getElementById('presetChipsContainer');

  const searchUrlInput = document.getElementById('searchUrl');
  const intervalMinutesSelect = document.getElementById('intervalMinutes');
  const $ = (id) => document.getElementById(id);
  const extraSearchesEl = $('extraSearches');

  const freelancerHeadlineInput = document.getElementById('freelancerHeadline');
  const freelancerYearsExpInput = document.getElementById('freelancerYearsExp');
  const freelancerKeyStrengthInput = document.getElementById('freelancerKeyStrength');

  const desktopNotificationsCheckbox = document.getElementById('desktopNotifications');
  const soundEnabledCheckbox = document.getElementById('soundEnabled');
  const testDesktopNotifBtn = document.getElementById('testDesktopNotifBtn');
  const testNotifFeedback = document.getElementById('testNotifFeedback');

  const pauseOnIdleCheckbox = document.getElementById('pauseOnIdle');
  const jitterEnabledCheckbox = document.getElementById('jitterEnabled');

  const DEFAULT_SKILLS = ['Full Stack Development', 'React', 'Node.js', 'Python', 'Web Development'];
  const DEFAULT_SEARCH_URL = 'https://www.upwork.com/nx/search/jobs/?q=full%20stack%20react%20python&sort=recency';
  const DEFAULT_HEADLINE = 'Senior Full Stack Engineer (Python, React & Web Architecture)';
  const DEFAULT_EXP = '5+ years';
  const DEFAULT_STRENGTH = 'Fast turnaround, clean architecture & proactive communication';

  // Load existing configuration
  let { settings = {} } = await chrome.storage.local.get('settings');

  // Automatic migration: if stored settings still hold the legacy single 'Python Developer' default, upgrade to full profile
  const isLegacyPython =
    (!settings.selectedSkills || settings.selectedSkills.length === 0 || (settings.selectedSkills.length === 1 && (settings.selectedSkills[0] === 'Python Developer' || settings.selectedSkills[0] === 'Python'))) &&
    (!settings.jobProfile || settings.jobProfile === 'Python Developer' || settings.jobProfile === 'Python');

  if (isLegacyPython) {
    settings = {
      ...settings,
      selectedSkills: [...DEFAULT_SKILLS],
      jobProfile: DEFAULT_SKILLS.join(', '),
      searchQuery: 'full stack react python node web development',
      searchUrl: (!settings.searchUrl || settings.searchUrl.includes('python%20developer') || settings.searchUrl === 'https://www.upwork.com/nx/search/jobs/?q=python%20developer&sort=recency')
        ? DEFAULT_SEARCH_URL
        : settings.searchUrl,
      freelancerHeadline: settings.freelancerHeadline || DEFAULT_HEADLINE,
      freelancerYearsExp: settings.freelancerYearsExp || DEFAULT_EXP,
      freelancerKeyStrength: settings.freelancerKeyStrength || DEFAULT_STRENGTH
    };
    await chrome.storage.local.set({ settings });
  }

  // Initialize selected skills list
  let selectedSkills = [];
  if (Array.isArray(settings.selectedSkills) && settings.selectedSkills.length > 0) {
    selectedSkills = [...settings.selectedSkills];
  } else if (settings.jobProfile && !settings.jobProfile.includes('chrome://')) {
    selectedSkills = settings.jobProfile.split(',').map((s) => s.trim()).filter(Boolean);
  } else {
    selectedSkills = [...DEFAULT_SKILLS];
  }

  // Initial render of skills
  renderSelectedTags();
  updatePresetChipsState();

  searchUrlInput.value = settings.searchUrl || DEFAULT_SEARCH_URL;
  intervalMinutesSelect.value = String(settings.intervalMinutes ?? 3);
  $('minHourly').value = settings.minHourly ?? settings.minBudget ?? '';
  $('minFixed').value = settings.minFixed || '';
  $('excludeKeywords').value = settings.excludeKeywords || '';
  $('excludeCountries').value = settings.excludeCountries || '';
  $('quietHoursEnabled').checked = !!settings.quietHoursEnabled;
  $('quietStart').value = settings.quietStart || '22:00';
  $('quietEnd').value = settings.quietEnd || '07:00';
  $('dailyAlertCap').value = settings.dailyAlertCap || '';
  $('minFitScore').value = settings.minFitScore || '';
  $('connectsPerProposal').value = settings.connectsPerProposal ?? 16;
  $('monthlyConnectsBudget').value = settings.monthlyConnectsBudget || '';

  // --- AI (bring your own key) ---
  const { aiConfig = {} } = await chrome.storage.local.get('aiConfig');
  $('aiProvider').value = aiConfig.provider || 'openai';
  $('aiApiKey').value = aiConfig.apiKey || '';
  $('aiModel').value = aiConfig.model || '';
  $('aiBaseUrl').value = aiConfig.baseUrl || '';
  syncAiPlaceholders();
  $('aiProvider').addEventListener('change', syncAiPlaceholders);

  function syncAiPlaceholders() {
    const d = AI_DEFAULTS[$('aiProvider').value];
    $('aiModel').placeholder = d.model || 'e.g. llama3';
    $('aiBaseUrl').placeholder = d.baseUrl || 'e.g. https://openrouter.ai/api/v1';
  }

  function readAiForm() {
    return {
      provider: $('aiProvider').value,
      apiKey: $('aiApiKey').value.trim(),
      model: $('aiModel').value.trim(),
      baseUrl: $('aiBaseUrl').value.trim()
    };
  }

  // Ask Chrome for access to just the provider's origin (must run from a click)
  async function ensureAiPermission(cfg) {
    try {
      const origin = new URL(cfg.baseUrl || AI_DEFAULTS[cfg.provider].baseUrl).origin + '/*';
      return (await chrome.permissions.contains({ origins: [origin] })) ||
        (await chrome.permissions.request({ origins: [origin] }));
    } catch (e) {
      return false;
    }
  }

  $('testAiBtn').addEventListener('click', async () => {
    const fb = $('testAiFeedback');
    const cfg = readAiForm();
    fb.className = 'status-msg';
    if (!cfg.apiKey) { fb.textContent = 'Enter an API key first.'; return; }
    fb.textContent = 'Testing...';
    if (!(await ensureAiPermission(cfg))) {
      fb.className = 'status-msg error';
      fb.textContent = 'Permission to reach the provider was not granted (check the base URL).';
      return;
    }
    const res = await chrome.runtime.sendMessage({ type: 'AI_RUN', mode: 'ping', config: cfg }).catch((e) => ({ ok: false, error: e.message }));
    fb.className = `status-msg ${res && res.ok ? 'success' : 'error'}`;
    fb.textContent = res && res.ok ? '✓ Connected' : `Failed: ${res && res.error}`;
  });

  // --- Webhook, colour, snippets, blocked clients, backup ---
  $('webhookUrl').value = settings.webhookUrl || '';
  $('primaryColor').value = settings.primaryColor || '#14a800';

  $('testWebhookBtn').addEventListener('click', async () => {
    const fb = $('testWebhookFeedback');
    fb.className = 'status-msg';
    fb.textContent = 'Sending...';
    const res = await chrome.runtime.sendMessage({ type: 'TEST_WEBHOOK', url: $('webhookUrl').value.trim() }).catch(() => null);
    fb.className = `status-msg ${res && res.success ? 'success' : 'error'}`;
    fb.textContent = res && res.success ? '✓ Sent' : 'Failed - check the URL (Discord or Slack webhook only)';
  });

  const snippetRows = $('snippetRows');
  (settings.snippets || []).forEach(addSnippetRow);
  $('addSnippetBtn').addEventListener('click', () => addSnippetRow({}));

  function addSnippetRow(sn) {
    const row = document.createElement('div');
    row.className = 'snippet-row';
    row.innerHTML = `
      <input class="input-control sn-name" placeholder="Name (e.g. Intro)" value="${escapeHtml(sn.name || '')}">
      <textarea class="input-control sn-text" rows="3" placeholder="Snippet text">${escapeHtml(sn.text || '')}</textarea>
      <button type="button" class="btn btn-secondary sn-del">Remove</button>`;
    row.querySelector('.sn-del').addEventListener('click', () => row.remove());
    snippetRows.appendChild(row);
  }

  function collectSnippets() {
    return [...snippetRows.querySelectorAll('.snippet-row')]
      .map((r) => ({ name: r.querySelector('.sn-name').value.trim(), text: r.querySelector('.sn-text').value }))
      .filter((s) => s.text.trim())
      .map((s, i) => ({ ...s, name: s.name || `Snippet ${i + 1}` }));
  }

  let blocked = [...(settings.blockedClients || [])];
  renderBlocked();
  function renderBlocked() {
    const el = $('blockedList');
    el.innerHTML = blocked.length ? '' : '<small class="hint">No blocked clients.</small>';
    blocked.forEach((b, i) => {
      const row = document.createElement('div');
      row.className = 'setting-toggle-row';
      row.innerHTML = `<div class="setting-title">${escapeHtml(b.label || b.fp)}</div>
        <button type="button" class="btn btn-secondary">Unblock</button>`;
      row.querySelector('button').addEventListener('click', () => { blocked.splice(i, 1); renderBlocked(); });
      el.appendChild(row);
    });
  }

  $('exportBtn').addEventListener('click', async () => {
    const { settings: cur = {} } = await chrome.storage.local.get('settings');
    const { webhookUrl, ...safe } = cur; // webhook URL is a secret
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(safe, null, 2)], { type: 'application/json' }));
    a.download = 'job-radar-settings.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', async (e) => {
    const fb = $('backupFeedback');
    try {
      const imported = JSON.parse(await e.target.files[0].text());
      if (!imported || typeof imported !== 'object' || Array.isArray(imported)) throw new Error('not a settings object');
      delete imported.webhookUrl;
      const { settings: cur = {} } = await chrome.storage.local.get('settings');
      await chrome.storage.local.set({ settings: { ...cur, ...imported } });
      await chrome.runtime.sendMessage({ type: 'UPDATE_ALARM_INTERVAL', intervalMinutes: imported.intervalMinutes || cur.intervalMinutes || 3 }).catch(() => {});
      location.reload();
    } catch (err) {
      fb.className = 'status-msg error';
      fb.textContent = `Import failed: ${err.message}`;
    }
  });

  // --- Extra saved searches ---
  (settings.searches || []).forEach(addSearchRow);
  $('addSearchBtn').addEventListener('click', () => addSearchRow({}));

  function addSearchRow(s) {
    const row = document.createElement('div');
    row.className = 'form-row search-row';
    row.innerHTML = `
      <input class="input-control s-name" placeholder="Name" value="${escapeHtml(s.name || '')}" style="flex:1">
      <input class="input-control s-url" placeholder="Upwork search URL" value="${escapeHtml(s.url || '')}" style="flex:3">
      <input class="input-control s-hr" type="number" min="0" placeholder="$/hr min" value="${s.minHourly || ''}" style="flex:1">
      <input class="input-control s-fx" type="number" min="0" placeholder="Fixed min" value="${s.minFixed || ''}" style="flex:1">
      <input class="s-color" type="color" value="${s.color || '#2563eb'}" title="Search colour">
      <label><input type="checkbox" class="s-notify" ${s.notify === false ? '' : 'checked'}> Alert</label>
      <button type="button" class="btn btn-secondary s-del">&times;</button>`;
    row.querySelector('.s-del').addEventListener('click', () => row.remove());
    extraSearchesEl.appendChild(row);
  }

  function collectSearches() {
    return [...extraSearchesEl.querySelectorAll('.search-row')]
      .map((r, i) => ({
        name: r.querySelector('.s-name').value.trim() || `Search ${i + 2}`,
        url: r.querySelector('.s-url').value.trim(),
        minHourly: parseFloat(r.querySelector('.s-hr').value) || 0,
        minFixed: parseFloat(r.querySelector('.s-fx').value) || 0,
        color: r.querySelector('.s-color').value,
        notify: r.querySelector('.s-notify').checked,
        enabled: true
      }))
      .filter((s) => s.url);
  }

  if (freelancerHeadlineInput) freelancerHeadlineInput.value = settings.freelancerHeadline || DEFAULT_HEADLINE;
  if (freelancerYearsExpInput) freelancerYearsExpInput.value = settings.freelancerYearsExp || DEFAULT_EXP;
  if (freelancerKeyStrengthInput) freelancerKeyStrengthInput.value = settings.freelancerKeyStrength || DEFAULT_STRENGTH;

  desktopNotificationsCheckbox.checked = settings.desktopNotifications !== false;
  soundEnabledCheckbox.checked = settings.soundEnabled !== false;

  const soundChoiceSelect = document.getElementById('soundChoice');
  const soundVolumeInput = document.getElementById('soundVolume');
  soundChoiceSelect.innerHTML = Object.entries(ALERT_SOUNDS)
    .map(([key, s]) => `<option value="${key}">${s.label}</option>`).join('') +
    '<option value="system">System default (OS notification sound)</option>';
  soundChoiceSelect.value = settings.soundChoice || 'chime';
  soundVolumeInput.value = settings.soundVolume ?? 70;
  document.getElementById('soundVolumeLabel').textContent = soundVolumeInput.value;
  soundVolumeInput.addEventListener('input', () => {
    document.getElementById('soundVolumeLabel').textContent = soundVolumeInput.value;
  });
  document.getElementById('previewSoundBtn').addEventListener('click', playAudioChime);

  pauseOnIdleCheckbox.checked = settings.pauseOnIdle !== false;
  jitterEnabledCheckbox.checked = settings.jitterEnabled !== false;

  // --- Searchable Skills & Autocomplete Engine ---

  skillsSearchInput.addEventListener('input', () => {
    const query = skillsSearchInput.value.trim().toLowerCase();
    if (!query) {
      skillsDropdown.style.display = 'none';
      return;
    }

    const matches = UPWORK_SKILLS_DATABASE.filter(
      (item) => item.name.toLowerCase().includes(query) && !selectedSkills.includes(item.name)
    );

    renderDropdownSuggestions(matches, query);
  });

  skillsSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = skillsSearchInput.value.trim();
      if (val) {
        addSkillTag(val);
        skillsSearchInput.value = '';
        skillsDropdown.style.display = 'none';
      }
    } else if (e.key === 'Backspace' && skillsSearchInput.value === '' && selectedSkills.length > 0) {
      // Remove last tag on backspace
      removeSkillTag(selectedSkills[selectedSkills.length - 1]);
    }
  });

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#skillsTagContainer') && !e.target.closest('#skillsDropdown')) {
      skillsDropdown.style.display = 'none';
    }
  });

  // Render Dropdown suggestions
  function renderDropdownSuggestions(matches, query) {
    if (matches.length === 0) {
      skillsDropdown.innerHTML = `
        <div class="dropdown-item" id="addCustomSkillItem">
          <span>+ Add custom skill "<strong>${escapeHtml(query)}</strong>"</span>
        </div>
      `;
      skillsDropdown.style.display = 'block';

      const customItem = document.getElementById('addCustomSkillItem');
      customItem.addEventListener('click', () => {
        addSkillTag(skillsSearchInput.value.trim());
        skillsSearchInput.value = '';
        skillsDropdown.style.display = 'none';
      });
      return;
    }

    // Group matches by category
    const grouped = {};
    matches.forEach((item) => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item.name);
    });

    let html = '';
    for (const [category, skills] of Object.entries(grouped)) {
      html += `<div class="dropdown-category">${escapeHtml(category)}</div>`;
      skills.forEach((skill) => {
        html += `
          <div class="dropdown-item" data-skill="${escapeHtml(skill)}">
            <span>${escapeHtml(skill)}</span>
            <span class="item-cat">${escapeHtml(category)}</span>
          </div>
        `;
      });
    }

    skillsDropdown.innerHTML = html;
    skillsDropdown.style.display = 'block';

    skillsDropdown.querySelectorAll('.dropdown-item').forEach((item) => {
      item.addEventListener('click', () => {
        const skillName = item.dataset.skill;
        if (skillName) {
          addSkillTag(skillName);
          skillsSearchInput.value = '';
          skillsDropdown.style.display = 'none';
        }
      });
    });
  }

  // Quick Preset Chips Click Listener
  if (presetChipsContainer) {
    presetChipsContainer.querySelectorAll('.preset-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const skill = chip.dataset.skill;
        if (selectedSkills.includes(skill)) {
          removeSkillTag(skill);
        } else {
          addSkillTag(skill);
        }
      });
    });
  }

  // Add a skill tag
  function addSkillTag(skill) {
    if (!skill || selectedSkills.includes(skill)) return;
    selectedSkills.push(skill);
    renderSelectedTags();
    updatePresetChipsState();
    updateSearchUrlFromCurrentSkills();
  }

  // Remove a skill tag
  function removeSkillTag(skill) {
    selectedSkills = selectedSkills.filter((s) => s !== skill);
    renderSelectedTags();
    updatePresetChipsState();
    updateSearchUrlFromCurrentSkills();
  }

  // Render pills in container
  function renderSelectedTags() {
    selectedTagsWrapper.innerHTML = selectedSkills
      .map(
        (skill) => `
        <span class="skill-tag" data-skill="${escapeHtml(skill)}">
          ${escapeHtml(skill)}
          <span class="tag-remove" title="Remove">&times;</span>
        </span>
      `
      )
      .join('');

    selectedTagsWrapper.querySelectorAll('.tag-remove').forEach((removeBtn) => {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const skill = removeBtn.parentElement.dataset.skill;
        removeSkillTag(skill);
      });
    });
  }

  // Update active state of preset chips
  function updatePresetChipsState() {
    if (!presetChipsContainer) return;
    presetChipsContainer.querySelectorAll('.preset-chip').forEach((chip) => {
      const skill = chip.dataset.skill;
      if (!chip.dataset.label) {
        chip.dataset.label = chip.textContent.replace(/^[+✓]\s*/, '').trim();
      }
      const label = chip.dataset.label;
      if (selectedSkills.includes(skill)) {
        chip.classList.add('active');
        chip.textContent = `✓ ${label}`;
      } else {
        chip.classList.remove('active');
        chip.textContent = `+ ${label}`;
      }
    });
  }

  function updateSearchUrlFromCurrentSkills() {
    searchUrlInput.value = generateSearchUrlFromSkills(selectedSkills);
  }

  function generateSearchUrlFromSkills(skills) {
    if (!skills || skills.length === 0) {
      return DEFAULT_SEARCH_URL;
    }
    const cleanTerms = skills.map((s) => s.toLowerCase().replace(/\bdevelopment\b/g, '').trim()).filter(Boolean);
    const query = cleanTerms.join(' ').replace(/\s+/g, ' ');
    return `https://www.upwork.com/nx/search/jobs/?q=${encodeURIComponent(query)}&sort=recency`;
  }

  // Top Save button triggers form submit
  saveBtnTop.addEventListener('click', (e) => {
    e.preventDefault();
    form.requestSubmit();
  });

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Permission prompt must happen right after the click, before other awaits
    const aiCfg = readAiForm();
    if (aiCfg.apiKey) {
      await ensureAiPermission(aiCfg);
      await chrome.storage.local.set({ aiConfig: aiCfg });
    } else {
      await chrome.storage.local.remove('aiConfig');
    }

    const newInterval = parseFloat(intervalMinutesSelect.value) || 3;
    const combinedProfile = selectedSkills.join(', ') || 'Web Development';

    const { settings: latest = settings } = await chrome.storage.local.get('settings');
    const updatedSettings = {
      ...latest,
      webhookUrl: $('webhookUrl').value.trim(),
      primaryColor: $('primaryColor').value,
      snippets: collectSnippets(),
      blockedClients: blocked,
      selectedSkills: selectedSkills,
      jobProfile: combinedProfile,
      freelancerHeadline: freelancerHeadlineInput ? freelancerHeadlineInput.value.trim() : '',
      freelancerYearsExp: freelancerYearsExpInput ? freelancerYearsExpInput.value.trim() : '',
      freelancerKeyStrength: freelancerKeyStrengthInput ? freelancerKeyStrengthInput.value.trim() : '',
      searchQuery: selectedSkills.join(' '),
      searchUrl: searchUrlInput.value.trim() || generateSearchUrlFromSkills(selectedSkills),
      intervalMinutes: newInterval,
      minBudget: 0,
      minHourly: parseFloat($('minHourly').value) || 0,
      minFixed: parseFloat($('minFixed').value) || 0,
      searches: collectSearches(),
      excludeKeywords: $('excludeKeywords').value.trim(),
      excludeCountries: $('excludeCountries').value.trim(),
      quietHoursEnabled: $('quietHoursEnabled').checked,
      quietStart: $('quietStart').value || '22:00',
      quietEnd: $('quietEnd').value || '07:00',
      dailyAlertCap: parseInt($('dailyAlertCap').value, 10) || 0,
      minFitScore: parseInt($('minFitScore').value, 10) || 0,
      connectsPerProposal: parseInt($('connectsPerProposal').value, 10) || 16,
      monthlyConnectsBudget: parseInt($('monthlyConnectsBudget').value, 10) || 0,
      desktopNotifications: desktopNotificationsCheckbox.checked,
      soundEnabled: soundEnabledCheckbox.checked,
      soundChoice: soundChoiceSelect.value,
      soundVolume: parseInt(soundVolumeInput.value, 10),
      telegramEnabled: false,
      pauseOnIdle: pauseOnIdleCheckbox.checked,
      jitterEnabled: jitterEnabledCheckbox.checked,
      monitoringActive: latest.monitoringActive !== false
    };

    await chrome.storage.local.set({ settings: updatedSettings });

    // Inform background worker to update timers
    await chrome.runtime.sendMessage({
      type: 'UPDATE_ALARM_INTERVAL',
      intervalMinutes: newInterval
    }).catch(() => {});

    showSaveSuccess();
  });

  function showSaveSuccess() {
    saveBanner.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      saveBanner.style.display = 'none';
    }, 3500);
  }

  // Test Desktop Notification with sound and Mac verification
  testDesktopNotifBtn.addEventListener('click', async () => {
    testDesktopNotifBtn.disabled = true;
    testNotifFeedback.className = 'status-msg';
    testNotifFeedback.textContent = 'Triggering notification...';

    if (soundEnabledCheckbox.checked) {
      playAudioChime();
    }

    try {
      await chrome.runtime.sendMessage({ type: 'TEST_NOTIFICATION' });
      testNotifFeedback.className = 'status-msg success';
      testNotifFeedback.textContent = '✓ Notification dispatched! Check your screen/Notification Center.';
    } catch (err) {
      testNotifFeedback.className = 'status-msg error';
      testNotifFeedback.textContent = `Error: ${err.message}`;
    } finally {
      setTimeout(() => {
        testDesktopNotifBtn.disabled = false;
      }, 1500);
    }
  });

  function playAudioChime() {
    if (soundChoiceSelect.value !== 'system') playAlertSound(soundChoiceSelect.value, soundVolumeInput.value);
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

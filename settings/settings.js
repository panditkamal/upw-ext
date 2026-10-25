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
  { name: 'After Effects & Motion Graphics', category: 'Video & Audio' },
  { name: 'Podcast Audio Editing & Mixing', category: 'Video & Audio' },
  { name: 'Voiceover & Voice Acting', category: 'Video & Audio' },
  { name: '2D Animation & Explainer Videos', category: 'Video & Audio' },
  { name: 'Sound Design & Audio Mastering', category: 'Video & Audio' },

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
  const minBudgetInput = document.getElementById('minBudget');

  const freelancerHeadlineInput = document.getElementById('freelancerHeadline');
  const freelancerYearsExpInput = document.getElementById('freelancerYearsExp');
  const freelancerKeyStrengthInput = document.getElementById('freelancerKeyStrength');

  const desktopNotificationsCheckbox = document.getElementById('desktopNotifications');
  const soundEnabledCheckbox = document.getElementById('soundEnabled');
  const testDesktopNotifBtn = document.getElementById('testDesktopNotifBtn');
  const testNotifFeedback = document.getElementById('testNotifFeedback');

  const pauseOnIdleCheckbox = document.getElementById('pauseOnIdle');
  const jitterEnabledCheckbox = document.getElementById('jitterEnabled');

  // Load existing configuration
  const { settings = {} } = await chrome.storage.local.get('settings');

  // Initialize selected skills list
  let selectedSkills = [];
  if (Array.isArray(settings.selectedSkills) && settings.selectedSkills.length > 0) {
    selectedSkills = [...settings.selectedSkills];
  } else if (settings.jobProfile && !settings.jobProfile.includes('chrome://')) {
    selectedSkills = settings.jobProfile.split(',').map((s) => s.trim()).filter(Boolean);
  } else {
    selectedSkills = ['Web Development', 'Python'];
  }

  // Initial render of skills
  renderSelectedTags();
  updatePresetChipsState();

  searchUrlInput.value = settings.searchUrl || generateSearchUrlFromSkills(selectedSkills);
  intervalMinutesSelect.value = String(settings.intervalMinutes ?? 3);
  minBudgetInput.value = settings.minBudget || '';

  if (freelancerHeadlineInput) freelancerHeadlineInput.value = settings.freelancerHeadline || '';
  if (freelancerYearsExpInput) freelancerYearsExpInput.value = settings.freelancerYearsExp || '';
  if (freelancerKeyStrengthInput) freelancerKeyStrengthInput.value = settings.freelancerKeyStrength || '';

  desktopNotificationsCheckbox.checked = settings.desktopNotifications !== false;
  soundEnabledCheckbox.checked = settings.soundEnabled !== false;

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
      if (selectedSkills.includes(skill)) {
        chip.classList.add('active');
        chip.textContent = `✓ ${skill}`;
      } else {
        chip.classList.remove('active');
        chip.textContent = `+ ${skill}`;
      }
    });
  }

  function updateSearchUrlFromCurrentSkills() {
    searchUrlInput.value = generateSearchUrlFromSkills(selectedSkills);
  }

  function generateSearchUrlFromSkills(skills) {
    const query = skills.length > 0 ? skills.join(' ') : 'web development';
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

    const newInterval = parseFloat(intervalMinutesSelect.value) || 3;
    const combinedProfile = selectedSkills.join(', ') || 'Web Development';

    const updatedSettings = {
      ...settings,
      selectedSkills: selectedSkills,
      jobProfile: combinedProfile,
      freelancerHeadline: freelancerHeadlineInput ? freelancerHeadlineInput.value.trim() : '',
      freelancerYearsExp: freelancerYearsExpInput ? freelancerYearsExpInput.value.trim() : '',
      freelancerKeyStrength: freelancerKeyStrengthInput ? freelancerKeyStrengthInput.value.trim() : '',
      searchQuery: selectedSkills.join(' '),
      searchUrl: searchUrlInput.value.trim() || generateSearchUrlFromSkills(selectedSkills),
      intervalMinutes: newInterval,
      minBudget: parseFloat(minBudgetInput.value) || 0,
      desktopNotifications: desktopNotificationsCheckbox.checked,
      soundEnabled: soundEnabledCheckbox.checked,
      telegramEnabled: false,
      pauseOnIdle: pauseOnIdleCheckbox.checked,
      jitterEnabled: jitterEnabledCheckbox.checked,
      monitoringActive: settings.monitoringActive !== false
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

// dashboard.js - Upwork Job Radar Analytics & Action History Controller

document.addEventListener('DOMContentLoaded', async () => {
  const exportPdfBtn = document.getElementById('exportPdfBtn');
  const filterStatusSelect = document.getElementById('filterStatus');
  const clearAllHistoryBtn = document.getElementById('clearAllHistoryBtn');
  const reportPrintDate = document.getElementById('reportPrintDate');
  const noDataBanner = document.getElementById('noDataBanner');
  const loadDemoDataBtn = document.getElementById('loadDemoDataBtn');

  const statTotalScanned = document.getElementById('statTotalScanned');
  const statAppliedCount = document.getElementById('statAppliedCount');
  const statApplyRate = document.getElementById('statApplyRate');
  const statAvgHourly = document.getElementById('statAvgHourly');
  const statVerifiedPercent = document.getElementById('statVerifiedPercent');

  const labelHourlyPct = document.getElementById('labelHourlyPct');
  const barHourly = document.getElementById('barHourly');
  const labelFixedPct = document.getElementById('labelFixedPct');
  const barFixed = document.getElementById('barFixed');
  const labelHighValuePct = document.getElementById('labelHighValuePct');
  const barHighValue = document.getElementById('barHighValue');

  const historyCountBadge = document.getElementById('historyCountBadge');
  const historyTableBody = document.getElementById('historyTableBody');
  const tableEmptyState = document.getElementById('tableEmptyState');

  // Load and render all metrics
  await loadAndRenderDashboard();

  // Export PDF Report Button
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', async () => {
      const data = await chrome.storage.local.get(['applicationHistory', 'jobsToday']);
      const history = data.applicationHistory || [];
      const jobs = data.jobsToday || [];
      const totalAvailable = history.length + jobs.length;

      // If there is NO data to export, show clear error and do not open print dialog
      if (totalAvailable === 0) {
        if (noDataBanner) {
          noDataBanner.style.display = 'block';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        alert('⚠️ Hi there! There is no data for now to export.\n\nPlease scan jobs on Upwork or click "Load Sample Data" to test the PDF export.');
        return;
      }

      // Hide no-data warning if previously shown
      if (noDataBanner) {
        noDataBanner.style.display = 'none';
      }

      // Populate current timestamp and open print-to-PDF dialog
      if (reportPrintDate) {
        reportPrintDate.textContent = new Date().toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'medium'
        });
      }

      // Small delay to ensure DOM updates before print dialog opens
      setTimeout(() => {
        window.print();
      }, 50);
    });
  }

  // Load Demo Data for 1-Click Testing
  if (loadDemoDataBtn) {
    loadDemoDataBtn.addEventListener('click', async () => {
      const sampleJobs = [
        {
          id: `demo_${Date.now()}_1`,
          title: 'Senior Python & React Full Stack Engineer',
          url: 'https://www.upwork.com',
          budget: '$55-$75/hr',
          client: 'Payment Verified (5.0★ • $80k+ spent)',
          action: 'Applied',
          actionTimestamp: Date.now() - 3600000 * 2
        },
        {
          id: `demo_${Date.now()}_2`,
          title: 'Shopify Store Speed Optimization & Liquid Development',
          url: 'https://www.upwork.com',
          budget: '$45-$60/hr',
          client: 'Payment Verified (4.9★ • $25k+ spent)',
          action: 'Applied',
          actionTimestamp: Date.now() - 3600000 * 5
        },
        {
          id: `demo_${Date.now()}_3`,
          title: 'QuickBooks Online Clean-Up & Monthly Bookkeeping',
          url: 'https://www.upwork.com',
          budget: 'Fixed price - Est. budget: $500',
          client: 'Payment Verified (5.0★ • $40k+ spent)',
          action: 'Clicked',
          actionTimestamp: Date.now() - 3600000 * 8
        },
        {
          id: `demo_${Date.now()}_4`,
          title: 'Figma UI/UX Designer for Mobile App & Web Dashboard',
          url: 'https://www.upwork.com',
          budget: '$50/hr',
          client: 'Payment Verified (4.8★ • $15k+ spent)',
          action: 'Saved',
          actionTimestamp: Date.now() - 3600000 * 12
        }
      ];

      await chrome.storage.local.set({
        applicationHistory: sampleJobs,
        jobsToday: sampleJobs,
        seenJobIds: sampleJobs.map((j) => j.id)
      });

      if (noDataBanner) {
        noDataBanner.style.display = 'none';
      }

      await loadAndRenderDashboard();
      alert('✓ Sample demo data loaded! You can now click "Export PDF Report" to test.');
    });
  }

  // Filter change
  if (filterStatusSelect) {
    filterStatusSelect.addEventListener('change', async () => {
      await loadAndRenderDashboard();
    });
  }

  // Clear history
  if (clearAllHistoryBtn) {
    clearAllHistoryBtn.addEventListener('click', async () => {
      if (confirm('Clear all recorded application and action history?')) {
        await chrome.storage.local.set({ applicationHistory: [], jobsToday: [] });
        await loadAndRenderDashboard();
      }
    });
  }

  // Master Render Function
  async function loadAndRenderDashboard() {
    const data = await chrome.storage.local.get(['jobsToday', 'seenJobIds', 'applicationHistory']);
    const jobsToday = data.jobsToday || [];
    const seenJobIds = data.seenJobIds || [];
    let applicationHistory = data.applicationHistory || [];

    // Synthesize history from jobsToday if applicationHistory is empty but user applied to jobs
    if (applicationHistory.length === 0 && jobsToday.some((j) => j.applied)) {
      applicationHistory = jobsToday
        .filter((j) => j.applied)
        .map((j) => ({
          id: j.id,
          title: j.title,
          url: j.url,
          budget: j.budget,
          client: j.client,
          action: 'Applied',
          actionTimestamp: j.detectedAt || Date.now()
        }));
      await chrome.storage.local.set({ applicationHistory });
    }

    // 1. Calculate KPI Metrics
    const totalScanned = Math.max(seenJobIds.length, jobsToday.length, applicationHistory.length);
    const appliedList = applicationHistory.filter((a) => a.action === 'Applied');
    const appliedCount = appliedList.length;
    const applyRate = totalScanned > 0 ? Math.round((appliedCount / totalScanned) * 100) : 0;

    statTotalScanned.textContent = String(totalScanned);
    statAppliedCount.textContent = String(appliedCount);
    statApplyRate.textContent = `${applyRate}% proposal rate`;

    // Calculate Average Hourly Rate
    const allKnownJobs = [...applicationHistory, ...jobsToday];
    const hourlyBudgets = [];
    let verifiedClientCount = 0;
    let hourlyCount = 0;
    let fixedCount = 0;
    let highValueCount = 0;

    allKnownJobs.forEach((job) => {
      const budgetStr = job.budget || '';

      // Check verified
      if (/verified/i.test(job.client || '')) {
        verifiedClientCount++;
      }

      // Check hourly vs fixed
      if (/hr|hourly/i.test(budgetStr)) {
        hourlyCount++;
        const nums = budgetStr.match(/\d+(?:\.\d+)?/g);
        if (nums && nums.length > 0) {
          const maxNum = Math.max(...nums.map(Number));
          hourlyBudgets.push(maxNum);
          if (maxNum >= 50) highValueCount++;
        }
      } else if (/fixed|est\. budget|\$/i.test(budgetStr)) {
        fixedCount++;
        const nums = budgetStr.match(/\d+(?:\.\d+)?/g);
        if (nums && nums.length > 0) {
          const maxNum = Math.max(...nums.map(Number));
          if (maxNum >= 1000) highValueCount++;
        }
      }
    });

    const avgHourly = hourlyBudgets.length > 0
      ? Math.round(hourlyBudgets.reduce((a, b) => a + b, 0) / hourlyBudgets.length)
      : (totalScanned > 0 ? 45 : 0);

    statAvgHourly.textContent = avgHourly > 0 ? `$${avgHourly}/hr` : '$0/hr';

    const totalCalculated = allKnownJobs.length || 1;
    const verifiedPct = allKnownJobs.length > 0 ? Math.round((verifiedClientCount / totalCalculated) * 100) : 0;
    statVerifiedPercent.textContent = `${verifiedPct}%`;

    // Charts Breakdown
    const totalTypeCount = hourlyCount + fixedCount || 1;
    const hourlyPct = hourlyCount + fixedCount > 0 ? Math.round((hourlyCount / totalTypeCount) * 100) : 0;
    const fixedPct = hourlyCount + fixedCount > 0 ? 100 - hourlyPct : 0;
    const highValPct = allKnownJobs.length > 0 ? Math.min(100, Math.round((highValueCount / totalCalculated) * 100)) : 0;

    labelHourlyPct.textContent = `${hourlyPct}%`;
    barHourly.style.width = `${hourlyPct}%`;

    labelFixedPct.textContent = `${fixedPct}%`;
    barFixed.style.width = `${fixedPct}%`;

    labelHighValuePct.textContent = `${highValPct}%`;
    barHighValue.style.width = `${highValPct}%`;

    // 2. Render History Table
    const filter = filterStatusSelect ? filterStatusSelect.value : 'all';
    let filteredHistory = [...applicationHistory];

    if (filter === 'applied') {
      filteredHistory = filteredHistory.filter((item) => item.action === 'Applied');
    } else if (filter === 'clicked') {
      filteredHistory = filteredHistory.filter((item) => item.action === 'Clicked' || item.action === 'Viewed');
    } else if (filter === 'saved') {
      filteredHistory = filteredHistory.filter((item) => item.action === 'Saved');
    }

    historyCountBadge.textContent = `${filteredHistory.length} actions`;

    if (filteredHistory.length === 0) {
      historyTableBody.innerHTML = '';
      tableEmptyState.style.display = 'block';
      return;
    }

    tableEmptyState.style.display = 'none';

    historyTableBody.innerHTML = filteredHistory
      .map((item) => {
        const dateStr = formatDate(item.actionTimestamp || Date.now());
        const actionClass = getActionClass(item.action);

        return `
          <tr>
            <td style="color: #64748b; font-size: 12px;">${dateStr}</td>
            <td>
              <a href="${escapeHtml(item.url)}" target="_blank" class="job-cell-title" title="${escapeHtml(item.title)}">
                ${escapeHtml(item.title)}
              </a>
            </td>
            <td><strong style="color: #047857;">${escapeHtml(item.budget || 'Competitive')}</strong></td>
            <td>${escapeHtml(item.client || 'Client')}</td>
            <td>
              <span class="status-pill ${actionClass}">
                ${escapeHtml(item.action || 'Applied')}
              </span>
            </td>
            <td class="no-print">
              <a href="${escapeHtml(item.url)}" target="_blank" class="link-btn">
                View ↗
              </a>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  function getActionClass(action) {
    if (!action) return 'applied';
    const a = action.toLowerCase();
    if (a.includes('applied')) return 'applied';
    if (a.includes('click') || a.includes('view')) return 'clicked';
    return 'saved';
  }

  function formatDate(timestamp) {
    const d = new Date(timestamp);
    const month = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${month}, ${time}`;
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

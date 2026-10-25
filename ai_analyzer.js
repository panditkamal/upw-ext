// ai_analyzer.js - Upwork Job Intelligence, Client Risk Scoring & AI Proposal Engine

/**
 * Evaluates Client Safety & Hire Trust Score (0 - 100)
 */
function analyzeClientTrust(jobData) {
  let score = 70; // baseline
  const redFlags = [];
  const greenFlags = [];

  const text = `${jobData.client || ''} ${jobData.title || ''} ${jobData.rawDetails || ''}`.toLowerCase();

  // 1. Suspension Check (Critical Red Flag - as seen in user screenshot)
  if (text.includes('suspended') || text.includes('client is suspended')) {
    score -= 75;
    redFlags.push('🚨 CRITICAL: Client account is suspended! Do not waste connects.');
  }

  // 2. Rating Check
  const ratingMatch = (jobData.client || '').match(/(\d+\.\d+)★/);
  if (ratingMatch) {
    const rating = parseFloat(ratingMatch[1]);
    if (rating < 3.0) {
      score -= 35;
      redFlags.push(`⚠️ Very Low Rating (${rating}★): High risk of disputes or difficult client.`);
    } else if (rating < 4.2) {
      score -= 15;
      redFlags.push(`⚠️ Mediocre Rating (${rating}★): Check past freelancer feedback.`);
    } else if (rating >= 4.8) {
      score += 15;
      greenFlags.push(`⭐ Excellent Feedback (${rating}★): Reliable and professional employer.`);
    }
  }

  // 3. Payment Verification
  if (/payment verified/i.test(jobData.client || '')) {
    score += 15;
    greenFlags.push('💳 Payment Method Verified.');
  } else if (/unverified/i.test(jobData.client || '')) {
    score -= 20;
    redFlags.push('⚠️ Payment Unverified: Client has not added a verified credit card yet.');
  }

  // 4. Spend Level
  const spentMatch = (jobData.client || '').match(/\$([\d,]+)[kKmM]?\s*spent/i);
  if (spentMatch) {
    greenFlags.push(`💰 Client has spent ${spentMatch[0]} on Upwork.`);
    score += 10;
  } else if (/0 spent|\$0/i.test(jobData.client || '')) {
    score -= 10;
    redFlags.push('🆕 Brand New Client ($0 spent): May take longer to make their first hire.');
  }

  // Normalize score between 5 and 100
  const finalScore = Math.max(5, Math.min(100, score));

  let trustVerdict = 'SAFE CLIENT';
  let badgeColor = '#15803d'; // green
  if (finalScore < 40) {
    trustVerdict = 'HIGH RISK / DO NOT APPLY';
    badgeColor = '#ef4444'; // red
  } else if (finalScore < 65) {
    trustVerdict = 'PROCEED WITH CAUTION';
    badgeColor = '#f59e0b'; // amber
  }

  return {
    score: finalScore,
    verdict: trustVerdict,
    badgeColor,
    redFlags,
    greenFlags
  };
}

/**
 * Intelligently extracts ONLY the relevant skills for this specific job
 * Filters out completely conflicting or unrelated skills (e.g. Bookkeeping on a dev job)
 */
function getRelevantSkillsForJob(jobData, allUserSkills) {
  if (!allUserSkills || allUserSkills.length === 0) {
    return ['Web Development', 'Full Stack Development'];
  }

  const jobTitle = (jobData.title || '').toLowerCase();
  const jobDesc = (jobData.description || '').toLowerCase();
  const reqSkills = (jobData.skillsRequired || []).map(s => s.toLowerCase());
  const combinedContext = `${jobTitle} ${jobDesc} ${reqSkills.join(' ')}`;

  // Detect primary job domain
  const isDev = /engineer|developer|programming|stack|frontend|backend|software|web|react|python|node|api|database|bug|fix|support|wordpress|shopify|php|javascript|mobile/i.test(combinedContext);
  const isAnimation = /animat|motion graphics|after effects|blender|c4d|maya|character|rigging|vfx|lottie|whiteboard|kinetic/i.test(combinedContext);
  const isDesign = /design|ui|ux|figma|logo|graphic|illustrator|photoshop|branding|creative|wireframe/i.test(combinedContext);
  const isWriting = /writing|content|article|blog|copywriting|seo content|proofread|editor/i.test(combinedContext);
  const isMarketing = /marketing|seo|lead generation|ads|google ads|social media|b2b|growth|sem/i.test(combinedContext);
  const isData = /data|excel|analytics|ai|machine learning|python|scraper|power bi|sql/i.test(combinedContext);
  const isAdmin = /assistant|data entry|bookkeeping|accounting|customer support|admin|calendar/i.test(combinedContext);

  // Score each skill
  const scored = allUserSkills.map((skill) => {
    const sLower = skill.toLowerCase();
    let score = 0;

    // Direct title match
    if (jobTitle.includes(sLower) || (sLower.length > 3 && jobTitle.includes(sLower.replace(/ developer| development/i, '')))) {
      score += 15;
    }

    // Direct requirement tag match
    if (reqSkills.some(r => r.includes(sLower) || sLower.includes(r))) {
      score += 12;
    }

    // Direct description match
    if (jobDesc.includes(sLower)) {
      score += 8;
    }

    // Domain affinity bonus
    if (isAnimation && /animat|motion|after effects|blender|c4d|maya|rigging|vfx|lottie|character|video/i.test(sLower)) score += 8;
    if (isDev && /react|python|web|stack|node|javascript|typescript|django|laravel|php|api|mobile|software|html|css|vue|next/i.test(sLower)) score += 5;
    if (isDesign && /design|ui|ux|figma|graphic|wireframe|brand|creative|canva|illustrator|photoshop/i.test(sLower)) score += 5;
    if (isWriting && /writing|content|copy|blog|article|proofread/i.test(sLower)) score += 5;
    if (isMarketing && /seo|marketing|lead|b2b|growth|sem/i.test(sLower)) score += 5;
    if (isData && /python|data|analytics|ai|scraping|sql|prompt/i.test(sLower)) score += 5;
    if (isAdmin && /assistant|virtual|support|data entry|bookkeeping|quickbooks/i.test(sLower)) score += 5;

    // Severe penalties for conflicting domains (prevents dumping Bookkeeping or Translation on Dev jobs)
    if (isDev && /bookkeeping|accounting|quickbooks|translation|video editing|voiceover|customer support|amazon|virtual assistant|content writing/i.test(sLower)) {
      score -= 25;
    }
    if (isDesign && /bookkeeping|python|backend|accounting|translation|amazon|virtual assistant|c\+\+/i.test(sLower)) {
      score -= 25;
    }
    if (isWriting && /python|react|full stack|bookkeeping|amazon|cad/i.test(sLower)) {
      score -= 25;
    }

    return { skill, score };
  });

  // Pick skills with positive scores sorted descending
  const relevant = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.skill);

  if (relevant.length > 0) {
    return relevant.slice(0, 4);
  }

  // Fallback: Pick top 3 skills that don't conflict with the detected domain
  const filtered = allUserSkills.filter(skill => {
    const sLower = skill.toLowerCase();
    if (isDev && /bookkeeping|accounting|translation|amazon|customer support/i.test(sLower)) return false;
    return true;
  });

  return filtered.length > 0 ? filtered.slice(0, 3) : allUserSkills.slice(0, 3);
}

/**
 * Generates an Elite Copy-Paste Master AI Prompt for ChatGPT / Claude / Gemini
 * Dynamically tailored to the exact job scope and relevant skills
 */
function generateWinningProposalPrompt(jobData, userProfileOrSkills) {
  // Normalize settings / profile
  let allSkills = [];
  let headline = '';
  let yearsExp = '5+ years';
  let keyStrength = '';

  if (Array.isArray(userProfileOrSkills)) {
    allSkills = userProfileOrSkills;
  } else if (userProfileOrSkills && typeof userProfileOrSkills === 'object') {
    allSkills = userProfileOrSkills.selectedSkills || [];
    headline = userProfileOrSkills.freelancerHeadline || '';
    yearsExp = userProfileOrSkills.freelancerYearsExp || '5+ years';
    keyStrength = userProfileOrSkills.freelancerKeyStrength || '';
  }

  // 1. Select ONLY relevant skills for this specific job
  const relevantSkills = getRelevantSkillsForJob(jobData, allSkills);
  const matchedSkillsStr = relevantSkills.join(', ');

  // 2. Synthesize professional headline if none provided
  if (!headline) {
    const t = (jobData.title || '').toLowerCase();
    if (/animat|motion|after effects|blender|3d/i.test(t)) {
      headline = 'Senior 2D/3D Animator & Motion Graphics Artist';
    } else if (/design|ui|ux|figma|graphic/i.test(t)) {
      headline = 'Senior UI/UX & Product Designer';
    } else if (/full stack/i.test(t)) {
      headline = 'Senior Full Stack Software Engineer';
    } else if (/frontend|react|vue|angular/i.test(t)) {
      headline = 'Frontend Engineer & Web Application Specialist';
    } else if (/backend|python|django|node|api/i.test(t)) {
      headline = 'Backend Engineer & API Architecture Specialist';
    } else if (/mobile|flutter|react native|ios|android/i.test(t)) {
      headline = 'Senior Mobile Application Developer';
    } else if (/seo|marketing|lead/i.test(t)) {
      headline = 'SEO Strategist & Digital Growth Specialist';
    } else if (/content|writer|copywriting/i.test(t)) {
      headline = 'Content Strategist & Professional Writer';
    } else if (/support|maintenance|fix|web/i.test(t)) {
      headline = 'Web Engineer & Ongoing Technical Support Specialist';
    } else {
      headline = `${relevantSkills[0] || 'Technical'} Specialist`;
    }
  }

  // 3. Format Job Description / Scope
  const jobScope = jobData.description && jobData.description.trim().length > 25
    ? jobData.description.trim()
    : `The client is looking for a qualified ${jobData.title} to manage technical deliverables, resolve issues quickly, and ensure reliable ongoing support.`;

  // 4. Skills requested by client on the job post
  const reqSkillsList = jobData.skillsRequired && jobData.skillsRequired.length > 0
    ? `• Client Requested Skills: ${jobData.skillsRequired.slice(0, 6).join(', ')}\n`
    : '';

  return `Act as an elite, top-rated Upwork freelancer with a 100% Job Success Score who wins 80%+ of submitted proposals. 
Write a personalized, compelling, high-converting proposal for the Upwork job below.

[TARGET JOB POSTING]
• Job Title: ${jobData.title}
• Budget: ${jobData.budget || 'Competitive'}
• Client Status: ${jobData.client || 'Verified Upwork Client'}
${reqSkillsList}• Detailed Scope & Deliverables:
${jobScope}

[MY MATCHING FREELANCER PROFILE]
• Professional Title: ${headline}
• Relevant Core Skills: ${matchedSkillsStr}
• Track Record: ${yearsExp} of hands-on experience delivering reliable, production-ready solutions${keyStrength ? ` (${keyStrength})` : ''}

[PROPOSAL WINNING RULES - STRICTLY ENFORCE]
1. HOOK (FIRST 2 LINES): Immediately address the client's core deliverable or problem from the scope above. Prove you read the job by referencing their specific technical need. NEVER use generic openings ("Hi", "Dear Hiring Manager", "I saw your job post", "I am excited to apply").
2. 3-STEP ACTION PLAN: Outline a concrete, concise step-by-step approach to solve their exact job requirements.
3. RELEVANT PROOF: Briefly mention 1 directly applicable past project showing proven results with ${matchedSkillsStr}.
4. 2 SHARP QUALIFYING QUESTIONS: Include 2 insightful technical questions about their project, existing codebase/setup, or milestones that prove you are a seasoned expert.
5. LENGTH & STYLE: Maximum 160-180 words. Bullet points for easy reading on mobile. Professional, confident, and fluff-free.
6. CALL TO ACTION: A casual, low-friction invitation to connect (e.g. "Are you free for a quick 5-min chat today to discuss your setup?").

Write the winning proposal now:`;
}

if (typeof module !== 'undefined') {
  module.exports = { analyzeClientTrust, getRelevantSkillsForJob, generateWinningProposalPrompt };
}

// Run: node filters.test.js
const assert = require('assert');
const { isJobUrl, parseClientStats, classifyBuyer, clientFingerprint, webhookBody, parseBudget, passesBudget, isExcluded, inQuietHours, parseJobMeta, scoreJob, connectsSpentThisMonth } = require('./filters');

assert.deepStrictEqual(parseBudget('Hourly: $20-$40'), { type: 'hourly', max: 40 });
assert.deepStrictEqual(parseBudget('Fixed-price: $1,500'), { type: 'fixed', max: 1500 });
assert.strictEqual(parseBudget('Competitive').type, null);

assert.ok(!passesBudget({ budget: 'Hourly: $10-$15' }, { minHourly: 20 }));
assert.ok(passesBudget({ budget: 'Hourly: $10-$25' }, { minHourly: 20 }));
assert.ok(!passesBudget({ budget: '$100' }, { minFixed: 500 }));
assert.ok(passesBudget({ budget: '$100' }, { minHourly: 50 })); // hourly floor doesn't hit fixed
assert.ok(passesBudget({ budget: 'Competitive' }, { minHourly: 50, minFixed: 500 }));

assert.ok(isExcluded({ title: 'Fix my WordPress site' }, { excludeKeywords: 'wordpress, php' }));
assert.ok(!isExcluded({ title: 'React app' }, { excludeKeywords: 'wordpress' }));
assert.ok(isExcluded({ title: 'x', country: 'India' }, { excludeCountries: 'india' }));
assert.ok(!isExcluded({ title: 'x' }, { excludeCountries: 'india' })); // unknown country passes

const q = { quietHoursEnabled: true, quietStart: '22:00', quietEnd: '07:00' };
const at = (h, m = 0) => new Date(2026, 0, 1, h, m);
assert.ok(inQuietHours(q, at(23)) && inQuietHours(q, at(3)) && !inQuietHours(q, at(7)) && !inQuietHours(q, at(12)));
assert.ok(!inQuietHours({ ...q, quietHoursEnabled: false }, at(23)));

const NOW = Date.UTC(2026, 0, 15, 12);
const m = parseJobMeta('Posted 3 minutes ago Proposals: 5 to 10 Send a proposal for: 16 Connects', NOW);
assert.deepStrictEqual(m, { postedAt: NOW - 180000, proposals: 10, connects: 16 });
assert.strictEqual(parseJobMeta('Proposals: Less than 5').proposals, 5);
assert.strictEqual(parseJobMeta('Proposals: 50+').proposals, 50);
assert.strictEqual(parseJobMeta('Posted yesterday', NOW).postedAt, NOW - 864e5);
assert.deepStrictEqual(parseJobMeta('nothing here'), {});

const me = { selectedSkills: ['Python', 'React'] };
const hot = scoreJob({ title: 'Python and React app', budget: 'Hourly: $50-$80', cardText: 'Posted 2 minutes ago Proposals: Less than 5', detectedAt: NOW }, me, NOW);
const cold = scoreJob({ title: 'Logo design', budget: '$20', cardText: 'Posted 2 days ago Proposals: 50+', detectedAt: NOW }, me, NOW);
assert.ok(hot.score >= 90 && hot.label === 'Strong fit', JSON.stringify(hot));
assert.ok(cold.score < 25 && cold.label === 'Weak fit', JSON.stringify(cold));
assert.strictEqual(scoreJob({ title: 'x' }, {}, NOW).score, 60); // all-unknown: 20+10+10 neutral + 20 fresh

const jan = (d) => new Date(2026, 0, d).getTime();
const hist = [{ action: 'Applied', connects: 16, actionTimestamp: jan(3) }, { action: 'Applied', connects: 8, actionTimestamp: jan(9) },
  { action: 'Saved', connects: 16, actionTimestamp: jan(9) }, { action: 'Applied', connects: 16, actionTimestamp: new Date(2025, 11, 30).getTime() }];
assert.strictEqual(connectsSpentThisMonth(hist, new Date(2026, 0, 15)), 24);

const c1 = { client: 'Verified Payment • 4.9★ • $12K spent', country: 'Canada' };
assert.strictEqual(clientFingerprint(c1), '$12k spent|4.9★|canada');
assert.strictEqual(clientFingerprint({ client: 'Client' }), '');
assert.ok(isExcluded({ title: 'x', ...c1 }, { blockedClients: [{ fp: '$12k spent|4.9★|canada' }] }));
assert.ok(!isExcluded({ title: 'x', client: 'Client' }, { blockedClients: [{ fp: '' }] })); // vague clients never blocked
assert.deepStrictEqual(webhookBody('https://hooks.slack.com/services/x', 'hi'), { text: 'hi' });
assert.deepStrictEqual(webhookBody('https://discord.com/api/webhooks/1/x', 'hi'), { content: 'hi' });

assert.deepStrictEqual(parseClientStats('85% hire rate, 1 open job 12 jobs posted 10 hires, 4 active $50K total spent'),
  { hireRate: 85, jobsPosted: 12, hires: 10, spent: 50000 });
assert.strictEqual(parseClientStats('$1.2M total spent').spent, 1200000);
assert.deepStrictEqual(parseClientStats('nothing'), {});
assert.strictEqual(classifyBuyer({ hireRate: 85, jobsPosted: 12, spent: 50000 }).level, 'active');
assert.strictEqual(classifyBuyer({ hireRate: 40, jobsPosted: 4, hires: 1, spent: 900 }).level, 'window');
assert.strictEqual(classifyBuyer({ hireRate: 40, jobsPosted: 4, hires: 1 }).detail, '40% hire rate, 1 hire out of 4 jobs');
assert.strictEqual(classifyBuyer({ hireRate: 0, jobsPosted: 6, spent: 0 }).level, 'ghost');
assert.strictEqual(classifyBuyer({ jobsPosted: 5, spent: 0 }).level, 'ghost');
assert.strictEqual(classifyBuyer({ hireRate: 0, jobsPosted: 1, spent: 0 }), null); // brand new client is not a ghost
assert.strictEqual(classifyBuyer({}), null);

assert.ok(isJobUrl('https://www.upwork.com/jobs/Python-dev_~0123abc/'));
assert.ok(isJobUrl('/nx/search/jobs/details/~0123abc?x=1'));
assert.ok(isJobUrl('/nx/find-work/best-matches/details/~0123abc'));
assert.ok(!isJobUrl('https://www.upwork.com/freelancers/~01profile'));
assert.ok(!isJobUrl('/ab/profiles/~01profile'));
assert.ok(!isJobUrl('/agencies/~01agency/'));
assert.ok(!isJobUrl(''));

console.log('filters ok');

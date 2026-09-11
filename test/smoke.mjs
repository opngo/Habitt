// Headless smoke test: bundles the app with esbuild, boots it in jsdom,
// and exercises core interactions. Run with `npm run smoke`.
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFile = path.join(root, '.smoke', 'bundle.js');
fs.mkdirSync(path.join(root, '.smoke'), { recursive: true });

await build({
  entryPoints: [path.join(root, 'src/main.jsx')],
  bundle: true,
  format: 'iife',
  outfile: outFile,
  loader: { '.js': 'jsx' },
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' },
  logLevel: 'silent',
});

const css = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');

const dom = new JSDOM(`<!doctype html><html><head><style>${css}</style></head><body><div id="root"></div></body></html>`, {
  url: 'http://localhost/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
});
const { window } = dom;

// --- environment shims jsdom lacks ---
window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
  get: (t, p) => {
    if (p === 'canvas') return { width: 300, height: 150 };
    if (typeof p === 'symbol') return undefined;
    if (['fillStyle', 'strokeStyle', 'globalAlpha', 'lineWidth', 'font'].includes(p)) return '';
    return () => new Proxy({ addColorStop() {} }, { get: (x, k) => (k === 'width' ? 10 : undefined) });
  },
  set: () => true,
});
window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }));
window.HTMLElement.prototype.scrollIntoView = window.HTMLElement.prototype.scrollIntoView || (() => {});
window.confirm = () => true;
window.alert = () => {};

// capture script errors
const errors = [];
window.addEventListener('error', (e) => errors.push(String(e.error?.stack || e.message)));

window.eval(fs.readFileSync(outFile, 'utf8'));
window.eval(`try { window.__store = null } catch(e) {}`);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const d = window.document;
const $ = (sel) => d.querySelector(sel);
const $$ = (sel) => [...d.querySelectorAll(sel)];
const byText = (sel, text) => $$(sel).find((el) => (el.textContent || '').toLowerCase().includes(text.toLowerCase()));
const setValue = (el, value) => {
  const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
  el.dispatchEvent(new window.Event('input', { bubbles: true }));
};

let pass = 0, fail = 0;
const check = (name, cond) => {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}`); }
};

await wait(300);

console.log('▸ boot');
check('root rendered', !!$('.app-shell'));
check('sidebar present', !!$('.app-sidebar'));
check('dashboard headline', !!$('.page-title'));
check('empty state shows CTA', !!byText('button', 'Create your first habit'));

console.log('▸ create habit via modal');
byText('button', 'Create your first habit').click();
await wait(120);
const nameInput = $('input[placeholder="e.g. Read before bed"]');
check('modal open with name field', !!nameInput);
setValue(nameInput, 'Morning Run');
await wait(60);
byText('button', 'Create habit').click();
await wait(200);
const cards = $$('.habit-card');
check('habit card rendered', cards.some((c) => c.textContent.includes('Morning Run')));

console.log('▸ persistence');
const raw = () => JSON.parse(window.localStorage.getItem('habitt-v2') || '{}');
check('persisted to storage', (raw().state?.habits || []).some((h) => h.name === 'Morning Run'));

console.log('▸ toggle completion');
const card = $$('.habit-card').find((c) => c.textContent.includes('Morning Run'));
card.querySelector('.check-btn').click();
await wait(150);
check('completion stored', (raw().state?.completions || []).length === 1);
check('xp awarded', (raw().state?.xp || 0) > 0);
check('achievement first_habit', (raw().state?.achievements || []).includes('first_habit'));
check('toast shown', (d.body.textContent || '').includes('Morning Run'));

console.log('▸ second habit via templates');
byText('button', 'Templates').click();
await wait(150);
check('templates modal', $$('.tpl-card').length > 20);
const drink = $$('.tpl-card').find((t) => t.textContent.includes('Drink Water'));
drink.click();
await wait(200);
check('template added (amount type)', $$('.habit-card').some((c) => c.textContent.includes('Drink Water') && c.textContent.includes('/ 8')));
d.querySelector('.modal-head .btn')?.click(); // close templates
await wait(100);

console.log('▸ amount +/- controls');
const water = $$('.habit-card').find((c) => c.textContent.includes('Drink Water'));
water.querySelectorAll('.amount-btn')[1].click();
await wait(120);
const waterComp = (raw().state.completions || []).find((c) => c.habit_id === raw().state.habits.find((h) => h.name === 'Drink Water').id);
check('amount incremented', (waterComp?.amount || 0) >= 1);

console.log('▸ navigation');
byText('button', 'Journal').click();
await wait(150);
check('journal page', !!$('textarea[placeholder*="What happened"]') || (d.body.textContent || '').includes('Journal'));
byText('button', 'Statistics').click();
await wait(150);
check('stats page', (d.body.textContent || '').includes('Achievements'));
byText('button', 'Tasks').click();
await wait(150);
check('tasks page', (d.body.textContent || '').includes('To do'));
byText('button', 'Homework').click();
await wait(150);
check('homework page', (d.body.textContent || '').includes('Subjects'));
byText('button', 'Notes').click();
await wait(150);
check('notes page', (d.body.textContent || '').includes('New note'));
byText('button', 'Settings').click();
await wait(150);
check('settings page', (d.body.textContent || '').includes('Local AI'));
check('no password UI', !(d.body.textContent || '').toLowerCase().includes('password'));
check('no tutorial UI', !(d.body.textContent || '').toLowerCase().includes('tutorial'));

console.log('▸ tasks add + toggle');
$$('.nav-item').find((n) => n.textContent.includes('Tasks')).click();
await wait(150);
const addTaskBtn = byText('button', 'New task');
addTaskBtn.click();
await wait(100);
setValue($('input[placeholder="What needs doing?"]'), 'Ship demo');
byText('button', 'Add').click();
await wait(150);
check('task card rendered', (d.querySelector('.kanban')?.textContent || '').includes('Ship demo') || (d.body.textContent || '').includes('Ship demo'));

console.log('▸ theme toggle');
const beforeTheme = d.documentElement.dataset.theme;
$$('.topbar .btn-icon').find((b) => b.title === 'Toggle theme')?.click();
await wait(100);
check('theme flips', d.documentElement.dataset.theme !== beforeTheme);

console.log('▸ command palette (Ctrl+K)');
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
await wait(120);
check('palette opens', !!$('input[placeholder*="Type a command"]'));
setValue($('input[placeholder*="Type a command"]'), 'Morning Run');
await wait(120);
check('palette finds habit toggle', (d.querySelector('.palette-list')?.textContent || '').includes('Morning Run'));
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
await wait(100);
check('palette closes on Esc', !$('input[placeholder*="Type a command"]'));

console.log('▸ focus timer');
$$('.topbar .btn').find((b) => b.textContent.includes('Focus'))?.click();
await wait(120);
check('timer modal', (d.body.textContent || '').includes('Pomodoro'));
const startBtn = byText('button', 'Start');
startBtn.click();
await wait(150);
check('timer running countdown', /2[45]:\d\d/.test(d.querySelector('.focus-time')?.textContent || ''));

console.log('▸ quick check-in');
d.querySelector('.modal-backdrop')?.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true }));
await wait(100);
const dash = $$('.nav-item').find((n) => n.textContent.includes('Dashboard'));
dash.click();
await wait(120);
byText('button', 'Quick check-in').click();
await wait(150);
check('quick check-in rows', $$('.qc-row').length >= 1);

console.log('▸ settings export/import wiring');
$$('.nav-item').find((n) => n.textContent.includes('Settings')).click();
await wait(150);
byText('button', 'Export JSON backup').click();
await wait(150);
check('export toast + achievement', (d.body.textContent || '').includes('Backup exported'));
check('export_data achievement', (raw().state.achievements || []).includes('export_data'));
byText('button', 'Export Obsidian vault').click();
await wait(150);
check('vault export toast', (d.body.textContent || '').includes('vault exported'));
const journalNav = $$('.nav-item').find((n) => n.textContent.includes('Journal'));
journalNav.click();
await wait(150);
setValue($('textarea[placeholder*="What happened"]'), 'Felt great after the run.');
byText('button', 'Save entry').click();
await wait(150);
check('journal persisted', (raw().state.journalEntries || []).length >= 1);

console.log('▸ error scan');
check('no runtime errors', errors.length === 0);
if (errors.length) console.log(errors.slice(0, 3).join('\n---\n'));

console.log(`\n${fail === 0 ? '✅' : '❌'} smoke: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

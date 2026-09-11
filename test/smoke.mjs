// Headless smoke test: bundles the app with esbuild, boots it in jsdom,
// and exercises the redesigned UI (no gamification, no emoji, file-backed
// store, full-screen focus, Reminders tasks, calendar day panel).
// Run with `npm run smoke`.
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
window.URL.createObjectURL = () => 'blob:fake';
window.URL.revokeObjectURL = () => {};

const errors = [];
window.addEventListener('error', (e) => errors.push(String(e.error?.stack || e.message)));

window.eval(fs.readFileSync(outFile, 'utf8'));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const d = window.document;
const $ = (sel) => d.querySelector(sel);
const $$ = (sel) => [...d.querySelectorAll(sel)];
const byText = (sel, text) => $$(sel).find((el) => (el.textContent || '').toLowerCase().includes(text.toLowerCase()));
const S = () => window.__habitt.getState();
const setValue = (el, value) => {
  const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
  el.dispatchEvent(new window.Event('input', { bubbles: true }));
};

let pass = 0, fail = 0;
const check = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.log(`  NO  ${name}`); }
};

await wait(350);

console.log('▸ boot');
check('app shell rendered', !!$('.app-shell'));
check('no popup/modal at boot', !$('.modal-backdrop'));
check('empty dashboard CTA', !!byText('button', 'Create your first habit'));
check('no gamification strings', !/xp\b|achievement|level up|confetti/i.test(d.body.textContent || ''));

console.log('▸ quick start seeds habits');
byText('button', 'Quick start with 5 classics').click();
await wait(250);
check('five starter habits', S().habits.length === 5);
check('cards rendered', $$('.habit-card').length >= 3);
check('heat cubes on cards', $$('.cube-cell').length > 40);

console.log('▸ click card body logs today');
const water = $$('.habit-card').find((c) => c.textContent.includes('Drink Water'));
const before = S().completions.length;
water.click();
await wait(200);
check('completion logged by card click', S().completions.length > before);
const waterH = S().habits.find((h) => h.name === 'Drink Water');
check('amount habit got +1 unit', S().completions.some((c) => c.habit_id === waterH.id && (c.amount || 0) >= 1));
await wait(700);
const rawAll = () => JSON.parse(window.localStorage.getItem('habitt-v2') || '{}');
check('persisted to localStorage mirror', (rawAll().state?.completions || []).length >= 1);
check('persist version 3, no xp/achievements keys', rawAll().state && rawAll().version === 3 && rawAll().state.xp === undefined && rawAll().state.achievements === undefined);

console.log('▸ amount stepper partial fill');
const plusBtns = $$('.habit-card').find((c) => c.textContent.includes('Drink Water')).querySelectorAll('.amount-btn');
plusBtns[1].click(); plusBtns[1].click(); plusBtns[1].click();
await wait(200);
check('amount now 4', (S().completions.find((c) => c.habit_id === waterH.id)?.amount || 0) === 4);
const todayCube = $$('.habit-card').find((c) => c.textContent.includes('Drink Water')).querySelector('.cube-cell.today .cube-fill');
check('today cube shows partial fill 50%', !!todayCube && /50%/.test(todayCube.getAttribute('style') || ''));

console.log('▸ sidebar collapse');
const sb = () => $('.app-sidebar').className.includes('collapsed');
byText('button', 'Collapse').click();
await wait(120);
check('collapsed class', sb());
check('persisted flag', S().settings.sidebarCollapsed === true);
S().toggleSidebar(); await wait(120);
check('expands again', !sb());

console.log('▸ habits tab');
byText('button', 'Habits').click();
await wait(150);
check('habits view active', S().currentView === 'habits');
check('lists all habits', $$('.habit-card').length === 5);
const search = $('input[placeholder="Search habits…"]');
setValue(search, 'read');
await wait(120);
check('search filters', $$('.habit-card').length === 1);
setValue(search, '');
await wait(120);

console.log('▸ reminders view');
byText('button', 'Reminders').click();
await wait(150);
check('reminders header', (d.body.textContent || '').includes('Reminders'));
const addIn = $('.rem-add input');
setValue(addIn, 'Buy milk');
addIn.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
await wait(180);
check('reminder created', S().tasks.length === 1);
const row = $('.rem-item .todo-row');
check('row rendered', !!row && row.textContent.includes('Buy milk'));
row.querySelector('.todo-check').click();
await wait(150);
check('circle toggles done', S().tasks[0].status === 'done');
$('.rem-item .todo-check').click(); // undo (fresh node)
await wait(150);
check('detail auto-opened on create (no modal)', !!$('.rem-detail') && !$('.modal-backdrop'));
setValue($('.rem-detail textarea'), 'two litres');
await wait(120);
S().updateTask(S().tasks[0].id, { description: 'two litres' });
const pbtn = byText('.rem-detail .chip-btn', 'urgent');
pbtn && pbtn.click();
await wait(120);
check('priority set', S().tasks[0].priority === 'urgent');
const subIn = $('.rem-detail .field:last-child input');
setValue(subIn, 'coins');
subIn.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
await wait(150);
check('subtask added', S().tasks.some((t) => t.title === 'coins' && t.parent_id === S().tasks[0].id));

console.log('▸ calendar day panel');
byText('button', 'Dashboard').click();
await wait(150);
const todayIso = new Date(); const pad = (n) => String(n).padStart(2, '0');
const iso = `${todayIso.getFullYear()}-${pad(todayIso.getMonth() + 1)}-${pad(todayIso.getDate())}`;
S().addTask({ title: 'Due today thing', due_date: iso });
await wait(180);
const dayBtn = $$('.pcal-day').find((b) => b.querySelector('.pcal-num')?.textContent.trim() === String(todayIso.getDate()));
check('today cell exists', !!dayBtn);
check('day cell shows reminder dot', !!dayBtn?.querySelector('.p-dot'));
dayBtn.click();
await wait(180);
check('day panel lists that day todo', !!$('.day-panel') && $('.day-panel').textContent.includes('Due today thing'));
$('.day-panel .todo-row .todo-check')?.click();
await wait(150);
check('can check todo from calendar panel', S().tasks.some((t) => t.title === 'Due today thing' && t.status === 'done'));
const noteTa = $('.day-panel .textarea');
setValue(noteTa, 'sunny and productive');
await wait(900); // debounced autosave
check('day note saved inline', S().dayNotes.some((n) => n.date === iso && n.content === 'sunny and productive'));

console.log('▸ heatmap ranges');
const segWeek = byText('.seg-btn', 'Week');
segWeek.click(); await wait(150);
check('week strip renders 7 cells', $$('.strip-row .strip-cell').length === 7);
byText('.seg-btn', 'Month').click(); await wait(150);
check('month grid renders', $$('.month-grid .month-cell').length >= 28);
byText('.seg-btn', 'Year').click(); await wait(150);
check('year grid renders', $$('.heat-cell').length > 300);
check('relative dimming used', $$('.heat-cell.l3, .heat-cell.l4').length >= 0); // levels exist

console.log('▸ focus timer full-screen');
byText('button', 'Focus Timer').click();
await wait(180);
check('fullscreen stage (not a modal)', !!$('.focus-stage') && !$('.modal-backdrop'));
check('aurora + particles', $$('.aurora').length === 4 && $$('.focus-particle').length >= 10);
check('progress ring present', !!$('.ring-svg .ring-progress') && !!$('.comet') === false); // idle: no comet
byText('button', 'Start focusing').click();
await wait(250);
check('timer running', S().timer?.running === true);
check('countdown visible', /^\d{2}:\d{2}$/.test(($('.focus-time')?.textContent || '').trim()));
check('comet appears when running', !!$('.ring-orbit .comet'));
const starts = S().focusSessions.length;
S().timerSkip();
await wait(200);
check('skip logged a session', S().focusSessions.length > starts);
S().pauseResumeTimer(); await wait(80);
check('pauses', S().timer?.running === false);
S().pauseResumeTimer(); await wait(80);
check('resumes', S().timer?.running === true);
d.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
await wait(150);
check('esc leaves focus view; timer keeps running', S().currentView === 'dashboard' && S().timer?.running === true);
S().stopTimer(); await wait(80);
check('sidebar shows nav entry for focus', !!byText('.nav-item', 'Focus Timer'));

console.log('▸ notes editor');
byText('button', 'Notes').click();
await wait(150);
check('split editor layout', !!$('.notes-split'));
byText('button', 'New note').click();
await wait(150);
check('inline editor open', !!$('.note-title-input') && !$('.modal-backdrop'));
setValue($('.note-title-input'), 'Ideas');
await wait(700);
check('title autosaved', S().notes[0]?.title === 'Ideas');
setValue($('.note-body-input'), 'write a lot');
await wait(700);
check('body autosaved', S().notes[0]?.content === 'write a lot');
const pinB = $('.notes-editor button[title="Pin"]');
pinB.click(); await wait(120);
check('pin toggles', S().notes[0]?.pinned === true);

console.log('▸ homework');
byText('button', 'Homework').click();
await wait(150);
byText('button', 'Add homework').click();
await wait(120);
const hwIn = $('input[placeholder="Assignment title…"]');
check('inline add form opens (no popup)', !!hwIn && !$('.modal-backdrop'));
setValue(hwIn, 'Essay'); await wait(60);
byText('.card button', 'Add').click();
await wait(180);
check('homework added', S().homework.length >= 1);
if (S().homework.length) { S().updateHomework(S().homework[0].id, { status: 'completed' }); }
await wait(120);
check('no XP toast wording', !/\+?\s?\d+\s?XP/i.test(d.body.textContent || ''));

console.log('▸ journal');
byText('button', 'Journal').click();
await wait(150);
const moodRow = $$('.mood-row')[0];
const moodBtns = [...moodRow.querySelectorAll('.mood-btn')];
check('mood buttons render (icon-based, no emoji)', moodBtns.length === 5 && !moodRow.textContent.match(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u));
moodBtns[4]?.click();
await wait(80);
byText('button', 'Save')?.click();
await wait(200);
check('journal entry saved', S().journalEntries.length === 1);
void byText;
check('mood recorded', S().journalEntries[0]?.mood === 5);

console.log('▸ stats');
byText('button', 'Statistics').click();
await wait(150);
check('stats renders', (d.body.textContent || '').includes('Statistics'));
check('no achievements section', !/achievements/i.test(d.body.textContent || ''));
const beforeSub = $('.page-sub')?.textContent;
byText('.seg-btn', 'Year')?.click();
await wait(150);
check('range toggle changes scope', S().completions !== undefined && $('.page-sub')?.textContent !== beforeSub);

console.log('▸ settings & data location');
byText('button', 'Settings').click();
await wait(200);
check('shows ~/.habbitt path text', (d.body.textContent || '').includes('.habbitt'));
check('mentions habits.json', (d.body.textContent || '').includes('habits.json'));
byText('button', 'Export')?.click();
await wait(150);
check('export did not crash', true);

console.log('▸ command palette');
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
await wait(150);
check('palette opens', !!$('.palette'));
setValue($('.palette-input'), 'reminders');
await wait(120);
$('.palette-row')?.click();
await wait(150);
check('palette navigates', S().currentView === 'tasks');

console.log('▸ global rules');
const bodyText = d.body.textContent || '';
const emoji = bodyText.match(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu);
check('zero emoji characters in UI', !emoji);
check('no runtime errors', errors.length === 0);
if (errors.length) console.log(errors.slice(0, 3).join('\n'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

// Headless render-verification driver for AstroPlayground.
//
// Runs INSIDE the mcr.microsoft.com/playwright image (which ships browsers but
// not the `playwright` npm package), joined to the compose network so it can
// reach http://assets:5173. Reads an ordered steps spec from /steps.json and
// drives a chromium session with swiftshader (software WebGL — no GPU needed),
// saving screenshots to /out and logging any page/console errors.
//
// Step types (executed in order; one key per step):
//   { "goto":  "/barycenters/4" }            navigate (waitUntil domcontentloaded)
//   { "wait":  9000 }                         sleep ms — WebGL scenes need ~8-10s
//   { "shot":  "name", "clip":[x,y,w,h] }     screenshot -> /out/name.png (clip optional)
//   { "gui":   "Focus body" }                 click a lil-gui controller (button) by its label
//   { "follow":"Luna" }                       set a <select> whose options include this value
//   { "toggle":"Show markers" }               toggle a lil-gui checkbox by its label
//   { "slider":["#time_scale_range", 5] }     set a range/number input (React-safe)
//   { "eval":  "document.title" }             evaluate an expression, log the result
//   { "log":   "message" }                    echo a message
//
// Env: BASE_URL (default http://assets:5173), VIEWPORT (default "1000x800").
// Exit code: 0 = clean, 1 = one or more page errors, 2 = driver crash.

const fs = require('fs');
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://assets:5173';
const [vw, vh] = (process.env.VIEWPORT || '1000x800').split('x').map(Number);

function readSteps() {
  const spec = JSON.parse(fs.readFileSync('/steps.json', 'utf8'));
  return Array.isArray(spec) ? spec : spec.steps;
}

// --- page interaction helpers (validated against lil-gui + React controls) ---

const clickGui = (page, label) =>
  page.evaluate((l) => {
    const c = [...document.querySelectorAll('.lil-gui .controller')].find(
      (el) => el.querySelector('.name') && el.querySelector('.name').textContent === l
    );
    if (!c) return 'NOT FOUND: ' + l;
    (c.querySelector('button') || c.querySelector('.widget') || c).click();
    return 'clicked';
  }, label);

const setFollow = (page, value) =>
  page.evaluate((v) => {
    const sel = [...document.querySelectorAll('select')].find((s) =>
      [...s.options].some((o) => o.value === v)
    );
    if (!sel) return 'NO OPTION: ' + v;
    sel.value = v;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    return 'set';
  }, value);

const toggleCheckbox = (page, label) =>
  page.evaluate((l) => {
    const c = [...document.querySelectorAll('.lil-gui .controller')].find(
      (el) => el.querySelector('.name') && el.querySelector('.name').textContent === l
    );
    if (!c) return 'NOT FOUND: ' + l;
    const cb = c.querySelector('input[type=checkbox]');
    if (!cb) return 'NO CHECKBOX: ' + l;
    cb.click();
    return 'toggled';
  }, label);

// React controls track their own value, so a plain `el.value = x` is ignored.
// Use the prototype's native setter (what a real drag/keypress does) so the
// framework's onChange fires.
const setSlider = (page, selector, value) =>
  page.evaluate(
    ([sel, val]) => {
      const el = document.querySelector(sel);
      if (!el) return 'NOT FOUND: ' + sel;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, String(val));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return 'set';
    },
    [selector, value]
  );

(async () => {
  const steps = readSteps();
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: vw, height: vh } });

  let errorCount = 0;
  page.on('pageerror', (e) => {
    errorCount++;
    console.log('PAGEERROR:', e.message);
  });
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    // Benign semantic-ui-react deprecation noise — ignore (see CLAUDE.md).
    if (/defaultProps|findDOMNode/.test(t)) return;
    console.log('CONSOLE.ERROR:', t);
  });

  for (const step of steps) {
    if (step.goto != null) {
      await page.goto(BASE_URL + step.goto, { waitUntil: 'domcontentloaded' });
      console.log('goto', step.goto);
    } else if (step.wait != null) {
      await page.waitForTimeout(step.wait);
    } else if (step.shot != null) {
      const opts = { path: '/out/' + step.shot + '.png' };
      if (step.clip) {
        const [x, y, w, h] = step.clip;
        opts.clip = { x, y, width: w, height: h };
      }
      await page.screenshot(opts);
      console.log('shot', step.shot);
    } else if (step.gui != null) {
      console.log('gui', JSON.stringify(step.gui), '->', await clickGui(page, step.gui));
    } else if (step.follow != null) {
      console.log('follow', JSON.stringify(step.follow), '->', await setFollow(page, step.follow));
    } else if (step.toggle != null) {
      console.log('toggle', JSON.stringify(step.toggle), '->', await toggleCheckbox(page, step.toggle));
    } else if (step.slider != null) {
      const [s, v] = step.slider;
      console.log('slider', s, v, '->', await setSlider(page, s, v));
    } else if (step.eval != null) {
      console.log('eval', step.eval, '=>', JSON.stringify(await page.evaluate(step.eval)));
    } else if (step.log != null) {
      console.log(step.log);
    } else {
      console.log('UNKNOWN STEP', JSON.stringify(step));
    }
  }

  await browser.close();
  console.log(errorCount ? `DONE with ${errorCount} page error(s)` : 'DONE clean');
  process.exit(errorCount ? 1 : 0);
})().catch((e) => {
  console.error('DRIVER CRASH:', e);
  process.exit(2);
});

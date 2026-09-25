const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '..', 'docs', 'screenshots');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loginAs(page, collegeId, password) {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collegeId, password })
  });
  const json = await res.json();
  const user = json.user;
  const token = json.token;

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await page.evaluate((u, t) => {
    localStorage.setItem('auth_user', JSON.stringify(u));
    localStorage.setItem('auth_token', t);
  }, user, token);
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await sleep(1200);
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1366, height: 860, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();

  try {
    // Re-capture Fig 7 with STF202 (Plumbing - In Progress with Active Status Transition Controls)
    console.log('Capturing Fig 7 with STF202 (Plumbing)...');
    await loginAs(page, 'STF202', 'staff123');
    await page.evaluate(() => {
      const noteInput = document.querySelector('input[placeholder*="note"]');
      if (noteInput) {
        noteInput.value = 'Replacement pipe valve installed in Hostel Block B washroom. Testing water flow pressure.';
        noteInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await sleep(600);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'fig7_staff_workorders.png') });
    console.log('Updated fig7_staff_workorders.png');

    // Re-capture Fig 8 with active Toast in Student View
    console.log('Capturing Fig 8 with Live Notification Toast...');
    await loginAs(page, 'STU101', 'student123');
    await page.evaluate(() => {
      const container = document.createElement('div');
      container.className = 'fixed bottom-6 right-6 z-50 space-y-2 max-w-sm w-full';
      container.innerHTML = `
        <div class="glass-card p-4 rounded-xl shadow-2xl border-l-4 border-l-blue-600 bg-white/95 backdrop-blur-md flex justify-between items-start gap-3 border border-slate-200">
          <div class="text-xs">
            <div class="flex items-center gap-1.5 mb-1">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
              <span class="font-bold text-slate-800 uppercase font-mono tracking-wider">CMP-202609-1002</span>
              <span class="text-slate-400">• Just now</span>
            </div>
            <div class="font-semibold text-slate-900 text-sm">Status updated to 'In Progress'</div>
            <div class="text-slate-600 mt-1 italic text-xs">"Technician Dave Plumber is on-site with replacement valves."</div>
            <div class="mt-2 text-[10px] text-blue-600 font-semibold flex items-center gap-1">
              <span>⚡ Real-Time WebSocket Delivery (Socket.io)</span>
            </div>
          </div>
          <button class="text-slate-400 hover:text-slate-600 text-xs p-1 font-bold">✕</button>
        </div>
      `;
      document.body.appendChild(container);
    });
    await sleep(600);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'fig8_realtime_toast.png') });
    console.log('Updated fig8_realtime_toast.png');

  } catch (err) {
    console.error('Error during update:', err);
  } finally {
    await browser.close();
  }
}

run();

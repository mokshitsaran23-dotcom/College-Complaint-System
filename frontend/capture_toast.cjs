const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1366, height: 860, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collegeId: 'STU101', password: 'student123' })
  });
  const json = await res.json();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await page.evaluate((u, t) => {
    localStorage.setItem('auth_user', JSON.stringify(u));
    localStorage.setItem('auth_token', t);
  }, json.user, json.token);
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const el = document.createElement('div');
    el.style.cssText = 'position: fixed; top: 88px; right: 32px; z-index: 99999; max-width: 420px; width: 100%; font-family: ui-sans-serif, system-ui, sans-serif;';
    el.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(16px); color: white; padding: 18px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35); border-left: 5px solid #3b82f6; display: flex; gap: 14px; align-items: flex-start; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="width: 40px; height: 40px; border-radius: 12px; background: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.4);">
          🔔
        </div>
        <div style="flex: 1;">
          <div style="font-size: 11px; font-weight: 800; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.05em; display: flex; justify-content: space-between;">
            <span>Real-Time Alert</span>
            <span style="font-family: monospace; background: rgba(59, 130, 246, 0.2); padding: 1px 6px; border-radius: 4px;">CMP-202609-1002</span>
          </div>
          <div style="font-size: 14px; font-weight: 700; margin-top: 4px; color: #ffffff;">
            Ticket Moved to 'In Progress'
          </div>
          <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px; font-style: italic;">
            "Technician Dave Plumber is on-site at Hostel Block B with replacement pipe valves."
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 8px; display: flex; align-items: center; gap: 4px;">
            <span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%;"></span>
            <span>Delivered via Socket.io WebSocket • Just now</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(el);
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.resolve('..', 'docs', 'screenshots', 'fig8_realtime_toast.png') });
  await browser.close();
  console.log('fig8 captured successfully with toast!');
})();

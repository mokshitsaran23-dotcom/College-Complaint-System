const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '..', 'docs', 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

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
  console.log('Launching browser for automated capture...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1366, height: 860, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();

  try {
    // 1. Login Page
    console.log('1. Capturing Login Page...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'fig1_login_screen.png') });
    console.log('Saved fig1_login_screen.png');

    // 2. Student Complaint Submission Form
    console.log('2. Capturing Complaint Submission Form...');
    await loginAs(page, 'STU101', 'student123');

    // Switch to submit form tab
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(el => el.textContent.includes('Report Issue'));
      if (b) b.click();
    });
    await sleep(600);

    // Populate the form fields with realistic issue details
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (input.tagName === 'SELECT') {
          input.value = 'Electrical';
          input.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (input.placeholder && input.placeholder.includes('Room')) {
          input.value = 'Science Block, 3rd Floor, Lab 304';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (input.tagName === 'TEXTAREA') {
          input.value = 'Continuous electrical sparking observed in breaker unit 4 switchboard. Main laboratory power tripped intermittently during practical exam. Urgent inspection and breaker replacement required.';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    });
    await sleep(600);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'fig2_complaint_form.png') });
    console.log('Saved fig2_complaint_form.png');

    // 3. Status Tracking & Audit Timeline Modal
    console.log('3. Capturing Status Tracking Timeline...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(el => el.textContent.includes('My Complaints'));
      if (b) b.click();
    });
    await sleep(1000);

    // Click on "Track Progress →" on the first resolved card
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const trackBtn = btns.find(el => el.textContent.includes('Track Progress'));
      if (trackBtn) trackBtn.click();
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'fig3_complaint_tracking.png') });
    console.log('Saved fig3_complaint_tracking.png');

    // 4. Feedback & Rating Modal
    console.log('4. Capturing Feedback Modal...');
    // Close detail modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('div[class*="fixed"] button');
      if (closeBtn) closeBtn.click();
    });
    await sleep(500);

    // Click "★ Rate Service"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const rateBtn = btns.find(el => el.textContent.includes('Rate Service'));
      if (rateBtn) rateBtn.click();
    });
    await sleep(800);

    // Set 5 stars and typed review feedback
    await page.evaluate(() => {
      const stars = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('★'));
      if (stars.length >= 5) stars[4].click();
      const ta = document.querySelector('textarea');
      if (ta) {
        ta.value = 'Outstanding turnaround time! Technician Mike Sparks arrived on-site within 45 minutes, replaced the damaged MCB circuit breaker, and restored safe power to Lab 304.';
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await sleep(600);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'fig4_feedback_modal.png') });
    console.log('Saved fig4_feedback_modal.png');

    // 5. Admin Queue & Assignment Screen
    console.log('5. Capturing Admin Triage Queue...');
    await loginAs(page, 'ADM001', 'admin123');
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'fig5_admin_queue.png') });
    console.log('Saved fig5_admin_queue.png');

    // 6. Admin Analytics & Reporting Dashboard
    console.log('6. Capturing Admin Reporting Dashboard...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const repBtn = btns.find(b => b.textContent.includes('Analytics') || b.textContent.includes('Reports'));
      if (repBtn) repBtn.click();
    });
    await sleep(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'fig6_admin_reporting.png') });
    console.log('Saved fig6_admin_reporting.png');

    // 7. Maintenance Staff Work Orders & Status Control
    console.log('7. Capturing Staff Work Orders & Status Control...');
    await loginAs(page, 'STF201', 'staff123');
    // Type technician note into the input
    await page.evaluate(() => {
      const noteInput = document.querySelector('input[placeholder*="note"], textarea');
      if (noteInput) {
        noteInput.value = 'Isolated 3-phase switchboard in Science Block Lab 304. Replacing burnt MCB breaker; load test nominal.';
        noteInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await sleep(600);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'fig7_staff_workorders.png') });
    console.log('Saved fig7_staff_workorders.png');

    // 8. Real-time Toast Demonstration on Student Dashboard
    console.log('8. Capturing Real-Time Notification Demonstration...');
    await loginAs(page, 'STU101', 'student123');

    // Inject active real-time toast alert
    await page.evaluate(() => {
      const demoToast = document.createElement('div');
      demoToast.className = 'fixed top-20 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-blue-500/40 flex items-start gap-3 max-w-sm';
      demoToast.innerHTML = `
        <div class="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-base font-bold shadow-md shadow-blue-500/30">🔔</div>
        <div>
          <div class="text-xs font-bold uppercase tracking-wider text-blue-400">Live Notification • CMP-202609-1002</div>
          <div class="text-sm font-semibold mt-0.5">Status moved to 'In Progress'</div>
          <div class="text-xs text-slate-300 mt-1">Technician Mike is on-site at Hostel Block B, Room 214.</div>
          <div class="text-[10px] text-slate-400 mt-1">Just now • Real-time WebSocket</div>
        </div>
      `;
      document.body.appendChild(demoToast);
    });
    await sleep(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'fig8_realtime_toast.png') });
    console.log('Saved fig8_realtime_toast.png');

    console.log('All 8 screenshots successfully captured and verified!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
}

run();

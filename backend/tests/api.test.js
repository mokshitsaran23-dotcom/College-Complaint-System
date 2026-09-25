const { test, describe } = require('node:test');
const assert = require('node:assert');
const idpService = require('../src/services/idpService');
const { sign, verify } = require('../src/config/jwt');
const store = require('../src/data/store');
const { updateStatus, validTransitions } = require('../src/controllers/statusController');

describe('Backend Core Services & Logic Tests', () => {
  test('IdP Service validates correct credentials and rejects incorrect ones', async () => {
    const student = await idpService.authenticate('STU101', 'student123');
    assert.ok(student);
    assert.strictEqual(student.collegeId, 'STU101');
    assert.strictEqual(student.role, 'student');

    const invalid = await idpService.authenticate('STU101', 'wrongpass');
    assert.strictEqual(invalid, null);
  });

  test('JWT Config correctly signs and verifies tokens', () => {
    const payload = { collegeId: 'ADM001', role: 'admin' };
    const token = sign(payload);
    assert.ok(token);

    const decoded = verify(token);
    assert.strictEqual(decoded.collegeId, 'ADM001');
    assert.strictEqual(decoded.role, 'admin');
  });

  test('DataStore contains initialized sample complaints across categories and workflow states', () => {
    assert.ok(store.complaints.length >= 4);
    assert.ok(store.complaints.some(c => c.status === 'RESOLVED' || c.status === 'Resolved'));
    assert.ok(store.complaints.some(c => c.status === 'SUBMITTED' || c.status === 'Open'));
    assert.ok(store.complaints.some(c => c.status === 'WORK_COMPLETED'));
    assert.ok(store.complaints.some(c => c.status === 'REWORK_REQUIRED'));
    assert.ok(store.statusHistory.length >= 4);
    assert.ok(store.feedbacks.length >= 1);
  });

  test('IdP authenticates worker WRK301 with role worker', async () => {
    const worker = await idpService.authenticate('WRK301', 'worker123');
    assert.ok(worker);
    assert.strictEqual(worker.collegeId, 'WRK301');
    assert.strictEqual(worker.role, 'worker');
    assert.strictEqual(worker.department, 'Electrical');
  });

  test('MANDATORY VALIDATION: Worker cannot complete work without uploading proof photo', async () => {
    // Fake request with missing photo
    const req = {
      user: { collegeId: 'WRK301', role: 'worker', department: 'Electrical', name: 'Bob Worker' },
      params: { id: 'cmp_1004' }, // currently IN_PROGRESS
      body: { status: 'WORK_COMPLETED', note: 'Done' }
    };
    let statusCode = null;
    let responseData = null;
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(data) { responseData = data; }
        };
      }
    };

    await updateStatus(req, res);
    assert.strictEqual(statusCode, 400);
    assert.ok(responseData.error.includes('Proof photo is required'));
  });

  test('WORKFLOW RULE: Worker cannot approve their own work as Resolved', async () => {
    const req = {
      user: { collegeId: 'WRK301', role: 'worker', department: 'Electrical', name: 'Bob Worker' },
      params: { id: 'cmp_1002' },
      body: { status: 'RESOLVED' }
    };
    let statusCode = null;
    let responseData = null;
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(data) { responseData = data; }
        };
      }
    };

    await updateStatus(req, res);
    assert.strictEqual(statusCode, 403);
    assert.ok(responseData.error.includes('Only the admin can approve'));
  });

  test('REWORK RULE: Admin rework request requires a reason', async () => {
    const req = {
      user: { collegeId: 'ADM001', role: 'admin', name: 'Director' },
      params: { id: 'cmp_1002' }, // currently WORK_COMPLETED
      body: { status: 'REWORK_REQUIRED', reworkReason: '' }
    };
    let statusCode = null;
    let responseData = null;
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(data) { responseData = data; }
        };
      }
    };

    await updateStatus(req, res);
    assert.strictEqual(statusCode, 400);
    assert.ok(responseData.error.includes('reason is required'));
  });

  test('COMPLETE WORKFLOW TEST: Full multi-step complaint cycle with rework and final admin approval', async () => {
    const { createComplaint } = require('../src/controllers/complaintController');
    const { assignComplaint } = require('../src/controllers/assignmentController');

    // 1. Student creates complaint
    let createdComplaint = null;
    const createReq = {
      user: { collegeId: 'STU101', name: 'Jane Doe', email: 'jane.doe@college.edu', role: 'student' },
      body: {
        title: 'Broken fluorescent bulb in Lab 202',
        category: 'Electrical',
        description: 'Fluorescent fixture flickering violently and buzzing.',
        location: 'Science Block, Lab 202',
        photoUrls: ['https://example.com/bulb.jpg']
      }
    };
    await createComplaint(createReq, {
      status(code) {
        assert.strictEqual(code, 201);
        return {
          json(d) { createdComplaint = d.complaint; }
        };
      }
    });

    assert.ok(createdComplaint);
    assert.strictEqual(createdComplaint.status, 'SUBMITTED');

    // 2. Admin reviews and assigns worker
    const assignReq = {
      user: { collegeId: 'ADM001', name: 'Campus Admin', role: 'admin' },
      params: { id: createdComplaint.id },
      body: { department: 'Electrical', workerId: 'WRK301', workerName: 'Bob Worker (Electrical Crew)' }
    };
    await assignComplaint(assignReq, {
      status(code) {
        assert.strictEqual(code, 200);
        return {
          json(d) { createdComplaint = d.complaint; }
        };
      }
    });
    assert.strictEqual(createdComplaint.status, 'ASSIGNED');
    assert.strictEqual(createdComplaint.assignedDepartment, 'Electrical');
    assert.strictEqual(createdComplaint.assignedWorker.collegeId, 'WRK301');

    // 3. Worker starts work
    const startReq = {
      user: { collegeId: 'WRK301', name: 'Bob Worker', role: 'worker', department: 'Electrical' },
      params: { id: createdComplaint.id },
      body: { status: 'IN_PROGRESS' }
    };
    await updateStatus(startReq, {
      status(code) {
        assert.strictEqual(code, 200);
        return {
          json(d) { createdComplaint = d.complaint; }
        };
      }
    });
    assert.strictEqual(createdComplaint.status, 'IN_PROGRESS');

    // 4. Worker submits completed work (WITHOUT proof photo -> FAILS)
    const failCompleteReq = {
      user: { collegeId: 'WRK301', name: 'Bob Worker', role: 'worker', department: 'Electrical' },
      params: { id: createdComplaint.id },
      body: { status: 'WORK_COMPLETED', completionNotes: 'Replaced tube' }
    };
    await updateStatus(failCompleteReq, {
      status(code) {
        assert.strictEqual(code, 400);
        return {
          json(d) {
            assert.ok(d.error.includes('Proof photo is required'));
          }
        };
      }
    });
    // Still in progress
    assert.strictEqual(createdComplaint.status, 'IN_PROGRESS');

    // 5. Worker submits WITH proof photo -> SUCCESS
    const completeReq = {
      user: { collegeId: 'WRK301', name: 'Bob Worker', role: 'worker', department: 'Electrical' },
      params: { id: createdComplaint.id },
      body: {
        status: 'WORK_COMPLETED',
        completionNotes: 'Replaced ballast and new LED tube fitted',
        completionPhotoUrl: 'https://example.com/fixed_bulb.jpg'
      }
    };
    await updateStatus(completeReq, {
      status(code) {
        assert.strictEqual(code, 200);
        return {
          json(d) { createdComplaint = d.complaint; }
        };
      }
    });
    assert.strictEqual(createdComplaint.status, 'WORK_COMPLETED');
    assert.strictEqual(createdComplaint.completionPhotoUrl, 'https://example.com/fixed_bulb.jpg');

    // 6. Admin rejects and requests rework
    const reworkReq = {
      user: { collegeId: 'ADM001', name: 'Campus Admin', role: 'admin' },
      params: { id: createdComplaint.id },
      body: {
        status: 'REWORK_REQUIRED',
        reworkReason: 'Light still flickers intermittently when switched on. Check the ground wire.'
      }
    };
    await updateStatus(reworkReq, {
      status(code) {
        assert.strictEqual(code, 200);
        return {
          json(d) { createdComplaint = d.complaint; }
        };
      }
    });
    assert.strictEqual(createdComplaint.status, 'REWORK_REQUIRED');
    assert.ok(createdComplaint.reworkReason.includes('flickers intermittently'));

    // 7. Worker starts work again on rework
    const restartReq = {
      user: { collegeId: 'WRK301', name: 'Bob Worker', role: 'worker', department: 'Electrical' },
      params: { id: createdComplaint.id },
      body: { status: 'IN_PROGRESS', note: 'Checking ground wire connection' }
    };
    await updateStatus(restartReq, {
      status(code) {
        assert.strictEqual(code, 200);
        return {
          json(d) { createdComplaint = d.complaint; }
        };
      }
    });
    assert.strictEqual(createdComplaint.status, 'IN_PROGRESS');

    // 8. Worker resubmits with NEW proof photo
    const resubmitReq = {
      user: { collegeId: 'WRK301', name: 'Bob Worker', role: 'worker', department: 'Electrical' },
      params: { id: createdComplaint.id },
      body: {
        status: 'WORK_COMPLETED',
        completionNotes: 'Secured ground connection. Fully tested for 15 minutes with steady light output.',
        completionPhotoUrl: 'https://example.com/fixed_bulb_grounded.jpg'
      }
    };
    await updateStatus(resubmitReq, {
      status(code) {
        assert.strictEqual(code, 200);
        return {
          json(d) { createdComplaint = d.complaint; }
        };
      }
    });
    assert.strictEqual(createdComplaint.status, 'WORK_COMPLETED');
    assert.strictEqual(createdComplaint.completionPhotoUrl, 'https://example.com/fixed_bulb_grounded.jpg');

    // 9. Admin approves work -> RESOLVED
    const approveReq = {
      user: { collegeId: 'ADM001', name: 'Campus Admin', role: 'admin' },
      params: { id: createdComplaint.id },
      body: { status: 'RESOLVED', note: 'Verified by Admin. Issue completely fixed.' }
    };
    await updateStatus(approveReq, {
      status(code) {
        assert.strictEqual(code, 200);
        return {
          json(d) { createdComplaint = d.complaint; }
        };
      }
    });
    assert.strictEqual(createdComplaint.status, 'RESOLVED');
    assert.ok(createdComplaint.resolvedAt);
    assert.strictEqual(createdComplaint.resolvedBy, 'ADM001');

    // Check status history preserves all previous steps
    const history = store.statusHistory.filter(h => h.complaintId === createdComplaint.id);
    assert.ok(history.length >= 7, 'History must contain all intermediate steps and rework iterations');
  });

  test('AUTH MODULE: Student registration, duplicate prevention, and login with bcrypt', async () => {
    const authService = require('../src/services/authService');

    const uniqueReg = 'STU' + Math.floor(10000 + Math.random() * 90000);
    const uniqueEmail = `test.${uniqueReg.toLowerCase()}@college.edu`;

    // 1. Register student
    const student = await authService.registerStudent({
      name: 'Rohan Sharma',
      registerNumber: uniqueReg,
      department: 'Mechanical Engineering',
      year: '2nd Year',
      email: uniqueEmail,
      phone: '9876543219',
      password: 'mypassword123',
      confirmPassword: 'mypassword123'
    });

    assert.ok(student);
    assert.strictEqual(student.registerNumber, uniqueReg);
    assert.strictEqual(student.role, 'student');

    // 2. Duplicate registration attempt fails
    await assert.rejects(async () => {
      await authService.registerStudent({
        name: 'Another Student',
        registerNumber: uniqueReg,
        department: 'Civil Engineering',
        year: '1st Year',
        email: 'another@college.edu',
        phone: '9876543218',
        password: 'mypassword123'
      });
    }, /already registered/);

    // 3. Login with correct credentials & role
    const loggedIn = await authService.authenticateUser('student', uniqueReg, 'mypassword123');
    assert.ok(loggedIn);
    assert.strictEqual(loggedIn.email, uniqueEmail);

    // 4. Role mismatch rejection
    await assert.rejects(async () => {
      await authService.authenticateUser('worker', uniqueReg, 'mypassword123');
    }, /switch your role selection/);
  });

  test('AUTH MODULE: Staff registration and Worker predefined authentication', async () => {
    const authService = require('../src/services/authService');
    const { registerUnified } = require('../src/controllers/authController');

    // 1. Staff registration
    const uniqueStaffId = 'STF' + Math.floor(1000 + Math.random() * 9000);
    const staff = await authService.registerStaff({
      name: 'Dr. Anita Roy',
      staffId: uniqueStaffId,
      department: 'Chemistry',
      designation: 'Assistant Professor',
      email: `${uniqueStaffId.toLowerCase()}@college.edu`,
      phone: '9123456780',
      password: 'staffpassword123',
      confirmPassword: 'staffpassword123'
    });
    assert.ok(staff);
    assert.strictEqual(staff.role, 'staff');

    // 2. Worker registration is blocked
    await assert.rejects(async () => {
      await authService.registerWorker({
        name: 'Suresh Kumar',
        workerId: 'WRK999',
        password: 'workerpassword123'
      });
    }, /Worker registration is disabled/);

    let workerRegStatusCode = null;
    let workerRegData = null;
    await registerUnified({
      body: { role: 'worker', workerId: 'WRK999', password: 'workerpassword123' }
    }, {
      status(code) {
        workerRegStatusCode = code;
        return { json(d) { workerRegData = d; } };
      }
    });
    assert.strictEqual(workerRegStatusCode, 403);
    assert.ok(workerRegData.error.includes('Worker accounts cannot register'));

    // 3. Predefined Worker logs in successfully with Worker ID and Password
    const worker1 = await authService.authenticateUser('worker', 'WRK301', 'worker123');
    assert.ok(worker1);
    assert.strictEqual(worker1.role, 'worker');
    assert.strictEqual(worker1.workerId, 'WRK301');
    assert.strictEqual(worker1.department, 'Electrical');

    // 4. Predefined Workers across all 6 departments (Electrical, Plumbing, Facilities, IT Support, Carpentry, Sanitation) log in successfully
    const worker2 = await authService.authenticateUser('worker', 'WRK302', 'worker123');
    assert.strictEqual(worker2.workerId, 'WRK302');
    assert.strictEqual(worker2.department, 'Plumbing');

    const worker3 = await authService.authenticateUser('worker', 'WRK303', 'worker123');
    assert.strictEqual(worker3.workerId, 'WRK303');
    assert.strictEqual(worker3.department, 'Facilities');

    const worker4 = await authService.authenticateUser('worker', 'WRK304', 'worker123');
    assert.strictEqual(worker4.workerId, 'WRK304');
    assert.strictEqual(worker4.department, 'IT Support');

    const worker5 = await authService.authenticateUser('worker', 'WRK305', 'worker123');
    assert.strictEqual(worker5.workerId, 'WRK305');
    assert.strictEqual(worker5.department, 'Carpentry');

    const worker6 = await authService.authenticateUser('worker', 'WRK306', 'worker123');
    assert.strictEqual(worker6.workerId, 'WRK306');
    assert.strictEqual(worker6.department, 'Sanitation');

    // 5. Worker login with wrong password throws 'Invalid Worker ID or Password'
    await assert.rejects(async () => {
      await authService.authenticateUser('worker', 'WRK301', 'wrongpass');
    }, /Invalid Worker ID or Password/);

    // 6. Worker login with unknown Worker ID throws 'Invalid Worker ID or Password'
    await assert.rejects(async () => {
      await authService.authenticateUser('worker', 'WRK99999', 'worker123');
    }, /Invalid Worker ID or Password/);
  });

  test('AUTH MODULE: Predefined Admin cannot register and logs in successfully', async () => {
    const authService = require('../src/services/authService');
    const { registerUnified } = require('../src/controllers/authController');

    // Admin registration attempt must be forbidden
    let statusCode = null;
    let responseData = null;
    await registerUnified({
      body: { role: 'admin', email: 'fakeadmin@college.edu', password: 'password123' }
    }, {
      status(code) {
        statusCode = code;
        return { json(d) { responseData = d; } };
      }
    });
    assert.strictEqual(statusCode, 403);
    assert.ok(responseData.error.includes('Admin cannot register'));

    // Admin logs in with predefined credentials
    const admin = await authService.authenticateUser('admin', 'ADM001', 'admin123');
    assert.ok(admin);
    assert.strictEqual(admin.role, 'admin');
    assert.strictEqual(admin.email, 'admin@college.edu');
  });

  test('FEEDBACK MODULE: Student can submit feedback for RESOLVED complaint with rating, comment, and worker association', async () => {
    const { submitFeedback } = require('../src/controllers/feedbackController');
    const { getComplaintById, getComplaints } = require('../src/controllers/complaintController');

    // 1. Create a resolved complaint in the store
    const testComplaint = {
      id: 'cmp_test_resolved_fb_' + Date.now(),
      referenceId: 'CMP-202609-FB01',
      title: 'Water filter broken',
      category: 'Plumbing',
      location: 'Block A, 1st Floor',
      description: 'Water dispenser not cooling',
      status: 'RESOLVED',
      submitter: {
        collegeId: 'STU101',
        name: 'Alice Johnson',
        email: 'alice@college.edu',
        role: 'student'
      },
      assignedDepartment: 'Plumbing',
      assignedWorker: {
        collegeId: 'WRK302',
        name: 'Charlie Worker'
      },
      resolvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    store.complaints.push(testComplaint);

    // 2. Reject feedback if complaint is NOT resolved
    const inProgressComplaint = {
      id: 'cmp_test_inprog_fb_' + Date.now(),
      referenceId: 'CMP-202609-FB02',
      title: 'Fan malfunctioning',
      category: 'Electrical',
      location: 'Block B, 202',
      status: 'IN_PROGRESS',
      submitter: {
        collegeId: 'STU101',
        name: 'Alice Johnson',
        email: 'alice@college.edu',
        role: 'student'
      },
      assignedDepartment: 'Electrical',
      assignedWorker: {
        collegeId: 'WRK301',
        name: 'Bob Worker'
      },
      createdAt: new Date().toISOString()
    };
    store.complaints.push(inProgressComplaint);

    let statusCode = null;
    let resData = null;
    const mockRes = () => ({
      status(code) {
        statusCode = code;
        return { json(d) { resData = d; } };
      }
    });

    await submitFeedback({
      user: { collegeId: 'STU101', name: 'Alice Johnson', role: 'student', email: 'alice@college.edu' },
      params: { id: inProgressComplaint.id },
      body: { rating: 5, comment: 'Premature feedback' }
    }, mockRes());
    assert.strictEqual(statusCode, 400);
    assert.ok(resData.error.includes('Feedback can only be submitted for Resolved complaints'));

    // 3. Reject feedback if non-submitter tries to submit
    await submitFeedback({
      user: { collegeId: 'STU999', name: 'Imposter Student', role: 'student', email: 'imposter@college.edu' },
      params: { id: testComplaint.id },
      body: { rating: 5, comment: 'Nice work' }
    }, mockRes());
    assert.strictEqual(statusCode, 403);
    assert.ok(resData.error.includes('Forbidden: Only the original submitter'));

    // 4. Reject feedback with invalid rating
    await submitFeedback({
      user: { collegeId: 'STU101', name: 'Alice Johnson', role: 'student', email: 'alice@college.edu' },
      params: { id: testComplaint.id },
      body: { rating: 0, comment: 'Invalid star' }
    }, mockRes());
    assert.strictEqual(statusCode, 400);

    // 5. Successful submission by submitter
    await submitFeedback({
      user: { collegeId: 'STU101', name: 'Alice Johnson', role: 'student', email: 'alice@college.edu' },
      params: { id: testComplaint.id },
      body: { rating: 5, comment: 'Quick fix and excellent service by Charlie!' }
    }, mockRes());
    assert.strictEqual(statusCode, 201);
    assert.strictEqual(resData.success, true);
    assert.ok(resData.feedback);
    assert.strictEqual(resData.feedback.rating, 5);
    assert.strictEqual(resData.feedback.comment, 'Quick fix and excellent service by Charlie!');
    assert.strictEqual(resData.feedback.workerCollegeId, 'WRK302');
    assert.strictEqual(resData.feedback.workerName, 'Charlie Worker');
    assert.strictEqual(resData.feedback.department, 'Plumbing');
    assert.strictEqual(resData.feedback.submitterCollegeId, 'STU101');

    // 6. Verify complaint returned by getComplaintById has feedback attached
    let getByIdData = null;
    await getComplaintById({
      params: { id: testComplaint.id }
    }, {
      status(code) { return { json(d) { getByIdData = d; } }; }
    });
    assert.ok(getByIdData.feedback);
    assert.strictEqual(getByIdData.feedback.rating, 5);
    assert.strictEqual(getByIdData.complaint.feedback.workerName, 'Charlie Worker');

    // 7. Verify Worker sees this feedback when worker fetches complaints
    let workerComplaintsData = null;
    await getComplaints({
      user: { role: 'worker', collegeId: 'WRK302', department: 'Plumbing' },
      query: { status: 'RESOLVED' }
    }, {
      status(code) { return { json(d) { workerComplaintsData = d; } }; }
    });
    const found = workerComplaintsData.complaints.find(c => c.id === testComplaint.id);
    assert.ok(found);
    assert.ok(found.feedback);
    assert.strictEqual(found.feedback.rating, 5);
  });
});

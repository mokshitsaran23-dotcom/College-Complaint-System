const bcrypt = require('bcryptjs');
const { Student, Staff, Worker, Admin } = require('../models');
const { mongoose } = require('../config/db');

// In-memory fallback stores for when MongoDB is disconnected
const inMemoryStore = {
  students: [],
  staff: [],
  workers: [],
  admins: []
};

// Seed predefined admin & demo accounts
let hasSeeded = false;

async function seedDefaultAccounts() {
  if (hasSeeded) return;

  const adminHash = await bcrypt.hash('admin123', 10);
  const studentHash = await bcrypt.hash('student123', 10);
  const staffHash = await bcrypt.hash('staff123', 10);
  const workerHash = await bcrypt.hash('worker123', 10);

  // Default Admin (Cannot register, predefined)
  const defaultAdmin = {
    name: 'Campus Director (Admin)',
    adminId: 'ADM001',
    collegeId: 'ADM001',
    email: 'admin@college.edu',
    password: adminHash,
    role: 'admin',
    department: 'Facilities Management'
  };

  // Default Student Demo
  const defaultStudent = {
    name: 'Jane Doe',
    registerNumber: 'STU101',
    collegeId: 'STU101',
    department: 'Computer Science',
    year: '3rd Year',
    email: 'jane.doe@college.edu',
    phone: '9876543210',
    password: studentHash,
    role: 'student'
  };

  // Default Staff Demo
  const defaultStaff = {
    name: 'Prof. Mike Sparks',
    staffId: 'STF201',
    collegeId: 'STF201',
    department: 'Electrical Engineering',
    designation: 'Associate Professor',
    email: 'mike.sparks@college.edu',
    phone: '9876543211',
    password: staffHash,
    role: 'staff'
  };

  // Default Worker Demo 1 (Electrical)
  const defaultWorker = {
    name: 'Bob Worker (Electrical Crew)',
    workerId: 'WRK301',
    collegeId: 'WRK301',
    category: 'Electrical',
    department: 'Electrical',
    phone: '9876543212',
    email: 'bob.worker@college.edu',
    password: workerHash,
    role: 'worker'
  };

  // Default Worker Demo 2 (Plumbing)
  const defaultWorker2 = {
    name: 'Charlie Worker (Plumbing Crew)',
    workerId: 'WRK302',
    collegeId: 'WRK302',
    category: 'Plumbing',
    department: 'Plumbing',
    phone: '9876543213',
    email: 'charlie.worker@college.edu',
    password: workerHash,
    role: 'worker'
  };

  // Default Worker Demo 3 (Facilities)
  const defaultWorker3 = {
    name: 'David Worker (Facilities Crew)',
    workerId: 'WRK303',
    collegeId: 'WRK303',
    category: 'Facilities',
    department: 'Facilities',
    phone: '9876543214',
    email: 'david.worker@college.edu',
    password: workerHash,
    role: 'worker'
  };

  // Default Worker Demo 4 (IT Support)
  const defaultWorker4 = {
    name: 'Alex Tech (IT Support Crew)',
    workerId: 'WRK304',
    collegeId: 'WRK304',
    category: 'IT Support',
    department: 'IT Support',
    phone: '9876543215',
    email: 'alex.tech@college.edu',
    password: workerHash,
    role: 'worker'
  };

  // Default Worker Demo 5 (Carpentry)
  const defaultWorker5 = {
    name: 'Edward Carpenter (Carpentry Crew)',
    workerId: 'WRK305',
    collegeId: 'WRK305',
    category: 'Carpentry',
    department: 'Carpentry',
    phone: '9876543216',
    email: 'edward.carpenter@college.edu',
    password: workerHash,
    role: 'worker'
  };

  // Default Worker Demo 6 (Sanitation)
  const defaultWorker6 = {
    name: 'Sam Cleaner (Sanitation Crew)',
    workerId: 'WRK306',
    collegeId: 'WRK306',
    category: 'Sanitation',
    department: 'Sanitation',
    phone: '9876543217',
    email: 'sam.cleaner@college.edu',
    password: workerHash,
    role: 'worker'
  };

  // Seed MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const existingAdmin = await Admin.findOne({
        $or: [{ adminId: 'ADM001' }, { email: 'admin@college.edu' }]
      });
      if (!existingAdmin) {
        await Admin.create(defaultAdmin);
        console.log('🛡️ [AuthService] Predefined Admin ADM001 seeded into MongoDB');
      }

      const existingStudent = await Student.findOne({ registerNumber: 'STU101' });
      if (!existingStudent) {
        await Student.create(defaultStudent);
      }

      const existingStaff = await Staff.findOne({ staffId: 'STF201' });
      if (!existingStaff) {
        await Staff.create(defaultStaff);
      }

      const defaultWorkersList = [
        defaultWorker,
        defaultWorker2,
        defaultWorker3,
        defaultWorker4,
        defaultWorker5,
        defaultWorker6
      ];

      for (const dw of defaultWorkersList) {
        const existingW = await Worker.findOne({ workerId: dw.workerId });
        if (!existingW) {
          await Worker.create(dw);
        } else {
          existingW.name = dw.name;
          existingW.category = dw.category;
          existingW.department = dw.department;
          existingW.password = workerHash;
          await existingW.save();
        }
      }
    } catch (err) {
      console.warn('⚠️ [AuthService] MongoDB seed error:', err.message);
    }
  }

  // Also seed in-memory store
  if (!inMemoryStore.admins.some(a => a.adminId === 'ADM001')) {
    inMemoryStore.admins.push(defaultAdmin);
  }
  if (!inMemoryStore.students.some(s => s.registerNumber === 'STU101')) {
    inMemoryStore.students.push(defaultStudent);
  }
  if (!inMemoryStore.staff.some(s => s.staffId === 'STF201')) {
    inMemoryStore.staff.push(defaultStaff);
  }

  const allWorkers = [defaultWorker, defaultWorker2, defaultWorker3, defaultWorker4, defaultWorker5, defaultWorker6];
  for (const w of allWorkers) {
    if (!inMemoryStore.workers.some(existing => existing.workerId === w.workerId)) {
      inMemoryStore.workers.push(w);
    }
  }

  hasSeeded = true;
}

// Check duplicate ID/Email across all tables
async function checkDuplicate(email, idField, idValue) {
  const normEmail = (email || '').trim().toLowerCase();
  const normId = (idValue || '').trim().toUpperCase();

  const isMongo = mongoose.connection.readyState === 1;

  if (isMongo) {
    const [stu, stf, wrk, adm] = await Promise.all([
      Student.findOne({ $or: [{ email: normEmail }, { registerNumber: normId }] }),
      Staff.findOne({ $or: [{ email: normEmail }, { staffId: normId }] }),
      Worker.findOne({ $or: [{ email: normEmail }, { workerId: normId }] }),
      Admin.findOne({ $or: [{ email: normEmail }, { adminId: normId }] })
    ]);

    if (stu) return { isDuplicate: true, role: 'student', field: stu.email === normEmail ? 'Email' : 'Register Number' };
    if (stf) return { isDuplicate: true, role: 'staff', field: stf.email === normEmail ? 'Email' : 'Staff ID' };
    if (wrk) return { isDuplicate: true, role: 'worker', field: wrk.email === normEmail ? 'Email' : 'Worker ID' };
    if (adm) return { isDuplicate: true, role: 'admin', field: adm.email === normEmail ? 'Email' : 'Admin ID' };
  } else {
    for (const s of inMemoryStore.students) {
      if (s.email === normEmail) return { isDuplicate: true, role: 'student', field: 'Email' };
      if (s.registerNumber === normId) return { isDuplicate: true, role: 'student', field: 'Register Number' };
    }
    for (const s of inMemoryStore.staff) {
      if (s.email === normEmail) return { isDuplicate: true, role: 'staff', field: 'Email' };
      if (s.staffId === normId) return { isDuplicate: true, role: 'staff', field: 'Staff ID' };
    }
    for (const w of inMemoryStore.workers) {
      if (w.email && w.email === normEmail) return { isDuplicate: true, role: 'worker', field: 'Email' };
      if (w.workerId === normId) return { isDuplicate: true, role: 'worker', field: 'Worker ID' };
    }
    for (const a of inMemoryStore.admins) {
      if (a.email === normEmail) return { isDuplicate: true, role: 'admin', field: 'Email' };
      if (a.adminId === normId) return { isDuplicate: true, role: 'admin', field: 'Admin ID' };
    }
  }

  return { isDuplicate: false };
}

// 1. Student Registration
async function registerStudent(data) {
  await seedDefaultAccounts();
  const { name, registerNumber, department, year, email, phone, password, confirmPassword } = data || {};

  if (!name || !registerNumber || !department || !year || !email || !phone || !password) {
    throw new Error('All student registration fields are required.');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  if (confirmPassword && password !== confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  const dup = await checkDuplicate(email, 'registerNumber', registerNumber);
  if (dup.isDuplicate) {
    throw new Error(`${dup.field} is already registered with an existing ${dup.role} account.`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const studentDoc = {
    name: name.trim(),
    registerNumber: registerNumber.trim().toUpperCase(),
    collegeId: registerNumber.trim().toUpperCase(),
    department: department.trim(),
    year: year.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    password: hashedPassword,
    role: 'student'
  };

  let savedStudent;
  if (mongoose.connection.readyState === 1) {
    savedStudent = await Student.create(studentDoc);
  } else {
    savedStudent = { ...studentDoc, _id: 'stu_' + Date.now() };
  }
  inMemoryStore.students.push(savedStudent);

  const { password: _, ...userProfile } = (savedStudent.toObject ? savedStudent.toObject() : savedStudent);
  return userProfile;
}

// 2. Staff Registration
async function registerStaff(data) {
  await seedDefaultAccounts();
  const { name, staffId, department, designation, email, phone, password, confirmPassword } = data || {};

  if (!name || !staffId || !department || !designation || !email || !phone || !password) {
    throw new Error('All staff registration fields are required.');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  if (confirmPassword && password !== confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  const dup = await checkDuplicate(email, 'staffId', staffId);
  if (dup.isDuplicate) {
    throw new Error(`${dup.field} is already registered with an existing ${dup.role} account.`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const staffDoc = {
    name: name.trim(),
    staffId: staffId.trim().toUpperCase(),
    collegeId: staffId.trim().toUpperCase(),
    department: department.trim(),
    designation: designation.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    password: hashedPassword,
    role: 'staff'
  };

  let savedStaff;
  if (mongoose.connection.readyState === 1) {
    savedStaff = await Staff.create(staffDoc);
  } else {
    savedStaff = { ...staffDoc, _id: 'stf_' + Date.now() };
  }
  inMemoryStore.staff.push(savedStaff);

  const { password: _, ...userProfile } = (savedStaff.toObject ? savedStaff.toObject() : savedStaff);
  return userProfile;
}

// 3. Worker Registration (Disabled - Workers cannot register)
async function registerWorker() {
  throw new Error('Worker registration is disabled. Worker accounts are pre-created and assigned by Administration.');
}

// 4. Role-Validated Authentication
async function authenticateUser(role, identifier, password) {
  await seedDefaultAccounts();

  if (!role) {
    throw new Error('Please select a role (Student, Staff, Worker, or Admin).');
  }
  if (!identifier || !password) {
    throw new Error(role.toLowerCase() === 'worker' ? 'Worker ID and password are required.' : 'Email/ID and password are required.');
  }

  const targetRole = role.toLowerCase().trim();
  const cleanId = identifier.trim();
  const isEmail = cleanId.includes('@');
  const queryField = isEmail ? 'email' : 'id';
  const cleanQueryVal = isEmail ? cleanId.toLowerCase() : cleanId.toUpperCase();

  const isMongo = mongoose.connection.readyState === 1;

  let user = null;

  // Query specific model according to the selected role
  if (targetRole === 'student') {
    if (isMongo) {
      user = await Student.findOne(isEmail ? { email: cleanQueryVal } : { registerNumber: cleanQueryVal });
    } else {
      user = inMemoryStore.students.find(s => isEmail ? s.email === cleanQueryVal : s.registerNumber === cleanQueryVal || s.collegeId === cleanQueryVal);
    }
  } else if (targetRole === 'staff') {
    if (isMongo) {
      user = await Staff.findOne(isEmail ? { email: cleanQueryVal } : { staffId: cleanQueryVal });
    } else {
      user = inMemoryStore.staff.find(s => isEmail ? s.email === cleanQueryVal : s.staffId === cleanQueryVal || s.collegeId === cleanQueryVal);
    }
  } else if (targetRole === 'worker') {
    if (isMongo) {
      user = await Worker.findOne(isEmail ? { email: cleanQueryVal } : { workerId: cleanQueryVal });
    } else {
      user = inMemoryStore.workers.find(w => isEmail ? w.email === cleanQueryVal : w.workerId === cleanQueryVal || w.collegeId === cleanQueryVal);
    }
  } else if (targetRole === 'admin') {
    if (isMongo) {
      user = await Admin.findOne(isEmail ? { email: cleanQueryVal } : { adminId: cleanQueryVal });
    } else {
      user = inMemoryStore.admins.find(a => isEmail ? a.email === cleanQueryVal : a.adminId === cleanQueryVal || a.collegeId === cleanQueryVal);
    }
  } else {
    throw new Error(`Invalid role '${role}'. Must be Student, Staff, Worker, or Admin.`);
  }

  // Cross-role verification: If not found in selected role, check if registered under a DIFFERENT role!
  if (!user) {
    const dupCheck = await checkDuplicate(cleanQueryVal, 'id', cleanQueryVal);
    if (dupCheck.isDuplicate) {
      const correctRole = dupCheck.role.charAt(0).toUpperCase() + dupCheck.role.slice(1);
      throw new Error(`Account found, but it is registered as '${correctRole}'. Please switch your role selection to '${correctRole}' to log in.`);
    }
    if (targetRole === 'worker') {
      throw new Error('Invalid Worker ID or Password');
    }
    throw new Error(`Invalid credentials for ${role}. No ${role} account found matching '${cleanId}'.`);
  }

  // Password verification
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    if (targetRole === 'worker') {
      throw new Error('Invalid Worker ID or Password');
    }
    throw new Error('Invalid password. Please verify your credentials.');
  }

  const rawUser = user.toObject ? user.toObject() : user;
  const { password: _, ...profile } = rawUser;

  // Normalize collegeId
  if (!profile.collegeId) {
    profile.collegeId = profile.registerNumber || profile.staffId || profile.workerId || profile.adminId;
  }

  return profile;
}

module.exports = {
  seedDefaultAccounts,
  registerStudent,
  registerStaff,
  registerWorker,
  authenticateUser,
  checkDuplicate,
  inMemoryStore
};

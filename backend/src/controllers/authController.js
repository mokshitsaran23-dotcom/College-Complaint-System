const authService = require('../services/authService');
const { sign } = require('../config/jwt');

async function login(req, res) {
  try {
    const { role, identifier, emailOrId, collegeId, password } = req.body || {};
    const inputIdentifier = identifier || emailOrId || collegeId;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Please select your role (Student, Staff, Worker, or Admin).'
      });
    }

    if (!inputIdentifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email or ID and password are required.'
      });
    }

    const user = await authService.authenticateUser(role, inputIdentifier, password);

    const token = sign({
      id: user._id,
      collegeId: user.collegeId,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    });

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: err.message || 'Authentication failed'
    });
  }
}

async function registerStudent(req, res) {
  try {
    const user = await authService.registerStudent(req.body);
    return res.status(201).json({
      success: true,
      message: 'Student registered successfully! You can now sign in with your credentials.',
      user
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Student registration failed'
    });
  }
}

async function registerStaff(req, res) {
  try {
    const user = await authService.registerStaff(req.body);
    return res.status(201).json({
      success: true,
      message: 'Staff registered successfully! You can now sign in with your credentials.',
      user
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Staff registration failed'
    });
  }
}

async function registerWorker(req, res) {
  return res.status(403).json({
    success: false,
    error: 'Worker accounts cannot register. Worker accounts are assigned and managed by Administration.'
  });
}

async function registerUnified(req, res) {
  const { role } = req.body || {};
  if (!role) {
    return res.status(400).json({ success: false, error: 'Role is required for registration.' });
  }

  const r = role.toLowerCase().trim();
  if (r === 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin cannot register. Admin accounts are predefined and managed by the institution.'
    });
  }

  if (r === 'worker') {
    return res.status(403).json({
      success: false,
      error: 'Worker accounts cannot register. Worker accounts are assigned and managed by Administration.'
    });
  }

  if (r === 'student') return registerStudent(req, res);
  if (r === 'staff') return registerStaff(req, res);

  return res.status(400).json({ success: false, error: `Invalid registration role '${role}'.` });
}

async function getMe(req, res) {
  return res.status(200).json({ success: true, user: req.user });
}

module.exports = {
  login,
  registerUnified,
  registerStudent,
  registerStaff,
  registerWorker,
  getMe
};

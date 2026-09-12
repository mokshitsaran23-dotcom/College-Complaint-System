const idpService = require('../services/idpService');
const { sign } = require('../config/jwt');

async function login(req, res) {
  const { collegeId, password } = req.body || {};
  if (!collegeId || !password) {
    return res.status(400).json({ success: false, error: 'College ID and password are required.' });
  }

  const user = await idpService.authenticate(collegeId, password);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid college credentials. Access denied.' });
  }

  const token = sign({
    collegeId: user.collegeId,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department
  });

  return res.status(200).json({
    success: true,
    token,
    user
  });
}

async function getMe(req, res) {
  return res.status(200).json({ success: true, user: req.user });
}

async function getDemoUsers(req, res) {
  return res.status(200).json({ success: true, users: idpService.getDemoAccounts() });
}

module.exports = { login, getMe, getDemoUsers };

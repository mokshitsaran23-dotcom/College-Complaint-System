const { getUserNotifications, notificationHistory } = require('../services/notificationService');

async function getNotifications(req, res) {
  const user = req.user;
  const list = getUserNotifications(user.collegeId, user.role, user.department);
  return res.status(200).json({
    success: true,
    notifications: list
  });
}

async function markAsRead(req, res) {
  const { id } = req.params;
  const found = notificationHistory.find(n => n.id === id);
  if (found) {
    found.read = true;
  }
  return res.status(200).json({ success: true });
}

async function markAllAsRead(req, res) {
  const user = req.user;
  const userColId = (user.collegeId || '').toUpperCase();
  const userRole = (user.role || '').toLowerCase();
  const userDept = user.department;

  notificationHistory.forEach(n => {
    const isForUser = (n.recipient && n.recipient.toUpperCase() === userColId) ||
                      (n.recipientRole && n.recipientRole.toLowerCase() === userRole) ||
                      (n.recipientDept && n.recipientDept === userDept) ||
                      (!n.recipient && !n.recipientRole && !n.recipientDept);
    if (isForUser) {
      n.read = true;
    }
  });
  return res.status(200).json({ success: true });
}

module.exports = { getNotifications, markAsRead, markAllAsRead };

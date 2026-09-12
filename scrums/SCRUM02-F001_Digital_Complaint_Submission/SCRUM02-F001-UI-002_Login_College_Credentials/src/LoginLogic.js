/**
 * Logic for college credentials login (SCRUM02-F001-UI-002)
 */
async function authenticateUser(collegeId, password, authService = null) {
  if (!collegeId || !collegeId.trim()) {
    return { success: false, error: "College ID is required" };
  }
  if (!password || !password.trim()) {
    return { success: false, error: "Password is required" };
  }

  const service = authService || {
    login: async (id, pwd) => {
      // Mock IdP check
      if (id === 'STU101' && pwd === 'student123') {
        return {
          status: 200,
          data: {
            token: 'mock-jwt-token-stu101',
            user: { collegeId: 'STU101', name: 'Jane Doe', role: 'student' }
          }
        };
      }
      throw { status: 401, error: 'Invalid college credentials. Access denied.' };
    }
  };

  try {
    const res = await service.login(collegeId, password);
    const role = res.data.user.role;
    let redirectUrl = '/dashboard';
    if (role === 'student') redirectUrl = '/student/dashboard';
    else if (role === 'admin') redirectUrl = '/admin/queue';
    else if (role === 'staff') redirectUrl = '/staff/assigned';

    return {
      success: true,
      token: res.data.token,
      user: res.data.user,
      redirectUrl
    };
  } catch (err) {
    return {
      success: false,
      error: err.error || 'Authentication failed'
    };
  }
}

module.exports = { authenticateUser };

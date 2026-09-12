const jwt = require('./jwtHelper');

const JWT_SECRET = process.env.JWT_SECRET || 'college-auth-secret-key-2026';

class CollegeIdentityProvider {
  constructor(users = null) {
    this.directory = users || [
      { collegeId: 'STU101', password: 'student123', name: 'Jane Doe', email: 'jane.doe@college.edu', role: 'student', department: null },
      { collegeId: 'ADM001', password: 'admin123', name: 'Campus Admin', email: 'admin@college.edu', role: 'admin', department: 'Facilities' },
      { collegeId: 'STF201', password: 'staff123', name: 'Mike Sparks', email: 'mike@college.edu', role: 'staff', department: 'Electrical' }
    ];
  }

  async verifyCredentials(collegeId, password) {
    const matched = this.directory.find(u => u.collegeId === collegeId && u.password === password);
    if (!matched) return null;
    const { password: _, ...userProfile } = matched;
    return userProfile;
  }
}

class AuthService {
  constructor(idp = new CollegeIdentityProvider(), secret = JWT_SECRET) {
    this.idp = idp;
    this.secret = secret;
  }

  async login(collegeId, password) {
    const user = await this.idp.verifyCredentials(collegeId, password);
    if (!user) {
      throw new Error('Invalid college credentials');
    }

    const token = jwt.sign(
      {
        collegeId: user.collegeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      },
      this.secret
    );

    return { token, user };
  }

  verifyToken(token) {
    return jwt.verify(token, this.secret);
  }
}

module.exports = { CollegeIdentityProvider, AuthService, JWT_SECRET, jwt };

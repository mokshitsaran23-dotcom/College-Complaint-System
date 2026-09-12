/**
 * Stubbed Institutional Identity Provider (LDAP / SSO Integration Service)
 * In accordance with SCRUM02-F001-BE-002:
 * Simulates integration with the college's directory service.
 */

const demoCollegeDirectory = [
  {
    collegeId: 'STU101',
    password: 'student123',
    name: 'Jane Doe',
    email: 'jane.doe@college.edu',
    role: 'student',
    department: null,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  {
    collegeId: 'STU102',
    password: 'student123',
    name: 'Alex Smith',
    email: 'alex.smith@college.edu',
    role: 'student',
    department: null,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    collegeId: 'ADM001',
    password: 'admin123',
    name: 'Campus Director (Admin)',
    email: 'facilities.admin@college.edu',
    role: 'admin',
    department: 'Facilities Management',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    collegeId: 'STF201',
    password: 'staff123',
    name: 'Mike Sparks (Lead Electrician)',
    email: 'mike.sparks@college.edu',
    role: 'staff',
    department: 'Electrical',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    collegeId: 'STF202',
    password: 'staff123',
    name: 'Dave Plumber',
    email: 'dave.plumber@college.edu',
    role: 'staff',
    department: 'Plumbing',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
  },
  {
    collegeId: 'STF203',
    password: 'staff123',
    name: 'Sarah Byte (Network Tech)',
    email: 'sarah.byte@college.edu',
    role: 'staff',
    department: 'IT Support',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  }
];

class CollegeIdentityProvider {
  async authenticate(collegeId, password) {
    if (!collegeId || !password) return null;
    const user = demoCollegeDirectory.find(
      u => u.collegeId.toUpperCase() === collegeId.toUpperCase() && u.password === password
    );
    if (!user) return null;
    const { password: _, ...profile } = user;
    return profile;
  }

  async findByCollegeId(collegeId) {
    const user = demoCollegeDirectory.find(u => u.collegeId.toUpperCase() === collegeId.toUpperCase());
    if (!user) return null;
    const { password: _, ...profile } = user;
    return profile;
  }

  getDemoAccounts() {
    return demoCollegeDirectory.map(({ password: _, ...profile }) => profile);
  }
}

module.exports = new CollegeIdentityProvider();

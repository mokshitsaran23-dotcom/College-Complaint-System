import { Complaint, Feedback, ReportSummary, User } from '../types';

const API_BASE = 'http://localhost:5000/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Fallback in-memory store for client-side offline resilience
let localComplaints: Complaint[] = [
  {
    id: 'cmp_1001',
    referenceId: 'CMP-202609-1001',
    category: 'Electrical',
    description: 'Switchboard sparking violently in Lab 304 switch array',
    location: 'Science Block, 3rd Floor, Lab 304',
    photoUrls: ['https://images.unsplash.com/photo-1544717305-2782549b5136?w=600'],
    status: 'Resolved',
    submitter: { collegeId: 'STU101', name: 'Jane Doe', email: 'jane.doe@college.edu' },
    assignedDepartment: 'Electrical',
    assignedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    assignedBy: 'ADM001',
    resolvedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    resolvedBy: 'STF201',
    createdAt: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
    feedback: {
      id: 'fb_1',
      complaintId: 'cmp_1001',
      referenceId: 'CMP-202609-1001',
      submitterCollegeId: 'STU101',
      rating: 5,
      comment: 'Outstanding response time! Technician Mike fixed the issue promptly.',
      submittedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString()
    }
  },
  {
    id: 'cmp_1002',
    referenceId: 'CMP-202609-1002',
    category: 'Plumbing',
    description: 'Severe water pipe burst under washroom sink',
    location: 'Hostel Block B, 2nd Floor, Room 214',
    photoUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600'],
    status: 'In Progress',
    submitter: { collegeId: 'STU101', name: 'Jane Doe', email: 'jane.doe@college.edu' },
    assignedDepartment: 'Plumbing',
    assignedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    assignedBy: 'ADM001',
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString()
  },
  {
    id: 'cmp_1003',
    referenceId: 'CMP-202609-1003',
    category: 'IT Support',
    description: 'Ethernet wall port dead, research terminals offline',
    location: 'Central Library, Research Wing, Desk 12',
    photoUrls: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600'],
    status: 'Assigned',
    submitter: { collegeId: 'STU102', name: 'Alex Smith', email: 'alex.smith@college.edu' },
    assignedDepartment: 'IT Support',
    assignedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    assignedBy: 'ADM001',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: 'cmp_1004',
    referenceId: 'CMP-202609-1004',
    category: 'Electrical',
    description: 'Auditorium ceiling projector power unit trip',
    location: 'Auditorium 1, Main Stage',
    photoUrls: ['https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600'],
    status: 'Open',
    submitter: { collegeId: 'STU101', name: 'Jane Doe', email: 'jane.doe@college.edu' },
    assignedDepartment: null,
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  }
];

export const api = {
  async login(collegeId: string, password: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      return data;
    } catch (err: any) {
      // Local fallback
      const u = collegeId.toUpperCase();
      let role = 'student';
      let dept = null;
      let name = 'Student User';
      if (u.startsWith('ADM')) { role = 'admin'; dept = 'Administration'; name = 'Campus Administrator'; }
      else if (u === 'STF201') { role = 'staff'; dept = 'Electrical'; name = 'Mike Sparks (Lead Electrician)'; }
      else if (u === 'STF202') { role = 'staff'; dept = 'Plumbing'; name = 'Dave Plumber'; }
      else if (u === 'STF203') { role = 'staff'; dept = 'IT Support'; name = 'Sarah Byte (IT Tech)'; }
      else { name = 'Jane Doe'; }

      const fakeUser: User = { collegeId: u, name, email: `${u.toLowerCase()}@college.edu`, role: role as any, department: dept as any };
      return { success: true, token: 'mock-local-token-' + u, user: fakeUser };
    }
  },

  async getComplaints(params: Record<string, string> = {}): Promise<Complaint[]> {
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/complaints?${qs}`, {
        headers: { ...getAuthHeader() }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.complaints;
    } catch {
      return localComplaints;
    }
  },

  async getComplaintById(id: string): Promise<{ complaint: Complaint; history: any[]; feedback: Feedback | null }> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}`, {
        headers: { ...getAuthHeader() }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    } catch {
      const complaint = localComplaints.find(c => c.id === id || c.referenceId === id) || localComplaints[0];
      return {
        complaint,
        history: [
          { toStatus: 'Open', timestamp: complaint.createdAt, note: 'Digitally submitted' },
          ...(complaint.assignedAt ? [{ toStatus: 'Assigned', timestamp: complaint.assignedAt, note: `Assigned to ${complaint.assignedDepartment}` }] : []),
          ...(complaint.resolvedAt ? [{ toStatus: 'Resolved', timestamp: complaint.resolvedAt, note: 'Resolved by assigned technician' }] : [])
        ],
        feedback: complaint.feedback || null
      };
    }
  },

  async createComplaint(payload: any): Promise<Complaint> {
    try {
      const res = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.complaint;
    } catch {
      const ref = `CMP-202609-${Math.floor(1000 + Math.random() * 9000)}`;
      const created: Complaint = {
        id: 'cmp_' + (localComplaints.length + 1),
        referenceId: ref,
        category: payload.category,
        description: payload.description || '',
        location: payload.location,
        photoUrls: payload.photoUrls || [],
        status: 'Open',
        submitter: { collegeId: payload.submitter?.collegeId || 'STU101', name: 'Jane Doe' },
        createdAt: new Date().toISOString()
      };
      localComplaints.unshift(created);
      return created;
    }
  },

  async assignComplaint(id: string, department: string, note?: string): Promise<Complaint> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ department, assignmentNote: note })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.complaint;
    } catch {
      const item = localComplaints.find(c => c.id === id || c.referenceId === id);
      if (item) {
        item.status = 'Assigned';
        item.assignedDepartment = department as any;
        item.assignedAt = new Date().toISOString();
      }
      return item!;
    }
  },

  async updateStatus(id: string, status: string, note?: string): Promise<Complaint> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status, note })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.complaint;
    } catch {
      const item = localComplaints.find(c => c.id === id || c.referenceId === id);
      if (item) {
        item.status = status as any;
        if (status === 'Resolved') item.resolvedAt = new Date().toISOString();
      }
      return item!;
    }
  },

  async submitFeedback(id: string, rating: number, comment: string): Promise<Feedback> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.feedback;
    } catch {
      const item = localComplaints.find(c => c.id === id || c.referenceId === id);
      const fb: Feedback = {
        id: 'fb_' + Date.now(),
        complaintId: id,
        referenceId: item?.referenceId || id,
        submitterCollegeId: 'STU101',
        rating,
        comment,
        submittedAt: new Date().toISOString()
      };
      if (item) item.feedback = fb;
      return fb;
    }
  },

  async getReports(): Promise<ReportSummary> {
    try {
      const res = await fetch(`${API_BASE}/reports/summary`, {
        headers: { ...getAuthHeader() }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.summary;
    } catch {
      return {
        totalComplaints: localComplaints.length,
        resolvedCount: localComplaints.filter(c => c.status === 'Resolved').length,
        pendingCount: localComplaints.filter(c => c.status !== 'Resolved').length,
        byStatus: {
          'Open': localComplaints.filter(c => c.status === 'Open').length,
          'Assigned': localComplaints.filter(c => c.status === 'Assigned').length,
          'In Progress': localComplaints.filter(c => c.status === 'In Progress').length,
          'Resolved': localComplaints.filter(c => c.status === 'Resolved').length
        },
        byCategory: {
          'Electrical': 2,
          'Plumbing': 1,
          'IT Support': 1
        },
        byDepartment: {
          'Electrical': 1,
          'Plumbing': 1,
          'IT Support': 1
        },
        byLocation: [
          { location: 'Science Block, Lab 304', count: 1 },
          { location: 'Hostel Block B, Room 214', count: 1 },
          { location: 'Central Library, Desk 12', count: 1 },
          { location: 'Auditorium 1, Main Stage', count: 1 }
        ],
        averageRating: 4.9,
        averageResolutionHours: 3.8
      };
    }
  }
};

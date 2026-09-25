import { Complaint, Feedback, ReportSummary, User, AppNotification } from '../types';

const API_BASE = 'http://localhost:5000/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  async login(roleOrIdentifier: string, identifierOrPassword?: string, maybePassword?: string) {
    let role = 'student';
    let identifier = '';
    let password = '';

    if (maybePassword !== undefined) {
      role = roleOrIdentifier;
      identifier = identifierOrPassword || '';
      password = maybePassword;
    } else {
      identifier = roleOrIdentifier;
      password = identifierOrPassword || '';
      const u = identifier.toUpperCase();
      if (u.startsWith('ADM')) role = 'admin';
      else if (u.startsWith('WRK')) role = 'worker';
      else if (u.startsWith('STF')) role = 'staff';
      else role = 'student';
    }

    let res: Response;
    try {
      res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, identifier, collegeId: identifier, password })
      });
    } catch {
      // Offline fallback only when backend is unreachable
      const u = identifier.toUpperCase();
      let fallbackRole = role || 'student';
      let dept: any = null;
      let name = 'Student User';
      if (fallbackRole === 'admin' || u.startsWith('ADM')) {
        fallbackRole = 'admin';
        dept = 'Facilities Management';
        name = 'Campus Administrator';
      } else if (fallbackRole === 'worker' || u.startsWith('WRK')) {
        fallbackRole = 'worker';
        if (u === 'WRK301') { dept = 'Electrical'; name = 'Bob Worker (Electrical Crew)'; }
        else if (u === 'WRK302') { dept = 'Plumbing'; name = 'Charlie Worker (Plumbing Crew)'; }
        else if (u === 'WRK303') { dept = 'Facilities'; name = 'David Worker (Facilities Crew)'; }
        else if (u === 'WRK304') { dept = 'IT Support'; name = 'Alex Tech (IT Support Crew)'; }
        else if (u === 'WRK305') { dept = 'Carpentry'; name = 'Edward Carpenter (Carpentry Crew)'; }
        else if (u === 'WRK306') { dept = 'Sanitation'; name = 'Sam Cleaner (Sanitation Crew)'; }
        else { dept = 'Facilities'; name = `Worker (${u})`; }
      } else if (fallbackRole === 'staff' || u.startsWith('STF')) {
        fallbackRole = 'staff';
        if (u === 'STF201') { dept = 'Electrical'; name = 'Prof. Mike Sparks'; }
        else if (u === 'STF202') { dept = 'Plumbing'; name = 'Dave Plumber (Staff Supervisor)'; }
        else if (u === 'STF203') { dept = 'IT Support'; name = 'Sarah Byte (Network Tech)'; }
        else { dept = 'Electrical'; name = `Staff (${u})`; }
      } else {
        name = u === 'STU101' ? 'Jane Doe' : `Student (${u})`;
      }
      if (u.startsWith('ADM')) { role = 'admin'; dept = 'Administration'; name = 'Campus Administrator'; }
      else if (u === 'WRK301') { role = 'worker'; dept = 'Electrical'; name = 'Bob Worker (Electrical Crew)'; }
      else if (u === 'WRK302') { role = 'worker'; dept = 'Plumbing'; name = 'Charlie Worker (Plumbing Crew)'; }
      else if (u === 'STF201') { role = 'staff'; dept = 'Electrical'; name = 'Mike Sparks (Staff Supervisor)'; }
      else if (u === 'STF202') { role = 'staff'; dept = 'Plumbing'; name = 'Dave Plumber (Staff Supervisor)'; }
      else if (u === 'STF203') { role = 'staff'; dept = 'IT Support'; name = 'Sarah Byte (IT Tech)'; }
      else { name = 'Jane Doe'; }

      const fakeUser: User = { collegeId: u, name, email: `${u.toLowerCase()}@college.edu`, role: fallbackRole as any, department: dept as any };
      return { success: true, token: 'mock-local-token-' + u, user: fakeUser };
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    return data;
  },

  async register(role: string, payload: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, ...payload })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    return data;
  },

  async getComplaints(params: Record<string, string> = {}): Promise<Complaint[]> {
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/complaints?${qs}`, {
        headers: { ...getAuthHeader() }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch complaints');
      return data.complaints;
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
      return [];
    }
  },

  async getComplaintById(id: string): Promise<{ complaint: Complaint; history: any[]; feedback: Feedback | null }> {
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Complaint not found');
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
          ...(complaint.pendingApprovalAt ? [{ toStatus: 'Pending Approval', timestamp: complaint.pendingApprovalAt, note: 'Work completed, pending Admin approval' }] : []),
          ...(complaint.resolvedAt ? [{ toStatus: 'Resolved', timestamp: complaint.resolvedAt, note: 'Resolution approved by Admin' }] : [])
        ],
        feedback: complaint.feedback || null
      };
    }
    return data;
  },

  async createComplaint(payload: any): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create complaint');
    }
    return data.complaint;
  },

  async reviewComplaint(id: string): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${id}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to mark under review');
    }
    return data.complaint;
  },

  async assignComplaint(
    id: string,
    department: string,
    workerId?: string,
    workerName?: string,
    note?: string
  ): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ department, workerId, workerName, assignmentNote: note })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Assignment failed');
    }
    return data.complaint;
  },

  async updateStatus(
    id: string,
    status: string,
    note?: string,
    completionPhotoUrl?: string,
    completionNotes?: string,
    reworkReason?: string
  ): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({
        status,
        note,
        completionPhotoUrl,
        completionNotes,
        reworkReason
      })
    });

    const data = await res.json();
    if (!res.ok) {
      // MUST throw backend validation errors directly so UI surfaces them!
      throw new Error(data.error || `Status update to ${status} failed`);
    }
    return data.complaint;
  },

  async startWork(id: string): Promise<Complaint> {
    return this.updateStatus(id, 'IN_PROGRESS', 'Worker started work operations.');
  },

  async submitCompletedWork(id: string, notes: string, proofPhotoUrl: string): Promise<Complaint> {
    // If proof photo is missing, throw immediate frontend error before request
    if (!proofPhotoUrl || !proofPhotoUrl.trim()) {
      throw new Error('Proof photo is required before submitting completed work.');
    }
    return this.updateStatus(
      id,
      'WORK_COMPLETED',
      notes || 'Work completed by technician with proof photo.',
      proofPhotoUrl,
      notes
    );
  },

  async approveWork(id: string, note?: string): Promise<Complaint> {
    return this.updateStatus(
      id,
      'RESOLVED',
      note || 'Work approved and resolution verified by Admin.'
    );
  },

  async requestRework(id: string, reason: string): Promise<Complaint> {
    if (!reason || !reason.trim()) {
      throw new Error('Please enter a rework reason explaining what needs to be fixed.');
    }
    return this.updateStatus(
      id,
      'REWORK_REQUIRED',
      reason.trim(),
      undefined,
      undefined,
      reason.trim()
    );
  },

  async getNotifications(): Promise<AppNotification[]> {
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { ...getAuthHeader() }
      });
      const data = await res.json();
      if (!res.ok) return [];
      return data.notifications || [];
    } catch {
      return [];
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { ...getAuthHeader() }
      });
    } catch {
      // ignore
    }
  },

  async markAllNotificationsRead(): Promise<void> {
  async updateStatus(id: string, status: string, note?: string, completionPhotoUrl?: string, completionNotes?: string): Promise<Complaint> {
    try {
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: { ...getAuthHeader() }
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status, note, completionPhotoUrl, completionNotes })
      });
    } catch {
      // ignore
      const item = localComplaints.find(c => c.id === id || c.referenceId === id);
      if (item) {
        item.status = status as any;
        if (completionPhotoUrl) item.completionPhotoUrl = completionPhotoUrl;
        if (completionNotes) item.completionNotes = completionNotes;
        if (status === 'Pending Approval') {
          item.pendingApprovalAt = new Date().toISOString();
        }
        if (status === 'Resolved') {
          item.resolvedAt = new Date().toISOString();
        }
      }
      return item!;
    }
  },

  async submitFeedback(id: string, rating: number, comment: string): Promise<Feedback> {
    const res = await fetch(`${API_BASE}/complaints/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ rating, comment })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit feedback');
    return data.feedback;
  },

  async getReports(): Promise<ReportSummary> {
    const res = await fetch(`${API_BASE}/reports/summary`, {
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch reports');
    return data.summary;
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
          'Pending Approval': localComplaints.filter(c => c.status === 'Pending Approval').length,
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

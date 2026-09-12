export type Role = 'student' | 'staff' | 'admin';

export type Department = 'Electrical' | 'Plumbing' | 'IT Support' | 'Carpentry' | 'Facilities' | 'Sanitation';

export type ComplaintStatus = 'Open' | 'Assigned' | 'In Progress' | 'Resolved';

export interface User {
  collegeId: string;
  name: string;
  email: string;
  role: Role;
  department?: Department | null;
  avatar?: string;
}

export interface Complaint {
  id: string;
  referenceId: string;
  category: string;
  description: string;
  location: string;
  photoUrls?: string[];
  status: ComplaintStatus;
  submitter: {
    collegeId: string;
    name?: string;
    email?: string;
  };
  assignedDepartment?: Department | null;
  assignedAt?: string;
  assignedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  feedback?: Feedback | null;
}

export interface StatusHistoryItem {
  id: string;
  complaintId: string;
  referenceId: string;
  fromStatus: ComplaintStatus | null;
  toStatus: ComplaintStatus;
  changedBy: string;
  changedByRole: Role;
  note: string;
  timestamp: string;
}

export interface Feedback {
  id: string;
  complaintId: string;
  referenceId: string;
  submitterCollegeId: string;
  rating: number; // 1 to 5
  comment: string;
  submittedAt: string;
}

export interface ReportSummary {
  totalComplaints: number;
  resolvedCount: number;
  pendingCount: number;
  byStatus: Record<ComplaintStatus, number>;
  byCategory: Record<string, number>;
  byDepartment: Record<string, number>;
  byLocation: Array<{ location: string; count: number }>;
  averageRating: number;
  averageResolutionHours: number;
}

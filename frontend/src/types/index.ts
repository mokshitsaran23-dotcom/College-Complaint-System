export type Role = 'student' | 'worker' | 'staff' | 'admin';

export type Department = 'Electrical' | 'Plumbing' | 'IT Support' | 'Carpentry' | 'Facilities' | 'Sanitation';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WORK_COMPLETED'
  | 'ADMIN_REVIEW'
  | 'REWORK_REQUIRED'
  | 'RESOLVED'
  // Legacy aliases
  | 'Open'
  | 'Pending Approval';

export interface User {
  collegeId: string;
  name: string;
  email: string;
  role: Role;
  department?: Department | null | string;
  avatar?: string;
  registerNumber?: string;
  staffId?: string;
  workerId?: string;
  adminId?: string;
  year?: string;
  designation?: string;
  category?: string;
  phone?: string;
}

export interface ProofSubmission {
  submissionNumber: number;
  workerCollegeId: string;
  workerName: string;
  notes: string;
  photoUrl: string;
  submittedAt: string;
  adminDecision?: string;
  adminReason?: string;
  reviewedAt?: string;
}

export interface Complaint {
  id: string;
  referenceId: string;
  title: string;
  category: string;
  description: string;
  location: string;
  photoUrls?: string[];
  completionPhotoUrl?: string;
  completionNotes?: string;
  status: ComplaintStatus;
  submitter: {
    collegeId: string;
    name?: string;
    email?: string;
    role?: Role;
  };
  assignedDepartment?: Department | null;
  assignedWorker?: {
    collegeId: string;
    name: string;
  } | null;
  assignedAt?: string;
  assignedBy?: string;
  underReviewAt?: string;
  pendingApprovalAt?: string;
  pendingApprovalBy?: string;
  completedAt?: string;
  completedBy?: string;
  reworkReason?: string;
  reworkRequestedAt?: string;
  reworkRequestedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  proofHistory?: ProofSubmission[];
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
  action?: string;
  note: string;
  proofPhotoUrl?: string;
  reworkReason?: string;
  timestamp: string;
}

export interface Feedback {
  id: string;
  complaintId: string;
  referenceId: string;
  submitterCollegeId: string;
  submitterName?: string;
  submitterRole?: Role;
  workerCollegeId?: string | null;
  workerName?: string | null;
  department?: string | null;
  rating: number; // 1 to 5
  comment: string;
  submittedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message?: string;
  time?: string;
  referenceId?: string;
  read?: boolean;
  timestamp?: string;
  recipient?: string;
  recipientRole?: string;
}

export interface ReportSummary {
  totalComplaints: number;
  resolvedCount: number;
  pendingCount: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byDepartment: Record<string, number>;
  byLocation: Array<{ location: string; count: number }>;
  averageRating: number;
  averageResolutionHours: number;
}

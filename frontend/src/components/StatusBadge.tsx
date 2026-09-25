import React from 'react';
import { ComplaintStatus } from '../types';

interface StatusBadgeProps {
  status: ComplaintStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = (status || '').toUpperCase().replace(/\s+/g, '_');

  const configs: Record<string, { label: string; bg: string; text: string; dot: string; border: string; icon?: string }> = {
    'SUBMITTED': {
      label: 'Submitted',
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      dot: 'bg-sky-500',
      border: 'border-sky-200',
      icon: '📥'
    },
    'OPEN': {
      label: 'Submitted',
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      dot: 'bg-sky-500',
      border: 'border-sky-200',
      icon: '📥'
    },
    'UNDER_REVIEW': {
      label: 'Under Review',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      dot: 'bg-indigo-500',
      border: 'border-indigo-200',
      icon: '🔍'
    },
    'ASSIGNED': {
      label: 'Assigned',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      border: 'border-blue-200',
      icon: '👷'
    },
    'IN_PROGRESS': {
      label: 'In Progress',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      dot: 'bg-purple-500 animate-pulse',
      border: 'border-purple-200',
      icon: '⚡'
    },
    'WORK_COMPLETED': {
      label: 'Work Completed',
      bg: 'bg-amber-100',
      text: 'text-amber-900',
      dot: 'bg-amber-600 animate-ping',
      border: 'border-amber-300',
      icon: '📸'
    },
    'PENDING_APPROVAL': {
      label: 'Work Completed',
      bg: 'bg-amber-100',
      text: 'text-amber-900',
      dot: 'bg-amber-600 animate-ping',
      border: 'border-amber-300',
      icon: '📸'
    },
    'ADMIN_REVIEW': {
      label: 'Admin Reviewing',
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      dot: 'bg-orange-500',
      border: 'border-orange-200',
      icon: '🧐'
    },
    'REWORK_REQUIRED': {
      label: 'Rework Required',
      bg: 'bg-rose-100',
      text: 'text-rose-800',
      dot: 'bg-rose-600 animate-bounce',
      border: 'border-rose-300',
      icon: '⚠️'
    },
    'RESOLVED': {
      label: 'Resolved',
    'Pending Approval': {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      dot: 'bg-amber-600 animate-ping',
      border: 'border-amber-300'
    },
    'Resolved': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200',
      icon: '✓'
    }
  };

  const config = configs[norm] || configs['SUBMITTED'];

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border shadow-2xs tracking-tight ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

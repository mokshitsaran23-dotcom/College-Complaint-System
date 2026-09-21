import React from 'react';
import { ComplaintStatus } from '../types';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<ComplaintStatus, { bg: string; text: string; dot: string; border: string }> = {
    'Open': {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      border: 'border-amber-200'
    },
    'Assigned': {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      border: 'border-blue-200'
    },
    'In Progress': {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      dot: 'bg-purple-500 animate-pulse',
      border: 'border-purple-200'
    },
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
      border: 'border-emerald-200'
    }
  };

  const config = configs[status] || configs['Open'];

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
};

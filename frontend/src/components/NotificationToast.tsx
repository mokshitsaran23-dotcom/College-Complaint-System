import React from 'react';

export interface ToastItem {
  id: string;
  referenceId: string;
  title: string;
  status: string;
  note?: string;
  time: string;
}

interface NotificationToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = () => {
  // All notifications are exclusively routed to the notification bell panel in the header
  return null;
};

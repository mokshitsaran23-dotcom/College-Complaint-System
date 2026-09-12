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

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="glass-card p-4 rounded-xl shadow-xl border-l-4 border-l-blue-600 animate-in slide-in-from-bottom-5 duration-300 flex justify-between items-start gap-3"
        >
          <div className="text-xs">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span className="font-bold text-slate-800 uppercase font-mono tracking-wider">{toast.referenceId}</span>
              <span className="text-slate-400">• {toast.time}</span>
            </div>
            <div className="font-semibold text-slate-800">{toast.title}</div>
            {toast.note && <div className="text-slate-500 mt-0.5 italic">"{toast.note}"</div>}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-slate-600 text-xs p-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

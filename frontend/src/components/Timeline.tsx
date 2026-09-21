import React from 'react';
import { ComplaintStatus, StatusHistoryItem } from '../types';

interface TimelineProps {
  currentStatus: ComplaintStatus;
  history: StatusHistoryItem[];
  createdAt: string;
}

export const Timeline: React.FC<TimelineProps> = ({ currentStatus, history, createdAt }) => {
  const stages: ComplaintStatus[] = ['Open', 'Assigned', 'In Progress', 'Pending Approval', 'Resolved'];
  const currentIndex = stages.indexOf(currentStatus);

  return (
    <div className="space-y-6">
      {/* Visual Step Progress Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
        <div className="flex justify-between relative">
          {/* Track line behind */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
          <div
            className="absolute top-4 left-6 h-0.5 bg-blue-600 transition-all duration-500 -z-0"
            style={{ width: `${(Math.max(0, currentIndex) / (stages.length - 1)) * 100}%` }}
          />

          {stages.map((stage, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={stage} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                      : isCompleted
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-400 border border-slate-300'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    isCurrent ? 'text-blue-700 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chronological Audit Log */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Audit Timeline & Updates</h4>
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
          {history.length === 0 ? (
            <div className="text-xs text-slate-400 italic pl-8">No logged status transitions yet.</div>
          ) : (
            history.map((item, idx) => (
              <div key={item.id || idx} className="relative flex items-start gap-4 pl-1">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center text-[10px] text-blue-600 font-bold z-10 shrink-0">
                  •
                </div>
                <div className="flex-1 bg-white p-3 rounded-lg border border-slate-100 shadow-xs text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800">
                      Status transitioned to <span className="text-blue-600 font-semibold">{item.toStatus}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {item.note && <p className="text-slate-600 mt-1 italic">"{item.note}"</p>}
                  <div className="text-[10px] text-slate-400 mt-1">Updated by: {item.changedBy} ({item.changedByRole})</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ComplaintStatus, StatusHistoryItem } from '../types';

interface TimelineProps {
  currentStatus: ComplaintStatus | string;
  history: StatusHistoryItem[];
  createdAt: string;
}

export const Timeline: React.FC<TimelineProps> = ({ currentStatus, history, createdAt }) => {
  const normStatus = (currentStatus || '').toUpperCase().replace(/\s+/g, '_');
  const isRework = normStatus === 'REWORK_REQUIRED';

  const stages: { key: string; label: string }[] = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'WORK_COMPLETED', label: 'Work Completed' },
    { key: 'RESOLVED', label: 'Resolved' }
  ];

  let currentIndex = stages.findIndex(s => s.key === normStatus);
  if (normStatus === 'OPEN') currentIndex = 0;
  if (normStatus === 'PENDING_APPROVAL') currentIndex = 4;
  if (normStatus === 'ADMIN_REVIEW') currentIndex = 4;
  if (isRework) currentIndex = 3; // Rework sits between in-progress and completed
  const stages: ComplaintStatus[] = ['Open', 'Assigned', 'In Progress', 'Pending Approval', 'Resolved'];
  const currentIndex = stages.indexOf(currentStatus);

  return (
    <div className="space-y-6">
      {/* Visual Step Progress Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Workflow Progress
          </span>
          {isRework && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
              <span>⚠️</span> Rework Required by Admin
            </span>
          )}
        </div>

        <div className="flex justify-between relative">
          {/* Track line behind */}
          <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0 rounded" />
          <div
            className={`absolute top-4 left-6 h-1 transition-all duration-500 -z-0 rounded ${
              isRework ? 'bg-amber-500' : 'bg-blue-600'
            }`}
            style={{
              width: `${(Math.max(0, currentIndex) / (stages.length - 1)) * 100}%`
            }}
          />

          {stages.map((stage, idx) => {
            const isCompleted = idx < currentIndex || (idx === currentIndex && normStatus === 'RESOLVED');
            const isCurrent = idx === currentIndex && normStatus !== 'RESOLVED';

            return (
              <div key={stage.key} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isCurrent
                      ? isRework
                        ? 'bg-amber-500 text-white ring-4 ring-amber-100 shadow-md'
                        : 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                      : isCompleted
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-400 border border-slate-300'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-[11px] mt-2 font-medium text-center hidden sm:block ${
                    isCurrent
                      ? 'text-blue-700 font-bold'
                      : isCompleted
                      ? 'text-slate-800 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chronological Audit Log */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Activity & History Audit Trail ({history.length} events)
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            Started: {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
          {history.length === 0 ? (
            <div className="text-xs text-slate-400 italic pl-8">No logged status transitions yet.</div>
          ) : (
            history.map((item, idx) => {
              const isResolvedEvent = (item.toStatus || '').toUpperCase() === 'RESOLVED';
              const isReworkEvent = (item.toStatus || '').toUpperCase() === 'REWORK_REQUIRED';
              const isWorkCompletedEvent = (item.toStatus || '').toUpperCase() === 'WORK_COMPLETED';

              return (
                <div key={item.id || idx} className="relative flex items-start gap-4 pl-1">
                  <div
                    className={`w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center text-[10px] font-bold z-10 shrink-0 ${
                      isResolvedEvent
                        ? 'border-emerald-500 text-emerald-600'
                        : isReworkEvent
                        ? 'border-rose-500 text-rose-600'
                        : isWorkCompletedEvent
                        ? 'border-amber-500 text-amber-600'
                        : 'border-blue-500 text-blue-600'
                    }`}
                  >
                    {isResolvedEvent ? '✓' : isReworkEvent ? '!' : '•'}
                  </div>

                  <div className={`flex-1 p-3.5 rounded-xl border shadow-xs text-xs space-y-1.5 ${
                    isReworkEvent
                      ? 'bg-rose-50/70 border-rose-200'
                      : isResolvedEvent
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-white border-slate-200/80'
                  }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                      <span className="font-extrabold text-slate-800">
                        {item.action || `Status changed to ${item.toStatus}`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>

                    {item.note && (
                      <p className="text-slate-600 text-xs italic bg-white/60 p-2 rounded-lg border border-slate-100">
                        "{item.note}"
                      </p>
                    )}

                    {/* Admin Rework Callout */}
                    {(item.reworkReason || (isReworkEvent && item.note)) && (
                      <div className="p-2.5 bg-rose-100/80 border border-rose-300 rounded-lg text-rose-900 text-xs font-medium">
                        <strong>Admin Reason:</strong> {item.reworkReason || item.note}
                      </div>
                    )}

                    {/* Proof Photo In History */}
                    {item.proofPhotoUrl && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold uppercase text-amber-800 block mb-1">
                          📸 Submitted Proof Photo:
                        </span>
                        <img
                          src={item.proofPhotoUrl}
                          alt="Proof in timeline"
                          className="h-28 max-w-xs object-cover rounded-lg border border-amber-300 shadow-xs"
                        />
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 font-medium pt-1">
                      Actor: <span className="text-slate-700 font-semibold">{item.changedBy}</span> ({item.changedByRole})
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

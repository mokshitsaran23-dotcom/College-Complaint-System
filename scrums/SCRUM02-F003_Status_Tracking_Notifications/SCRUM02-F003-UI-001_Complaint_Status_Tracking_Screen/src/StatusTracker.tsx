import React, { useEffect, useState } from 'react';
import { loadComplaintDetails } from './StatusTrackerLogic';

export const StatusTracker: React.FC<{ referenceId: string; apiService?: any }> = ({ referenceId, apiService }) => {
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplaintDetails(referenceId, apiService).then(data => {
      setModel(data);
      setLoading(false);
    });
  }, [referenceId]);

  if (loading) return <div>Loading complaint status...</div>;
  if (!model) return <div>Complaint not found.</div>;

  return (
    <div data-testid="tracking-screen" className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow border">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-sm text-gray-500 font-mono">Reference ID</span>
          <h2 data-testid="ref-id" className="text-xl font-bold text-gray-800">{model.referenceId}</h2>
        </div>
        <div data-testid="current-status-badge" className="px-4 py-1.5 rounded-full font-semibold text-sm bg-blue-100 text-blue-800">
          {model.currentStatus}
        </div>
      </div>

      {/* Visual Timeline Steps */}
      <div data-testid="timeline-steps" className="flex justify-between mb-8 relative">
        {model.timelineSteps.map((step: any) => (
          <div key={step.stage} className="text-center flex-1">
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-sm ${step.isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step.isCompleted ? '✓' : '•'}
            </div>
            <span className="text-xs font-medium mt-1 block">{step.stage}</span>
          </div>
        ))}
      </div>

      {/* History Event Log */}
      <div className="mt-6 border-t pt-4">
        <h3 className="text-md font-semibold text-gray-700 mb-3">Status History & Updates</h3>
        <div data-testid="history-log" className="space-y-3">
          {model.historyEvents.map((evt: any, idx: number) => (
            <div key={idx} className="text-sm p-3 bg-gray-50 rounded border flex justify-between">
              <div>
                <span className="font-semibold text-gray-800">Status changed to {evt.toStatus}</span>
                {evt.note && <p className="text-gray-600 mt-0.5">{evt.note}</p>}
              </div>
              <span className="text-xs text-gray-400 font-mono">{new Date(evt.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

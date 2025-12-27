
import React, { useState, useEffect } from 'react';
import { Job, JobCompletionData } from '../types';
import { Header } from './Header';

interface FinishJobProps {
  job: Job;
  onBack: () => void;
  onSubmit: (data: JobCompletionData) => void;
}

/**
 * Formats total minutes into a human-readable string like "1h 30m" or "45m".
 */
const formatDuration = (totalMinutes: number): string => {
  if (totalMinutes <= 0) return '0m';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || h === 0) parts.push(`${m}m`);
  
  return parts.join(' ');
};

/**
 * Parses strings like "1h 30m", "90m", or "2h" into total minutes.
 * Returns null if no units (h/m) are found.
 */
const parseDurationWithValidation = (input: string): number | null => {
  let totalMinutes = 0;
  const hMatches = input.match(/(\d+)\s*h/gi);
  const mMatches = input.match(/(\d+)\s*m/gi);
  
  // If user typed numbers but no h or m, return null for validation
  if (!hMatches && !mMatches) {
    return null;
  }
  
  if (hMatches) {
    hMatches.forEach(match => {
      const val = parseInt(match.replace(/[^0-9]/g, ''));
      if (!isNaN(val)) totalMinutes += val * 60;
    });
  }
  
  if (mMatches) {
    mMatches.forEach(match => {
      const val = parseInt(match.replace(/[^0-9]/g, ''));
      if (!isNaN(val)) totalMinutes += val;
    });
  }
  
  return totalMinutes;
};

export const FinishJob: React.FC<FinishJobProps> = ({ job, onBack, onSubmit }) => {
  const [durationInput, setDurationInput] = useState('');
  const [durationError, setDurationError] = useState<string | null>(null);
  const [customerNotes, setCustomerNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [customerImages, setCustomerImages] = useState<string[]>([]);
  const [adminImages, setAdminImages] = useState<string[]>([]);
  const [syncWithAdmin, setSyncWithAdmin] = useState(true);
  const [needsFollowUp, setNeedsFollowUp] = useState(false);

  const recalculateDuration = () => {
    if (job.startTime) {
      const start = new Date(job.startTime).getTime();
      const now = new Date().getTime();
      const diffMins = Math.round((now - start) / 60000);
      setDurationInput(formatDuration(Math.max(1, diffMins)));
      setDurationError(null);
    } else {
      setDurationInput('0m');
    }
  };

  useEffect(() => {
    recalculateDuration();
  }, [job.startTime]);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Strictly allow only numbers, h, m, and spaces
    const filteredVal = val.replace(/[^0-9hmHM ]/g, '');
    setDurationInput(filteredVal);
    
    // Clear error while typing if they add a unit
    if (/[hmHM]/.test(filteredVal)) {
      setDurationError(null);
    }
  };

  const handleDurationBlur = () => {
    const minutes = parseDurationWithValidation(durationInput);
    if (minutes === null && durationInput.trim() !== '') {
      setDurationError("Please specify units (e.g. 1h 20m)");
    } else if (minutes !== null) {
      setDurationError(null);
      setDurationInput(formatDuration(minutes));
    }
  };

  const handleImageAdd = (type: 'customer' | 'admin', file: File) => {
    const url = URL.createObjectURL(file);
    if (type === 'customer') {
      setCustomerImages(prev => [...prev, url]);
      if (syncWithAdmin) setAdminImages(prev => [...prev, url]);
    } else {
      setAdminImages(prev => [...prev, url]);
    }
  };

  const handleCustomerNoteChange = (text: string) => {
    setCustomerNotes(text);
    if (syncWithAdmin) setAdminNotes(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMinutes = parseDurationWithValidation(durationInput);
    
    if (finalMinutes === null) {
      setDurationError("Duration requires units (h or m)");
      return;
    }

    onSubmit({
      actualDurationMinutes: finalMinutes,
      customerNotes,
      adminNotes: syncWithAdmin ? customerNotes : adminNotes,
      customerImages,
      adminImages: syncWithAdmin ? [...adminImages, ...customerImages] : adminImages,
      needsFollowUp,
      finishTime: new Date().toISOString()
    });
  };

  return (
    <div className="flex flex-col min-h-full bg-white animate-in slide-in-from-right duration-300">
      <Header title="Job Completion" showBack onBack={onBack} />
      
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 pb-12 pt-4">
        
        {/* Duration Calculation */}
        <div className={`bg-white border rounded-2xl p-4 mb-8 transition-colors relative ${durationError ? 'border-red-300 bg-red-50/30' : 'border-gray-200 shadow-sm'}`}>
            <div className="flex justify-between items-center mb-1">
              <label className={`block text-[10px] font-bold uppercase tracking-wide ${durationError ? 'text-red-500' : 'text-gray-500'}`}>
                Time on Site (e.g. 1h 30m)
              </label>
              <button 
                type="button"
                onClick={recalculateDuration}
                className="p-1 rounded-full hover:bg-gray-100 text-blue-600 transition-colors flex items-center gap-1 group"
                title="Reset to system time"
              >
                <span className="text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">System Time</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>
            <div className="flex items-end gap-4">
                <input 
                    type="text"
                    value={durationInput}
                    onChange={handleDurationChange}
                    onBlur={handleDurationBlur}
                    placeholder="0m"
                    className={`text-4xl font-bold bg-transparent border-b-2 w-full focus:outline-none pb-2 placeholder-gray-100 uppercase tracking-tight transition-colors ${durationError ? 'border-red-400 text-red-700' : 'border-gray-200 text-black focus:border-blue-500'}`}
                />
            </div>
            {durationError ? (
              <div className="flex items-center gap-1.5 mt-2 text-red-600 font-bold text-[11px] animate-in slide-in-from-top-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {durationError}
              </div>
            ) : (
              <p className="text-gray-400 text-[11px] italic leading-tight mt-3">
                  Auto-calculated from Start time. Normalized on blur.
              </p>
            )}
        </div>

        {/* Sync Toggle */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl mb-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                </svg>
                <span className="text-sm font-bold text-gray-700">Sync Customer & Admin notes?</span>
            </div>
            <button 
                type="button"
                onClick={() => setSyncWithAdmin(!syncWithAdmin)}
                className={`w-12 h-6 rounded-full transition-colors relative ${syncWithAdmin ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${syncWithAdmin ? 'right-1' : 'left-1'}`} />
            </button>
        </div>

        {/* Admin Section (Only if not synced) */}
        {!syncWithAdmin && (
            <div className="mb-8 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    Office / Admin Report
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Internal Only</span>
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Internal Office Notes</label>
                        <textarea 
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Sensitive info, technical jargon, or parts required for billing..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none resize-none text-sm shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Technical / Evidence Photos</label>
                        <div className="flex flex-wrap gap-2">
                             <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase">Add</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageAdd('admin', e.target.files[0])} />
                            </label>
                            {adminImages.map((img, idx) => (
                                <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100 relative group">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setAdminImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Customer Section */}
        <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                Customer Report
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Visible to Client</span>
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Work Completed / Feedback</label>
                    <textarea 
                        required
                        value={customerNotes}
                        onChange={(e) => handleCustomerNoteChange(e.target.value)}
                        placeholder="What was fixed? Any recommendations for the client?"
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none resize-none text-sm shadow-sm"
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Completion Photos</label>
                    <div className="flex flex-wrap gap-2">
                        <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase">Add</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageAdd('customer', e.target.files[0])} />
                        </label>
                        {customerImages.map((img, idx) => (
                            <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100 relative group">
                                <img src={img} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setCustomerImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Follow Up Checkbox */}
        <div className="flex items-center gap-3 mb-10 p-4 border border-gray-200 bg-white rounded-2xl shadow-sm">
            <input 
                type="checkbox"
                id="followup"
                checked={needsFollowUp}
                onChange={(e) => setNeedsFollowUp(e.target.checked)}
                className="w-6 h-6 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="followup" className="text-sm font-bold text-gray-700 leading-tight">
                Follow-up required? 
                <span className="block text-[10px] font-normal text-gray-500 opacity-70">This will flag the office to create a new work order.</span>
            </label>
        </div>

        <button 
            type="submit"
            className="w-full bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-800 active:scale-[0.98] transition-all"
        >
            Complete & Submit Report
        </button>
      </form>
    </div>
  );
};


import React, { useState } from 'react';
import { Job, Customer, Machine } from '../types';

interface MyJobsProps {
  jobs: Job[];
  customers: Customer[];
  machines: Machine[];
  onJobClick: (job: Job) => void;
  onCreateWorkOrder: () => void;
  canCreateWorkOrder: boolean;
}

export const MyJobs: React.FC<MyJobsProps> = ({ jobs, customers, machines, onJobClick, onCreateWorkOrder, canCreateWorkOrder }) => {
  const [searchText, setSearchText] = useState('');

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchText.toLowerCase()) || 
    job.id.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <div className="pt-12 pb-2 px-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
            {canCreateWorkOrder && (
                <button onClick={onCreateWorkOrder} className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm">New Order</button>
            )}
        </div>
        <input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Search orders..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
      </div>
      <div className="flex-1 px-4 py-4 space-y-3">
        {filteredJobs.map(job => (
            <div key={job.id} onClick={() => onJobClick(job)} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900">{job.title}</h3>
                <p className="text-xs text-gray-500 mt-1">#WO-{job.id.toUpperCase()} • {job.status}</p>
            </div>
        ))}
      </div>
    </div>
  );
};

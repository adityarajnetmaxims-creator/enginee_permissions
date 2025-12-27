
import React from 'react';
import { Job, Customer, Machine } from '../types';
import { Header } from './Header';

interface JobDetailsProps {
  job: Job;
  customer?: Customer;
  machine?: Machine;
  allMachines?: Machine[];
  onBack: () => void;
  onEdit: () => void;
  onViewAllMachines: () => void;
  onUpdateJob?: (job: Job) => void;
  onFinishJob: () => void;
  canEditJob: boolean;
}

export const JobDetails: React.FC<JobDetailsProps> = ({ job, customer, machine, onBack, onEdit, canEditJob }) => {
  return (
    <div className="flex flex-col min-h-full bg-white">
      <Header 
        title="Job Details" 
        showBack onBack={onBack} 
        action={canEditJob && job.status !== 'Completed' ? <button onClick={onEdit} className="text-blue-700 font-bold text-sm">Edit</button> : null} 
      />
      <main className="flex-1 p-6 bg-gray-50/30">
        <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
        <p className="text-sm text-gray-500 mt-2">{job.description}</p>
        <div className="mt-8 pt-8 border-t">
            <h2 className="font-bold text-gray-900 mb-2">Customer</h2>
            <p className="text-sm text-gray-600">{customer?.name}</p>
            <p className="text-xs text-gray-400">{customer?.address}</p>
        </div>
      </main>
    </div>
  );
};

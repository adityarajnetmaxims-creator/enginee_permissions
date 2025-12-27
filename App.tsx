
import React, { useState } from 'react';
import { Customer, Machine, ScreenName, User, Job, JobCompletionData } from './types';
import { BottomNav } from './components/BottomNav';
import { Profile } from './components/Profile';
import { CreateWorkOrder } from './components/CreateWorkOrder';
import { MyJobs } from './components/MyJobs';
import { Header } from './components/Header';
import { JobDetails } from './components/JobDetails';
import { Login } from './components/Login';
import { FinishJob } from './components/FinishJob';

// Mock Data
const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Old Gym', email: 'contact@oldgym.com', address: '1515 Broadway, New York, NY 10036', phone: '555-0101', contactName: 'Nico Williams' },
  { id: 'c2', name: 'Gold Gym', email: 'support@goldgym.com', address: '200 West St, New York, NY 10282', phone: '555-0102', contactName: 'Sarah Connor' },
  { id: 'c3', name: 'Planet Fitness - Brooklyn', email: 'manager@pf-brooklyn.com', address: '450 Fulton St, Brooklyn, NY 11201', phone: '555-0103', contactName: 'Mike Johnson' },
];

const MOCK_MACHINES: Machine[] = [
  { id: 'm1', customerId: 'c1', name: 'Flexi Strength 9000', serialNumber: 'FS-9000-X', installDate: '2022-01-15', location: 'Main Floor - Bay 3' },
  { id: 'm2', customerId: 'c2', name: 'PowerMax 3000', serialNumber: 'PM-3000-A', installDate: '2023-05-10', location: 'Server Room B' },
];

const MOCK_JOBS: Job[] = [
    {
        id: 'j1',
        customerId: 'c1',
        machineId: 'm1',
        engineerId: 'u1',
        type: 'Standard',
        title: 'Cable snapped',
        description: 'Main resistance cable snapped during operation.',
        priority: 'High',
        status: 'Scheduled',
        date: '2025-01-19',
    },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('profile');
  const [machines, setMachines] = useState<Machine[]>(MOCK_MACHINES);
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentScreen('home'); 
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('home'); 
  };

  const handleAddMachine = (newMachine: Machine) => {
    setMachines((prev) => [...prev, newMachine]);
  };

  const handleUpdateMachine = (updatedMachine: Machine) => {
    setMachines((prev) => prev.map(m => m.id === updatedMachine.id ? updatedMachine : m));
  };

  const handleJobClick = (job: Job) => {
      setSelectedJob(job);
      setCurrentScreen('job-details');
  };

  const handleUpdateJob = (updatedJob: Job) => {
      setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
      setSelectedJob(updatedJob);
      setCurrentScreen('job-details');
  };

  const handleFinishSubmit = (completionData: JobCompletionData) => {
    if (!selectedJob) return;
    const finishedJob: Job = { ...selectedJob, status: 'Completed', completionData };
    handleUpdateJob(finishedJob);
  };

  // Fix: Added missing handleNavigate function
  const handleNavigate = (screen: ScreenName) => {
    setCurrentScreen(screen);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const renderContent = () => {
    switch (currentScreen) {
      case 'home':
        return (
            <div className="flex flex-col min-h-full bg-gray-50">
                <Header title="Home" />
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                    <p className="text-xl font-bold text-gray-900">Welcome, {user.name}</p>
                    <p className="mt-1">Role: {user.role}</p>
                </div>
            </div>
        );
      case 'my-jobs':
         return (
             <MyJobs 
                jobs={jobs} 
                customers={MOCK_CUSTOMERS} 
                machines={machines}
                onJobClick={handleJobClick}
                onCreateWorkOrder={() => setCurrentScreen('create-work-order')}
                canCreateWorkOrder={user.permissions.canCreateWorkOrder}
             />
         );
      case 'job-details':
        if (!selectedJob) return null;
        return (
            <JobDetails 
                job={selectedJob}
                customer={MOCK_CUSTOMERS.find(c => c.id === selectedJob.customerId)}
                machine={machines.find(m => m.id === selectedJob.machineId)}
                allMachines={machines.filter(m => m.customerId === selectedJob.customerId)}
                onBack={() => setCurrentScreen('my-jobs')}
                onEdit={() => setCurrentScreen('edit-job')}
                onViewAllMachines={() => setCurrentScreen('customer-assets')}
                onUpdateJob={handleUpdateJob}
                onFinishJob={() => setCurrentScreen('finish-job')}
                canEditJob={user.permissions.canEditWorkOrder}
            />
        );
      case 'finish-job':
        if (!selectedJob) return null;
        return <FinishJob job={selectedJob} onBack={() => setCurrentScreen('job-details')} onSubmit={handleFinishSubmit} />;
      case 'edit-job':
        if (!selectedJob || !user.permissions.canEditWorkOrder) return null; 
        return <CreateWorkOrder onBack={() => setCurrentScreen('job-details')} onSuccess={() => setCurrentScreen('my-jobs')} customers={MOCK_CUSTOMERS} machines={machines} onAddMachine={handleAddMachine} onUpdateMachine={handleUpdateMachine} initialJob={selectedJob} onUpdateJob={handleUpdateJob} />;
      case 'profile':
        return <Profile user={user} onCreateWorkOrderClick={() => setCurrentScreen('create-work-order')} onLogout={handleLogout} />;
      case 'create-work-order':
        const activeCustomerIds = Array.from(new Set(jobs.filter(j => j.status !== 'Completed').map(j => j.customerId)));
        return (
          <CreateWorkOrder
            onBack={() => setCurrentScreen('profile')}
            onSuccess={() => setCurrentScreen('my-jobs')}
            customers={MOCK_CUSTOMERS}
            allowedCustomerIds={activeCustomerIds} 
            machines={machines}
            onAddMachine={handleAddMachine}
            onUpdateMachine={handleUpdateMachine}
            canCreateWorkOrder={user.permissions.canCreateWorkOrder}
            canAddMachine={user.permissions.canAddMachine}
            canEditMachine={user.permissions.canEditMachine}
          />
        );
      // Added case for managing customer assets
      case 'customer-assets':
        if (!selectedJob) return null;
        const customer = MOCK_CUSTOMERS.find(c => c.id === selectedJob.customerId);
        return (
          <CreateWorkOrder
            onBack={() => setCurrentScreen('job-details')}
            onSuccess={() => setCurrentScreen('my-jobs')}
            customers={MOCK_CUSTOMERS}
            machines={machines}
            onAddMachine={handleAddMachine}
            onUpdateMachine={handleUpdateMachine}
            initialCustomer={customer}
            mode="manage"
            canCreateWorkOrder={user.permissions.canCreateWorkOrder}
            canAddMachine={user.permissions.canAddMachine}
            canEditMachine={user.permissions.canEditMachine}
          />
        );
      default:
        return <div>Screen not found</div>;
    }
  };

  const navHiddenScreens: ScreenName[] = ['create-work-order', 'job-details', 'edit-job', 'customer-assets', 'finish-job'];

  return (
    <div className="max-w-md mx-auto h-[100dvh] bg-white shadow-2xl relative flex flex-col font-sans text-gray-900 overflow-hidden">
      <div className="flex-1 overflow-y-auto relative">{renderContent()}</div>
      {!navHiddenScreens.includes(currentScreen) && <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />}
    </div>
  );
};

export default App;

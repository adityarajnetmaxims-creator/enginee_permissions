
import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Customer, Machine, Job } from '../types';
import { MachineForm } from './MachineForm';
import { generateJobSuggestions } from '../services/geminiService';

interface CreateWorkOrderProps {
  onBack: () => void;
  onSuccess: () => void;
  customers: Customer[];
  machines: Machine[];
  onAddMachine: (machine: Machine) => void;
  onUpdateMachine: (machine: Machine) => void;
  initialJob?: Job; // For Edit Mode
  onUpdateJob?: (job: Job) => void; // For saving edits
  initialCustomer?: Customer; // For Manage Mode
  mode?: 'default' | 'manage';
  allowedCustomerIds?: string[]; // IDs of customers allowed for WO creation
  canCreateWorkOrder?: boolean;
  canAddMachine?: boolean;
  canEditMachine?: boolean;
}

export const CreateWorkOrder: React.FC<CreateWorkOrderProps> = ({
  onBack,
  onSuccess,
  customers,
  machines,
  onAddMachine,
  onUpdateMachine,
  initialJob,
  onUpdateJob,
  initialCustomer,
  mode = 'default',
  allowedCustomerIds,
  canCreateWorkOrder = false,
  canAddMachine = false,
  canEditMachine = false,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [internalMode, setInternalMode] = useState<'default' | 'manage'>(mode);
  
  // Selection State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [restrictionModalCustomer, setRestrictionModalCustomer] = useState<Customer | null>(null);
  
  // Form State
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  
  // UI State
  const [isMachineFormOpen, setIsMachineFormOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize
  useEffect(() => {
    if (initialJob) {
        const jobCustomer = customers.find(c => c.id === initialJob.customerId);
        const jobMachine = initialJob.machineId ? machines.find(m => m.id === initialJob.machineId) : null;
        if (jobCustomer) setSelectedCustomer(jobCustomer);
        if (jobMachine) setSelectedMachine(jobMachine);
        setIssueTitle(initialJob.title);
        setIssueDescription(initialJob.description);
        setPriority(initialJob.priority === 'Emergency' ? 'High' : (initialJob.priority === 'None' ? 'Low' : initialJob.priority)); 
        setInstructions(initialJob.instructions || '');
        setDueDate(initialJob.date || new Date().toISOString().split('T')[0]);
        setStep(3);
    } else if (initialCustomer && mode === 'manage') {
        setSelectedCustomer(initialCustomer);
        setInternalMode('manage');
        setStep(2);
    }
  }, [initialJob, initialCustomer, mode, customers, machines]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.address.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const customerMachines = machines.filter(m => m.customerId === selectedCustomer?.id);

  const handleCustomerClick = (customer: Customer) => {
    if (internalMode === 'manage' || !allowedCustomerIds) {
        setSelectedCustomer(customer);
        setStep(2);
        return;
    }

    if (canCreateWorkOrder && allowedCustomerIds.includes(customer.id)) {
        setSelectedCustomer(customer);
        setStep(2);
    } else {
        setRestrictionModalCustomer(customer);
    }
  };

  const handleSwitchToManageMode = () => {
    if (restrictionModalCustomer) {
        setSelectedCustomer(restrictionModalCustomer);
        setInternalMode('manage'); 
        setRestrictionModalCustomer(null);
        setStep(2);
    }
  };

  const handleMachineCardClick = (machine: Machine) => {
    if (internalMode === 'manage') {
        if (canEditMachine) {
          setEditingMachine(machine);
          setIsMachineFormOpen(true);
        }
    } else {
        setSelectedMachine(machine);
        setStep(3); 
    }
  };

  const handleEditMachineClick = (e: React.MouseEvent, machine: Machine) => {
    e.stopPropagation(); 
    if (canEditMachine) {
      setEditingMachine(machine);
      setIsMachineFormOpen(true);
    }
  };

  const handleAddOrUpdateMachine = (data: Partial<Machine>) => {
    if (editingMachine && canEditMachine) {
        onUpdateMachine({ ...editingMachine, ...data } as Machine);
    } else if (!editingMachine && canAddMachine) {
        const newMachine: Machine = {
            id: Math.random().toString(36).substr(2, 9),
            ...data
        } as Machine;
        onAddMachine(newMachine);
    }
    setIsMachineFormOpen(false);
    setEditingMachine(null);
  };

  const handleAIAssist = async () => {
    if (!selectedMachine || !issueTitle) return;
    setIsGenerating(true);
    const suggestion = await generateJobSuggestions(selectedMachine.name, issueTitle);
    setIssueDescription(suggestion);
    setIsGenerating(false);
  };

  const handleSubmit = () => {
    if (initialJob && onUpdateJob) {
        onUpdateJob({
            ...initialJob,
            machineId: selectedMachine?.id || initialJob.machineId, 
            title: issueTitle,
            description: issueDescription,
            priority: priority as any,
            instructions,
            date: dueDate,
        });
    } else {
        onSuccess();
    }
  };

  if (step === 1) {
    const activeCustomers = allowedCustomerIds && canCreateWorkOrder
        ? filteredCustomers.filter(c => allowedCustomerIds.includes(c.id))
        : filteredCustomers;
        
    return (
      <div className="flex flex-col min-h-full bg-white relative">
        <Header title="My Customers" showBack onBack={onBack} />
        <div className="px-4 py-2 bg-white border-b border-gray-100 sticky top-16 z-10">
            <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-3 top-3 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input 
                    type="text" 
                    placeholder="Search customers..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                />
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-gray-100 pb-8">
                {activeCustomers.map(cust => (
                    <button key={cust.id} onClick={() => handleCustomerClick(cust)} className="w-full text-left p-4 hover:bg-gray-50 flex justify-between items-center group">
                        <div>
                            <div className="font-bold text-gray-900">{cust.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{cust.address}</div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-300 group-hover:text-blue-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                ))}
            </div>
        </div>

        {restrictionModalCustomer && (
            <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-6 animate-in fade-in duration-200">
                <div className="bg-white w-full rounded-2xl p-6 shadow-xl animate-in zoom-in duration-300">
                    <h3 className="text-lg font-bold text-gray-900">Site Selection</h3>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        {canCreateWorkOrder 
                          ? `You don't have an active work order assigned for ${restrictionModalCustomer.name}.`
                          : `You do not have permission to create work orders.`}
                    </p>
                    <div className="flex flex-col gap-3 mt-6">
                        {(canAddMachine || canEditMachine) && (
                          <button onClick={handleSwitchToManageMode} className="w-full bg-blue-700 text-white font-bold py-3 rounded-xl">Manage Assets</button>
                        )}
                        <button onClick={() => setRestrictionModalCustomer(null)} className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl">Close</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  }

  if (step === 2) {
      return (
        <div className="flex flex-col min-h-full bg-white relative">
            <Header 
                title={internalMode === 'manage' ? "Site Assets" : "Select Asset"}
                showBack 
                onBack={() => {
                    if (initialJob) { setStep(3); return; }
                    if (mode === 'manage') { onBack(); return; }
                    if (internalMode === 'manage' && mode === 'default') setInternalMode('default');
                    setStep(1);
                }} 
                action={canAddMachine ? <button onClick={() => { setEditingMachine(null); setIsMachineFormOpen(true); }} className="text-blue-700 font-bold text-sm">+ Add</button> : null}
            />
            
            <div className="px-4 py-3 border-b bg-gray-50">
                <h2 className="text-sm font-bold text-gray-900">{selectedCustomer?.name}</h2>
                <p className="text-xs text-gray-500">{selectedCustomer?.address}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {customerMachines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <p className="mb-4">No machines registered.</p>
                        {canAddMachine && <button onClick={() => { setEditingMachine(null); setIsMachineFormOpen(true); }} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Add First Machine</button>}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {customerMachines.map(machine => (
                            <div key={machine.id} onClick={() => handleMachineCardClick(machine)} className="bg-white rounded-xl p-4 border shadow-sm flex justify-between items-center group cursor-pointer hover:border-blue-300">
                                <div>
                                    <h3 className="font-bold text-gray-900">{machine.name}</h3>
                                    <p className="text-xs text-gray-500">SN: {machine.serialNumber}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {canEditMachine && (
                                      <button onClick={(e) => handleEditMachineClick(e, machine)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg></button>
                                    )}
                                    {internalMode !== 'manage' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isMachineFormOpen && (
                <div className="absolute inset-0 z-50 bg-white animate-in slide-in-from-bottom duration-300 overflow-y-auto">
                    <div className="pt-12 px-4 pb-2">
                        <MachineForm initialData={editingMachine || {}} customerId={selectedCustomer!.id} onSave={handleAddOrUpdateMachine} onCancel={() => setIsMachineFormOpen(false)} />
                    </div>
                </div>
            )}
        </div>
      );
  }

  return (
    <div className="flex flex-col min-h-full bg-white relative">
      <div className="pt-12 pb-4 px-4 bg-white sticky top-0 z-10 flex items-center justify-between border-b border-gray-100">
          <button onClick={() => setStep(2)} className="p-2 -ml-2 rounded-full hover:bg-gray-100"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>
          <h1 className="text-xl font-bold text-gray-900">{initialJob ? 'Update Order' : 'New Order'}</h1>
          <button onClick={handleSubmit} className="text-blue-600 font-bold text-sm">Submit</button>
      </div>

      <main className="flex-1 overflow-y-auto pb-8">
        <div className="bg-gray-50 px-5 py-8 space-y-6">
            <div>
                <label className="block text-gray-700 font-bold text-sm mb-1.5">Issue Title</label>
                <input type="text" value={issueTitle} onChange={(e) => setIssueTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300" placeholder="Summary" />
            </div>
            <div>
                <label className="block text-gray-700 font-bold text-sm mb-1.5">Description</label>
                <textarea value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-300 resize-none" placeholder="Details" />
            </div>
            <div>
                 <label className="block text-gray-900 font-bold text-sm mb-3">Priority</label>
                 <div className="flex gap-2">
                    {['Low', 'Medium', 'High'].map((p) => (
                        <button key={p} onClick={() => setPriority(p as any)} className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${priority === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200'}`}>{p}</button>
                    ))}
                 </div>
            </div>
        </div>
      </main>
    </div>
  );
};

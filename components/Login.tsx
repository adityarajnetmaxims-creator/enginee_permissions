
import React, { useState } from 'react';
import { User, UserRole, UserPermissions } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>('FullTime');
  const [name, setName] = useState('Roberto Carlos');
  const [permissions, setPermissions] = useState<UserPermissions>({
    canCreateWorkOrder: true,
    canEditWorkOrder: true,
    canAddMachine: true,
    canEditMachine: true,
  });

  const togglePermission = (key: keyof UserPermissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    // Trainees get no permissions
    const finalPermissions = role === 'Trainee' ? {
      canCreateWorkOrder: false,
      canEditWorkOrder: false,
      canAddMachine: false,
      canEditMachine: false,
    } : permissions;

    const user: User = {
      id: 'u1',
      name,
      email: `${name.toLowerCase().replace(' ', '')}@email.com`,
      initials,
      role,
      permissions: finalPermissions
    };
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="mx-auto h-16 w-16 bg-blue-700 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          FE
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to FieldEngineer Pro
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white p-8 shadow-lg rounded-xl border border-gray-100">
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
              Name
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Select Role
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
               <button
                 type="button"
                 onClick={() => setRole('FullTime')}
                 className={`flex items-center justify-center px-3 py-3 border rounded-xl text-sm font-medium sm:flex-1 cursor-pointer focus:outline-none transition-all ${role === 'FullTime' ? 'bg-blue-600 text-white border-transparent shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
               >
                 Full-Time
               </button>
               <button
                 type="button"
                 onClick={() => setRole('Trainee')}
                 className={`flex items-center justify-center px-3 py-3 border rounded-xl text-sm font-medium sm:flex-1 cursor-pointer focus:outline-none transition-all ${role === 'Trainee' ? 'bg-blue-600 text-white border-transparent shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
               >
                 Trainee
               </button>
            </div>
          </div>

          {role === 'FullTime' ? (
            <div className="animate-in fade-in duration-300">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                Engineer Permissions
              </label>
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <PermissionToggle label="Create Work Orders" checked={permissions.canCreateWorkOrder} onChange={() => togglePermission('canCreateWorkOrder')} />
                <PermissionToggle label="Edit Work Orders" checked={permissions.canEditWorkOrder} onChange={() => togglePermission('canEditWorkOrder')} />
                <PermissionToggle label="Add New Machines" checked={permissions.canAddMachine} onChange={() => togglePermission('canAddMachine')} />
                <PermissionToggle label="Edit Machines" checked={permissions.canEditMachine} onChange={() => togglePermission('canEditMachine')} />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                 <p className="text-xs text-orange-700 font-medium leading-relaxed">
                    Access Level: <strong>Restricted</strong>. Trainees have view-only access and cannot modify site data or create jobs.
                 </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="flex w-full justify-center rounded-xl bg-blue-700 px-3 py-3.5 text-sm font-bold leading-6 text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PermissionToggle: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between group cursor-pointer">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <div className="relative inline-flex items-center" onClick={onChange}>
      <div className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}>
        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${checked ? 'right-1' : 'left-1'}`} />
      </div>
    </div>
  </label>
);

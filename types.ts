
export interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  contactName?: string;
}

export interface Machine {
  id: string;
  customerId: string;
  name: string;
  serialNumber: string;
  installDate: string;
  location?: string;
}

export interface ServiceCheckItem {
  machineId: string;
  status: 'Pending' | 'Passed' | 'Failed';
  note?: string;
  attachments?: string[]; // Array of image URLs/Base64
}

export interface JobCompletionData {
  actualDurationMinutes: number;
  customerNotes: string;
  adminNotes: string;
  customerImages: string[];
  adminImages: string[];
  needsFollowUp: boolean;
  finishTime: string;
}

export interface Job {
  id: string;
  customerId: string;
  machineId?: string; // Optional for Annual Service
  engineerId: string;
  type: 'Standard' | 'AnnualService';
  isFollowUp?: boolean;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency' | 'None';
  status: 'Scheduled' | 'In Progress' | 'Completed';
  date: string;
  startTime?: string;
  instructions?: string;
  estimatedDuration?: string;
  checklist?: ServiceCheckItem[];
  completionData?: JobCompletionData;
}

export type UserRole = 'FullTime' | 'Trainee';

export interface UserPermissions {
  canCreateWorkOrder: boolean;
  canEditWorkOrder: boolean;
  canAddMachine: boolean;
  canEditMachine: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  permissions: UserPermissions;
}

// Navigation Types
export type ScreenName = 'home' | 'my-jobs' | 'history' | 'profile' | 'create-work-order' | 'job-details' | 'edit-job' | 'customer-assets' | 'finish-job';

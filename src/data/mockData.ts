export interface Project {
  id: string;
  name: string;
  location: string;
  contractorProgress: number;
  ownerProgress: number;
  notes: string;
  brand: 'BK' | 'TC';
  status: {
    orders: number;
    ordersTotal: number;
    lpos: number;
    lposTotal: number;
    drawings: number;
    drawingsTotal: number;
    invoices: number;
    invoicesTotal: number;
  };
}

export interface ScheduleItem {
  id?: string;
  projectId?: string;
  task: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  delayDays: number;
}

export interface SitePhoto {
  id: string;
  projectId: string;
  url: string;
  uploadDate: string;
  description: string;
}

export interface Drawing {
  id: string;
  projectId: string;
  name: string;
  url: string;
  uploadDate: string;
}

export interface OrderItem {
  id: string;
  projectId: string;
  category: string;
  name: string;
  ordered: boolean;
  lpoReceived: boolean;
  lpoFile?: string;
  invoiceStatus: '0%' | '25%' | '50%' | '100%';
  invoiceFile?: string;
}

export interface ResponsibilityItem {
  id: string;
  projectId: string;
  task: string;
  responsibleParty: 'Contractor' | 'Owner';
  notes: string;
}

// Mock projects
export const projects: Project[] = [
  {
    id: '1',
    name: 'Warsan Mall',
    location: 'Dubai, UAE',
    contractorProgress: 65,
    ownerProgress: 80,
    notes: 'Civil works complete. Awaiting MEP installation.',
    brand: 'BK',
    status: {
      orders: 18,
      ordersTotal: 25,
      lpos: 15,
      lposTotal: 25,
      drawings: 8,
      drawingsTotal: 10,
      invoices: 12,
      invoicesTotal: 25
    }
  },
  {
    id: '2',
    name: 'Sairina Mall',
    location: 'Abu Dhabi, UAE',
    contractorProgress: 40,
    ownerProgress: 35,
    notes: 'Foundation work in progress. Equipment orders placed.',
    brand: 'BK',
    status: {
      orders: 10,
      ordersTotal: 25,
      lpos: 8,
      lposTotal: 25,
      drawings: 5,
      drawingsTotal: 10,
      invoices: 6,
      invoicesTotal: 25
    }
  },
  {
    id: '3',
    name: 'City Center',
    location: 'Sharjah, UAE',
    contractorProgress: 85,
    ownerProgress: 70,
    notes: 'Final finishing and equipment installation underway.',
    brand: 'TC',
    status: {
      orders: 22,
      ordersTotal: 25,
      lpos: 21,
      lposTotal: 25,
      drawings: 10,
      drawingsTotal: 10,
      invoices: 20,
      invoicesTotal: 25
    }
  }
];

// Mock schedule items
export const schedules: { [key: string]: ScheduleItem[] } = {
  '1': [
    { task: 'Site Preparation', plannedStart: '2023-01-10', plannedEnd: '2023-01-20', actualStart: '2023-01-12', actualEnd: '2023-01-22', delayDays: 2 },
    { task: 'Foundation Work', plannedStart: '2023-01-21', plannedEnd: '2023-02-10', actualStart: '2023-01-23', actualEnd: '2023-02-15', delayDays: 5 },
    { task: 'Framing', plannedStart: '2023-02-11', plannedEnd: '2023-03-05', actualStart: '2023-02-16', actualEnd: '2023-03-12', delayDays: 7 },
    { task: 'MEP Installation', plannedStart: '2023-03-06', plannedEnd: '2023-04-05', actualStart: '2023-03-13', actualEnd: null, delayDays: 7 }
  ],
  '2': [
    { task: 'Site Preparation', plannedStart: '2023-03-01', plannedEnd: '2023-03-10', actualStart: '2023-03-05', actualEnd: '2023-03-15', delayDays: 5 },
    { task: 'Foundation Work', plannedStart: '2023-03-11', plannedEnd: '2023-03-25', actualStart: '2023-03-16', actualEnd: null, delayDays: 5 }
  ],
  '3': [
    { task: 'Site Preparation', plannedStart: '2023-02-01', plannedEnd: '2023-02-10', actualStart: '2023-02-01', actualEnd: '2023-02-09', delayDays: 0 },
    { task: 'Foundation Work', plannedStart: '2023-02-11', plannedEnd: '2023-02-28', actualStart: '2023-02-10', actualEnd: '2023-02-25', delayDays: 0 },
    { task: 'Framing', plannedStart: '2023-03-01', plannedEnd: '2023-03-20', actualStart: '2023-02-26', actualEnd: '2023-03-18', delayDays: 0 },
    { task: 'MEP Installation', plannedStart: '2023-03-21', plannedEnd: '2023-04-10', actualStart: '2023-03-19', actualEnd: '2023-04-12', delayDays: 2 },
    { task: 'Interior Finishing', plannedStart: '2023-04-11', plannedEnd: '2023-05-01', actualStart: '2023-04-13', actualEnd: null, delayDays: 2 }
  ]
};

// Mock responsibility items
export const responsibilities: { [key: string]: ResponsibilityItem[] } = {
  '1': [
    { id: '1-1', projectId: '1', task: 'Civil Works', responsibleParty: 'Contractor', notes: 'Complete' },
    { id: '1-2', projectId: '1', task: 'Plumbing', responsibleParty: 'Contractor', notes: 'In progress' },
    { id: '1-3', projectId: '1', task: 'Electrical', responsibleParty: 'Contractor', notes: 'Waiting for permits' },
    { id: '1-4', projectId: '1', task: 'Equipment Installation', responsibleParty: 'Owner', notes: 'Scheduled for next month' },
    { id: '1-5', projectId: '1', task: 'Furniture', responsibleParty: 'Owner', notes: 'Ordered' }
  ],
  '2': [
    { id: '2-1', projectId: '2', task: 'Civil Works', responsibleParty: 'Contractor', notes: 'In progress' },
    { id: '2-2', projectId: '2', task: 'Plumbing', responsibleParty: 'Contractor', notes: 'Not started' },
    { id: '2-3', projectId: '2', task: 'Equipment Installation', responsibleParty: 'Owner', notes: 'Equipment ordered' }
  ],
  '3': [
    { id: '3-1', projectId: '3', task: 'Civil Works', responsibleParty: 'Contractor', notes: 'Complete' },
    { id: '3-2', projectId: '3', task: 'Plumbing', responsibleParty: 'Contractor', notes: 'Complete' },
    { id: '3-3', projectId: '3', task: 'Electrical', responsibleParty: 'Contractor', notes: 'Complete' },
    { id: '3-4', projectId: '3', task: 'Equipment Installation', responsibleParty: 'Owner', notes: 'In progress' },
    { id: '3-5', projectId: '3', task: 'Furniture', responsibleParty: 'Owner', notes: 'Delivered' },
    { id: '3-6', projectId: '3', task: 'Signage', responsibleParty: 'Owner', notes: 'Installation scheduled' }
  ]
};

// Mock orders
export const orders: { [key: string]: OrderItem[] } = {
  '1': [
    { id: '1-1', projectId: '1', category: 'Furniture', name: 'Dining Tables', ordered: true, lpoReceived: true, invoiceStatus: '50%' },
    { id: '1-2', projectId: '1', category: 'Furniture', name: 'Chairs', ordered: true, lpoReceived: true, invoiceStatus: '50%' },
    { id: '1-3', projectId: '1', category: 'Equipment', name: 'Fryers', ordered: true, lpoReceived: true, invoiceStatus: '100%' },
    { id: '1-4', projectId: '1', category: 'Equipment', name: 'Grills', ordered: true, lpoReceived: false, invoiceStatus: '0%' },
    { id: '1-5', projectId: '1', category: 'S/S', name: 'Kitchen Counters', ordered: true, lpoReceived: true, invoiceStatus: '25%' },
    { id: '1-6', projectId: '1', category: 'Cold Room', name: 'Walk-in Freezer', ordered: false, lpoReceived: false, invoiceStatus: '0%' }
  ],
  '2': [
    { id: '2-1', projectId: '2', category: 'Furniture', name: 'Dining Tables', ordered: true, lpoReceived: true, invoiceStatus: '25%' },
    { id: '2-2', projectId: '2', category: 'Furniture', name: 'Chairs', ordered: true, lpoReceived: false, invoiceStatus: '0%' },
    { id: '2-3', projectId: '2', category: 'Equipment', name: 'Fryers', ordered: false, lpoReceived: false, invoiceStatus: '0%' }
  ],
  '3': [
    { id: '3-1', projectId: '3', category: 'Furniture', name: 'Dining Tables', ordered: true, lpoReceived: true, invoiceStatus: '100%' },
    { id: '3-2', projectId: '3', category: 'Furniture', name: 'Chairs', ordered: true, lpoReceived: true, invoiceStatus: '100%' },
    { id: '3-3', projectId: '3', category: 'Equipment', name: 'Fryers', ordered: true, lpoReceived: true, invoiceStatus: '100%' },
    { id: '3-4', projectId: '3', category: 'Equipment', name: 'Grills', ordered: true, lpoReceived: true, invoiceStatus: '50%' },
    { id: '3-5', projectId: '3', category: 'S/S', name: 'Kitchen Counters', ordered: true, lpoReceived: true, invoiceStatus: '100%' }
  ]
};

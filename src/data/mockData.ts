import { Tables } from "@/integrations/supabase/types";

export type Project = {
  id: string;
  name: string;
  location: string;
  client: string;
  startDate: string;
  endDate: string;
  budget: number;
  contractorProgress: number;
  ownerProgress: number;
  brand: 'BK' | 'TC';
  notes?: string;
  status?: string | {
    orders: number;
    ordersTotal: number;
    lpos: number;
    lposTotal: number;
    drawings: number;
    drawingsTotal: number;
    invoices: number;
    invoicesTotal: number;
  };
};

export type ScheduleItem = {
  id: string;
  projectId: string;
  task: string;
  description?: string;
  status?: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  delayDays: number;
};

export type OrderItem = {
  id: string;
  projectId: string;
  name: string;
  quantity: number;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  status: string;
  notes?: string;
};

export type ResponsibilityItem = {
  id: string;
  projectId: string;
  task: string;
  assignedTo: string;
  dueDate?: string;
  status?: string;
  notes?: string;
};

export const projects: Project[] = [
  {
    id: "p-1",
    name: "BK Fort Greene",
    location: "Brooklyn, NY",
    client: "Brooklyn Kawi",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    budget: 500000,
    contractorProgress: 75,
    ownerProgress: 60,
    brand: "BK",
    status: {
      orders: 5,
      ordersTotal: 10,
      lpos: 3,
      lposTotal: 5,
      drawings: 8,
      drawingsTotal: 10,
      invoices: 2,
      invoicesTotal: 3,
    },
  },
  {
    id: "p-2",
    name: "TC Flatbush",
    location: "Brooklyn, NY",
    client: "TC USA",
    startDate: "2023-02-15",
    endDate: "2024-01-31",
    budget: 750000,
    contractorProgress: 40,
    ownerProgress: 30,
    brand: "TC",
    status: {
      orders: 2,
      ordersTotal: 8,
      lpos: 1,
      lposTotal: 4,
      drawings: 5,
      drawingsTotal: 9,
      invoices: 1,
      invoicesTotal: 2,
    },
  },
  {
    id: "p-3",
    name: "BK Harlem",
    location: "New York, NY",
    client: "Brooklyn Kawi",
    startDate: "2023-03-01",
    endDate: "2023-11-30",
    budget: 600000,
    contractorProgress: 90,
    ownerProgress: 85,
    brand: "BK",
    status: {
      orders: 7,
      ordersTotal: 10,
      lpos: 4,
      lposTotal: 5,
      drawings: 9,
      drawingsTotal: 10,
      invoices: 3,
      invoicesTotal: 3,
    },
  },
  {
    id: "p-4",
    name: "TC Bronx",
    location: "Bronx, NY",
    client: "TC USA",
    startDate: "2023-04-10",
    endDate: "2024-02-29",
    budget: 800000,
    contractorProgress: 25,
    ownerProgress: 20,
    brand: "TC",
    status: {
      orders: 1,
      ordersTotal: 7,
      lpos: 0,
      lposTotal: 3,
      drawings: 3,
      drawingsTotal: 8,
      invoices: 0,
      invoicesTotal: 1,
    },
  },
];

export const schedules: { [projectId: string]: ScheduleItem[] } = {
  "p-1": [
    {
      id: "s-1",
      projectId: "p-1",
      task: "Initial Planning",
      plannedStart: "2023-01-01",
      plannedEnd: "2023-01-15",
      actualStart: "2023-01-01",
      actualEnd: "2023-01-14",
      delayDays: 0,
    },
    {
      id: "s-2",
      projectId: "p-1",
      task: "Site Survey",
      plannedStart: "2023-01-16",
      plannedEnd: "2023-01-31",
      actualStart: "2023-01-16",
      actualEnd: "2023-01-30",
      delayDays: 0,
    },
    {
      id: "s-3",
      projectId: "p-1",
      task: "Foundation Work",
      plannedStart: "2023-02-01",
      plannedEnd: "2023-02-28",
      actualStart: "2023-02-01",
      actualEnd: "2023-03-10",
      delayDays: 10,
    },
  ],
  "p-2": [
    {
      id: "s-4",
      projectId: "p-2",
      task: "Initial Planning",
      plannedStart: "2023-02-15",
      plannedEnd: "2023-02-28",
      actualStart: "2023-02-15",
      actualEnd: "2023-02-27",
      delayDays: 0,
    },
    {
      id: "s-5",
      projectId: "p-2",
      task: "Permitting",
      plannedStart: "2023-03-01",
      plannedEnd: "2023-03-31",
      actualStart: null,
      actualEnd: null,
      delayDays: 0,
    },
  ],
  "p-3": [
    {
      id: "s-6",
      projectId: "p-3",
      task: "Demolition",
      plannedStart: "2023-03-01",
      plannedEnd: "2023-03-15",
      actualStart: "2023-03-01",
      actualEnd: "2023-03-14",
      delayDays: 0,
    },
    {
      id: "s-7",
      projectId: "p-3",
      task: "Construction",
      plannedStart: "2023-03-16",
      plannedEnd: "2023-10-31",
      actualStart: "2023-03-16",
      actualEnd: "2023-10-30",
      delayDays: 0,
    },
  ],
  "p-4": [
    {
      id: "s-8",
      projectId: "p-4",
      task: "Planning",
      plannedStart: "2023-04-10",
      plannedEnd: "2023-04-30",
      actualStart: "2023-04-10",
      actualEnd: "2023-04-29",
      delayDays: 0,
    },
    {
      id: "s-9",
      projectId: "p-4",
      task: "Design",
      plannedStart: "2023-05-01",
      plannedEnd: "2023-06-30",
      actualStart: null,
      actualEnd: null,
      delayDays: 0,
    },
  ],
};

export const orders: { [projectId: string]: OrderItem[] } = {
  "p-1": [
    {
      id: "o-1",
      projectId: "p-1",
      name: "Steel Beams",
      quantity: 10,
      orderDate: "2023-02-01",
      expectedDelivery: "2023-02-15",
      actualDelivery: "2023-02-14",
      status: "delivered",
      notes: "High quality steel beams for foundation.",
    },
    {
      id: "o-2",
      projectId: "p-1",
      name: "Concrete Mix",
      quantity: 50,
      orderDate: "2023-02-01",
      expectedDelivery: "2023-02-10",
      actualDelivery: "2023-02-09",
      status: "delivered",
      notes: "Ready-mix concrete for foundation.",
    },
  ],
  "p-2": [
    {
      id: "o-3",
      projectId: "p-2",
      name: "Lumber",
      quantity: 2000,
      orderDate: "2023-03-01",
      expectedDelivery: "2023-03-15",
      status: "pending",
      notes: "Various sizes of lumber for framing.",
    },
  ],
  "p-3": [
    {
      id: "o-4",
      projectId: "p-3",
      name: "Bricks",
      quantity: 10000,
      orderDate: "2023-03-15",
      expectedDelivery: "2023-03-31",
      actualDelivery: "2023-03-30",
      status: "delivered",
      notes: "Standard size bricks for construction.",
    },
  ],
  "p-4": [
    {
      id: "o-5",
      projectId: "p-4",
      name: "Design Software License",
      quantity: 5,
      orderDate: "2023-04-15",
      expectedDelivery: "2023-04-22",
      status: "pending",
      notes: "Annual licenses for architectural design software.",
    },
  ],
};

export const responsibilities: { [projectId: string]: ResponsibilityItem[] } = {
  "p-1": [
    {
      id: "r-1",
      projectId: "p-1",
      task: "Foundation Inspection",
      assignedTo: "John Doe",
      dueDate: "2023-02-28",
      status: "completed",
      notes: "Ensure foundation meets safety standards.",
    },
    {
      id: "r-2",
      projectId: "p-1",
      task: "Electrical Wiring",
      assignedTo: "Jane Smith",
      dueDate: "2023-03-15",
      status: "in progress",
      notes: "Install electrical wiring and outlets.",
    },
  ],
  "p-2": [
    {
      id: "r-3",
      projectId: "p-2",
      task: "Framing Inspection",
      assignedTo: "John Doe",
      dueDate: "2023-04-15",
      status: "pending",
      notes: "Inspect framing for structural integrity.",
    },
  ],
  "p-3": [
    {
      id: "r-4",
      projectId: "p-3",
      task: "Brick Laying",
      assignedTo: "Construction Crew",
      dueDate: "2023-04-30",
      status: "completed",
      notes: "Lay bricks for exterior walls.",
    },
  ],
  "p-4": [
    {
      id: "r-5",
      projectId: "p-4",
      task: "Software Installation",
      assignedTo: "IT Department",
      dueDate: "2023-05-01",
      status: "pending",
      notes: "Install design software on workstations.",
    },
  ],
};

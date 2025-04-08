
import { supabase } from '@/integrations/supabase/client';
import { Project, ScheduleItem, OrderItem, ResponsibilityItem } from '@/data/mockData';
import { Database } from '@/integrations/supabase/types';

// Get all projects
export const getProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*');
    
    if (error) {
      console.error('Error fetching projects:', error);
      // Fallback to mock data if there's an error
      const { projects } = await import('@/data/mockData');
      return projects;
    }
    
    // Map Supabase data to match the expected Project type
    const mappedData = data.map(project => ({
      id: project.id,
      name: project.name,
      location: project.location || "",
      client: project.client || "",
      notes: project.notes || "",
      startDate: project.start_date,
      endDate: project.end_date,
      budget: project.budget || 0,
      contractorProgress: 0, // Default values since not in DB
      ownerProgress: 0,      // Default values since not in DB
      brand: 'BK' as 'BK' | 'TC', // Default value
      // Add project status object
      status: {
        orders: 0,
        ordersTotal: 10,
        lpos: 0,
        lposTotal: 10,
        drawings: 0,
        drawingsTotal: 10,
        invoices: 0,
        invoicesTotal: 10
      }
    }));
    
    return data.length > 0 ? mappedData : (await import('@/data/mockData')).projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    const { projects } = await import('@/data/mockData');
    return projects;
  }
};

// Get schedule items for a project
export const getScheduleItems = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) {
      console.error('Error fetching schedule items:', error);
      // Fallback to mock data
      const { schedules } = await import('@/data/mockData');
      return Object.values(schedules).flat().filter(item => item.projectId === projectId);
    }
    
    // Map Supabase data to match the expected ScheduleItem type
    const mappedData = data.map(item => ({
      id: item.id,
      projectId: item.project_id,
      task: item.title, 
      plannedStart: item.start_date,
      plannedEnd: item.end_date,
      actualStart: "", // Default values since these might not be in DB
      actualEnd: "",   // Default values since these might not be in DB
      delayDays: 0,    // Default values since these might not be in DB
      description: item.description || ""
    }));
    
    return data.length > 0 ? mappedData : (await import('@/data/mockData')).schedules[projectId] || [];
  } catch (error) {
    console.error('Error fetching schedule items:', error);
    const { schedules } = await import('@/data/mockData');
    return Object.values(schedules).flat().filter(item => item.projectId === projectId);
  }
};

// Get order items for a project
export const getOrderItems = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) {
      console.error('Error fetching order items:', error);
      // Fallback to mock data
      const { orders } = await import('@/data/mockData');
      return Object.values(orders).flat().filter(item => item.projectId === projectId);
    }
    
    // Map Supabase data to match the expected OrderItem type
    const mappedData = data.map(item => ({
      id: item.id,
      projectId: item.project_id,
      name: item.item_name,
      quantity: item.quantity,
      orderDate: item.order_date,
      expectedDelivery: item.expected_delivery,
      actualDelivery: item.actual_delivery,
      status: item.status || "pending",
      notes: item.notes || ""
    }));
    
    return data.length > 0 ? mappedData : (await import('@/data/mockData')).orders[projectId] || [];
  } catch (error) {
    console.error('Error fetching order items:', error);
    const { orders } = await import('@/data/mockData');
    return Object.values(orders).flat().filter(item => item.projectId === projectId);
  }
};

// Get responsibility items for a project
export const getResponsibilityItems = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('responsibilities')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) {
      console.error('Error fetching responsibility items:', error);
      // Fallback to mock data
      const { responsibilities } = await import('@/data/mockData');
      return Object.values(responsibilities).flat().filter(item => item.projectId === projectId);
    }
    
    // Map Supabase data to match the expected ResponsibilityItem type
    const mappedData = data.map(item => ({
      id: item.id,
      projectId: item.project_id,
      task: item.task,
      assignedTo: item.assigned_to,
      dueDate: item.due_date,
      status: item.status || "pending",
      notes: item.notes || ""
    }));
    
    return data.length > 0 ? mappedData : (await import('@/data/mockData')).responsibilities[projectId] || [];
  } catch (error) {
    console.error('Error fetching responsibility items:', error);
    const { responsibilities } = await import('@/data/mockData');
    return Object.values(responsibilities).flat().filter(item => item.projectId === projectId);
  }
};

// Update a project
export const updateProject = async (projectId: string, updates: Partial<Project>) => {
  try {
    // Convert from Project structure to database structure
    const dbUpdates: any = {};
    if ('name' in updates) dbUpdates.name = updates.name;
    if ('location' in updates) dbUpdates.location = updates.location;
    if ('client' in updates) dbUpdates.client = updates.client;
    if ('notes' in updates) dbUpdates.notes = updates.notes;
    if ('budget' in updates) dbUpdates.budget = updates.budget;
    if ('startDate' in updates) dbUpdates.start_date = updates.startDate;
    if ('endDate' in updates) dbUpdates.end_date = updates.endDate;
    
    // Only use string status, not the complex status object
    if ('status' in updates && typeof updates.status === 'string') {
      dbUpdates.status = updates.status;
    }
    
    const { data, error } = await supabase
      .from('projects')
      .update(dbUpdates)
      .eq('id', projectId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project:', error);
      // Fallback to mock data
      const { projects } = await import('@/data/mockData');
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex !== -1) {
        const updatedProject = { ...projects[projectIndex], ...updates };
        return updatedProject;
      }
      return null;
    }
    
    // Map back to Project type
    return {
      id: data.id,
      name: data.name,
      location: data.location || "",
      client: data.client || "",
      notes: data.notes || "",
      startDate: data.start_date,
      endDate: data.end_date,
      budget: data.budget || 0,
      contractorProgress: 0, // Default values 
      ownerProgress: 0,      // Default values
      brand: 'BK' as 'BK' | 'TC', // Default value
      status: {
        orders: 0,
        ordersTotal: 10,
        lpos: 0,
        lposTotal: 10,
        drawings: 0,
        drawingsTotal: 10,
        invoices: 0,
        invoicesTotal: 10
      }
    } as Project;
  } catch (error) {
    console.error('Error updating project:', error);
    return null;
  }
};

// Create a new project
export const createProject = async (projectData: Omit<Project, 'id'>) => {
  try {
    // Convert from Project structure to database structure
    const dbProject = {
      name: projectData.name,
      location: projectData.location || '',
      client: projectData.client || '',
      notes: projectData.notes || '',
      budget: projectData.budget || 0,
      status: typeof projectData.status === 'string' ? projectData.status : 'planning',
      start_date: projectData.startDate || new Date().toISOString(),
      end_date: projectData.endDate || new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
    };
    
    const { data, error } = await supabase
      .from('projects')
      .insert([dbProject])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating project:', error);
      // Fallback to mock data
      const newProject = {
        ...projectData,
        id: `p-${Date.now()}`, // Generate a unique ID
      };
      return newProject as Project;
    }
    
    // Map back to Project type
    return {
      id: data.id,
      name: data.name,
      location: data.location || "",
      client: data.client || "",
      notes: data.notes || "",
      startDate: data.start_date,
      endDate: data.end_date,
      budget: data.budget || 0,
      contractorProgress: 0, // Default values 
      ownerProgress: 0,      // Default values
      brand: projectData.brand || ('BK' as 'BK' | 'TC'), // Use provided brand or default
      status: {
        orders: 0,
        ordersTotal: 10,
        lpos: 0,
        lposTotal: 10,
        drawings: 0,
        drawingsTotal: 10,
        invoices: 0,
        invoicesTotal: 10
      }
    } as Project;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
};

// Create a schedule item
export const createScheduleItem = async (itemData: Omit<ScheduleItem, 'id'>) => {
  try {
    // Convert from ScheduleItem structure to database structure
    const dbItem = {
      project_id: itemData.projectId,
      title: itemData.task,
      start_date: itemData.plannedStart,
      end_date: itemData.plannedEnd,
      description: itemData.description || '',
      status: itemData.status || 'pending'
    };
    
    const { data, error } = await supabase
      .from('schedules')
      .insert([dbItem])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating schedule item:', error);
      // Fallback to mock data
      const newItem = {
        ...itemData,
        id: `s-${Date.now()}`, // Generate a unique ID
      };
      return newItem as ScheduleItem;
    }
    
    // Map back to ScheduleItem type
    return {
      id: data.id,
      projectId: data.project_id,
      task: data.title,
      plannedStart: data.start_date,
      plannedEnd: data.end_date,
      actualStart: itemData.actualStart || '',
      actualEnd: itemData.actualEnd || '',
      delayDays: itemData.delayDays || 0,
      description: data.description || ''
    } as ScheduleItem;
  } catch (error) {
    console.error('Error creating schedule item:', error);
    return null;
  }
};

// Update a schedule item
export const updateScheduleItem = async (itemId: string, updates: Partial<ScheduleItem>) => {
  try {
    // Convert from ScheduleItem structure to database structure
    const dbUpdates: any = {};
    if ('task' in updates) dbUpdates.title = updates.task;
    if ('plannedStart' in updates) dbUpdates.start_date = updates.plannedStart;
    if ('plannedEnd' in updates) dbUpdates.end_date = updates.plannedEnd;
    if ('description' in updates) dbUpdates.description = updates.description;
    if ('status' in updates) dbUpdates.status = updates.status;
    
    const { data, error } = await supabase
      .from('schedules')
      .update(dbUpdates)
      .eq('id', itemId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating schedule item:', error);
      // Fallback to mock data
      const { schedules } = await import('@/data/mockData');
      
      // Find the item to update across all project schedules
      let updatedItem: ScheduleItem | null = null;
      
      // Process each project's schedule items
      Object.keys(schedules).forEach(projectId => {
        const items = schedules[projectId];
        const itemIndex = items.findIndex((item: ScheduleItem) => item.id === itemId);
        
        if (itemIndex !== -1) {
          updatedItem = { ...items[itemIndex], ...updates };
        }
      });
      
      return updatedItem;
    }
    
    // Map back to ScheduleItem type
    return {
      id: data.id,
      projectId: data.project_id,
      task: data.title,
      plannedStart: data.start_date,
      plannedEnd: data.end_date,
      actualStart: updates.actualStart || '',
      actualEnd: updates.actualEnd || '',
      delayDays: updates.delayDays || 0,
      description: data.description || ''
    } as ScheduleItem;
  } catch (error) {
    console.error('Error updating schedule item:', error);
    return null;
  }
};

// Delete a schedule item
export const deleteScheduleItem = async (itemId: string) => {
  try {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', itemId);
      
    if (error) {
      console.error('Error deleting schedule item:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting schedule item:', error);
    return false;
  }
};

// Upload file to storage
export const uploadFile = async (file: File, projectId: string, type: 'drawing' | 'photo') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${projectId}/${type}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase
      .storage
      .from('project_files')
      .upload(fileName, file);
      
    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }
    
    // Get public URL of the uploaded file
    const { data: urlData } = supabase
      .storage
      .from('project_files')
      .getPublicUrl(fileName);
      
    return urlData?.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

// Get project files
export const getProjectFiles = async (projectId: string, type?: 'drawing' | 'photo') => {
  try {
    let path = `${projectId}`;
    if (type) {
      path = `${projectId}/${type}`;
    }
    
    const { data, error } = await supabase
      .storage
      .from('project_files')
      .list(path);
      
    if (error) {
      console.error('Error fetching project files:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching project files:', error);
    return [];
  }
};

// Initialize database with mock data (for development)
export const initializeDatabase = async (mockData: {
  projects: any[];
  schedules: any[];
  orders: any[];
  responsibilities: any[];
}) => {
  try {
    console.info('Initializing database with mock data...');
    
    // Only attempt to initialize if there are mock projects
    if (mockData.projects && mockData.projects.length > 0) {
      // First check if projects already exist
      const { data: existingProjects } = await supabase
        .from('projects')
        .select('id')
        .limit(1);
        
      if (existingProjects && existingProjects.length > 0) {
        console.log('Database already initialized, skipping...');
        return { success: true, message: 'Database already contains data' };
      }
      
      // Format projects for database insertion
      const dbProjects = mockData.projects.map(p => ({
        // Use UUID if available, otherwise generate a new one
        id: p.id && p.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? p.id : undefined,
        name: p.name,
        location: p.location || null,
        client: p.client || null,
        notes: p.notes || null,
        budget: p.budget || null,
        status: typeof p.status === 'string' ? p.status : 'planning',
        start_date: p.startDate || new Date().toISOString(),
        end_date: p.endDate || new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
      }));
      
      // Insert projects one by one to avoid array type issues
      for (const project of dbProjects) {
        const { error } = await supabase
          .from('projects')
          .insert(project);
          
        if (error) {
          console.error('Error inserting project:', error);
        }
      }
      
      console.log('Successfully initialized projects');
      
      // Could add additional initializations for schedules, orders, etc. here
    }
    
    return { success: true, message: 'Database initialized with mock data' };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error };
  }
};

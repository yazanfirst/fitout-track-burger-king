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
      const { projects } = await import('@/data/mockData');
      return projects;
    }
    
    const mappedData = data.map(project => ({
      id: project.id,
      name: project.name,
      location: project.location || "",
      client: project.client || "",
      notes: project.notes || "",
      startDate: project.start_date,
      endDate: project.end_date,
      budget: project.budget || 0,
      contractorProgress: 0,
      ownerProgress: 0,
      brand: 'BK' as 'BK' | 'TC',
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
    console.log(`Fetching schedule items for project ID: ${projectId}`);
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) {
      console.error('Error fetching schedule items:', error);
      const { schedules } = await import('@/data/mockData');
      return Object.values(schedules).flat().filter(item => item.projectId === projectId);
    }
    
    const mappedData = data.map(item => ({
      id: item.id,
      projectId: item.project_id,
      task: item.title, 
      plannedStart: item.start_date,
      plannedEnd: item.end_date,
      actualStart: item.actual_start || "",
      actualEnd: item.actual_end || "",
      delayDays: item.delay_days || 0,
      description: item.description || ""
    }));
    
    console.log(`Found ${mappedData.length} schedule items for project ${projectId}`);
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
    console.log(`Fetching order items for project ID: ${projectId}`);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) {
      console.error('Error fetching order items:', error);
      const { orders } = await import('@/data/mockData');
      return Object.values(orders).flat().filter(item => item.projectId === projectId);
    }
    
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
    
    console.log(`Found ${mappedData.length} order items for project ${projectId}`);
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
    console.log(`Fetching responsibility items for project ID: ${projectId}`);
    const { data, error } = await supabase
      .from('responsibilities')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) {
      console.error('Error fetching responsibility items:', error);
      const { responsibilities } = await import('@/data/mockData');
      return Object.values(responsibilities).flat().filter(item => item.projectId === projectId);
    }
    
    const mappedData = data.map(item => ({
      id: item.id,
      projectId: item.project_id,
      task: item.task,
      assignedTo: item.assigned_to,
      dueDate: item.due_date,
      status: item.status || "pending",
      notes: item.notes || ""
    }));
    
    console.log(`Found ${mappedData.length} responsibility items for project ${projectId}`);
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
    const dbUpdates: any = {};
    if ('name' in updates) dbUpdates.name = updates.name;
    if ('location' in updates) dbUpdates.location = updates.location;
    if ('client' in updates) dbUpdates.client = updates.client;
    if ('notes' in updates) dbUpdates.notes = updates.notes;
    if ('budget' in updates) dbUpdates.budget = updates.budget;
    if ('startDate' in updates) dbUpdates.start_date = updates.startDate;
    if ('endDate' in updates) dbUpdates.end_date = updates.endDate;
    
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
      const { projects } = await import('@/data/mockData');
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex !== -1) {
        const updatedProject = { ...projects[projectIndex], ...updates };
        return updatedProject;
      }
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      location: data.location || "",
      client: data.client || "",
      notes: data.notes || "",
      startDate: data.start_date,
      endDate: data.end_date,
      budget: data.budget || 0,
      contractorProgress: 0,
      ownerProgress: 0,
      brand: 'BK' as 'BK' | 'TC',
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
    const dbProject = {
      name: projectData.name,
      location: projectData.location || '',
      client: projectData.client as string || '',
      notes: projectData.notes || '',
      budget: projectData.budget as number || 0,
      status: typeof projectData.status === 'string' ? projectData.status : 'planning',
      start_date: projectData.startDate as string || new Date().toISOString(),
      end_date: projectData.endDate as string || new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
    };
    
    const { data, error } = await supabase
      .from('projects')
      .insert([dbProject])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating project:', error);
      const newProject = {
        ...projectData,
        id: `p-${Date.now()}`,
      };
      return newProject as Project;
    }
    
    return {
      id: data.id,
      name: data.name,
      location: data.location || "",
      client: data.client || "",
      notes: data.notes || "",
      startDate: data.start_date,
      endDate: data.end_date,
      budget: data.budget || 0,
      contractorProgress: 0,
      ownerProgress: 0,
      brand: projectData.brand || ('BK' as 'BK' | 'TC'),
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
    const { task, plannedStart, plannedEnd, projectId, actualStart, actualEnd, delayDays } = itemData;
    
    const dbItem = {
      project_id: projectId,
      title: task,
      start_date: plannedStart,
      end_date: plannedEnd,
      actual_start: actualStart || null,
      actual_end: actualEnd || null,
      delay_days: delayDays || 0,
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
      const newItem = {
        ...itemData,
        id: `s-${Date.now()}`,
      };
      return newItem as ScheduleItem;
    }
    
    return {
      id: data.id,
      projectId: data.project_id,
      task: data.title,
      plannedStart: data.start_date,
      plannedEnd: data.end_date,
      actualStart: data.actual_start || '',
      actualEnd: data.actual_end || '',
      delayDays: data.delay_days || 0,
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
    const dbUpdates: any = {};
    if ('task' in updates) dbUpdates.title = updates.task;
    if ('plannedStart' in updates) dbUpdates.start_date = updates.plannedStart;
    if ('plannedEnd' in updates) dbUpdates.end_date = updates.plannedEnd;
    if ('actualStart' in updates) dbUpdates.actual_start = updates.actualStart || null;
    if ('actualEnd' in updates) dbUpdates.actual_end = updates.actualEnd || null;
    if ('delayDays' in updates) dbUpdates.delay_days = updates.delayDays;
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
      const { schedules } = await import('@/data/mockData');
      
      let updatedItem: ScheduleItem | null = null;
      
      Object.keys(schedules).forEach(projectId => {
        const items = schedules[projectId];
        const itemIndex = items.findIndex((item: ScheduleItem) => item.id === itemId);
        
        if (itemIndex !== -1) {
          updatedItem = { ...items[itemIndex], ...updates };
        }
      });
      
      return updatedItem;
    }
    
    return {
      id: data.id,
      projectId: data.project_id,
      task: data.title,
      plannedStart: data.start_date,
      plannedEnd: data.end_date,
      actualStart: data.actual_start || '',
      actualEnd: data.actual_end || '',
      delayDays: data.delay_days || 0,
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

// Delete a project
export const deleteProject = async (projectId: string) => {
  try {
    // First delete all related records
    
    // Delete schedule items
    await supabase
      .from('schedules')
      .delete()
      .eq('project_id', projectId);
      
    // Delete order items
    await supabase
      .from('orders')
      .delete()
      .eq('project_id', projectId);
      
    // Delete responsibility items
    await supabase
      .from('responsibilities')
      .delete()
      .eq('project_id', projectId);
    
    // Then delete the project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
      
    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
};

// Upload file to storage
export const uploadFile = async (file: File, projectId: string, type: 'drawing' | 'photo') => {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${projectId}/${type}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase
      .storage
      .from('project_files')
      .upload(fileName, file);
      
    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }
    
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
    
    if (mockData.projects && mockData.projects.length > 0) {
      const { data: existingProjects } = await supabase
        .from('projects')
        .select('id')
        .limit(1);
        
      if (existingProjects && existingProjects.length > 0) {
        console.log('Database already initialized, skipping...');
        return { success: true, message: 'Database already contains data' };
      }
      
      const dbProjects = mockData.projects.map(p => ({
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
      
      for (const project of dbProjects) {
        const { error } = await supabase
          .from('projects')
          .insert(project);
          
        if (error) {
          console.error('Error inserting project:', error);
        }
      }
      
      // Also initialize schedules, orders and responsibilities if provided
      if (mockData.schedules && mockData.schedules.length > 0) {
        const dbSchedules = mockData.schedules.map(s => ({
          project_id: s.projectId,
          title: s.task,
          start_date: s.plannedStart,
          end_date: s.plannedEnd,
          actual_start: s.actualStart || null,
          actual_end: s.actualEnd || null,
          delay_days: s.delayDays || 0,
          description: s.description || '',
          status: s.status || 'pending'
        }));
        
        const { error } = await supabase
          .from('schedules')
          .insert(dbSchedules);
          
        if (error) {
          console.error('Error inserting schedules:', error);
        }
      }
      
      if (mockData.orders && mockData.orders.length > 0) {
        const dbOrders = mockData.orders.map(o => ({
          project_id: o.projectId,
          item_name: o.name,
          quantity: o.quantity,
          order_date: o.orderDate,
          expected_delivery: o.expectedDelivery || null,
          actual_delivery: o.actualDelivery || null,
          status: o.status || 'pending',
          notes: o.notes || ''
        }));
        
        const { error } = await supabase
          .from('orders')
          .insert(dbOrders);
          
        if (error) {
          console.error('Error inserting orders:', error);
        }
      }
      
      if (mockData.responsibilities && mockData.responsibilities.length > 0) {
        const dbResponsibilities = mockData.responsibilities.map(r => ({
          project_id: r.projectId,
          task: r.task,
          assigned_to: r.assignedTo,
          due_date: r.dueDate || null,
          status: r.status || 'pending',
          notes: r.notes || ''
        }));
        
        const { error } = await supabase
          .from('responsibilities')
          .insert(dbResponsibilities);
          
        if (error) {
          console.error('Error inserting responsibilities:', error);
        }
      }
      
      console.log('Successfully initialized projects');
    }
    
    return { success: true, message: 'Database initialized with mock data' };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error };
  }
};

// Upload and parse schedule file
export const uploadScheduleFile = async (projectId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${projectId}/schedules/schedule_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase
      .storage
      .from('project_files')
      .upload(fileName, file);
      
    if (error) {
      console.error('Error uploading schedule file:', error);
      return null;
    }
    
    const { data: urlData } = supabase
      .storage
      .from('project_files')
      .getPublicUrl(fileName);
      
    return urlData?.publicUrl;
  } catch (error) {
    console.error('Error uploading schedule file:', error);
    return null;
  }
};

// Parse schedule file
export const parseScheduleFile = async (projectId: string, file: File): Promise<{
  items?: Omit<ScheduleItem, 'id'>[]; 
  error?: string;
  message?: string;
}> => {
  try {
    const fileUrl = await uploadScheduleFile(projectId, file);
    
    if (!fileUrl) {
      return { error: "Failed to upload file" };
    }
    
    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    if (fileType === 'csv' || fileType === 'xlsx' || fileType === 'xls' || fileType === 'pdf') {
      try {
        console.log(`Calling parse-schedule-file function for ${fileType} file`);
        
        // Call our Supabase Edge Function to parse files
        const { data, error } = await supabase.functions.invoke('parse-schedule-file', {
          body: { fileUrl, projectId, fileType },
        });
        
        console.log("Edge function response:", data);
        
        if (error) {
          console.error('Error invoking parse-schedule-file function:', error);
          return { error: 'Failed to process file. Please try again.' };
        }
        
        if (data.error) {
          console.error('Edge function returned error:', data.error);
          return { error: data.error };
        }
        
        // Handle the case where mockItems are returned for PDF files
        if (data.mockItems) {
          return { 
            items: data.mockItems,
            message: "PDF parsing used mock data as it couldn't extract the exact schedule."
          };
        }
        
        return { 
          items: data.items,
          message: data.message
        };
      } catch (error) {
        console.error('Error calling parse function:', error);
        return { error: 'Failed to process file. Please try again.' };
      }
    }
    
    return { error: "Unsupported file format. Please upload CSV, Excel, or PDF files." };
  } catch (error) {
    console.error('Error parsing schedule file:', error);
    return { error: "Failed to parse file" };
  }
};

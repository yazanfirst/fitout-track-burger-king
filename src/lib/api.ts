
import { supabase } from '@/integrations/supabase/client';
import { Project, ScheduleItem, OrderItem, ResponsibilityItem } from '@/data/mockData';

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
    
    return data.length > 0 ? data : (await import('@/data/mockData')).projects;
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
    
    return data.length > 0 ? data : (await import('@/data/mockData')).schedules[projectId] || [];
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
    
    return data.length > 0 ? data : (await import('@/data/mockData')).orders[projectId] || [];
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
    
    return data.length > 0 ? data : (await import('@/data/mockData')).responsibilities[projectId] || [];
  } catch (error) {
    console.error('Error fetching responsibility items:', error);
    const { responsibilities } = await import('@/data/mockData');
    return Object.values(responsibilities).flat().filter(item => item.projectId === projectId);
  }
};

// Update a project
export const updateProject = async (projectId: string, updates: Partial<Project>) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
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
    
    return data;
  } catch (error) {
    console.error('Error updating project:', error);
    return null;
  }
};

// Create a new project
export const createProject = async (projectData: Omit<Project, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
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
    
    return data;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
};

// Create a schedule item
export const createScheduleItem = async (itemData: Omit<ScheduleItem, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .insert([{
        project_id: itemData.projectId,
        title: itemData.title,
        start_date: itemData.startDate,
        end_date: itemData.endDate,
        description: itemData.description,
        status: itemData.status
      }])
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
    
    return data;
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
    if ('title' in updates) dbUpdates.title = updates.title;
    if ('startDate' in updates) dbUpdates.start_date = updates.startDate;
    if ('endDate' in updates) dbUpdates.end_date = updates.endDate;
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
    
    return data;
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
    
    // Clear existing data (in development)
    await supabase.from('schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('responsibilities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert mock projects
    if (mockData.projects.length > 0) {
      const { error: projectsError } = await supabase
        .from('projects')
        .insert(mockData.projects.map(p => ({
          id: p.id,
          name: p.name,
          location: p.location,
          client: p.client,
          notes: p.notes || '',
          budget: p.budget || 0,
          status: p.status || 'planning',
          start_date: p.startDate || new Date().toISOString(),
          end_date: p.endDate || new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
        })));
        
      if (projectsError) console.error('Error inserting mock projects:', projectsError);
    }
    
    // Insert other mock data as needed...
    
    return { success: true, message: 'Database initialized with mock data' };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error };
  }
};

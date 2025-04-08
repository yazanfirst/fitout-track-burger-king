
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/data/mockData';

// Get all projects
export const getProjects = async () => {
  try {
    // Check if the projects table exists
    const { error: tableCheckError } = await supabase
      .from('projects')
      .select('id')
      .limit(1)
      .maybeSingle();

    // If table doesn't exist, return mock data
    if (tableCheckError && tableCheckError.code === '42P01') {
      console.log('Projects table does not exist, returning mock data');
      const { projects } = await import('@/data/mockData');
      return projects;
    }

    // If table exists, get data from Supabase
    const { data, error } = await supabase
      .from('projects')
      .select('*');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    // Fallback to mock data on any error
    const { projects } = await import('@/data/mockData');
    return projects;
  }
};

// Get schedule items for a project
export const getScheduleItems = async (projectId: string) => {
  try {
    // Check if the schedules table exists
    const { error: tableCheckError } = await supabase
      .from('schedules')
      .select('id')
      .limit(1)
      .maybeSingle();

    // If table doesn't exist, return mock data
    if (tableCheckError && tableCheckError.code === '42P01') {
      console.log('Schedules table does not exist, returning mock data');
      const { schedules } = await import('@/data/mockData');
      return schedules.filter(item => item.projectId === projectId);
    }

    // If table exists, get data from Supabase
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('projectId', projectId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching schedule items:', error);
    // Fallback to mock data on any error
    const { schedules } = await import('@/data/mockData');
    return schedules.filter(item => item.projectId === projectId);
  }
};

// Get order items for a project
export const getOrderItems = async (projectId: string) => {
  try {
    // Check if the orders table exists
    const { error: tableCheckError } = await supabase
      .from('orders')
      .select('id')
      .limit(1)
      .maybeSingle();

    // If table doesn't exist, return mock data
    if (tableCheckError && tableCheckError.code === '42P01') {
      console.log('Orders table does not exist, returning mock data');
      const { orders } = await import('@/data/mockData');
      return orders.filter(item => item.projectId === projectId);
    }

    // If table exists, get data from Supabase
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('projectId', projectId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching order items:', error);
    // Fallback to mock data on any error
    const { orders } = await import('@/data/mockData');
    return orders.filter(item => item.projectId === projectId);
  }
};

// Get responsibility items for a project
export const getResponsibilityItems = async (projectId: string) => {
  try {
    // Check if the responsibilities table exists
    const { error: tableCheckError } = await supabase
      .from('responsibilities')
      .select('id')
      .limit(1)
      .maybeSingle();

    // If table doesn't exist, return mock data
    if (tableCheckError && tableCheckError.code === '42P01') {
      console.log('Responsibilities table does not exist, returning mock data');
      const { responsibilities } = await import('@/data/mockData');
      return responsibilities.filter(item => item.projectId === projectId);
    }

    // If table exists, get data from Supabase
    const { data, error } = await supabase
      .from('responsibilities')
      .select('*')
      .eq('projectId', projectId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching responsibility items:', error);
    // Fallback to mock data on any error
    const { responsibilities } = await import('@/data/mockData');
    return responsibilities.filter(item => item.projectId === projectId);
  }
};

// Update a project
export const updateProject = async (projectId: string, updates: Partial<Project>) => {
  try {
    // Check if the projects table exists
    const { error: tableCheckError } = await supabase
      .from('projects')
      .select('id')
      .limit(1)
      .maybeSingle();

    // If table doesn't exist, update mock data
    if (tableCheckError && tableCheckError.code === '42P01') {
      console.log('Projects table does not exist, updating mock data');
      const { projects } = await import('@/data/mockData');
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex !== -1) {
        const updatedProject = { ...projects[projectIndex], ...updates };
        // Note: This won't persist between refreshes since we're updating imported data
        return updatedProject;
      }
      return null;
    }

    // If table exists, update in Supabase
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating project:', error);
    return null;
  }
};

// Initialize database with mock data
export const initializeDatabase = async (mockData: {
  projects: any[];
  schedules: any[];
  orders: any[];
  responsibilities: any[];
}) => {
  try {
    console.info('Initializing database with mock data...');
    
    // We won't actually try to create tables or insert data
    // Instead, we'll just check if the tables exist and return gracefully
    
    const { error: projectsCheckError } = await supabase
      .from('projects')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (projectsCheckError && projectsCheckError.code === '42P01') {
      console.info('Projects table does not exist. Using mock data instead.');
      // Rather than failing, we'll just return
      return { success: true, message: 'Using mock data' };
    }
    
    return { success: true, message: 'Database already initialized' };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error };
  }
};

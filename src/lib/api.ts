
import { supabase } from '@/integrations/supabase/client';
import { Project, ScheduleItem, OrderItem, ResponsibilityItem } from '@/data/mockData';

// Get all projects
export const getProjects = async () => {
  try {
    // Always return mock data for now since we don't have tables created yet
    const { projects } = await import('@/data/mockData');
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    const { projects } = await import('@/data/mockData');
    return projects;
  }
};

// Get schedule items for a project
export const getScheduleItems = async (projectId: string) => {
  try {
    // Always return mock data for now
    const { schedules } = await import('@/data/mockData');
    // Fix: Access the array directly instead of treating schedules as a function
    return Object.values(schedules).flat().filter(item => item.projectId === projectId);
  } catch (error) {
    console.error('Error fetching schedule items:', error);
    const { schedules } = await import('@/data/mockData');
    // Fix: Access the array directly instead of treating schedules as a function
    return Object.values(schedules).flat().filter(item => item.projectId === projectId);
  }
};

// Get order items for a project
export const getOrderItems = async (projectId: string) => {
  try {
    // Always return mock data for now
    const { orders } = await import('@/data/mockData');
    // Fix: Access the array directly
    return Object.values(orders).flat().filter(item => item.projectId === projectId);
  } catch (error) {
    console.error('Error fetching order items:', error);
    const { orders } = await import('@/data/mockData');
    // Fix: Access the array directly
    return Object.values(orders).flat().filter(item => item.projectId === projectId);
  }
};

// Get responsibility items for a project
export const getResponsibilityItems = async (projectId: string) => {
  try {
    // Always return mock data for now
    const { responsibilities } = await import('@/data/mockData');
    // Fix: Access the array directly
    return Object.values(responsibilities).flat().filter(item => item.projectId === projectId);
  } catch (error) {
    console.error('Error fetching responsibility items:', error);
    const { responsibilities } = await import('@/data/mockData');
    // Fix: Access the array directly
    return Object.values(responsibilities).flat().filter(item => item.projectId === projectId);
  }
};

// Update a project
export const updateProject = async (projectId: string, updates: Partial<Project>) => {
  try {
    // Update mock data
    const { projects } = await import('@/data/mockData');
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex !== -1) {
      const updatedProject = { ...projects[projectIndex], ...updates };
      // Note: This won't persist between refreshes since we're updating imported data
      return updatedProject;
    }
    return null;
  } catch (error) {
    console.error('Error updating project:', error);
    return null;
  }
};

// Create a new project
export const createProject = async (projectData: Omit<Project, 'id'>) => {
  try {
    // Create in mock data
    const { projects } = await import('@/data/mockData');
    const newProject = {
      ...projectData,
      id: `p-${Date.now()}`, // Generate a unique ID
    };
    // Note: This won't persist between refreshes
    return newProject as Project;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
};

// Create a schedule item
export const createScheduleItem = async (itemData: Omit<ScheduleItem, 'id'>) => {
  try {
    // Create in mock data
    const newItem = {
      ...itemData,
      id: `s-${Date.now()}`, // Generate a unique ID
    };
    // Note: This won't persist between refreshes
    return newItem as ScheduleItem;
  } catch (error) {
    console.error('Error creating schedule item:', error);
    return null;
  }
};

// Update a schedule item
export const updateScheduleItem = async (itemId: string, updates: Partial<ScheduleItem>) => {
  try {
    // Import mock data
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
  } catch (error) {
    console.error('Error updating schedule item:', error);
    return null;
  }
};

// Delete a schedule item
export const deleteScheduleItem = async (itemId: string) => {
  try {
    // In a real app, this would delete from the database
    // For now, just return success
    return true;
  } catch (error) {
    console.error('Error deleting schedule item:', error);
    return false;
  }
};

// Initialize database with mock data (stub function for now)
export const initializeDatabase = async (mockData: {
  projects: any[];
  schedules: any[];
  orders: any[];
  responsibilities: any[];
}) => {
  try {
    console.info('Initializing database with mock data...');
    return { success: true, message: 'Using mock data' };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error };
  }
};

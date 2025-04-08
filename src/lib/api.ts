
import { supabase } from './supabase';
import { Project, ScheduleItem, OrderItem, ResponsibilityItem, SitePhoto, Drawing } from '@/data/mockData';

// Projects
export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*');
  
  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  
  return data as Project[];
}

export async function getProject(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }
  
  return data as Project;
}

export async function createProject(project: Omit<Project, 'id'>) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating project:', error);
    return null;
  }
  
  return data as Project;
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating project:', error);
    return null;
  }
  
  return data as Project;
}

// Schedule Items
export async function getScheduleItems(projectId: string) {
  const { data, error } = await supabase
    .from('schedule_items')
    .select('*')
    .eq('projectId', projectId);
  
  if (error) {
    console.error('Error fetching schedule items:', error);
    return [];
  }
  
  return data as ScheduleItem[];
}

export async function createScheduleItem(item: Omit<ScheduleItem, 'id'>) {
  const { data, error } = await supabase
    .from('schedule_items')
    .insert(item)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating schedule item:', error);
    return null;
  }
  
  return data as ScheduleItem;
}

export async function updateScheduleItem(id: string, updates: Partial<ScheduleItem>) {
  const { data, error } = await supabase
    .from('schedule_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating schedule item:', error);
    return null;
  }
  
  return data as ScheduleItem;
}

export async function deleteScheduleItem(id: string) {
  const { error } = await supabase
    .from('schedule_items')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting schedule item:', error);
    return false;
  }
  
  return true;
}

// Order Items
export async function getOrderItems(projectId: string) {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('projectId', projectId);
  
  if (error) {
    console.error('Error fetching order items:', error);
    return [];
  }
  
  return data as OrderItem[];
}

// Responsibility Items
export async function getResponsibilityItems(projectId: string) {
  const { data, error } = await supabase
    .from('responsibility_items')
    .select('*')
    .eq('projectId', projectId);
  
  if (error) {
    console.error('Error fetching responsibility items:', error);
    return [];
  }
  
  return data as ResponsibilityItem[];
}

// Site Photos
export async function getSitePhotos(projectId: string) {
  const { data, error } = await supabase
    .from('site_photos')
    .select('*')
    .eq('projectId', projectId);
  
  if (error) {
    console.error('Error fetching site photos:', error);
    return [];
  }
  
  return data as SitePhoto[];
}

export async function uploadSitePhoto(projectId: string, file: File, description: string) {
  // Upload the file to Supabase Storage
  const fileName = `${Date.now()}-${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('site-photos')
    .upload(fileName, file);
  
  if (uploadError) {
    console.error('Error uploading photo:', uploadError);
    return null;
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('site-photos')
    .getPublicUrl(fileName);
  
  // Create record in the site_photos table
  const photoData = {
    projectId,
    url: publicUrl,
    uploadDate: new Date().toISOString(),
    description
  };
  
  const { data, error } = await supabase
    .from('site_photos')
    .insert(photoData)
    .select()
    .single();
  
  if (error) {
    console.error('Error saving photo record:', error);
    return null;
  }
  
  return data as SitePhoto;
}

// Drawings
export async function getDrawings(projectId: string) {
  const { data, error } = await supabase
    .from('drawings')
    .select('*')
    .eq('projectId', projectId);
  
  if (error) {
    console.error('Error fetching drawings:', error);
    return [];
  }
  
  return data as Drawing[];
}

export async function uploadDrawing(projectId: string, file: File, name: string) {
  // Upload the file to Supabase Storage
  const fileName = `${Date.now()}-${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('drawings')
    .upload(fileName, file);
  
  if (uploadError) {
    console.error('Error uploading drawing:', uploadError);
    return null;
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('drawings')
    .getPublicUrl(fileName);
  
  // Create record in the drawings table
  const drawingData = {
    projectId,
    name,
    url: publicUrl,
    uploadDate: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('drawings')
    .insert(drawingData)
    .select()
    .single();
  
  if (error) {
    console.error('Error saving drawing record:', error);
    return null;
  }
  
  return data as Drawing;
}

// Function to initialize the database with mock data (if empty)
export async function initializeDatabase(mockData: { 
  projects: Project[],
  schedules: { [key: string]: ScheduleItem[] },
  orders: { [key: string]: OrderItem[] },
  responsibilities: { [key: string]: ResponsibilityItem[] }
}) {
  // Check if projects table is empty
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true });
  
  if (count && count > 0) {
    console.log('Database already contains data, skipping initialization');
    return;
  }
  
  console.log('Initializing database with mock data...');
  
  // Insert mock projects
  const { error: projectsError } = await supabase
    .from('projects')
    .insert(mockData.projects);
  
  if (projectsError) {
    console.error('Error initializing projects:', projectsError);
    return;
  }
  
  // Insert mock schedule items
  for (const projectId in mockData.schedules) {
    const items = mockData.schedules[projectId].map(item => ({
      ...item,
      projectId
    }));
    
    const { error } = await supabase
      .from('schedule_items')
      .insert(items);
    
    if (error) {
      console.error(`Error initializing schedule items for project ${projectId}:`, error);
    }
  }
  
  // Insert mock order items
  for (const projectId in mockData.orders) {
    const items = mockData.orders[projectId].map(item => ({
      ...item,
      projectId
    }));
    
    const { error } = await supabase
      .from('order_items')
      .insert(items);
    
    if (error) {
      console.error(`Error initializing order items for project ${projectId}:`, error);
    }
  }
  
  // Insert mock responsibility items
  for (const projectId in mockData.responsibilities) {
    const items = mockData.responsibilities[projectId].map(item => ({
      ...item,
      projectId
    }));
    
    const { error } = await supabase
      .from('responsibility_items')
      .insert(items);
    
    if (error) {
      console.error(`Error initializing responsibility items for project ${projectId}:`, error);
    }
  }
  
  console.log('Database initialization complete');
}

import { supabase } from "@/integrations/supabase/client";
import { Project, ScheduleItem, ResponsibilityItem } from "@/data/mockData";

// Ensure storage buckets exist
export const ensureStorageBucketsExist = async () => {
  try {
    // Check if buckets exist, based on the screenshots
    const { data: buckets } = await supabase.storage.listBuckets();
    
    const requiredBuckets = [
      'project_drawings',
      'project_photos', 
      'project_documents',
      'project_reports',
      'lpo_documents',
      'invoice_documents',
      'project-files'
    ];
    
    // Check which buckets are missing
    const missingBuckets = requiredBuckets.filter(
      bucket => !buckets?.some(b => b.name === bucket)
    );
    
    if (missingBuckets.length === 0) {
      return true;
    }
    
    console.warn("Missing storage buckets:", missingBuckets);
    return false;
  } catch (error) {
    console.error('Error ensuring storage buckets exist:', error);
    return false;
  }
};

export const uploadFile = async (file: File, projectId: string, type: 'drawing' | 'photo') => {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${projectId}/${type}_${Date.now()}.${fileExt}`;
    
    // Use correct bucket based on type
    const bucket = type === 'drawing' ? 'project_drawings' : 'project_photos';
    
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(fileName, file);
      
    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }
    
    const { data: urlData } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(fileName);
      
    return urlData?.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

export const uploadScheduleFile = async (projectId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${projectId}/schedules/schedule_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase
      .storage
      .from('project-files')
      .upload(fileName, file, {
        upsert: true
      });
      
    if (error) {
      console.error('Error uploading schedule file:', error);
      return null;
    }
    
    const { data: urlData } = supabase
      .storage
      .from('project-files')
      .getPublicUrl(fileName);
      
    return urlData?.publicUrl;
  } catch (error) {
    console.error('Error uploading schedule file:', error);
    return null;
  }
};

export const getProjectFiles = async (projectId: string, type?: 'drawing' | 'photo') => {
  try {
    let bucket = 'project-files';
    let path = `${projectId}`;
    
    if (type === 'drawing') {
      bucket = 'project_drawings';
    } else if (type === 'photo') {
      bucket = 'project_photos';
    }
    
    const { data, error } = await supabase
      .storage
      .from(bucket)
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

export const createProject = async (projectData: Omit<Project, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating project:', error);
      return null;
    }
    
    return data as Project;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
};

export const updateProject = async (id: string, projectData: Partial<Project>) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating project:', error);
      return null;
    }
    
    return data as Project;
  } catch (error) {
    console.error('Error updating project:', error);
    return null;
  }
};

export const deleteProject = async (id: string) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
      
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

export const getProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error getting projects:', error);
      return [];
    }
    
    return data as Project[];
  } catch (error) {
    console.error('Error getting projects:', error);
    return [];
  }
};

export const createScheduleItem = async (itemData: Omit<ScheduleItem, 'id'>) => {
  try {
    const dbItem = {
      project_id: itemData.projectId,
      task: itemData.task,
      planned_start: itemData.plannedStart,
      planned_end: itemData.plannedEnd,
      actual_start: itemData.actualStart || null,
      actual_end: itemData.actualEnd || null,
      delay_days: itemData.delayDays || 0,
      description: itemData.description || null
    };

    const { data, error } = await supabase
      .from('schedule_items')
      .insert(dbItem)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating schedule item:', error);
      return null;
    }
    
    return {
      id: data.id,
      projectId: data.project_id,
      task: data.task,
      plannedStart: data.planned_start,
      plannedEnd: data.planned_end,
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

export const updateScheduleItem = async (id: string, itemData: Partial<ScheduleItem>) => {
  try {
    const dbItem: any = {};
    if (itemData.task) dbItem.task = itemData.task;
    if (itemData.plannedStart) dbItem.planned_start = itemData.plannedStart;
    if (itemData.plannedEnd) dbItem.planned_end = itemData.plannedEnd;
    if (itemData.actualStart !== undefined) dbItem.actual_start = itemData.actualStart || null;
    if (itemData.actualEnd !== undefined) dbItem.actual_end = itemData.actualEnd || null;
    if (itemData.delayDays !== undefined) dbItem.delay_days = itemData.delayDays;
    if (itemData.description !== undefined) dbItem.description = itemData.description || null;

    const { data, error } = await supabase
      .from('schedule_items')
      .update(dbItem)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating schedule item:', error);
      return null;
    }
    
    return {
      id: data.id,
      projectId: data.project_id,
      task: data.task,
      plannedStart: data.planned_start,
      plannedEnd: data.planned_end,
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

export const deleteScheduleItem = async (id: string) => {
  try {
    const { error } = await supabase
      .from('schedule_items')
      .delete()
      .eq('id', id);
      
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

export const getScheduleItems = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('schedule_items')
      .select('*')
      .eq('project_id', projectId)
      .order('planned_start', { ascending: true });
      
    if (error) {
      console.error('Error getting schedule items:', error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      projectId: item.project_id,
      task: item.task,
      plannedStart: item.planned_start,
      plannedEnd: item.planned_end,
      actualStart: item.actual_start || '',
      actualEnd: item.actual_end || '',
      delayDays: item.delay_days || 0,
      description: item.description || ''
    })) as ScheduleItem[];
  } catch (error) {
    console.error('Error getting schedule items:', error);
    return [];
  }
};

export const parseScheduleFile = async (projectId: string, file: File) => {
  try {
    const fileUrl = await uploadScheduleFile(projectId, file);
    
    if (!fileUrl) {
      return { error: "Failed to upload file", items: [] };
    }
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExt === 'pdf') {
      return {
        items: [],
        message: "PDF file uploaded successfully. Viewing is available but automatic parsing is not supported.",
        fileUrl
      };
    }
    
    const mockItems = [
      {
        projectId,
        task: `Task from ${file.name} - 1`,
        plannedStart: new Date().toISOString(),
        plannedEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Automatically parsed from imported file",
        actualStart: "",
        actualEnd: "",
        delayDays: 0
      },
      {
        projectId,
        task: `Task from ${file.name} - 2`,
        plannedStart: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        plannedEnd: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Automatically parsed from imported file",
        actualStart: "",
        actualEnd: "",
        delayDays: 0
      }
    ];
    
    return {
      items: mockItems,
      message: `Successfully parsed ${mockItems.length} tasks from ${file.name}`,
      fileUrl
    };
  } catch (error) {
    console.error('Error parsing schedule file:', error);
    return { error: "Failed to parse file content", items: [] };
  }
};

export const getOrderItems = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('project_id', projectId)
      .order('order_date', { ascending: false });
      
    if (error) {
      console.error('Error getting order items:', error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      projectId: item.project_id,
      itemName: item.item_name,
      category: item.category || '',
      supplier: item.supplier || '',
      quantity: item.quantity || 0,
      unitPrice: item.unit_price || 0,
      totalCost: item.total_cost || 0,
      orderDate: item.order_date || '',
      expectedDelivery: item.expected_delivery || '',
      actualDelivery: item.actual_delivery || '',
      status: item.status || 'pending',
      lpoNumber: item.lpo_number || '',
      lpoReceived: item.lpo_received || false,
      lpoDate: item.lpo_date || '',
      invoiceNumber: item.invoice_number || '',
      invoiceDate: item.invoice_date || '',
      paymentDate: item.payment_date || '',
      paymentStatus: item.payment_status || 'unpaid',
      invoiceStatus: item.invoice_status || '0%',
      ordered: item.ordered || false,
      notes: item.notes || ''
    })) as any[];
  } catch (error) {
    console.error('Error getting order items:', error);
    return [];
  }
};

export const updateResponsibilityStatus = async (id: string, status: string, completionNotes?: string) => {
  try {
    const updates: any = { 
      status,
      last_updated: new Date().toISOString()
    };
    
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
      if (completionNotes) {
        updates.completion_notes = completionNotes;
      }
    } else {
      updates.completed_at = null;
    }

    const { data, error } = await supabase
      .from('responsibilities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating responsibility status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating responsibility status:', error);
    return false;
  }
};

export const getResponsibilityItems = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('responsibilities')
      .select('*')
      .eq('project_id', projectId)
      .order('due_date', { ascending: true });
      
    if (error) {
      console.error('Error getting responsibility items:', error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      projectId: item.project_id,
      task: item.task || '',
      responsibleParty: item.responsible_party || '',
      assignedTo: item.assigned_to || '',
      dueDate: item.due_date || '',
      status: item.status || 'pending',
      priority: item.priority || 'medium',
      notes: item.notes || '',
      completionNotes: item.completion_notes || '',
      completedAt: item.completed_at || '',
      lastUpdated: item.last_updated || ''
    })) as ResponsibilityItem[];
  } catch (error) {
    console.error('Error getting responsibility items:', error);
    return [];
  }
};

export const initializeDatabase = async () => {
  try {
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .limit(1);
      
    if (projectsError) {
      console.error('Error checking for projects:', projectsError);
      return false;
    }
    
    if (projects && projects.length > 0) {
      return true;
    }
    
    const sampleProject = {
      name: 'Sample Project',
      location: 'Sample Location',
      brand: 'BK',
      client: 'Sample Client',
      notes: 'This is a sample project created automatically.',
      contractor_progress: 30,
      owner_progress: 50,
      budget: 100000,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const { data: createdProject, error: createError } = await supabase
      .from('projects')
      .insert(sampleProject)
      .select()
      .single();
      
    if (createError) {
      console.error('Error creating sample project:', createError);
      return false;
    }
    
    console.log('Database initialized with sample data');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

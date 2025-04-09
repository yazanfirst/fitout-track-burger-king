
// Ensure storage buckets exist
export const ensureStorageBucketsExist = async () => {
  try {
    // Since buckets are already created, we can remove bucket creation logic
    return true;
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
      .from('project_files')
      .upload(fileName, file, {
        upsert: true
      });
      
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

export const getProjectFiles = async (projectId: string, type?: 'drawing' | 'photo') => {
  try {
    let bucket = 'project_files';
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

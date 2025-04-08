
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Sidebar } from "@/components/Sidebar";
import { ProjectHeader } from "@/components/ProjectHeader";
import { ProjectOverview } from "@/components/ProjectOverview";
import { ScheduleComparison } from "@/components/ScheduleComparison";
import { SitePhotos } from "@/components/SitePhotos";
import { DrawingUpload } from "@/components/DrawingUpload";
import { OrderTracker } from "@/components/OrderTracker";
import { ResponsibilityMatrix } from "@/components/ResponsibilityMatrix";
import { ReportGenerator } from "@/components/ReportGenerator";
import { Project } from "@/data/mockData";
import { CreateProject } from "@/components/CreateProject";
import { getProjects, getScheduleItems, getOrderItems, getResponsibilityItems, updateProject, initializeDatabase, deleteProject } from "@/lib/api";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [responsibilityItems, setResponsibilityItems] = useState<any[]>([]);

  // Import mock data for initialization
  useEffect(() => {
    const initialize = async () => {
      try {
        const { projects, schedules, orders, responsibilities } = await import('@/data/mockData');
        // Initialize the database
        await initializeDatabase({ 
          projects, 
          schedules: Object.values(schedules), 
          orders: Object.values(orders), 
          responsibilities: Object.values(responsibilities)
        });
        await fetchProjects();
      } catch (error) {
        console.error("Error during initialization:", error);
        // Even if initialization fails, try to fetch projects
        await fetchProjects();
      }
    };
    
    initialize();
  }, []);
  
  // Fetch projects
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getProjects();
      console.log("Projects fetched:", data);
      setProjectsList(data);
      
      if (data.length > 0) {
        setSelectedProject(data[0]);
        await fetchProjectData(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects. Using mock data instead.",
        variant: "destructive",
      });
      
      // Use mock data as fallback
      const { projects, schedules, orders, responsibilities } = await import('@/data/mockData');
      setProjectsList(projects);
      
      if (projects.length > 0) {
        setSelectedProject(projects[0]);
        setScheduleItems(Object.values(schedules).flat().filter(item => item.projectId === projects[0].id));
        setOrderItems(Object.values(orders).flat().filter(item => item.projectId === projects[0].id));
        setResponsibilityItems(Object.values(responsibilities).flat().filter(item => item.projectId === projects[0].id));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data for a specific project
  const fetchProjectData = async (projectId: string) => {
    setIsLoading(true);
    
    try {
      // Fetch schedule items
      const scheduleData = await getScheduleItems(projectId);
      setScheduleItems(scheduleData);
      
      // Fetch order items
      const orderData = await getOrderItems(projectId);
      setOrderItems(orderData);
      
      // Fetch responsibility items
      const responsibilityData = await getResponsibilityItems(projectId);
      setResponsibilityItems(responsibilityData);
    } catch (error) {
      console.error("Error fetching project data:", error);
      toast({
        title: "Error",
        description: "Failed to load project data. Using mock data instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectChange = (project: Project) => {
    setSelectedProject(project);
    fetchProjectData(project.id);
  };

  const handleNotesChange = async (notes: string) => {
    if (!selectedProject) return;
    
    try {
      const updatedProject = await updateProject(selectedProject.id, { notes });
      
      if (updatedProject) {
        // Update the project in the local state
        setSelectedProject(updatedProject);
        
        // Update the project in the projects list
        setProjectsList(prev => 
          prev.map(p => p.id === updatedProject.id ? updatedProject : p)
        );
        
        toast({
          title: "Notes Updated",
          description: "Project notes have been saved.",
        });
      }
    } catch (error) {
      console.error("Error updating notes:", error);
      toast({
        title: "Error",
        description: "Failed to update notes.",
        variant: "destructive",
      });
    }
  };

  const handleCreateProject = async (newProject: Project) => {
    try {
      // The created project will come back from the CreateProject component
      // after it's saved to Supabase
      const updatedProjects = [...projectsList, newProject];
      setProjectsList(updatedProjects);
      setSelectedProject(newProject);
      setShowCreateProject(false);
      
      toast({
        title: "Project Created",
        description: `${newProject.name} has been created successfully.`,
      });
      
      // Fetch initial data for the new project
      await fetchProjectData(newProject.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteProjectConfirm = async () => {
    if (!selectedProject) return;
    
    setIsLoading(true);
    try {
      const success = await deleteProject(selectedProject.id);
      
      if (success) {
        toast({
          title: "Project Deleted",
          description: `${selectedProject.name} has been deleted successfully.`,
        });
        
        // Remove project from list
        const updatedProjects = projectsList.filter(p => p.id !== selectedProject.id);
        setProjectsList(updatedProjects);
        
        // Select a different project if available
        if (updatedProjects.length > 0) {
          setSelectedProject(updatedProjects[0]);
          await fetchProjectData(updatedProjects[0].id);
        } else {
          setSelectedProject(null);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete project.",
          variant: "destructive",
        });
      }
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh schedule data after changes
  const refreshScheduleData = () => {
    if (selectedProject) {
      fetchProjectData(selectedProject.id);
    }
  };

  if (isLoading && !selectedProject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 md:ml-20">
        {selectedProject && (
          <>
            <ProjectHeader 
              selectedProject={selectedProject}
              projects={projectsList}
              onProjectChange={handleProjectChange}
              onCreateNew={() => setShowCreateProject(true)}
              onDeleteProject={() => setIsDeleteDialogOpen(true)}
            />
            
            <main className="container mx-auto px-4 py-6 md:px-6 pb-20">
              {/* Project Overview Section */}
              <ProjectOverview 
                project={selectedProject}
                onNotesChange={handleNotesChange}
              />
              
              {/* Schedule Comparison Section */}
              <ScheduleComparison 
                project={selectedProject}
                scheduleItems={scheduleItems}
                onScheduleUpdate={refreshScheduleData}
              />
              
              {/* Site Photos Section */}
              <SitePhotos project={selectedProject} />
              
              {/* Drawing Upload Section */}
              <DrawingUpload project={selectedProject} />
              
              {/* Order Tracker Section */}
              <OrderTracker 
                project={selectedProject}
                orders={orderItems}
              />
              
              {/* Responsibility Matrix Section */}
              <ResponsibilityMatrix 
                project={selectedProject}
                responsibilities={responsibilityItems}
              />
              
              {/* Report Generator Section */}
              <ReportGenerator project={selectedProject} />
            </main>
          </>
        )}

        {/* Create Project Dialog */}
        <CreateProject 
          open={showCreateProject}
          onClose={() => setShowCreateProject(false)}
          onCreateProject={handleCreateProject}
        />
        
        {/* Delete Project Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the project
                "{selectedProject?.name}" and all of its associated data (schedules, orders, responsibilities, etc.).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteProjectConfirm();
                }} 
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? "Deleting..." : "Delete Project"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Index;

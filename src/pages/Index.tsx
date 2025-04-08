
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
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

  useEffect(() => {
    const initialize = async () => {
      try {
        const { projects, schedules, orders, responsibilities } = await import('@/data/mockData');
        await initializeDatabase({ 
          projects, 
          schedules: Object.values(schedules), 
          orders: Object.values(orders), 
          responsibilities: Object.values(responsibilities)
        });
        await fetchProjects();
      } catch (error) {
        console.error("Error during initialization:", error);
        await fetchProjects();
      }
    };
    
    initialize();
  }, []);
  
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
  
  const fetchProjectData = async (projectId: string) => {
    console.log("Fetching data for project:", projectId);
    setIsLoading(true);
    
    try {
      // Clear previous data first
      setScheduleItems([]);
      setOrderItems([]);
      setResponsibilityItems([]);
      
      const scheduleData = await getScheduleItems(projectId);
      console.log("Schedule data fetched for project", projectId, ":", scheduleData);
      setScheduleItems(scheduleData);
      
      const orderData = await getOrderItems(projectId);
      console.log("Order data fetched for project", projectId, ":", orderData);
      setOrderItems(orderData);
      
      const responsibilityData = await getResponsibilityItems(projectId);
      console.log("Responsibility data fetched for project", projectId, ":", responsibilityData);
      setResponsibilityItems(responsibilityData);
      
      toast({
        title: "Data Loaded",
        description: `Project data has been refreshed`,
      });
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

  const handleProjectChange = async (project: Project) => {
    console.log("Project change handler called with:", project);
    if (project.id === selectedProject?.id) {
      console.log("Same project selected, skipping update");
      return;
    }
    
    setSelectedProject(project);
    toast({
      title: "Project Changed",
      description: `Switched to ${project.name}`,
    });
    await fetchProjectData(project.id);
  };

  const handleNotesChange = async (notes: string) => {
    if (!selectedProject) return;
    
    try {
      const updatedProject = await updateProject(selectedProject.id, { notes });
      
      if (updatedProject) {
        setSelectedProject(updatedProject);
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
      const updatedProjects = [...projectsList, newProject];
      setProjectsList(updatedProjects);
      setSelectedProject(newProject);
      setShowCreateProject(false);
      
      toast({
        title: "Project Created",
        description: `${newProject.name} has been created successfully.`,
      });
      
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
        
        const updatedProjects = projectsList.filter(p => p.id !== selectedProject.id);
        setProjectsList(updatedProjects);
        
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
      <Sidebar />
      
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
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4">Loading project data...</p>
                  </div>
                </div>
              ) : (
                <>
                  <ProjectOverview 
                    project={selectedProject}
                    onNotesChange={handleNotesChange}
                  />
                  
                  <ScheduleComparison 
                    project={selectedProject}
                    scheduleItems={scheduleItems}
                    onScheduleUpdate={refreshScheduleData}
                  />
                  
                  <SitePhotos project={selectedProject} />
                  
                  <DrawingUpload project={selectedProject} />
                  
                  <OrderTracker 
                    project={selectedProject}
                    orders={orderItems}
                  />
                  
                  <ResponsibilityMatrix 
                    project={selectedProject}
                    responsibilities={responsibilityItems}
                  />
                  
                  <ReportGenerator project={selectedProject} />
                </>
              )}
            </main>
          </>
        )}

        <CreateProject 
          open={showCreateProject}
          onClose={() => setShowCreateProject(false)}
          onCreateProject={handleCreateProject}
        />
        
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

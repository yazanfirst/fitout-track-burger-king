
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ProjectHeader } from "@/components/ProjectHeader";
import { ProjectOverview } from "@/components/ProjectOverview";
import { ScheduleComparison } from "@/components/ScheduleComparison";
import { SitePhotos } from "@/components/SitePhotos";
import { DrawingUpload } from "@/components/DrawingUpload";
import { OrderTracker } from "@/components/OrderTracker";
import { ResponsibilityMatrix } from "@/components/ResponsibilityMatrix";
import { ReportGenerator } from "@/components/ReportGenerator";
import { Project, projects, schedules, orders, responsibilities } from "@/data/mockData";
import { TooltipProvider } from "@/components/ui/tooltip";

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0]);

  const handleProjectChange = (project: Project) => {
    setSelectedProject(project);
  };

  const handleNotesChange = (notes: string) => {
    // This would typically update the project in a database
    console.log("Notes updated for project", selectedProject.id, ":", notes);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 md:ml-20">
        <ProjectHeader 
          selectedProject={selectedProject}
          onProjectChange={handleProjectChange}
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
            scheduleItems={schedules[selectedProject.id] || []}
          />
          
          {/* Site Photos Section */}
          <SitePhotos project={selectedProject} />
          
          {/* Drawing Upload Section */}
          <DrawingUpload project={selectedProject} />
          
          {/* Order Tracker Section */}
          <OrderTracker 
            project={selectedProject}
            orders={orders[selectedProject.id] || []}
          />
          
          {/* Responsibility Matrix Section */}
          <ResponsibilityMatrix 
            project={selectedProject}
            responsibilities={responsibilities[selectedProject.id] || []}
          />
          
          {/* Report Generator Section */}
          <ReportGenerator project={selectedProject} />
        </main>
      </div>
    </div>
  );
};

export default Index;

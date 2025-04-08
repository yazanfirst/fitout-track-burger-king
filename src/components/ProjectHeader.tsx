
import React from "react";
import { Project } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";

interface ProjectHeaderProps {
  selectedProject: Project;
  projects: Project[];
  onProjectChange: (project: Project) => void;
  onCreateNew: () => void;
  onDeleteProject?: () => void;
}

export function ProjectHeader({ 
  selectedProject, 
  projects, 
  onProjectChange,
  onCreateNew,
  onDeleteProject
}: ProjectHeaderProps) {
  
  return (
    <div className="bg-background border-b sticky top-0 z-10">
      <div className="container mx-auto py-4 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Select
              value={selectedProject?.id}
              onValueChange={(value) => {
                console.log("Project selection changed to:", value);
                const selected = projects.find((p) => p.id === value);
                if (selected) {
                  console.log("Selected project:", selected);
                  onProjectChange(selected);
                }
              }}
            >
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <h1 className="text-xl font-semibold">{selectedProject.name}</h1>
                <p className="text-sm text-muted-foreground">{selectedProject.location}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onCreateNew}>
              <PlusCircle className="mr-1 h-4 w-4" />
              New Project
            </Button>
            {onDeleteProject && (
              <Button variant="outline" size="sm" onClick={onDeleteProject} className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="mr-1 h-4 w-4" />
                Delete Project
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

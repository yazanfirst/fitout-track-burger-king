
import { useState } from "react";
import { Check, ChevronDown, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project, projects } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectHeaderProps {
  selectedProject: Project;
  onProjectChange: (project: Project) => void;
}

export function ProjectHeader({ selectedProject, onProjectChange }: ProjectHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get the correct brand logo based on project brand
  const getBrandLogo = (brand: 'BK' | 'TC') => {
    if (brand === 'BK') {
      return "https://www.burgerking.com.my/static/favicon/android-icon-96x96.png";
    } else {
      return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFLsKZ2_Tl-FfE0MZ3f9bpCQXLljAcfvrB-g&usqp=CAU";
    }
  };

  const getBrandColor = (brand: 'BK' | 'TC') => {
    return brand === 'BK' ? 'bg-bk-red' : 'bg-tc-blue';
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <div className="relative flex items-center">
              <img 
                src={getBrandLogo(selectedProject.brand)}
                alt={selectedProject.brand === 'BK' ? 'Burger King' : 'Texas Chicken'}
                className="w-10 h-10 mr-3" 
              />
              <div>
                <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="px-0 font-medium text-lg md:text-xl hover:bg-transparent focus:bg-transparent"
                    >
                      <span>{selectedProject.name}</span>
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {projects.map((project) => (
                      <DropdownMenuItem
                        key={project.id}
                        onClick={() => {
                          onProjectChange(project);
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center">
                          <div className={cn(
                            "w-2 h-2 rounded-full mr-2",
                            getBrandColor(project.brand)
                          )} />
                          <span>{project.name}</span>
                        </div>
                        {project.id === selectedProject.id && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <p className="text-sm text-gray-500">{selectedProject.location}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center px-3 py-1 bg-gray-100 rounded-full">
              <Crown className="h-4 w-4 text-bk-gold mr-1" />
              <span className="font-medium">
                {selectedProject.brand === 'BK' ? 'Burger King' : 'Texas Chicken'}
              </span>
            </div>
            
            <div className="flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
              <span className="font-medium">
                ID: {selectedProject.id}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

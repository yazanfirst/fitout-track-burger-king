
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Project } from "@/data/mockData";
import { createProject } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface CreateProjectProps {
  open: boolean;
  onClose: () => void;
  onCreateProject: (project: Project) => void;
}

export function CreateProject({ open, onClose, onCreateProject }: CreateProjectProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [brand, setBrand] = useState<'BK' | 'TC'>("BK");
  const [client, setClient] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create a new project with default values
      const newProjectData = {
        name,
        location,
        brand,
        client, // Added client field
        notes: "",
        contractorProgress: 0,
        ownerProgress: 0,
        budget: 0, // Added budget field with default value
        startDate: new Date().toISOString().split('T')[0], // Added startDate field with current date
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Added endDate field with date 1 year from now
        status: {
          orders: 0,
          ordersTotal: 10,
          lpos: 0,
          lposTotal: 10,
          drawings: 0,
          drawingsTotal: 10,
          invoices: 0,
          invoicesTotal: 10
        }
      };
      
      const createdProject = await createProject(newProjectData);
      
      if (createdProject) {
        onCreateProject(createdProject);
        
        // Reset form
        setName("");
        setLocation("");
        setBrand("BK");
        setClient("");
      } else {
        toast({
          title: "Error",
          description: "Failed to create project. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="project-location">Location</Label>
            <Input
              id="project-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter project location"
              required
            />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="project-client">Client</Label>
            <Input
              id="project-client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Enter client name"
              required
            />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="project-brand">Brand</Label>
            <Select 
              value={brand} 
              onValueChange={(value) => setBrand(value as 'BK' | 'TC')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BK">Burger King</SelectItem>
                <SelectItem value="TC">Texas Chicken</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

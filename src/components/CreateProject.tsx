
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

interface CreateProjectProps {
  open: boolean;
  onClose: () => void;
  onCreateProject: (project: Project) => void;
}

export function CreateProject({ open, onClose, onCreateProject }: CreateProjectProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [brand, setBrand] = useState<'BK' | 'TC'>("BK");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a new project with default values
    const newProject: Project = {
      id: `p-${Date.now()}`,
      name,
      location,
      brand,
      notes: "",
      contractorProgress: 0,
      ownerProgress: 0,
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
    
    onCreateProject(newProject);
    
    // Reset form
    setName("");
    setLocation("");
    setBrand("BK");
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

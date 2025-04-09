
import { useState, useEffect } from "react";
import { Plus, Check, AlertCircle } from "lucide-react";
import { Project, ResponsibilityItem } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface ResponsibilityMatrixProps {
  project: Project;
  responsibilities: ResponsibilityItem[];
}

interface ResponsibilityFormData {
  task: string;
  assignedTo: string;
  dueDate: Date | undefined;
  status: string;
  notes: string;
}

const initialFormData: ResponsibilityFormData = {
  task: "",
  assignedTo: "",
  dueDate: new Date(),
  status: "pending",
  notes: "",
};

export function ResponsibilityMatrix({ project, responsibilities: initialResponsibilities }: ResponsibilityMatrixProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ResponsibilityFormData>(initialFormData);
  const [responsibilities, setResponsibilities] = useState<ResponsibilityItem[]>(initialResponsibilities || []);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch responsibilities from the database
  useEffect(() => {
    fetchResponsibilities();
  }, [project.id]);

  const fetchResponsibilities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('responsibilities')
        .select('*')
        .eq('project_id', project.id);
      
      if (error) {
        console.error("Error fetching responsibilities:", error);
        toast({
          title: "Error",
          description: "Failed to load responsibilities",
          variant: "destructive",
        });
        setResponsibilities(initialResponsibilities || []);
      } else {
        // Transform the data to match our ResponsibilityItem interface
        const formattedItems = data.map(item => ({
          id: item.id,
          projectId: item.project_id,
          task: item.task || '',
          assignedTo: item.assigned_to || '',
          dueDate: item.due_date || '',
          status: item.status || 'pending',
          notes: item.notes || '',
        }));
        
        setResponsibilities(formattedItems);
      }
    } catch (error) {
      console.error("Error in fetchResponsibilities:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setResponsibilities(initialResponsibilities || []);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value
    }));
  };
  
  const handleSubmit = async () => {
    if (!formData.task || !formData.assignedTo || !formData.dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Insert into database
      const { data, error } = await supabase
        .from('responsibilities')
        .insert({
          project_id: project.id,
          task: formData.task,
          assigned_to: formData.assignedTo,
          due_date: formData.dueDate.toISOString().split('T')[0],
          status: formData.status,
          notes: formData.notes,
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating responsibility:", error);
        toast({
          title: "Error",
          description: "Failed to create responsibility",
          variant: "destructive",
        });
        return;
      }
      
      // Add new responsibility to the list
      const newItem = {
        id: data.id,
        projectId: data.project_id,
        task: data.task,
        assignedTo: data.assigned_to,
        dueDate: data.due_date,
        status: data.status,
        notes: data.notes,
      };
      
      setResponsibilities(prev => [newItem, ...prev]);
      
      toast({
        title: "Success",
        description: "Responsibility has been added",
      });
      
      // Reset form and close dialog
      setFormData(initialFormData);
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  
  const updateResponsibilityStatus = async (itemId: string, newStatus: string) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('responsibilities')
        .update({
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', itemId);
        
      if (error) {
        console.error("Error updating responsibility:", error);
        toast({
          title: "Error",
          description: "Failed to update status",
          variant: "destructive",
        });
        return;
      }
      
      // Update local state
      setResponsibilities(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Task status updated to ${newStatus}`,
      });
      
    } catch (error) {
      console.error("Error in updateResponsibilityStatus:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delayed':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };
  
  const filteredResponsibilities = filterStatus === 'all' 
    ? responsibilities 
    : responsibilities.filter(item => item.status === filterStatus);
  
  return (
    <section id="responsibility-matrix" className="content-section">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="mr-2">📋</span> Responsibility Matrix
      </h2>
      
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-lg">Tasks & Responsibilities</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-1" />
                    Add New Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                    <DialogDescription>
                      Add a new task or responsibility to the project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="task" className="text-sm font-medium">Task Description</label>
                      <Input 
                        id="task" 
                        name="task"
                        placeholder="Enter task description" 
                        value={formData.task} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="assignedTo" className="text-sm font-medium">Assigned To</label>
                        <Input 
                          id="assignedTo" 
                          name="assignedTo" 
                          placeholder="Enter person name" 
                          value={formData.assignedTo} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="status" className="text-sm font-medium">Status</label>
                        <Select 
                          value={formData.status} 
                          onValueChange={handleStatusChange}
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="delayed">Delayed</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Due Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.dueDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.dueDate ? format(formData.dueDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.dueDate}
                            onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                      <Textarea 
                        id="notes" 
                        name="notes" 
                        placeholder="Add any additional notes" 
                        value={formData.notes} 
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Add Task</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredResponsibilities && filteredResponsibilities.length > 0 ? (
                  filteredResponsibilities.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.task}</TableCell>
                      <TableCell>{item.assignedTo}</TableCell>
                      <TableCell>
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Not set'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <Badge variant="outline" className={getStatusColor(item.status)}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8">
                              <Check className="h-3 w-3 mr-1" />
                              Update Status
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Update Status</DialogTitle>
                              <DialogDescription>
                                Update the status for task: {item.task}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Current Status</label>
                                <Badge variant="outline" className={getStatusColor(item.status)}>
                                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">New Status</label>
                                <Select defaultValue={item.status}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select new status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="delayed">Delayed</SelectItem>
                                    <SelectItem value="blocked">Blocked</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button onClick={() => updateResponsibilityStatus(item.id, 'completed')}>
                                  Mark as Completed
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No responsibilities found for this project.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

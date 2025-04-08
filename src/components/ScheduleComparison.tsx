
import { useState, useEffect } from "react";
import { Calendar, Download, Upload, Plus, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Project, ScheduleItem } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { createScheduleItem, updateScheduleItem, deleteScheduleItem } from "@/lib/api";

interface ScheduleComparisonProps {
  project: Project;
  scheduleItems: ScheduleItem[];
}

export function ScheduleComparison({ project, scheduleItems }: ScheduleComparisonProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [items, setItems] = useState<ScheduleItem[]>(scheduleItems);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    task: "",
    plannedStart: "",
    plannedEnd: "",
    actualStart: "",
    actualEnd: "",
    delayDays: 0
  });
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [showQuickUpdate, setShowQuickUpdate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update local items when prop changes
  useEffect(() => {
    setItems(scheduleItems);
  }, [scheduleItems]);
  
  // Function to handle quick status updates
  const handleQuickUpdate = (item: ScheduleItem) => {
    setEditingItem(item);
    setShowQuickUpdate(true);
  };
  
  // Function to save edited item status
  const saveQuickUpdate = async (status: string) => {
    if (!editingItem) return;
    setIsSubmitting(true);
    
    const today = new Date().toISOString().split('T')[0];
    let updatedItem = { ...editingItem };
    
    switch (status) {
      case "not-started":
        updatedItem.actualStart = null;
        updatedItem.actualEnd = null;
        break;
      case "in-progress":
        updatedItem.actualStart = updatedItem.actualStart || today;
        updatedItem.actualEnd = null;
        break;
      case "completed":
        updatedItem.actualStart = updatedItem.actualStart || today;
        updatedItem.actualEnd = today;
        break;
      case "delayed":
        updatedItem.delayDays = updatedItem.delayDays > 0 ? updatedItem.delayDays : 1;
        break;
    }
    
    // Calculate delay
    if (updatedItem.actualEnd && updatedItem.plannedEnd) {
      const planned = new Date(updatedItem.plannedEnd);
      const actual = new Date(updatedItem.actualEnd);
      const diffTime = actual.getTime() - planned.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      updatedItem.delayDays = diffDays > 0 ? diffDays : 0;
    }
    
    try {
      // Update item in database
      const savedItem = await updateScheduleItem(updatedItem.id, updatedItem);
      
      if (savedItem) {
        // Update local state
        setItems(items.map(item => 
          item.id === editingItem.id ? savedItem : item
        ));
        
        toast({
          title: "Task Updated",
          description: `${updatedItem.task} status has been updated.`,
        });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowQuickUpdate(false);
      setEditingItem(null);
    }
  };

  const handleFileUpload = () => {
    // Simulate file upload - in a real app you would parse the file
    // and create schedule items from it
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      
      toast({
        title: "Schedule Uploaded",
        description: "Schedule data has been processed.",
      });
    }, 2000);
  };

  const addNewTask = async () => {
    setIsSubmitting(true);
    
    // Calculate delay days if applicable
    let delayDays = 0;
    if (newTask.actualEnd && newTask.plannedEnd) {
      const planned = new Date(newTask.plannedEnd);
      const actual = new Date(newTask.actualEnd);
      const diffTime = actual.getTime() - planned.getTime();
      if (diffTime > 0) {
        delayDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    const taskToAdd = {
      ...newTask,
      projectId: project.id,
      delayDays
    };

    try {
      const createdTask = await createScheduleItem(taskToAdd);
      
      if (createdTask) {
        setItems([...items, createdTask]);
        
        toast({
          title: "Task Added",
          description: `${newTask.task} has been added to the schedule.`,
        });
        
        // Reset form
        setNewTask({
          task: "",
          plannedStart: "",
          plannedEnd: "",
          actualStart: "",
          actualEnd: "",
          delayDays: 0
        });
        setShowAddTask(false);
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: "Failed to add task.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTask = async (index: number) => {
    const itemToDelete = items[index];
    
    try {
      const success = await deleteScheduleItem(itemToDelete.id);
      
      if (success) {
        const updatedItems = [...items];
        updatedItems.splice(index, 1);
        setItems(updatedItems);
        
        toast({
          title: "Task Deleted",
          description: `${itemToDelete.task} has been removed from the schedule.`,
        });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <section id="schedule-comparison" className="content-section">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="mr-2">📁</span> Schedule Comparison
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="card-shadow md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Upload Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contractor Schedule (Excel/CSV/PDF)
                </label>
                <div className="flex items-center gap-2">
                  <Input type="file" className="flex-1" />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Upload contractor schedule or add tasks manually
              </p>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowAddTask(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleFileUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-1" />
                      Update Schedule
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Schedule Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Total Tasks</span>
              <span className="text-sm">{items.length}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Completed Tasks</span>
              <span className="text-sm">
                {items.filter(item => item.actualEnd).length}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">In Progress</span>
              <span className="text-sm">
                {items.filter(item => item.actualStart && !item.actualEnd).length}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Delayed Tasks</span>
              <span className="text-sm font-medium text-red-600">
                {items.filter(item => item.delayDays > 0).length}
              </span>
            </div>
            
            <Button variant="outline" className="w-full mt-4">
              <Download className="h-4 w-4 mr-1" />
              Export Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card className="card-shadow">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Schedule Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Task</TableHead>
                  <TableHead>Planned Start</TableHead>
                  <TableHead>Planned End</TableHead>
                  <TableHead>Actual Start</TableHead>
                  <TableHead>Actual End</TableHead>
                  <TableHead className="text-right">Delay (Days)</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <TableRow key={item.id || index}>
                      <TableCell className="font-medium">{item.task}</TableCell>
                      <TableCell>{formatDate(item.plannedStart)}</TableCell>
                      <TableCell>{formatDate(item.plannedEnd)}</TableCell>
                      <TableCell>{formatDate(item.actualStart)}</TableCell>
                      <TableCell>
                        {item.actualEnd ? formatDate(item.actualEnd) : (
                          <span className="text-blue-500">In progress</span>
                        )}
                      </TableCell>
                      <TableCell className={`text-right ${item.delayDays > 0 ? 'text-red-600 font-medium' : ''}`}>
                        {item.delayDays > 0 ? `+${item.delayDays}` : item.delayDays}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleQuickUpdate(item)}
                            className="h-8 w-8"
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteTask(index)}
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No schedule data available. Please upload a schedule or add tasks manually.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Add Task Dialog */}
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="task-name">Task Name</Label>
              <Input
                id="task-name"
                value={newTask.task}
                onChange={(e) => setNewTask({...newTask, task: e.target.value})}
                placeholder="Enter task name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="planned-start">Planned Start</Label>
                <Input
                  id="planned-start"
                  type="date"
                  value={newTask.plannedStart}
                  onChange={(e) => setNewTask({...newTask, plannedStart: e.target.value})}
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="planned-end">Planned End</Label>
                <Input
                  id="planned-end"
                  type="date"
                  value={newTask.plannedEnd}
                  onChange={(e) => setNewTask({...newTask, plannedEnd: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="actual-start">Actual Start</Label>
                <Input
                  id="actual-start"
                  type="date"
                  value={newTask.actualStart}
                  onChange={(e) => setNewTask({...newTask, actualStart: e.target.value})}
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="actual-end">Actual End</Label>
                <Input
                  id="actual-end"
                  type="date"
                  value={newTask.actualEnd}
                  onChange={(e) => setNewTask({...newTask, actualEnd: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowAddTask(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" onClick={addNewTask} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Quick Update Dialog */}
      <Dialog open={showQuickUpdate} onOpenChange={setShowQuickUpdate}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              Update Task Status: {editingItem?.task}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup defaultValue="not-started" className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-started" id="not-started" onClick={() => saveQuickUpdate('not-started')} disabled={isSubmitting} />
                <Label htmlFor="not-started">Not Started</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-progress" id="in-progress" onClick={() => saveQuickUpdate('in-progress')} disabled={isSubmitting} />
                <Label htmlFor="in-progress">In Progress</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="completed" id="completed" onClick={() => saveQuickUpdate('completed')} disabled={isSubmitting} />
                <Label htmlFor="completed">Completed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delayed" id="delayed" onClick={() => saveQuickUpdate('delayed')} disabled={isSubmitting} />
                <Label htmlFor="delayed">Mark as Delayed</Label>
              </div>
            </RadioGroup>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowQuickUpdate(false)} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

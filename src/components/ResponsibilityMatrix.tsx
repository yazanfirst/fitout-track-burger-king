
import { useState } from "react";
import { Clock, Edit, Plus, Save, User, UserCog } from "lucide-react";
import { Project, ResponsibilityItem } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ResponsibilityMatrixProps {
  project: Project;
  responsibilities: ResponsibilityItem[];
}

export function ResponsibilityMatrix({ project, responsibilities }: ResponsibilityMatrixProps) {
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    task: "",
    responsibleParty: "Contractor",
    notes: "",
  });

  const handleAddTask = () => {
    console.log("Adding new task:", newTask);
    setNewTask({
      task: "",
      responsibleParty: "Contractor",
      notes: "",
    });
    setNewTaskDialogOpen(false);
  };

  return (
    <section id="responsibility-matrix" className="content-section">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="mr-2">🧑‍🔧</span> Responsibility Matrix
      </h2>
      
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg">Task Assignment</CardTitle>
            
            <Dialog open={newTaskDialogOpen} onOpenChange={setNewTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  Add New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Task Name</label>
                    <Input
                      placeholder="Enter task name"
                      value={newTask.task}
                      onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Responsible Party</label>
                    <Select
                      value={newTask.responsibleParty}
                      onValueChange={(value) => setNewTask({ ...newTask, responsibleParty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select responsibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contractor">Contractor</SelectItem>
                        <SelectItem value="Owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      placeholder="Add any notes or issues..."
                      value={newTask.notes}
                      onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={handleAddTask} className="w-full">
                      <Save className="h-4 w-4 mr-1" />
                      Save Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Task</TableHead>
                  <TableHead>Responsible Party</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responsibilities.length > 0 ? (
                  responsibilities.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.task}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={item.responsibleParty === "Owner" 
                            ? "bg-bk-gold text-bk-brown border-bk-gold" 
                            : "bg-bk-red bg-opacity-10 text-bk-red border-bk-red"
                          }
                        >
                          <div className="flex items-center gap-1">
                            {item.responsibleParty === "Owner" ? (
                              <UserCog className="h-3 w-3" />
                            ) : (
                              <User className="h-3 w-3" />
                            )}
                            <span>{item.responsibleParty}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{item.notes}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      No tasks assigned yet. Add your first task to start building the responsibility matrix.
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

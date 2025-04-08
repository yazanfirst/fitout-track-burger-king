
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { PlusCircle } from "lucide-react";
import { Project, ScheduleItem } from "@/data/mockData";
import { format, differenceInCalendarDays } from "date-fns";
import { createScheduleItem, updateScheduleItem, deleteScheduleItem } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface ScheduleComparisonProps {
  project: Project;
  scheduleItems: ScheduleItem[];
}

export function ScheduleComparison({ project, scheduleItems }: ScheduleComparisonProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Omit<ScheduleItem, 'id'>>({
    projectId: project.id,
    task: "",
    plannedStart: "",
    plannedEnd: "",
    actualStart: "",
    actualEnd: "",
    delayDays: 0
  });
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Graph data transformation
  const graphData = scheduleItems.map(item => ({
    name: item.task,
    planned: differenceInCalendarDays(
      new Date(item.plannedEnd),
      new Date(item.plannedStart)
    ),
    actual: item.actualEnd ? 
      differenceInCalendarDays(
        new Date(item.actualEnd),
        new Date(item.actualStart)
      ) : 0
  }));

  // Handle add new item
  const handleAddItem = async () => {
    setLoading(true);

    try {
      // Calculate delay days if both actual dates are provided
      let delayDays = 0;
      if (newItem.actualStart && newItem.actualEnd && newItem.plannedStart && newItem.plannedEnd) {
        const actualEndDate = new Date(newItem.actualEnd);
        const plannedEndDate = new Date(newItem.plannedEnd);
        delayDays = differenceInCalendarDays(actualEndDate, plannedEndDate);
        if (delayDays < 0) delayDays = 0;
      }

      // Create new schedule item
      const itemWithDelay = {
        ...newItem,
        delayDays
      };

      const createdItem = await createScheduleItem(itemWithDelay);

      if (createdItem) {
        // Close dialog and show success message
        setIsAddDialogOpen(false);
        toast({
          title: "Success",
          description: `Schedule item "${newItem.task}" was added.`
        });

        // Reset form
        setNewItem({
          projectId: project.id,
          task: "",
          plannedStart: "",
          plannedEnd: "",
          actualStart: "",
          actualEnd: "",
          delayDays: 0
        });
      }
    } catch (error) {
      console.error("Error adding schedule item:", error);
      toast({
        title: "Error",
        description: "Failed to add schedule item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle update item
  const handleUpdateItem = async () => {
    if (!selectedItem || !selectedItem.id) return;
    
    setLoading(true);

    try {
      // Calculate delay days if both actual dates are provided
      let delayDays = 0;
      if (selectedItem.actualStart && selectedItem.actualEnd && selectedItem.plannedStart && selectedItem.plannedEnd) {
        const actualEndDate = new Date(selectedItem.actualEnd);
        const plannedEndDate = new Date(selectedItem.plannedEnd);
        delayDays = differenceInCalendarDays(actualEndDate, plannedEndDate);
        if (delayDays < 0) delayDays = 0;
      }

      // Update schedule item
      const itemWithDelay = {
        ...selectedItem,
        delayDays
      };

      const updatedItem = await updateScheduleItem(selectedItem.id, itemWithDelay);

      if (updatedItem) {
        // Close dialog and show success message
        setIsUpdateDialogOpen(false);
        toast({
          title: "Success",
          description: `Schedule item "${selectedItem.task}" was updated.`
        });

        // Reset selected item
        setSelectedItem(null);
      }
    } catch (error) {
      console.error("Error updating schedule item:", error);
      toast({
        title: "Error",
        description: "Failed to update schedule item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this schedule item?")) return;

    try {
      const success = await deleteScheduleItem(id);

      if (success) {
        toast({
          title: "Success",
          description: "Schedule item was deleted."
        });
      }
    } catch (error) {
      console.error("Error deleting schedule item:", error);
      toast({
        title: "Error",
        description: "Failed to delete schedule item. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return format(new Date(dateStr), "MMM d, yyyy");
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Schedule Comparison</CardTitle>
            <CardDescription>Compare planned vs. actual schedules</CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <PlusCircle className="mr-1 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="chart">Chart View</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead className="hidden md:table-cell">Planned Start</TableHead>
                    <TableHead className="hidden md:table-cell">Planned End</TableHead>
                    <TableHead className="hidden md:table-cell">Actual Start</TableHead>
                    <TableHead className="hidden md:table-cell">Actual End</TableHead>
                    <TableHead>Delay (days)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduleItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        No schedule items added yet. Click "Add Task" to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    scheduleItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.task}</TableCell>
                        <TableCell className="hidden md:table-cell">{formatDate(item.plannedStart)}</TableCell>
                        <TableCell className="hidden md:table-cell">{formatDate(item.plannedEnd)}</TableCell>
                        <TableCell className="hidden md:table-cell">{formatDate(item.actualStart)}</TableCell>
                        <TableCell className="hidden md:table-cell">{formatDate(item.actualEnd)}</TableCell>
                        <TableCell>
                          <span className={item.delayDays > 0 ? "text-red-500 font-medium" : ""}>
                            {item.delayDays > 0 ? `+${item.delayDays}` : item.delayDays}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsUpdateDialogOpen(true);
                            }}
                            className="mr-1"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => item.id && handleDeleteItem(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="chart">
            <div className="w-full h-96">
              {scheduleItems.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No schedule items added yet. Click "Add Task" to get started.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={graphData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 50, bottom: 10 }}
                  >
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Bar dataKey="planned" name="Planned Days" fill="#4f46e5" />
                    <Bar dataKey="actual" name="Actual Days" fill="#f43f5e" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Schedule Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="task">Task Name</Label>
                <Input
                  id="task"
                  value={newItem.task}
                  onChange={(e) => setNewItem({ ...newItem, task: e.target.value })}
                  placeholder="Enter task name"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Planned Start Date</Label>
                <DatePicker
                  date={newItem.plannedStart ? new Date(newItem.plannedStart) : undefined}
                  setDate={(date) =>
                    setNewItem({
                      ...newItem,
                      plannedStart: date ? date.toISOString() : "",
                    })
                  }
                />
              </div>
              <div>
                <Label>Planned End Date</Label>
                <DatePicker
                  date={newItem.plannedEnd ? new Date(newItem.plannedEnd) : undefined}
                  setDate={(date) =>
                    setNewItem({
                      ...newItem,
                      plannedEnd: date ? date.toISOString() : "",
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Actual Start Date</Label>
                <DatePicker
                  date={newItem.actualStart ? new Date(newItem.actualStart) : undefined}
                  setDate={(date) =>
                    setNewItem({
                      ...newItem,
                      actualStart: date ? date.toISOString() : "",
                    })
                  }
                />
              </div>
              <div>
                <Label>Actual End Date</Label>
                <DatePicker
                  date={newItem.actualEnd ? new Date(newItem.actualEnd) : undefined}
                  setDate={(date) =>
                    setNewItem({
                      ...newItem,
                      actualEnd: date ? date.toISOString() : "",
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={loading || !newItem.task || !newItem.plannedStart || !newItem.plannedEnd}>
              {loading ? "Adding..." : "Add Schedule Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Item Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Update Schedule Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="update-task">Task Name</Label>
                  <Input
                    id="update-task"
                    value={selectedItem.task}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        task: e.target.value,
                      })
                    }
                    placeholder="Enter task name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Planned Start Date</Label>
                  <DatePicker
                    date={selectedItem.plannedStart ? new Date(selectedItem.plannedStart) : undefined}
                    setDate={(date) =>
                      setSelectedItem({
                        ...selectedItem,
                        plannedStart: date ? date.toISOString() : "",
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Planned End Date</Label>
                  <DatePicker
                    date={selectedItem.plannedEnd ? new Date(selectedItem.plannedEnd) : undefined}
                    setDate={(date) =>
                      setSelectedItem({
                        ...selectedItem,
                        plannedEnd: date ? date.toISOString() : "",
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Actual Start Date</Label>
                  <DatePicker
                    date={selectedItem.actualStart ? new Date(selectedItem.actualStart) : undefined}
                    setDate={(date) =>
                      setSelectedItem({
                        ...selectedItem,
                        actualStart: date ? date.toISOString() : "",
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Actual End Date</Label>
                  <DatePicker
                    date={selectedItem.actualEnd ? new Date(selectedItem.actualEnd) : undefined}
                    setDate={(date) =>
                      setSelectedItem({
                        ...selectedItem,
                        actualEnd: date ? date.toISOString() : "",
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateItem}
              disabled={loading || !selectedItem || !selectedItem.task || !selectedItem.plannedStart || !selectedItem.plannedEnd}
            >
              {loading ? "Updating..." : "Update Schedule Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

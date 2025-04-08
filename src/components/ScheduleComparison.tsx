import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { PlusCircle, Upload, FileText, Calendar, CalendarX, X, TrashIcon } from "lucide-react";
import { Project, ScheduleItem } from "@/data/mockData";
import { format, differenceInCalendarDays, parse } from "date-fns";
import { createScheduleItem, updateScheduleItem, deleteScheduleItem, uploadScheduleFile, parseScheduleFile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScheduleComparisonProps {
  project: Project;
  scheduleItems: ScheduleItem[];
  onScheduleUpdate?: () => void;
}

export function ScheduleComparison({ project, scheduleItems, onScheduleUpdate }: ScheduleComparisonProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Omit<ScheduleItem, 'id'>>({
    projectId: project.id,
    task: "",
    plannedStart: "",
    plannedEnd: "",
    actualStart: "",
    actualEnd: "",
    delayDays: 0,
    description: ""
  });
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileParseError, setFileParseError] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<(Omit<ScheduleItem, 'id'> & { id?: string })[]>([]);
  const [importSuccessful, setImportSuccessful] = useState(false);

  // Reset new item form when project changes
  useEffect(() => {
    setNewItem({
      projectId: project.id,
      task: "",
      plannedStart: "",
      plannedEnd: "",
      actualStart: "",
      actualEnd: "",
      delayDays: 0,
      description: ""
    });
  }, [project.id]);

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

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      setParsedItems([]);
      setFileParseError(null);
      return;
    }
    
    const file = e.target.files[0];
    setSelectedFile(file);
    setFileParseError(null);
    setParsedItems([]);
    setImportSuccessful(false);
    
    // Check file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !['csv', 'xlsx', 'xls', 'pdf'].includes(fileExt)) {
      setFileParseError("Unsupported file format. Please upload CSV, Excel, or PDF files.");
      return;
    }
    
    // Auto-trigger file parsing when file is selected
    handleFileUpload(file);
  };

  // Handle file upload and parsing
  const handleFileUpload = async (file?: File) => {
    const fileToUpload = file || selectedFile;
    if (!fileToUpload) return;
    
    setUploadLoading(true);
    setFileParseError(null);
    setImportSuccessful(false);

    try {
      // Upload and parse file
      const result = await parseScheduleFile(project.id, fileToUpload);
      
      if (result.error) {
        setFileParseError(result.error);
      } else if (result.items && result.items.length > 0) {
        setParsedItems(result.items);
        setImportSuccessful(true);
        toast({
          title: "File Parsed Successfully",
          description: result.message || `${result.items.length} items found in the file.`
        });
        
        // Auto import items if they're already saved to DB
        if (result.items.some(item => 'id' in item && item.id)) {
          if (onScheduleUpdate) {
            onScheduleUpdate();
          }
          setIsUploadDialogOpen(false);
          toast({
            title: "Items Imported",
            description: `${result.items.length} items have been imported into your schedule.`
          });
        }
      } else {
        setFileParseError("No valid schedule items found in the file.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setFileParseError("Failed to upload and parse file. Please try again.");
    } finally {
      setUploadLoading(false);
    }
  };

  // Import parsed items
  const handleImportItems = async () => {
    if (parsedItems.length === 0) return;
    
    setUploadLoading(true);
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      // Create each item
      for (const item of parsedItems) {
        try {
          await createScheduleItem({
            ...item,
            projectId: project.id
          });
          successCount++;
        } catch (error) {
          console.error("Error importing item:", error);
          errorCount++;
        }
      }
      
      // Close dialog and show success message
      setIsUploadDialogOpen(false);
      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} items. ${errorCount > 0 ? `Failed to import ${errorCount} items.` : ''}`
      });
      
      // Reset file and parsed items
      setSelectedFile(null);
      setParsedItems([]);
      
      // Notify parent to refresh data
      if (onScheduleUpdate) {
        onScheduleUpdate();
      }
    } catch (error) {
      console.error("Error importing items:", error);
      toast({
        title: "Error",
        description: "Failed to import items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadLoading(false);
    }
  };

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
          delayDays: 0,
          description: ""
        });
        
        // Notify parent to refresh data
        if (onScheduleUpdate) {
          onScheduleUpdate();
        }
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
        
        // Notify parent to refresh data
        if (onScheduleUpdate) {
          onScheduleUpdate();
        }
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

  // Open delete confirmation dialog
  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!itemToDelete) {
      setIsConfirmDeleteOpen(false);
      return;
    }

    setLoading(true);
    
    try {
      const success = await deleteScheduleItem(itemToDelete);
      
      setIsConfirmDeleteOpen(false);
      setItemToDelete(null);

      if (success) {
        toast({
          title: "Success",
          description: "Schedule item was deleted."
        });
        
        // Notify parent to refresh data
        if (onScheduleUpdate) {
          onScheduleUpdate();
        }
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting schedule item:", error);
      toast({
        title: "Error",
        description: "Failed to delete schedule item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", dateStr, error);
      return dateStr;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Schedule Comparison</CardTitle>
            <CardDescription>Compare planned vs. actual schedules</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setIsUploadDialogOpen(true)} variant="outline" size="sm">
              <Upload className="mr-1 h-4 w-4" />
              Import Schedule
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
              <PlusCircle className="mr-1 h-4 w-4" />
              Add Task
            </Button>
          </div>
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
                        No schedule items added yet. Click "Add Task" or "Import Schedule" to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    scheduleItems.map((item) => (
                      <TableRow key={item.id} isStripe>
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
                            onClick={() => item.id && openDeleteDialog(item.id)}
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
                  No schedule items added yet. Click "Add Task" or "Import Schedule" to get started.
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
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={newItem.description || ""}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Enter description"
              />
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
              <div>
                <Label htmlFor="update-description">Description (Optional)</Label>
                <Input
                  id="update-description"
                  value={selectedItem.description || ""}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter description"
                />
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

      {/* File Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Import Schedule from File</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="schedule-file">Upload Schedule File</Label>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  id="schedule-file"
                  type="file"
                  accept=".csv,.xlsx,.xls,.pdf"
                  onChange={handleFileSelect}
                  className="flex-1"
                  disabled={uploadLoading}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Supported formats: CSV, Excel (xlsx, xls), PDF
              </div>
            </div>

            {uploadLoading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-900 border-t-transparent"></div>
                <span className="ml-2">Parsing file...</span>
              </div>
            )}

            {fileParseError && (
              <Alert variant="destructive">
                <AlertDescription>{fileParseError}</AlertDescription>
              </Alert>
            )}

            {importSuccessful && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>
                  File parsed successfully! {parsedItems.length} schedule items found.
                </AlertDescription>
              </Alert>
            )}

            {parsedItems.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Found {parsedItems.length} schedule items:</h3>
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Planned Start</TableHead>
                        <TableHead>Planned End</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedItems.map((item, index) => (
                        <TableRow key={index} isStripe>
                          <TableCell>{item.task}</TableCell>
                          <TableCell>{formatDate(item.plannedStart)}</TableCell>
                          <TableCell>{formatDate(item.plannedEnd)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(false)}
              disabled={uploadLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportItems}
              disabled={uploadLoading || parsedItems.length === 0}
            >
              {uploadLoading ? "Importing..." : "Import Items"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this schedule item? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmDeleteOpen(false);
                setItemToDelete(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteItem}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

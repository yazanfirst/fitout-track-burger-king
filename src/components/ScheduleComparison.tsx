import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { PlusCircle, Upload, FileText, Calendar, CalendarX, X, TrashIcon, AlertCircle, Download } from "lucide-react";
import { Project, ScheduleItem } from "@/data/mockData";
import { format, differenceInCalendarDays } from "date-fns";
import { createScheduleItem, updateScheduleItem, deleteScheduleItem, parseScheduleFile, ensureStorageBucketsExist } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

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
  const [isBatchUpdateDialogOpen, setIsBatchUpdateDialogOpen] = useState(false);
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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [itemsToUpdate, setItemsToUpdate] = useState<ScheduleItem[]>([]);
  const [storageAlert, setStorageAlert] = useState<{
    show: boolean;
    message: string;
  }>({ show: false, message: "" });

  useEffect(() => {
    ensureStorageBucketsExist()
      .then(success => {
        if (!success) {
          console.warn("Failed to ensure storage buckets exist");
          setStorageAlert({
            show: true,
            message: "Storage system is not properly configured. Please contact support."
          });
        } else {
          setStorageAlert({ show: false, message: "" });
        }
      })
      .catch(error => {
        console.error("Error checking storage buckets:", error);
        setStorageAlert({
          show: true, 
          message: "Could not verify storage configuration. Some features may be limited."
        });
      });
  }, []);

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

  const graphData = scheduleItems.map(item => ({
    name: item.task,
    planned: differenceInCalendarDays(
      new Date(item.plannedEnd),
      new Date(item.plannedStart)
    ),
    actual: item.actualEnd && item.actualStart ? 
      differenceInCalendarDays(
        new Date(item.actualEnd),
        new Date(item.actualStart)
      ) : 0
  }));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      setParsedItems([]);
      setFileParseError(null);
      setPdfUrl(null);
      setShowPdfViewer(false);
      return;
    }
    
    const file = e.target.files[0];
    setSelectedFile(file);
    setFileParseError(null);
    setParsedItems([]);
    setImportSuccessful(false);
    setPdfUrl(null);
    setShowPdfViewer(false);
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !['csv', 'xlsx', 'xls', 'pdf'].includes(fileExt)) {
      setFileParseError("Unsupported file format. Please upload CSV, Excel, or PDF files.");
      return;
    }
    
    if (fileExt === 'pdf') {
      handlePdfUpload(file);
    } else {
      handleFileUpload(file);
    }
  };

  const handlePdfUpload = async (file: File) => {
    setUploadLoading(true);
    
    try {
      await ensureStorageBucketsExist();
      
      const fileName = `${project.id}/pdf_${Date.now()}_${file.name}`;
      let { data, error } = await supabase
        .storage
        .from('schedule-pdfs')
        .upload(fileName, file, {
          upsert: true,
          contentType: 'application/pdf'
        });
      
      if (error) {
        console.error("Error uploading to schedule-pdfs bucket:", error);
        const alternativeFileName = `${project.id}/schedules/pdf_${Date.now()}_${file.name}`;
        const result = await supabase
          .storage
          .from('project_files')
          .upload(alternativeFileName, file, {
            upsert: true,
            contentType: 'application/pdf'
          });
        
        data = result.data;
        error = result.error;
        
        if (error) {
          setStorageAlert({
            show: true,
            message: "Drawing storage is not properly configured. Please check your storage settings."
          });
          throw new Error(`Error uploading PDF: ${error.message}`);
        }
        
        const { data: urlData } = supabase
          .storage
          .from('project_files')
          .getPublicUrl(alternativeFileName);
        
        if (!urlData?.publicUrl) {
          throw new Error("Couldn't get public URL for uploaded PDF");
        }
        
        setPdfUrl(urlData.publicUrl);
      } else {
        const { data: urlData } = supabase
          .storage
          .from('schedule-pdfs')
          .getPublicUrl(fileName);
        
        if (!urlData?.publicUrl) {
          throw new Error("Couldn't get public URL for uploaded PDF");
        }
        
        setPdfUrl(urlData.publicUrl);
      }
      
      const { error: insertError } = await supabase
        .from('schedules')
        .insert({
          project_id: project.id,
          title: `Schedule from PDF: ${file.name}`,
          description: `Uploaded on ${new Date().toLocaleDateString()}`,
          status: 'pending',
          start_date: new Date().toISOString(),
          end_date: new Date().toISOString(),
          file_url: pdfUrl,
          file_name: file.name,
          uploaded_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error("Error saving PDF metadata:", insertError);
      }
      
      setShowPdfViewer(true);
      setImportSuccessful(true);
      setStorageAlert({ show: false, message: "" });
      
      toast({
        title: "PDF Uploaded Successfully",
        description: `${file.name} has been uploaded and saved.`
      });
      
    } catch (error) {
      console.error("Error handling PDF upload:", error);
      setFileParseError(error instanceof Error ? error.message : "Failed to upload PDF file");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileUpload = async (file?: File) => {
    const fileToUpload = file || selectedFile;
    if (!fileToUpload) return;
    
    setUploadLoading(true);
    setFileParseError(null);
    setImportSuccessful(false);
    setShowPdfViewer(false);

    try {
      await ensureStorageBucketsExist();
      
      const result = await parseScheduleFile(project.id, fileToUpload);
      
      if (result.error) {
        setFileParseError(result.error);
      } else if (result.items && result.items.length > 0) {
        setParsedItems(result.items.map(item => ({
          ...item,
          actualStart: item.actualStart || "",
          actualEnd: item.actualEnd || "",
          delayDays: item.delayDays || 0,
        })));
        setImportSuccessful(true);
        setStorageAlert({ show: false, message: "" });
        
        toast({
          title: "File Parsed Successfully",
          description: result.message || `${result.items.length} items found in the file.`
        });
        
        if (result.items.some(item => 'id' in item && item.id)) {
          if (onScheduleUpdate) {
            onScheduleUpdate();
          }
          setIsUploadDialogOpen(false);
          toast({
            title: "Items Imported",
            description: `${result.items.length} items have been imported into your schedule.`
          });
        } else {
          setItemsToUpdate(result.items.map(item => ({
            id: '',
            projectId: project.id,
            task: item.task || '',
            plannedStart: item.plannedStart || '',
            plannedEnd: item.plannedEnd || '',
            actualStart: item.actualStart || '',
            actualEnd: item.actualEnd || '',
            delayDays: item.delayDays || 0,
            description: item.description || ''
          })));
          
          setIsUploadDialogOpen(false);
          setIsBatchUpdateDialogOpen(true);
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

  const handleImportItems = async () => {
    if (parsedItems.length === 0) return;
    
    setUploadLoading(true);
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const item of parsedItems) {
        try {
          if ('id' in item && item.id) {
            successCount++;
            continue;
          }
          
          const result = await createScheduleItem({
            ...item,
            projectId: project.id
          });
          
          if (result) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error("Error importing item:", error);
          errorCount++;
        }
      }
      
      setIsUploadDialogOpen(false);
      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} items. ${errorCount > 0 ? `Failed to import ${errorCount} items.` : ''}`
      });
      
      setSelectedFile(null);
      setParsedItems([]);
      
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

  const handleBatchUpdate = async () => {
    if (itemsToUpdate.length === 0) return;
    
    setLoading(true);
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const item of itemsToUpdate) {
        try {
          let delayDays = 0;
          if (item.actualStart && item.actualEnd && item.plannedStart && item.plannedEnd) {
            const actualEndDate = new Date(item.actualEnd);
            const plannedEndDate = new Date(item.plannedEnd);
            delayDays = differenceInCalendarDays(actualEndDate, plannedEndDate);
            if (delayDays < 0) delayDays = 0;
          }
          
          const itemWithDelay = {
            ...item,
            delayDays
          };
          
          let result;
          if (item.id && item.id.length > 0 && item.id !== '') {
            result = await updateScheduleItem(item.id, itemWithDelay);
          } else {
            result = await createScheduleItem(itemWithDelay);
          }
          
          if (result) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error("Error processing item:", error);
          errorCount++;
        }
      }
      
      setIsBatchUpdateDialogOpen(false);
      toast({
        title: "Update Complete",
        description: `Successfully processed ${successCount} items. ${errorCount > 0 ? `Failed to process ${errorCount} items.` : ''}`
      });
      
      setItemsToUpdate([]);
      
      if (onScheduleUpdate) {
        onScheduleUpdate();
      }
    } catch (error) {
      console.error("Error in batch update:", error);
      toast({
        title: "Error",
        description: "Failed to update items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    setLoading(true);

    try {
      let delayDays = 0;
      if (newItem.actualStart && newItem.actualEnd && newItem.plannedStart && newItem.plannedEnd) {
        const actualEndDate = new Date(newItem.actualEnd);
        const plannedEndDate = new Date(newItem.plannedEnd);
        delayDays = differenceInCalendarDays(actualEndDate, plannedEndDate);
        if (delayDays < 0) delayDays = 0;
      }

      const itemWithDelay = {
        ...newItem,
        delayDays
      };

      const createdItem = await createScheduleItem(itemWithDelay);

      if (createdItem) {
        setIsAddDialogOpen(false);
        toast({
          title: "Success",
          description: `Schedule item "${newItem.task}" was added.`
        });

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

  const handleUpdateItem = async () => {
    if (!selectedItem || !selectedItem.id) return;
    
    setLoading(true);

    try {
      let delayDays = 0;
      if (selectedItem.actualStart && selectedItem.actualEnd && selectedItem.plannedStart && selectedItem.plannedEnd) {
        const actualEndDate = new Date(selectedItem.actualEnd);
        const plannedEndDate = new Date(selectedItem.plannedEnd);
        delayDays = differenceInCalendarDays(actualEndDate, plannedEndDate);
        if (delayDays < 0) delayDays = 0;
      }

      const itemWithDelay = {
        ...selectedItem,
        delayDays
      };

      const updatedItem = await updateScheduleItem(selectedItem.id, itemWithDelay);

      if (updatedItem) {
        setIsUpdateDialogOpen(false);
        toast({
          title: "Success",
          description: `Schedule item "${selectedItem.task}" was updated.`
        });

        setSelectedItem(null);
        
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

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", dateStr, error);
      return dateStr;
    }
  };

  const handleBatchItemChange = (index: number, field: keyof ScheduleItem, value: any) => {
    setItemsToUpdate(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
      
      if ((field === 'actualStart' || field === 'actualEnd') && 
          newItems[index].actualStart && 
          newItems[index].actualEnd && 
          newItems[index].plannedStart && 
          newItems[index].plannedEnd) {
        const actualEndDate = new Date(newItems[index].actualEnd);
        const plannedEndDate = new Date(newItems[index].plannedEnd);
        let delayDays = differenceInCalendarDays(actualEndDate, plannedEndDate);
        if (delayDays < 0) delayDays = 0;
        newItems[index].delayDays = delayDays;
      }
      
      return newItems;
    });
  };

  const getItemsMissingActualDates = () => {
    return scheduleItems.filter(item => !item.actualStart || !item.actualEnd);
  };

  const openActualDatesDialog = () => {
    const missingItems = getItemsMissingActualDates();
    setItemsToUpdate(missingItems);
    setIsBatchUpdateDialogOpen(true);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Schedule Comparison</CardTitle>
            <CardDescription>Compare planned vs. actual schedules</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={openActualDatesDialog} 
              variant="outline" 
              size="sm"
              disabled={getItemsMissingActualDates().length === 0}
            >
              <Calendar className="mr-1 h-4 w-4" />
              Update Actual Dates
            </Button>
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
        {storageAlert.show && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">{storageAlert.message}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            {showPdfViewer && <TabsTrigger value="pdf">PDF View</TabsTrigger>}
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
                        <TableCell className="hidden md:table-cell">
                          {item.actualStart ? (
                            formatDate(item.actualStart)
                          ) : (
                            <span className="text-amber-500 text-sm font-medium">Not set</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {item.actualEnd ? (
                            formatDate(item.actualEnd)
                          ) : (
                            <span className="text-amber-500 text-sm font-medium">Not set</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.actualEnd && item.plannedEnd ? (
                            <span className={item.delayDays > 0 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                              {item.delayDays > 0 ? `+${item.delayDays}` : item.delayDays}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
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
          <TabsContent value="pdf">
            {pdfUrl ? (
              <div className="w-full flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-muted-foreground">
                    Uploaded PDF schedule:
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      window.open(pdfUrl, '_blank');
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download PDF
                  </Button>
                </div>
                <iframe 
                  src={pdfUrl} 
                  className="w-full h-[600px] border rounded-md"
                  title="Schedule PDF"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                No PDF schedule uploaded yet.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

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

              {selectedItem.actualStart && selectedItem.actualEnd && selectedItem.plannedStart && selectedItem.plannedEnd && (
                <div className="bg-muted/30 p-3 rounded-md">
                  <div className="text-sm font-medium mb-1">Schedule Analysis</div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Planned Duration:</span>{" "}
                      {differenceInCalendarDays(new Date(selectedItem.plannedEnd), new Date(selectedItem.plannedStart))} days
                    </div>
                    <div>
                      <span className="text-muted-foreground">Actual Duration:</span>{" "}
                      {differenceInCalendarDays(new Date(selectedItem.actualEnd), new Date(selectedItem.actualStart))} days
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estimated Delay:</span>{" "}
                      <span className={
                        differenceInCalendarDays(new Date(selectedItem.actualEnd), new Date(selectedItem.plannedEnd)) > 0 
                          ? "text-red-500 font-medium" 
                          : "text-green-500 font-medium"
                      }>
                        {differenceInCalendarDays(new Date(selectedItem.actualEnd), new Date(selectedItem.plannedEnd))} days
                      </span>
                    </div>
                  </div>
                </div>
              )}
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

      <Dialog open={isBatchUpdateDialogOpen} onOpenChange={setIsBatchUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Update Actual Dates</DialogTitle>
          </DialogHeader>
          
          {itemsToUpdate.length === 0 ? (
            <div className="py-6 text-center">
              <div className="text-muted-foreground mb-2">
                No items to update or all items already have actual dates set.
              </div>
              <Button variant="outline" onClick={() => setIsBatchUpdateDialogOpen(false)}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 py-4">
                <div className="text-sm text-muted-foreground mb-2">
                  Update actual start and end dates for schedule items:
                </div>
                
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Task</TableHead>
                        <TableHead>Planned Start</TableHead>
                        <TableHead>Planned End</TableHead>
                        <TableHead>Actual Start</TableHead>
                        <TableHead>Actual End</TableHead>
                        <TableHead>Delay</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itemsToUpdate.map((item, index) => (
                        <TableRow key={item.id || index} isStripe>
                          <TableCell className="font-medium">{item.task}</TableCell>
                          <TableCell>{formatDate(item.plannedStart)}</TableCell>
                          <TableCell>{formatDate(item.plannedEnd)}</TableCell>
                          <TableCell>
                            <DatePicker
                              date={item.actualStart ? new Date(item.actualStart) : undefined}
                              setDate={(date) => 
                                handleBatchItemChange(index, 'actualStart', date ? date.toISOString() : "")
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <DatePicker
                              date={item.actualEnd ? new Date(item.actualEnd) : undefined}
                              setDate={(date) => 
                                handleBatchItemChange(index, 'actualEnd', date ? date.toISOString() : "")
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {item.actualEnd && item.plannedEnd ? (
                              <span className={item.delayDays > 0 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                                {item.delayDays > 0 ? `+${item.delayDays}` : item.delayDays}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsBatchUpdateDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBatchUpdate}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Save All Changes"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

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
                <span className="ml-2">Processing file...</span>
              </div>
            )}

            {fileParseError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">{fileParseError}</AlertDescription>
              </Alert>
            )}

            {showPdfViewer && pdfUrl && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>
                  PDF uploaded successfully! You can view it in the PDF tab.
                </AlertDescription>
              </Alert>
            )}

            {importSuccessful && !showPdfViewer && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>
                  File parsed successfully! {parsedItems.length} schedule items found.
                </AlertDescription>
              </Alert>
            )}

            {parsedItems.length > 0 && !showPdfViewer && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Found {parsedItems.length} schedule items:</h3>
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Planned Start</TableHead>
                        <TableHead>Planned End</TableHead>
                        {parsedItems.some(item => item.description) && (
                          <TableHead>Description</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedItems.map((item, index) => (
                        <TableRow key={index} isStripe>
                          <TableCell>{item.task}</TableCell>
                          <TableCell>{formatDate(item.plannedStart)}</TableCell>
                          <TableCell>{formatDate(item.plannedEnd)}</TableCell>
                          {parsedItems.some(item => item.description) && (
                            <TableCell>{item.description || "-"}</TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {showPdfViewer && pdfUrl && (
              <div className="mt-4 max-h-60">
                <h3 className="text-sm font-medium mb-2">PDF Preview:</h3>
                <iframe 
                  src={pdfUrl} 
                  className="w-full h-40 border rounded-md" 
                  title="PDF Preview"
                />
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
            {parsedItems.length > 0 && !showPdfViewer ? (
              <Button
                onClick={handleImportItems}
                disabled={uploadLoading || parsedItems.length === 0}
              >
                {uploadLoading ? "Importing..." : "Import Items"}
              </Button>
            ) : showPdfViewer && pdfUrl ? (
              <Button
                onClick={() => setIsUploadDialogOpen(false)}
                disabled={uploadLoading}
              >
                Done
              </Button>
            ) : (
              <Button
                onClick={() => handleFileUpload()}
                disabled={uploadLoading || !selectedFile}
              >
                {uploadLoading ? "Processing..." : "Process File"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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

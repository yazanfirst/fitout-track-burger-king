
import { useState } from "react";
import { Calendar, Download, Upload } from "lucide-react";
import { Project, ScheduleItem } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ScheduleComparisonProps {
  project: Project;
  scheduleItems: ScheduleItem[];
}

export function ScheduleComparison({ project, scheduleItems }: ScheduleComparisonProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = () => {
    // Simulate file upload
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
    }, 2000);
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
                  Contractor Schedule (Excel/CSV)
                </label>
                <div className="flex items-center gap-2">
                  <Input type="file" className="flex-1" />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actual Progress (Excel/CSV)
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
                Upload contractor schedule and actual progress for comparison
              </p>
              
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
          </CardContent>
        </Card>
        
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Schedule Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Total Tasks</span>
              <span className="text-sm">{scheduleItems.length}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Completed Tasks</span>
              <span className="text-sm">
                {scheduleItems.filter(item => item.actualEnd).length}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">In Progress</span>
              <span className="text-sm">
                {scheduleItems.filter(item => item.actualStart && !item.actualEnd).length}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Delayed Tasks</span>
              <span className="text-sm font-medium text-red-600">
                {scheduleItems.filter(item => item.delayDays > 0).length}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleItems.length > 0 ? (
                  scheduleItems.map((item, index) => (
                    <TableRow key={index}>
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No schedule data available. Please upload a schedule.
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

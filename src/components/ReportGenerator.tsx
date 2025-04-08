
import { useState } from "react";
import { BarChart3, Download, FileText, Printer } from "lucide-react";
import { Project } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressBar } from "./ProgressBar";
import { toast } from "sonner";

interface ReportGeneratorProps {
  project: Project;
}

export function ReportGenerator({ project }: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Report generated successfully!");
    }, 2000);
  };

  return (
    <section id="report-generator" className="content-section">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="mr-2">📝</span> Report Generator
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-shadow lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Generate Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Generate a comprehensive report of the current project status including progress, drawings, orders, and schedule.
            </p>
            
            <div className="space-y-4 mt-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium">PDF Report</p>
                  <p className="text-xs text-gray-500">
                    Complete project status report
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Print Report</p>
                  <p className="text-xs text-gray-500">
                    Printer-friendly format
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Analytics Export</p>
                  <p className="text-xs text-gray-500">
                    Project metrics in Excel format
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-shadow lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList className="mb-4 grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="visuals">Visuals</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-bold mb-3">{project.name} - Project Summary</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Project Location</p>
                      <p>{project.location}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Project Notes</p>
                      <p>{project.notes}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Progress Overview</p>
                      <div className="space-y-3">
                        <ProgressBar 
                          progress={project.contractorProgress} 
                          colorClass="bg-bk-red" 
                          label="Contractor Progress" 
                          size="sm"
                        />
                        <ProgressBar 
                          progress={project.ownerProgress} 
                          colorClass="bg-bk-gold" 
                          label="Owner Progress" 
                          size="sm"
                        />
                        <ProgressBar 
                          progress={(project.contractorProgress + project.ownerProgress) / 2} 
                          colorClass="bg-green-500" 
                          label="Overall Progress" 
                          size="sm"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Orders Status</p>
                        <p className="font-medium">
                          {project.status.orders}/{project.status.ordersTotal} Complete
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">LPOs Status</p>
                        <p className="font-medium">
                          {project.status.lpos}/{project.status.lposTotal} Received
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Drawings Status</p>
                        <p className="font-medium">
                          {project.status.drawings}/{project.status.drawingsTotal} Uploaded
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Invoices Status</p>
                        <p className="font-medium">
                          {project.status.invoices}/{project.status.invoicesTotal} Processed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="details">
                <div className="bg-gray-50 p-4 rounded-md h-80 flex items-center justify-center">
                  <p className="text-muted-foreground">Detailed report data will appear here.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="visuals">
                <div className="bg-gray-50 p-4 rounded-md h-80 flex items-center justify-center">
                  <p className="text-muted-foreground">Report charts and visuals will appear here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

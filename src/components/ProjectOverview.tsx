
import { useState } from "react";
import { CalendarClock, Check, Clipboard, FileText, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ProgressBar } from "./ProgressBar";

interface ProjectOverviewProps {
  project: Project;
  onNotesChange: (notes: string) => void;
}

export function ProjectOverview({ project, onNotesChange }: ProjectOverviewProps) {
  const [notes, setNotes] = useState<string>(project.notes);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleSaveNotes = () => {
    onNotesChange(notes);
  };

  const statusCards = [
    {
      title: "Orders",
      icon: Clipboard,
      current: project.status.orders,
      total: project.status.ordersTotal,
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      iconColor: "text-blue-500",
    },
    {
      title: "LPOs",
      icon: FileText,
      current: project.status.lpos,
      total: project.status.lposTotal, 
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      iconColor: "text-purple-500",
    },
    {
      title: "Drawings",
      icon: Upload,
      current: project.status.drawings,
      total: project.status.drawingsTotal,
      bgColor: "bg-amber-50",
      textColor: "text-amber-700", 
      iconColor: "text-amber-500",
    },
    {
      title: "Invoices",
      icon: CalendarClock,
      current: project.status.invoices,
      total: project.status.invoicesTotal,
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      iconColor: "text-green-500",
    },
  ];

  return (
    <section id="project-overview" className="content-section">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="mr-2">📋</span> Project Overview
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Column */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Progress Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <ProgressBar 
                progress={project.contractorProgress} 
                colorClass="bg-bk-red" 
                label="Contractor Progress" 
              />
            </div>
            <div>
              <ProgressBar 
                progress={project.ownerProgress} 
                colorClass="bg-bk-gold" 
                label="Owner Progress" 
              />
            </div>
            <div>
              <ProgressBar 
                progress={(project.contractorProgress + project.ownerProgress) / 2} 
                colorClass="bg-green-500" 
                label="Overall Progress" 
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Status Cards Column */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {statusCards.map((card, index) => (
                <div 
                  key={index} 
                  className={cn("p-3 rounded-lg", card.bgColor)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={cn("text-xs font-medium", card.textColor)}>
                        {card.title}
                      </p>
                      <p className="mt-1 text-xl font-semibold">
                        {card.current}/{card.total}
                      </p>
                      <p className="mt-1 text-xs">
                        {Math.round((card.current / card.total) * 100)}% Complete
                      </p>
                    </div>
                    <card.icon className={cn("h-5 w-5", card.iconColor)} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Notes Column */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Project Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea 
                placeholder="Add project notes here..."
                value={notes}
                onChange={handleNotesChange}
                className="min-h-[150px] resize-none"
              />
              <Button 
                onClick={handleSaveNotes}
                variant="default" 
                className="w-full"
              >
                <Check className="h-4 w-4 mr-1" />
                Save Notes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

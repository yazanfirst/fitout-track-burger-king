
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Calendar, 
  ClipboardList, 
  FileText, 
  Image, 
  LayoutDashboard, 
  Menu, 
  ScrollText, 
  UsersRound, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarLink {
  icon: React.ElementType;
  label: string;
  emoji: string;
  href: string;
}

const links: SidebarLink[] = [
  { icon: LayoutDashboard, label: "Project Overview", emoji: "📋", href: "#project-overview" },
  { icon: Calendar, label: "Schedule Comparison", emoji: "📁", href: "#schedule-comparison" },
  { icon: Image, label: "Site Photos", emoji: "📷", href: "#site-photos" },
  { icon: FileText, label: "Drawing Upload", emoji: "📐", href: "#drawing-upload" },
  { icon: ClipboardList, label: "Order Tracker", emoji: "🧾", href: "#order-tracker" },
  { icon: UsersRound, label: "Responsibility Matrix", emoji: "🧑‍🔧", href: "#responsibility-matrix" },
  { icon: BarChart, label: "Report Generator", emoji: "📝", href: "#report-generator" },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Mobile menu button - only appears on small screens */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setExpanded(true)}
          className="rounded-full bg-white shadow-md"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 md:relative",
          expanded ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          expanded ? "w-64" : "md:w-20",
          "md:hover:w-64",
          className
        )}
      >
        {/* Close button - mobile only */}
        <div className="flex justify-end p-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setExpanded(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-100">
          <img
            src="https://www.burgerking.com.my/static/favicon/android-icon-96x96.png"
            alt="Burger King"
            className="h-10 w-10 mr-3"
          />
          <span className={cn(
            "font-bold text-lg text-bk-brown transition-opacity duration-300",
            !expanded ? "hidden md:group-hover:block md:opacity-0 md:group-hover:opacity-100" : ""
          )}>
            Fitout Tracker
          </span>
        </div>
        
        {/* Navigation links */}
        <nav className="flex-1 pt-5 overflow-y-auto">
          <ul className="px-2 space-y-2">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={cn(
                    "flex items-center px-3 py-3 text-gray-700 rounded-md hover:bg-gray-100 transition-all duration-200",
                    "group focus:outline-none focus:bg-gray-100"
                  )}
                  onClick={() => setExpanded(false)}
                >
                  <span className="relative flex items-center justify-center w-10 h-6">
                    <link.icon className={cn(
                      "h-5 w-5 text-bk-red transition-opacity duration-200",
                      expanded ? "opacity-100" : "md:group-hover:opacity-0"
                    )} />
                    <span className={cn(
                      "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
                      expanded ? "opacity-0" : "md:opacity-0 md:group-hover:opacity-100"
                    )}>
                      {link.emoji}
                    </span>
                  </span>
                  
                  <span className={cn(
                    "ml-3 text-sm font-medium transition-opacity duration-300",
                    !expanded ? "hidden md:group-hover:block md:opacity-0 md:group-hover:opacity-100" : ""
                  )}>
                    {link.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className={cn(
            "flex items-center",
            !expanded ? "justify-center md:group-hover:justify-start" : "justify-start"
          )}>
            <ScrollText className="h-5 w-5 text-gray-500" />
            <span className={cn(
              "ml-3 text-xs text-gray-500 transition-opacity duration-300",
              !expanded ? "hidden md:group-hover:block md:opacity-0 md:group-hover:opacity-100" : ""
            )}>
              v1.0.0
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

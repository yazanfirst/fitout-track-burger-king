
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  colorClass?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function ProgressBar({ 
  progress, 
  colorClass = "bg-bk-red", 
  showLabel = true, 
  size = "md",
  label
}: ProgressBarProps) {
  const heightClass = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const formattedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between mb-1 text-sm">
          {label && <span>{label}</span>}
          {showLabel && <span>{formattedProgress}%</span>}
        </div>
      )}
      <div className={cn("w-full bg-gray-200 rounded-full", heightClass[size])}>
        <div
          className={cn("rounded-full", colorClass, heightClass[size])}
          style={{ width: `${formattedProgress}%` }}
        />
      </div>
    </div>
  );
}

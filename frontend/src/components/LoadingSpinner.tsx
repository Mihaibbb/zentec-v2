import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 48, 
  className = "",
  fullScreen = false 
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 
        size={size} 
        className="animate-spin text-purple-500" 
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}


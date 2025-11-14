import React from "react";
import { AlertTriangle } from "lucide-react";

type WarningModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
};

export default function WarningModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = "OK"
}: WarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 46, 0.95), rgba(20, 20, 35, 0.95))',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="p-6 lg:p-8">
          {/* Icon and Title - Centered */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-orange-500/20 mb-4 border-2 border-orange-500/30">
              <AlertTriangle 
                size={32} 
                className="text-orange-400" 
              />
            </div>
            <h3 className="text-xl lg:text-2xl font-semibold text-slate-100 mb-2">{title}</h3>
          </div>
          
          {/* Message - Centered */}
          <p className="text-slate-300 text-center mb-8 text-base lg:text-lg leading-relaxed">
            {message}
          </p>
          
          {/* Button - Centered and Bigger */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-3 lg:px-10 lg:py-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-base lg:text-lg transition-all duration-200 shadow-lg hover:shadow-orange-500/50 min-w-[120px]"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


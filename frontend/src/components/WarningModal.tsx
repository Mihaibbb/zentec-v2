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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-orange-500/20">
            <AlertTriangle 
              size={24} 
              className="text-orange-400" 
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-slate-300 mb-6">{message}</p>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


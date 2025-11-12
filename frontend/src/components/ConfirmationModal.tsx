import React from "react";
import { AlertTriangle } from "lucide-react";

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning"
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const buttonColors = {
    danger: "bg-red-600 hover:bg-red-700",
    warning: "bg-orange-600 hover:bg-orange-700",
    info: "bg-blue-600 hover:bg-blue-700"
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            type === "danger" ? "bg-red-500/20" : type === "warning" ? "bg-orange-500/20" : "bg-blue-500/20"
          }`}>
            <AlertTriangle 
              size={24} 
              className={type === "danger" ? "text-red-400" : type === "warning" ? "text-orange-400" : "text-blue-400"} 
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-slate-300 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${buttonColors[type]}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


import React, { useState, useEffect, useRef } from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";

type TimePickerProps = {
  value: string; // Format: "HH:mm"
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function TimePicker({ value, onChange, disabled = false }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hours, minutes] = value && value.includes(":") ? value.split(":").map(Number) : [0, 0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  function handleHourChange(newHour: number) {
    const h = String(newHour).padStart(2, "0");
    onChange(`${h}:${String(minutes).padStart(2, "0")}`);
  }

  function handleMinuteChange(newMinute: number) {
    const m = String(newMinute).padStart(2, "0");
    onChange(`${String(hours).padStart(2, "0")}:${m}`);
  }

  const displayValue = value && value.includes(":") ? value : "00:00";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`input w-full flex items-center justify-between ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          <span className="text-slate-200">{displayValue}</span>
        </div>
        <span className="text-slate-400">▾</span>
      </button>
      {isOpen && !disabled && (
        <div className="absolute z-10 mt-2 w-full bg-panel2 border border-slate-700 rounded-lg p-4 shadow-xl">
          <div className="flex items-center justify-center gap-4">
            {/* Hours */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-slate-400 mb-1">Hours</div>
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleHourChange((hours + 1) % 24)}
                  className="p-2 hover:bg-slate-800 rounded transition-colors"
                >
                  <ChevronUp size={18} className="text-slate-400" />
                </button>
                <div className="text-3xl font-semibold text-slate-200 min-w-[4rem] text-center py-2">
                  {String(hours).padStart(2, "0")}
                </div>
                <button
                  type="button"
                  onClick={() => handleHourChange((hours - 1 + 24) % 24)}
                  className="p-2 hover:bg-slate-800 rounded transition-colors"
                >
                  <ChevronDown size={18} className="text-slate-400" />
                </button>
              </div>
            </div>
            <div className="text-3xl font-semibold text-slate-400 py-2">:</div>
            {/* Minutes */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-slate-400 mb-1">Minute</div>
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMinuteChange((minutes + 15) % 60)}
                  className="p-2 hover:bg-slate-800 rounded transition-colors"
                >
                  <ChevronUp size={18} className="text-slate-400" />
                </button>
                <div className="text-3xl font-semibold text-slate-200 min-w-[4rem] text-center py-2">
                  {String(minutes).padStart(2, "0")}
                </div>
                <button
                  type="button"
                  onClick={() => handleMinuteChange((minutes - 15 + 60) % 60)}
                  className="p-2 hover:bg-slate-800 rounded transition-colors"
                >
                  <ChevronDown size={18} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700 flex gap-2">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                onChange(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
              }}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 transition-colors"
            >
              Now
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-2 rounded-lg bg-gradient-brand text-white text-sm transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


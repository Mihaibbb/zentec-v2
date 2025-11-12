import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

type HourPickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
};

export default function HourPicker({
  value,
  onChange,
  disabled = false,
  min = 0,
  max = 23,
  placeholder = "0"
}: HourPickerProps) {
  const numValue = parseInt(value) || 0;

  function handleIncrement() {
    if (disabled) return;
    const newValue = Math.min(numValue + 1, max);
    onChange(String(newValue));
  }

  function handleDecrement() {
    if (disabled) return;
    const newValue = Math.max(numValue - 1, min);
    onChange(String(newValue));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (disabled) return;
    const inputValue = e.target.value;
    if (inputValue === "") {
      onChange("");
      return;
    }
    const num = parseInt(inputValue);
    if (!isNaN(num)) {
      const clamped = Math.max(min, Math.min(max, num));
      onChange(String(clamped));
    }
  }

  return (
    <div className="relative">
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2 pr-10 text-slate-200 placeholder-slate-400 border border-none focus:border-none focus:outline-none transition-colors"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || numValue >= max}
          className="p-0.5 hover:bg-slate-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronUp size={14} className="text-slate-300" />
        </button>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || numValue <= min}
          className="p-0.5 hover:bg-slate-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronDown size={14} className="text-slate-300" />
        </button>
      </div>
    </div>
  );
}


import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Calendar as CalendarIcon, X } from "lucide-react";
import moment from "moment";

type CalendarInputProps = {
  value: string; // Format: "YYYY-MM-DD"
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  minDate?: Date; // Optional min date, defaults to today
  maxDate?: Date; // Optional max date
  allowPastDates?: boolean; // If true, allows selecting past dates
  maxWidth?: string; // Optional max width for the calendar popup
};

export default function CalendarInput({
  value,
  onChange,
  disabled = false,
  placeholder = "Select date",
  required = false,
  minDate,
  maxDate,
  allowPastDates = false,
  maxWidth
}: CalendarInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [calendarValue, setCalendarValue] = useState<Date | null>(
    value ? moment(value, "YYYY-MM-DD").toDate() : null
  );

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

  useEffect(() => {
    if (value) {
      setCalendarValue(moment(value, "YYYY-MM-DD").toDate());
    } else {
      setCalendarValue(null);
    }
  }, [value]);

  function handleDateChange(value: any) {
    // react-calendar can return a Date or an array of Dates (for range selection)
    // We only want single date selection, so handle both cases
    let selectedDate: Date | null = null;
    
    if (value instanceof Date) {
      selectedDate = value;
    } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
      selectedDate = value[0]; // Take the first date if it's an array
    } else if (value === null) {
      selectedDate = null;
    }
    
    if (selectedDate) {
      const formatted = moment(selectedDate).format("YYYY-MM-DD");
      onChange(formatted);
      setCalendarValue(selectedDate);
      setIsOpen(false);
    }
  }

  const displayValue = value ? moment(value, "YYYY-MM-DD").format("DD/MM/YYYY") : "";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`input w-full flex items-center justify-between ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className="text-slate-400" />
          <span className={displayValue ? "text-slate-200" : "text-slate-500"}>
            {displayValue || placeholder}
          </span>
        </div>
        {value && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              setCalendarValue(null);
            }}
            className="hover:text-red-300 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </button>
      {isOpen && !disabled && (
        <div 
          className="absolute z-[100] mt-2 bg-panel2 border border-slate-700 rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{ 
            top: '100%',
            left: 0,
            right: 0,
            minWidth: '350px',
            maxWidth: maxWidth || 'none',
          }}
        >
          <Calendar
            onChange={handleDateChange}
            value={calendarValue}
            className="react-calendar-custom"
            minDate={allowPastDates ? undefined : (minDate || new Date())} // Prevent selecting past dates unless allowed
            maxDate={maxDate}
            selectRange={false}
          />
        </div>
      )}
    </div>
  );
}


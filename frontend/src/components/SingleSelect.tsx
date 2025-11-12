import React, { useState, useEffect, useRef } from "react";
import { X, Search, ChevronDown } from "lucide-react";

type Item = {
  id: number;
  name: string;
  color?: string;
};

type SingleSelectProps = {
  items: Item[];
  selectedId: number | null;
  onSelectionChange: (id: number | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  disabled?: boolean;
};

export default function SingleSelect({
  items,
  selectedId,
  onSelectionChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  label,
  disabled = false
}: SingleSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showList, setShowList] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedItem = items.find(item => item.id === selectedId);
  const availableItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowList(false);
      }
    }

    if (showList) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showList]);

  function handleSelect(id: number) {
    onSelectionChange(id);
    setSearchQuery("");
    setShowList(false);
  }

  function handleClear() {
    onSelectionChange(null);
    setSearchQuery("");
  }

  function handleInputFocus() {
    if (!disabled) {
      setShowList(true);
    }
  }

  function handleInputBlur() {
    setTimeout(() => {
      setShowList(false);
    }, 200);
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && <div className="text-sm text-slate-400">{label}</div>}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setShowList(!showList)}
          disabled={disabled}
          className={`input w-full flex items-center justify-between ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedItem ? (
              <>
                {selectedItem.color && (
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selectedItem.color }}
                  />
                )}
                <span className="text-slate-200 truncate">{selectedItem.name}</span>
              </>
            ) : (
              <span className="text-slate-500">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {selectedItem && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="hover:text-red-300 transition-colors"
              >
                <X size={16} />
              </button>
            )}
            <ChevronDown size={16} className="text-slate-400" />
          </div>
        </button>
        {showList && !disabled && (
          <div className="absolute z-50 mt-2 w-full bg-panel2 border border-slate-700 rounded-lg shadow-xl">
            <div className="p-2 border-b border-slate-700">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-64 overflow-auto p-2">
              {availableItems.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-sm">No results found</div>
              ) : (
                availableItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-left ${
                      selectedId === item.id ? "bg-slate-800" : ""
                    }`}
                  >
                    {item.color && (
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    <span className="text-slate-200">{item.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


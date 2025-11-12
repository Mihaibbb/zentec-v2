import React, { useState, useEffect, useRef } from "react";
import { X, Search } from "lucide-react";

type Item = {
  id: number;
  name: string;
  color?: string;
};

type MultiSelectProps = {
  items: Item[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
};

export default function MultiSelect({
  items,
  selectedIds,
  onSelectionChange,
  placeholder = "Search...",
  searchPlaceholder = "Search...",
  label
}: MultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showList, setShowList] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedItems = items.filter(item => selectedIds.includes(item.id));
  const availableItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const notSelected = !selectedIds.includes(item.id);
    return matchesSearch && notSelected;
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

  function handleRemove(id: number) {
    onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
  }

  function handleAdd(id: number) {
    onSelectionChange([...selectedIds, id]);
    setSearchQuery("");
    setShowList(false);
  }

  function handleInputFocus() {
    setShowList(true);
  }

  function handleInputBlur() {
    // Delay to allow click events to fire first
    setTimeout(() => {
      setShowList(false);
    }, 200);
  }

  return (
    <div className="space-y-3" ref={containerRef}>
      {label && <div className="text-sm text-slate-400">{label}</div>}
      <div className="bg-panel2 rounded-lg p-3 flex flex-wrap gap-2 items-center">
        {selectedItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700"
          >
            {item.color && (
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span className="text-sm text-slate-200">{item.name}</span>
            <button
              onClick={() => handleRemove(item.id)}
              className="ml-1 hover:text-red-300 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowList(true);
            }}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="w-full bg-transparent border-0 outline-none pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500"
          />
        </div>
      </div>
      {showList && availableItems.length > 0 && (
        <div className="bg-panel2 rounded-lg p-2 space-y-1 max-h-64 overflow-auto">
          {availableItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                handleAdd(item.id);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-left"
            >
              {item.color && (
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
              )}
              <span className="text-slate-200">{item.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  format,
  parse,
  isValid,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  getDay,
  isToday,
  isBefore,
  startOfDay,
} from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: string;         // ISO date string: "2025-04-09"
  onChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  minDate?: Date;
  className?: string;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  id,
  disabled,
  minDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [viewDate, setViewDate] = useState<Date>(new Date());

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value → display text
  useEffect(() => {
    if (value) {
      // If it's a simple yyyy-MM-dd string, we can use new Date() which is very reliable for that format
      const d = new Date(value);
      if (isValid(d)) {
        setInputText(format(d, 'dd/MM/yyyy'));
        setViewDate(d);
      } else {
        // Fallback for non-standard formats
        try {
          const parsed = parse(value, 'yyyy-MM-dd', new Date());
          if (isValid(parsed)) {
            setInputText(format(parsed, 'dd/MM/yyyy'));
            setViewDate(parsed);
          }
        } catch {
          setInputText(value);
        }
      }
    } else {
      setInputText('');
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  // Parse manual text input (supports dd/MM/yyyy, MM/dd/yyyy, yyyy-MM-dd)
  const parseInput = useCallback((text: string): Date | null => {
    if (!text || text.length < 5) return null;

    const formats = ['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd', 'd/M/yyyy'];
    for (const fmt of formats) {
      try {
        const d = parse(text, fmt, new Date());
        // For 4-digit years, ensure it's not a tiny year like 0002
        if (isValid(d) && d.getFullYear() > 1000) return d;
      } catch {
        continue;
      }
    }
    return null;
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    setInputText(text);

    if (!text) {
      onChange?.('');
      return;
    }

    const d = parseInput(text);
    if (d) {
      // Successfully parsed, update form state
      onChange?.(format(d, 'yyyy-MM-dd'));
      setViewDate(d);
    }
  }

  function handleInputBlur() {
    if (!inputText) return;
    const d = parseInput(inputText);
    if (d) {
      setInputText(format(d, 'dd/MM/yyyy'));
      onChange?.(format(d, 'yyyy-MM-dd'));
    } else {
      // Revert to last valid value if available
      if (value) {
        const parsed = new Date(value);
        setInputText(isValid(parsed) ? format(parsed, 'dd/MM/yyyy') : '');
      } else {
        setInputText('');
      }
    }
  }

  function handleDayClick(day: Date) {
    if (minDate && isBefore(startOfDay(day), startOfDay(minDate))) return;
    
    // Internal state updates
    const dateStr = format(day, 'yyyy-MM-dd');
    onChange?.(dateStr);
    setInputText(format(day, 'dd/MM/yyyy'));
    setOpen(false);
  }

  function clearDate(e: React.MouseEvent) {
    e.stopPropagation();
    onChange?.('');
    setInputText('');
    inputRef.current?.focus();
  }

  // Build calendar days for current view month
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart); // 0=Sun

  const selectedDate = value
    ? (() => {
        try {
          const d = parse(value, 'yyyy-MM-dd', new Date());
          return isValid(d) ? d : null;
        } catch {
          return null;
        }
      })()
    : null;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Input row */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-16 text-sm',
            'ring-offset-background placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        />
        {/* Clear button */}
        {inputText && !disabled && (
          <button
            type="button"
            onClick={clearDate}
            className="absolute right-8 p-1 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {/* Calendar toggle */}
        <button
          type="button"
          onClick={() => { if (!disabled) setOpen(o => !o); }}
          className="absolute right-2 p-1 text-muted-foreground hover:text-primary transition-colors"
          tabIndex={-1}
          disabled={disabled}
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar Popup */}
      {open && (
        <div className="absolute top-full mt-2 z-50 w-72 rounded-xl border border-border bg-popover shadow-2xl shadow-black/40 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <button
              type="button"
              onClick={() => setViewDate(d => subMonths(d, 1))}
              className="p-1 rounded-md hover:bg-accent transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-foreground">
              {format(viewDate, 'MMMM yyyy')}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(d => addMonths(d, 1))}
              className="p-1 rounded-md hover:bg-accent transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-3 pb-1">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 px-3 pb-4 gap-y-0.5">
            {/* Padding cells */}
            {Array.from({ length: startPadding }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map(day => {
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
              const isTodayDay = isToday(day);
              const isDisabled = minDate
                ? isBefore(startOfDay(day), startOfDay(minDate))
                : false;
              const isCurrentMonth = isSameMonth(day, viewDate);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    'flex items-center justify-center rounded-md text-sm h-8 w-full transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : isTodayDay
                        ? 'border border-primary/40 text-primary font-medium hover:bg-primary/10'
                        : 'hover:bg-accent text-foreground',
                    !isCurrentMonth && 'text-muted-foreground/40',
                    isDisabled && 'opacity-30 cursor-not-allowed hover:bg-transparent',
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="border-t border-border px-3 py-2">
            <button
              type="button"
              onClick={() => handleDayClick(new Date())}
              className="text-xs text-primary hover:underline font-medium transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

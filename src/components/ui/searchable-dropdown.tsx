import React, { useState, useEffect, useRef } from 'react';
import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface SearchableDropdownProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  className,
  disabled = false
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get the currently selected option
  const selectedOption = options.find(option => option.value === value);

  // Filter options based on input value
  const filteredOptions = options
    .filter(option => 
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    )
    .sort((a, b) => a.label.localeCompare(b.label));

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset input value when dropdown closes
  useEffect(() => {
    if (!open) {
      setInputValue('');
    }
  }, [open]);

  // Update input value when selection changes
  useEffect(() => {
    if (selectedOption && open) {
      setInputValue(selectedOption.label);
    }
  }, [selectedOption, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select option"
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          onClick={() => {
            setOpen(true);
            // Focus the input when dropdown opens
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }, 0);
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0" 
        align="start"
        sideOffset={4}
      >
        <Command shouldFilter={false} className="max-h-[300px]">
          <CommandInput 
            ref={inputRef}
            placeholder="Type to search..."
            value={inputValue}
            onValueChange={setInputValue}
            className="h-9"
          />
          <CommandEmpty className="py-2 px-3 text-sm">
            No results found
          </CommandEmpty>
          <CommandGroup className="overflow-auto">
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="flex items-center justify-between cursor-pointer"
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
import React, { useState, useEffect } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { Company } from '../../types';
import { apiClient } from '../../services/apiClient';
import { Button } from '../ui/button';
import { Building2, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../ui/command';

export function CompanySelection({ onNext }: { onNext: () => void }) {
  const { company, setCompany } = useWorkflow();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getCompanies();
        setCompanies(data?.data?.companies);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Select Company</h2>
      </div>
      
      <div className="space-y-6">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-12 text-base"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading companies...</span>
                </div>
              ) : company ? (
                company.name
              ) : (
                "Search company..."
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[var(--radix-popover-trigger-width)] p-0" 
            align="start"
            side="bottom"
            sideOffset={4}
            alignOffset={0}
            avoidCollisions={false}
          >
            <Command shouldFilter={false}>
              <CommandInput 
                placeholder="Search company..." 
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="h-11"
              />
              <CommandEmpty className="py-6 text-center text-sm">
                {loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading companies...</span>
                  </div>
                ) : (
                  "No company found"
                )}
              </CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {filteredCompanies.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => {
                      setCompany(item);
                      setOpen(false);
                      setSearchTerm('');
                    }}
                    className="flex items-center justify-between py-3 px-4 text-base cursor-pointer"
                  >
                    <span>{item.name}</span>
                    {company?.id === item.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex justify-end">
          <Button 
            onClick={onNext} 
            disabled={!company}
            size="lg"
            className="text-base px-8"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
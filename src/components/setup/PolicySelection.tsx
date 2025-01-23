import React, { useState, useEffect } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { Policy } from '../../types';
import { apiClient } from '../../services/apiClient';
import { Button } from '../ui/button';
import { FileText, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
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

export function PolicySelection({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { company, policy, setPolicy, setSlabMapping, setGenomeRoster, setPolicyType } = useWorkflow();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempSelectPolicy, setTempSelectedPolicy] = useState(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      if (!company) return;
      
      setLoading(true);
      try {
        const data = await apiClient.getPolicies(company.id);
        setPolicies(data?.data);
      } catch (error) {
        console.error('Error fetching policies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, [company]);

  // Filter policies based on search term
  const filteredPolicies = policies
    .filter(policy => policy?.nickName?.toLowerCase().includes(searchTerm?.toLowerCase()))
    .sort((a, b) => a.nickName.localeCompare(b.nickName));

  const handlePolicySelect = () => {
    setPolicy(tempSelectPolicy);
    setPolicyType(tempSelectPolicy?.policyType || null);
    // Map slab IDs to sum insured values
    if (tempSelectPolicy?.sumAssuredSlabs) {
      const slabMapping = tempSelectPolicy?.sumAssuredSlabs?.map((slab) => ({
        slab_id: slab.slabId,
        sum_insured: slab.sumInsured.toString()
      }));
      setSlabMapping(slabMapping);
    }
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Select Policy</h2>
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
                  <span>Loading policies...</span>
                </div>
              ) : tempSelectPolicy ? (
                <div className="flex items-center gap-2">
                  {tempSelectPolicy?.insurerLogo && (
                    <img 
                      src={tempSelectPolicy?.insurerLogo} 
                      alt="Insurer logo" 
                      className="h-6 w-6 object-contain"
                    />
                  )}
                  <span>{tempSelectPolicy?.nickName}</span>
                </div>
              ) : (
                "Search policy..."
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
                placeholder="Search policy..." 
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="h-11"
              />
              <CommandEmpty className="py-6 text-center text-sm">
                {loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading policies...</span>
                  </div>
                ) : (
                  "No policy found"
                )}
              </CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {filteredPolicies?.map((item) => (
                  <CommandItem
                    key={item?.id}
                    value={item?.id}
                    onSelect={() => {
                      setTempSelectedPolicy(item)
                      setOpen(false);
                      setSearchTerm('');
                    }}
                    className="flex items-center gap-2 py-3 px-4 text-base cursor-pointer"
                  >
                    {item?.insurerLogo && (
                      <img 
                        src={item?.insurerLogo} 
                        alt="Insurer logo" 
                        className="h-6 w-6 object-contain flex-shrink-0"
                      />
                    )}
                    <span className="flex-1 truncate">{item?.nickName}</span>
                    {policy?.id === item?.id && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onBack}
            size="lg"
            className="text-base px-8"
          >
            Back
          </Button>
          <Button 
            onClick={handlePolicySelect} 
            disabled={!tempSelectPolicy}
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
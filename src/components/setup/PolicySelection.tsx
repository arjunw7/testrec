import React, { useState, useEffect } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { Policy } from '../../types';
import { apiClient } from '../../services/apiClient';
import { Button } from '../ui/button';
import { FileText, Check, ChevronsUpDown, Loader2, HelpCircle } from 'lucide-react';
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
import { HelpModal } from './HelpModal';

export function PolicySelection({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { company, policy, setPolicy, setSlabMapping, setPolicyType } = useWorkflow();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempSelectPolicy, setTempSelectedPolicy] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

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

  const filteredPolicies = policies
    .filter(policy => policy?.nickName?.toLowerCase().includes(searchTerm?.toLowerCase()))
    .sort((a, b) => a.nickName.localeCompare(b.nickName));

  const handlePolicySelect = () => {
    setPolicy(tempSelectPolicy);
    setPolicyType(tempSelectPolicy?.policyType || null);
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
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#025F4C]/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-[#025F4C]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Select Policy</h2>
              <p className="text-sm text-muted-foreground">Choose the policy to reconcile</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => setShowHelp(true)}
            className="h-9 rounded-lg bg-[#025F4C]/5 hover:bg-[#025F4C]/15 text-sm"
          > 
            <HelpCircle className="h-4 w-4" />
            &nbsp;Getting Started
          </Button>
        </div>
        <div className="space-y-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-11 text-base"
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
                        className="h-5 w-5 object-contain"
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
            >
              <Command shouldFilter={false}>
                <CommandInput 
                  placeholder="Search policy..." 
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                  className="h-10"
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
                <CommandGroup className="max-h-[280px] overflow-auto">
                  {filteredPolicies?.map((item) => (
                    <CommandItem
                      key={item?.id}
                      value={item?.id}
                      onSelect={() => {
                        setTempSelectedPolicy(item)
                        setOpen(false);
                        setSearchTerm('');
                      }}
                      className="flex items-center gap-2 py-3 px-4 text-sm cursor-pointer"
                    >
                      {item?.insurerLogo && (
                        <img 
                          src={item?.insurerLogo} 
                          alt="Insurer logo" 
                          className="h-5 w-5 object-contain flex-shrink-0"
                        />
                      )}
                      <span className="flex-1 truncate">{item?.nickName}</span>
                      {policy?.id === item?.id && (
                        <Check className="h-4 w-4 text-[#025F4C] flex-shrink-0" />
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
              size="sm"
              className="px-6"
            >
              Back
            </Button>
            <Button 
              onClick={handlePolicySelect} 
              disabled={!tempSelectPolicy}
              size="sm"
              className="px-6 policy-selector"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}

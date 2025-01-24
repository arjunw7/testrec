import React, { useState } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { Button } from '../ui/button';
import { ClipboardList, HelpCircle, ArrowRight } from 'lucide-react';
import { HelpModal } from './HelpModal';

export function EndorsementType({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { setIsFirstEndorsement, setStep } = useWorkflow();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#025F4C]/10 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-[#025F4C]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Select Endorsement Type</h2>
              <p className="text-sm text-muted-foreground">Choose how to process the endorsement</p>
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
        
        <div className="grid gap-3">
          <button
            className="group flex items-center gap-4 p-4 rounded-lg border hover:border-[#025F4C]/40 bg-white hover:bg-[#025F4C]/5 transition-colors text-left"
            onClick={() => {
              setIsFirstEndorsement(true);
              onNext();
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-[#025F4C]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-[#025F4C]">1</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-0.5">First Endorsement</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Initial data matching across systems to establish baseline for future endorsements
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-[#025F4C]/40 group-hover:text-[#025F4C]/60 flex-shrink-0" />
          </button>

          <button
            className="group flex items-center gap-4 p-4 rounded-lg border hover:border-[#025F4C]/40 bg-white hover:bg-[#025F4C]/5 transition-colors text-left"
            onClick={() => {
              setIsFirstEndorsement(false);
              setStep(6);
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-[#025F4C]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-[#025F4C]">2</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-0.5">Regular Endorsement</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Process new additions, deletions, and updates for subsequent reconciliations
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-[#025F4C]/40 group-hover:text-[#025F4C]/60 flex-shrink-0" />
          </button>

          <div className="flex justify-between mt-2">
            <Button 
              variant="outline" 
              onClick={onBack}
              size="sm"
              className="px-6"
            >
              Back
            </Button>
          </div>
        </div>
      </div>

      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}

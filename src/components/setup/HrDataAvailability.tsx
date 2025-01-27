import React, { useState } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { Button } from '../ui/button';
import { FileText, HelpCircle, ArrowRight, Plus, Ban } from 'lucide-react';
import { HelpModal } from './HelpModal';

export function HrDataAvailability({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { setHasAdditionalData } = useWorkflow();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#025F4C]/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-[#025F4C]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Additional Data Available for Endorsement?</h2>
              <p className="text-sm text-muted-foreground">Supplementary data for addition, corrections or deletions</p>
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
              setHasAdditionalData(true);
              onNext();
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <Plus className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-0.5">Yes, Additional Data Available</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Process new additions, deletions, and information updates from HR
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-[#025F4C]/40 group-hover:text-[#025F4C]/60 flex-shrink-0" />
          </button>

          <button
            className="group flex items-center gap-4 p-4 rounded-lg border hover:border-[#025F4C]/40 bg-white hover:bg-[#025F4C]/5 transition-colors text-left"
            onClick={() => {
              setHasAdditionalData(false);
              onNext();
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Ban className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-0.5">No Additional Data</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Focus on reconciling existing member data only
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

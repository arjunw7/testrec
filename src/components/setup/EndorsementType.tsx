import React from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { Button } from '../ui/button';
import { ClipboardList } from 'lucide-react';

export function EndorsementType({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { setIsFirstEndorsement, setStep } = useWorkflow();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Select Endorsement Type</h2>
      </div>
      
      <div className="grid gap-4">
        <Button
          variant="outline"
          className="h-auto p-4 justify-start"
          onClick={() => {
            setIsFirstEndorsement(true);
            onNext();
          }}
        >
          <div className="text-left">
            <div className="font-semibold">First Endorsement</div>
            <div className="text-sm text-muted-foreground">
              Initial reconciliation for the policy
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-4 justify-start"
          onClick={() => {
            setIsFirstEndorsement(false);
            setStep(6); // Skip directly to home screen
          }}
        >
          <div className="text-left">
            <div className="font-semibold">Regular Endorsement</div>
            <div className="text-sm text-muted-foreground">
              Subsequent reconciliation for the policy
            </div>
          </div>
        </Button>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
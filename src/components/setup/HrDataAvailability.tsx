import React from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { Button } from '../ui/button';
import { FileText } from 'lucide-react';

export function HrDataAvailability({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { setHasAdditionalData } = useWorkflow();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Additional HR Data Availability</h2>
      </div>
      
      <div className="grid gap-4">
        <Button
          variant="outline"
          className="h-auto p-4 justify-start"
          onClick={() => {
            setHasAdditionalData(true);
            onNext();
          }}
        >
          <div className="text-left">
            <div className="font-semibold">Yes, HR Has Shared Additional Data</div>
            <div className="text-sm text-muted-foreground">
              HR has provided data for additions, deletions, or corrections
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-4 justify-start"
          onClick={() => {
            setHasAdditionalData(false);
            onNext();
          }}
        >
          <div className="text-left">
            <div className="font-semibold">No Additional Data from HR</div>
            <div className="text-sm text-muted-foreground">
              Proceed with only Insurer and Genome data reconciliation
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
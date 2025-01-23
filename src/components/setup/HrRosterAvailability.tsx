import React from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { Button } from '../ui/button';
import { Users } from 'lucide-react';

export function HrRosterAvailability({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { setHasHrRoster } = useWorkflow();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">HR Active Roster Availability</h2>
      </div>
      
      <div className="grid gap-4">
        <Button
          variant="outline"
          className="h-auto p-4 justify-start"
          onClick={() => {
            setHasHrRoster(true);
            onNext('yes');
          }}
        >
          <div className="text-left">
            <div className="font-semibold">Yes, HR Active Roster is Available</div>
            <div className="text-sm text-muted-foreground">
              Upload HR, Insurer, and Genome data for reconciliation
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-4 justify-start"
          onClick={() => {
            setHasHrRoster(false);
            onNext('no');
          }}
        >
          <div className="text-left">
            <div className="font-semibold">No, HR Active Roster is Not Available</div>
            <div className="text-sm text-muted-foreground">
              Upload only Insurer and Genome data for reconciliation
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
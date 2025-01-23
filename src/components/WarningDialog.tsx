import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { AlertTriangle, Upload } from 'lucide-react';

interface WarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WarningDialog({ isOpen, onClose }: WarningDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="absolute left-[50%] translate-x-[-50%] -translate-y-1/2 rounded-full bg-amber-100 p-3 border-4 border-white">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
        </div>
        
        <DialogHeader className="pt-8">
          <DialogTitle className="text-center text-xl">Missing Required Data</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Please upload the Insurer Active Roster before proceeding with reconciliation.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 mt-2 bg-amber-50 rounded-lg border border-amber-100">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Upload className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-medium text-amber-900 mb-1">How to proceed?</h4>
              <p className="text-sm text-amber-700">
                1. Navigate to the "Insurer Active Roster" tab<br />
                2. Upload your insurer data file (.xlsx, .xml)<br />
                3. Map the columns correctly<br />
                4. Try reconciliation again
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button 
            onClick={onClose}
            className="w-full"
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
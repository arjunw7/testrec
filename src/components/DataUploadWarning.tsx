// src/components/DataUploadWarning.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

interface DataUploadWarningProps {
  className?: string;
}

export function DataUploadWarning({ className }: DataUploadWarningProps) {
  const { hasHrRoster } = useWorkflow();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Required Data Missing</h3>
      <p className="text-muted-foreground max-w-md">
        Please upload {hasHrRoster ? 'HR, ' : ''}Insurer and Genome data before proceeding with data reconciliation.
      </p>
    </div>
  );
}
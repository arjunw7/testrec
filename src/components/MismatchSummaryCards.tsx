import React from 'react';
import { AlertCircle } from 'lucide-react';

interface MismatchSummary {
  field: string;
  count: number;
  type: 'individual' | 'combination';
}

interface MismatchSummaryCardsProps {
  mismatches: MismatchSummary[];
}

export function MismatchSummaryCards({ mismatches }: MismatchSummaryCardsProps) {
  // Separate individual and combination mismatches
  const individualMismatches = mismatches.filter(m => m.type === 'individual');
  const combinationMismatches = mismatches.filter(m => m.type === 'combination');

  return (
    <div className="space-y-6">
      {(individualMismatches.length > 0 || combinationMismatches?.length > 0) && (
        <div className="grid grid-cols-4 gap-4">
          {individualMismatches.map((mismatch) => (
            <div 
              key={mismatch.field}
              className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3"
            >
              <div className="p-2 bg-red-100 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="font-medium text-red-900">{mismatch.field}</div>
                <div className="text-sm text-red-700 mt-1">
                  {mismatch.count} mismatches found
                </div>
              </div>
            </div>
          ))}
          {combinationMismatches.map((mismatch) => (
            <div 
              key={mismatch.field}
              className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3"
            >
              <div className="p-2 bg-amber-100 rounded-md">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div className="font-medium text-amber-900">{mismatch.field}</div>
                <div className="text-sm text-amber-700 mt-1">
                  {mismatch.count} mismatches found
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
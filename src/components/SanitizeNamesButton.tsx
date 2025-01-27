import React, { useState } from 'react';
import { Button } from './ui/button';
import { Sparkles } from 'lucide-react';
import { NameSanitizationPreview } from './NameSanitizationPreview';

interface SanitizeNamesButtonProps {
  onClick: (sanitizedData: any[]) => void;
  data: any[];
}

export function SanitizeNamesButton({ onClick, data }: SanitizeNamesButtonProps) {
  const [showPreview, setShowPreview] = useState(false);

  // Only show the button if there are records that need sanitization
  const hasInvalidNames = data.some(record => {
    const name = record.name?.toString() || '';
    return !/^[A-Za-z\s]+$/.test(name) || /^(mr\.|mrs\.|dr\.|miss\.|prof\.)/i.test(name);
  });

  if (!hasInvalidNames) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowPreview(true)}
        className="gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 sanitize-names-cta"
      >
        <Sparkles className="h-4 w-4" />
        Sanitize Names
      </Button>

      <NameSanitizationPreview
        data={data}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={onClick}
      />
    </>
  );
}
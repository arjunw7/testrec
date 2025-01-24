import React from 'react';
import { Button } from './ui/button';
import { Sparkles } from 'lucide-react';

interface SanitizeNamesButtonProps {
  onClick: () => void;
}

export function SanitizeNamesButton({ onClick }: SanitizeNamesButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
    >
      <Sparkles className="h-4 w-4" />
      Sanitize Names
    </Button>
  );
}
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sparkles, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface NameSanitizationPreviewProps {
  data: any[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sanitizedData: any[]) => void;
}

const NAME_REGEX = /^[A-Za-z\s]+$/;

export function NameSanitizationPreview({ 
  data, 
  isOpen, 
  onClose, 
  onConfirm 
}: NameSanitizationPreviewProps) {
  // Create a copy of data with sanitized names that can be edited
  const [editableData, setEditableData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [key: number]: string }>({});

  // Initialize editableData when the dialog opens or data changes
  useEffect(() => {
    if (isOpen && data) {
      setEditableData(data.map((record, index) => ({
        ...record,
        // Add a unique index to each record
        _sanitizeIndex: index,
        sanitizedName: record.name
          ?.toString()
          ?.replace(/^(mr\.|mrs\.|dr\.|miss\.|prof\.)?\s*/i, '')
          ?.replace(/[^a-zA-Z\s]/g, '')
          ?.trim()
      })));
    }
  }, [isOpen, data]);

  // Filter records that need sanitization
  const recordsToSanitize = editableData.filter(record => {
    const name = record.name?.toString() || '';
    return !NAME_REGEX.test(name) || // Use the same regex as validator
           /^(mr\.|mrs\.|dr\.|miss\.|prof\.)/i.test(name); // Also check for titles
  });

  const validateName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Name cannot be empty';
    }
    if (!NAME_REGEX.test(name)) {
      return 'Name can only contain letters and spaces';
    }
    if (/^(mr\.|mrs\.|dr\.|miss\.|prof\.)/i.test(name)) {
      return 'Name should not start with titles';
    }
    if (!/^[A-Z]/.test(name)) {
      return 'Name should start with a capital letter';
    }
    return null;
  };

  const handleNameChange = (index: number, value: string) => {
    // Prevent any characters except letters and spaces
    const sanitizedValue = value.replace(/[^a-zA-Z\s]/g, '');
    
    // Auto-capitalize first letter of each word
    const formattedValue = sanitizedValue
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    setEditableData(prev => {
      const newData = [...prev];
      // Find the record by its unique index
      const recordIndex = newData.findIndex(r => r._sanitizeIndex === index);
      if (recordIndex !== -1) {
        newData[recordIndex] = {
          ...newData[recordIndex],
          sanitizedName: formattedValue
        };
      }
      return newData;
    });

    // Validate the new value
    const error = validateName(formattedValue);
    setValidationErrors(prev => ({
      ...prev,
      [index]: error || ''
    }));
  };

  const handleConfirm = () => {
    // Check for any validation errors
    const hasErrors = Object.values(validationErrors).some(error => error);
    if (hasErrors) return;

    const updatedData = data.map((record, index) => {
      // Find the sanitized record using the unique index
      const sanitizedRecord = recordsToSanitize.find(
        r => r._sanitizeIndex === index
      );
      return sanitizedRecord ? {
        ...record,
        name: sanitizedRecord.sanitizedName
      } : record;
    });
    
    onConfirm(updatedData);
    onClose();
  };

  const hasValidationErrors = Object.values(validationErrors).some(error => error);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Name Sanitization Preview
            <Badge variant="secondary" className="ml-2">
              {recordsToSanitize.length} records to sanitize
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Review and edit the sanitized names before applying changes
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto py-4">
          <div className="space-y-4">
            {recordsToSanitize.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 bg-muted/50 rounded-lg">
                <p>No names need sanitization</p>
                <p className="text-sm mt-1">All names are properly formatted</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recordsToSanitize.map((record) => (
                  <div 
                    key={record._sanitizeIndex}
                    className="space-y-2 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1">Original</div>
                        <div className="text-muted-foreground">{record.name}</div>
                      </div>
                      <div className="w-8 flex items-center justify-center">
                        <div className="text-muted-foreground">→</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1">Sanitized</div>
                        <Input
                          value={record.sanitizedName}
                          onChange={(e) => handleNameChange(record._sanitizeIndex, e.target.value)}
                          className={cn(
                            "bg-white",
                            validationErrors[record._sanitizeIndex] && "border-red-500 focus-visible:ring-red-500"
                          )}
                        />
                      </div>
                    </div>
                    {validationErrors[record._sanitizeIndex] && (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors[record._sanitizeIndex]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="gap-2 sanitize-names-final-cta"
            disabled={recordsToSanitize.length === 0 || hasValidationErrors}
          >
            <Sparkles className="h-4 w-4" />
            Apply Changes to {recordsToSanitize.length} Records
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import * as XLSX from 'xlsx';
import { ValidationResult } from '@/lib/validation';

interface DownloadDataButtonProps {
  data: any[];
  validationResults: Map<number, ValidationResult>;
}

export function DownloadDataButton({ data, validationResults }: DownloadDataButtonProps) {
  // Count valid and invalid records
  const counts = {
    total: data.length,
    valid: 0,
    invalid: 0
  };

  validationResults.forEach(result => {
    result.isValid ? counts.valid++ : counts.invalid++;
  });

  const downloadData = (type: 'all' | 'valid' | 'invalid') => {
    let dataToDownload: any[] = [];

    switch (type) {
      case 'all':
        dataToDownload = data;
        break;
      case 'valid':
        dataToDownload = data.filter((_, index) => 
          validationResults.get(index)?.isValid
        );
        break;
      case 'invalid':
        dataToDownload = data.filter((_, index) => 
          !validationResults.get(index)?.isValid
        );
        break;
    }

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `data_${type}_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);
  };

  // If all records are valid, show simple download button
  if (counts.invalid === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => downloadData('all')}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
      </Button>
    );
  }

  // If there are invalid records, show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => downloadData('all')}>
          All Records ({counts.total})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadData('valid')}>
          Valid Records ({counts.valid})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadData('invalid')}>
          Invalid Records ({counts.invalid})
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

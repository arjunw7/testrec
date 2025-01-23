import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import {DataUploadWarning} from './DataUploadWarning';
import { AlertCircle } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface FileUploadProps {
  onFileUpload: (headers: string[], data: any[], autoMapDependentSumInsured: boolean) => void;
  disabled?: boolean;
  source?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, disabled, source }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [showSheetDialog, setShowSheetDialog] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [parsedData, setParsedData] = useState<{ headers: string[]; data: any[] } | null>(null);
  const [autoMapDependentSumInsured, setAutoMapDependentSumInsured] = useState(false);
  
  const processExcelFile = (workbook: XLSX.WorkBook, sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      setParsedData({ headers, data });
    }
  };

  const processCsvFile = (content: string) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length > 0) {
          const headers = Object.keys(results?.data?.[0]);
          const cleanData = results.data.filter(row => Object.keys(row).length > 0);
          setParsedData({ headers, data: cleanData });
        }
      }
    });
  };

  const processXmlFile = (content: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');
    
    // Get all Row elements
    const rows = xmlDoc.getElementsByTagName('Row');
    const headers: string[] = [];
    const data: any[] = [];
    
    // Process header row
    const headerCells = rows[0].getElementsByTagName('Cell');
    for (let i = 0; i < headerCells.length; i++) {
      const dataElement = headerCells[i].getElementsByTagName('Data')[0];
      if (dataElement) {
        headers.push(dataElement.textContent || '');
      }
    }
    
    // Process data rows
    for (let i = 1; i < rows.length; i++) {
      const row: any = {};
      const cells = rows[i].getElementsByTagName('Cell');
      
      for (let j = 0; j < cells.length; j++) {
        const dataElement = cells[j].getElementsByTagName('Data')[0];
        if (dataElement) {
          const value = dataElement.textContent || '';
          const type = dataElement.getAttribute('ss:Type');
          
          // Handle different data types
          if (type === 'DateTime') {
            // Convert Excel date format to JS Date
            const date = new Date(value);
            row[headers[j]] = date;
          } else if (type === 'Number') {
            row[headers[j]] = parseFloat(value);
          } else {
            row[headers[j]] = value;
          }
        }
      }
    }
    
    // Set the parsed data
    setParsedData({ headers: Object.keys(data[0]), data });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          if (file.name.endsWith('.csv')) {
            processCsvFile(content);
          } else if (file.name.endsWith('.xml')) {
            processXmlFile(content);
          } else {
            const wb = XLSX.read(content, { type: 'binary' });
            setWorkbook(wb);
            if (wb.SheetNames.length > 1) {
              setShowSheetDialog(true);
            } else {
              processExcelFile(wb, wb.SheetNames[0]);
            }
          }
        }
      };
      fileReader.readAsBinaryString(file);
    }
  };

  const handleSheetSelect = () => {
    if (workbook && selectedSheet) {
      processExcelFile(workbook, selectedSheet);
      setShowSheetDialog(false);
    }
  };

  const handleSubmit = () => {
    if (parsedData) {
      onFileUpload(parsedData.headers, parsedData.data, autoMapDependentSumInsured);
    }
  };

  return (
    <div className="space-y-6">
    {disabled ? (
        <DataUploadWarning />
      ) : (
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors",
          selectedFile && "border-primary/50 bg-primary/5"
        )}
      >
        <div className="flex flex-col items-center">
          <Upload className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg mb-2">
            {selectedFile ? selectedFile.name : "Select your file"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {selectedFile 
              ? `${parsedData?.data.length || 0} records found` 
              : "Supported formats: CSV, XLSX, XLS, XML(only Oriental Active Roster)"}
          </p>
          <Button variant="outline" asChild>
            <label className="cursor-pointer">
              {selectedFile ? "Change File" : "Browse Files"}
              <Input
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls,.xml"
                onChange={handleFileSelect}
              />
            </label>
          </Button>
        </div>
      </div>
      )}
      {selectedFile && ['hr', 'insurer', 'add', 'edit', 'offboard'].includes(source) && <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-amber-100 rounded">
            <AlertCircle className="h-4 w-4 text-amber-700" />
          </div>
          <div>
            <h4 className="font-medium text-amber-900">Sum Insured Mapping</h4>
            <p className="text-sm text-amber-700 mt-1 mb-3">
              For family floater policies, dependents should have the same sum insured as the primary member.
            </p>
            <div className="flex items-center gap-2">
              <Switch
                checked={autoMapDependentSumInsured}
                onCheckedChange={setAutoMapDependentSumInsured}
              />
              <Label className="text-amber-900">
                Automatically set dependent sum insured same as primary member
              </Label>
            </div>
          </div>
        </div>
      </div>}

      {selectedFile && (
        <div className="flex justify-end">
          <Button onClick={handleSubmit}>
            Upload and Map Columns
          </Button>
        </div>
      )}

      <Dialog open={showSheetDialog} onOpenChange={setShowSheetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Sheet</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={selectedSheet}
              onValueChange={setSelectedSheet}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a sheet" />
              </SelectTrigger>
              <SelectContent>
                {workbook?.SheetNames.map((sheet) => (
                  <SelectItem key={sheet} value={sheet}>
                    {sheet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSheetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSheetSelect} disabled={!selectedSheet}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
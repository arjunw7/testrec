import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Upload, AlertCircle, Check } from 'lucide-react';
import { cn, getInsurerStatusConfig } from '@/lib/utils';
import { DataUploadWarning } from './DataUploadWarning';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

import { useWorkflow } from '@/context/WorkflowContext';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
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
import { formatToStandardDate, ALWAYS_ACTIVE_INSURERS, standardDateToDate } from '@/lib/utils';
import { isValidDate } from '@/lib/validation';

interface FileUploadProps {
  onFileUpload: (headers: string[], data: any[], autoMapDependentSumInsured: boolean) => void;
  disabled?: boolean;
  source?: string;
}

interface StatusConfig {
  mode: 'calculate' | 'all_active';
  field: string;
  operator: 'equals' | 'not_equals' | 'empty' | 'not_empty' | 'is_in_future' | 'in' | 'not_in';
  value?: string | string[];
  selectedValues?: string[];
}

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'empty', label: 'Is Empty' },
  { value: 'not_empty', label: 'Is Not Empty' },
  { value: 'is_in_future', label: 'Is In Future' },
  { value: 'in', label: 'Is In' },
  { value: 'not_in', label: 'Is Not In' }
];

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, disabled, source }) => {
  const { policy } = useWorkflow();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [showSheetDialog, setShowSheetDialog] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [parsedData, setParsedData] = useState<{ headers: string[]; data: any[] } | null>(null);
  const [autoMapDependentSumInsured, setAutoMapDependentSumInsured] = useState(false);
  const [statusConfig, setStatusConfig] = useState<StatusConfig>({
    mode: 'all_active',
    field: '',
    operator: 'equals',
    value: '',
    selectedValues: []
  });
  const [uniqueValues, setUniqueValues] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateStatus = (record: any, config: StatusConfig): 'Yes' | 'No' => {
    if (config.mode === 'all_active') return 'Yes';
    
    const value = record[config.field];
    
    switch (config.operator) {
      case 'equals':
        return value === config.value ? 'Yes' : 'No';
      case 'not_equals':
        return value !== config.value ? 'Yes' : 'No';
      case 'empty':
        return !value ? 'Yes' : 'No';
      case 'not_empty':
        return value ? 'Yes' : 'No';
      case 'is_in_future':
        if (!value || !isValidDate(value)) return 'No';
        const standardDate = formatToStandardDate(value);
        const dateObj = standardDateToDate(standardDate);
        return dateObj && dateObj > new Date() ? 'Yes' : 'No';
      case 'in':
        return config.selectedValues?.includes(value) ? 'Yes' : 'No';
      case 'not_in':
        return !config.selectedValues?.includes(value) ? 'Yes' : 'No';
      default:
        return 'Yes';
    }
  };

  useEffect(() => {
    if (parsedData?.data && statusConfig.field) {
      const values = [...new Set(parsedData.data.map(row => row[statusConfig.field]))].filter(Boolean);
      setUniqueValues(values);
    }
  }, [statusConfig.field, parsedData]);

  useEffect(() => {
    if (source === 'insurer' && parsedData && policy?.insurerName) {
      const statusConfig = getInsurerStatusConfig(policy.insurerName, policy.policyType);
      
      if (statusConfig) {
        setStatusConfig({
          mode: 'calculate',
          field: statusConfig.field,
          operator: statusConfig.operator,
          value: statusConfig.value,
          selectedValues: Array.isArray(statusConfig.value) ? statusConfig.value : []
        });
      } else if (ALWAYS_ACTIVE_INSURERS.has(policy.insurerName)) {
        setStatusConfig({
          mode: 'all_active',
          field: '',
          operator: 'equals',
          value: '',
          selectedValues: []
        });
      }
    }
  }, [parsedData, policy, source]);

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
          const headers = Object.keys(results.data[0]);
          const cleanData = results.data.filter(row => Object.keys(row).length > 0);
          setParsedData({ headers, data: cleanData });
        }
      }
    });
  };

  const processXmlFile = (content: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');
    
    const rows = xmlDoc.getElementsByTagName('Row');
    const headers: string[] = [];
    const data: any[] = [];
    
    const headerCells = rows[0].getElementsByTagName('Cell');
    for (let i = 0; i < headerCells.length; i++) {
      const dataElement = headerCells[i].getElementsByTagName('Data')[0];
      if (dataElement) {
        headers.push(dataElement.textContent || '');
      }
    }
    
    for (let i = 1; i < rows.length; i++) {
      const row: any = {};
      const cells = rows[i].getElementsByTagName('Cell');
      
      for (let j = 0; j < cells.length; j++) {
        const dataElement = cells[j].getElementsByTagName('Data')[0];
        if (dataElement) {
          const value = dataElement.textContent || '';
          const type = dataElement.getAttribute('ss:Type');
          
          if (type === 'DateTime') {
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
      const dataWithStatus = parsedData.data.map(row => ({
        ...row,
        is_active: calculateStatus(row, statusConfig)
      }));
      
      onFileUpload(
        [...parsedData.headers, 'is_active'], 
        dataWithStatus, 
        autoMapDependentSumInsured
      );
    }
  };

  const showStatusConfig = source === 'insurer' && parsedData?.headers.length > 0;

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

      {selectedFile && ['hr', 'insurer', 'add', 'edit', 'offboard'].includes(source) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
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
        </div>
      )}

      {showStatusConfig && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 rounded">
              <AlertCircle className="h-4 w-4 text-blue-700" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">Status Configuration</h4>
              <p className="text-sm text-blue-700 mt-1 mb-3">
                Configure how to determine the active/inactive status of members.
              </p>
              
              <RadioGroup 
                value={statusConfig.mode} 
                onValueChange={(value: 'calculate' | 'all_active') => 
                  setStatusConfig(prev => ({ ...prev, mode: value }))
                }
                className="flex"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="calculate" id="calculate" />
                  <Label htmlFor="calculate" className="text-blue-900">
                    Enable status calculation
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all_active" id="all_active" />
                  <Label htmlFor="all_active" className="text-blue-900">
                    Mark all members active
                  </Label>
                </div>
              </RadioGroup>

              {statusConfig.mode === 'calculate' && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label className="text-blue-900">Select Field</Label>
                    <Select
                      value={statusConfig.field}
                      onValueChange={(field) => setStatusConfig(prev => ({ ...prev, field }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {parsedData.headers.map(header => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-blue-900">Select Operator</Label>
                    <Select
                      value={statusConfig.operator}
                      onValueChange={(operator) => 
                        setStatusConfig(prev => ({ 
                          ...prev, 
                          operator: operator as StatusConfig['operator'],
                          value: '',
                          selectedValues: [] 
                        }))
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map(op => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {['equals', 'not_equals'].includes(statusConfig.operator) ? (
                    <div>
                      <Label className="text-blue-900">Select Value</Label>
                      <Select
                        value={statusConfig.value as string}
                        onValueChange={(value) => setStatusConfig(prev => ({ 
                          ...prev, 
                          value,
                          selectedValues: [value]
                        }))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueValues.map(value => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : ['in', 'not_in'].includes(statusConfig.operator) ? (
                    <div>
                      <Label className="text-blue-900">Select Values</Label>
                      <Select
                        multiple
                        value={statusConfig.selectedValues || []} // Ensure it's always an array
                        onValueChange={(value) => {
                          // Handle single value selection
                          if (typeof value === 'string') {
                            setStatusConfig(prev => ({
                              ...prev,
                              selectedValues: statusConfig.selectedValues?.includes(value) ? statusConfig.selectedValues?.filter((item) => item !== value) : [...statusConfig.selectedValues, value]
                            }));
                          } 
                          // Handle array of values
                          else if (Array.isArray(value)) {
                            setStatusConfig(prev => ({
                              ...prev,
                              selectedValues: value
                            }));
                          }
                        }}
                      >
                        <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select values">
                          <div className="flex flex-wrap gap-1">
                            {statusConfig.selectedValues?.length === 0 && "Select values"}
                            {statusConfig.selectedValues?.map((value) => (
                              <Badge 
                                key={value}
                                variant="secondary" 
                                className="mr-1"
                              >
                                {value}
                                <button
                                  className="ml-1 hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newValues = statusConfig.selectedValues?.filter(v => v !== value);
                                    setStatusConfig(prev => ({
                                      ...prev,
                                      selectedValues: newValues
                                    }));
                                  }}
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueValues.map(value => (
                            <SelectItem 
                              key={value} 
                              value={value}
                              className="flex items-center gap-2"
                              onSelect={(e) => {
                                e.preventDefault();
                                const newValues = statusConfig.selectedValues?.includes(value)
                                  ? statusConfig.selectedValues.filter(v => v !== value)
                                  : [...(statusConfig.selectedValues || []), value];
                                setStatusConfig(prev => ({
                                  ...prev,
                                  selectedValues: newValues
                                }));
                              }}
                            >
                              <div className="flex items-center">
                                <div className="flex-1">{value}</div>
                                {statusConfig.selectedValues?.includes(value) && (
                                  <Check className="h-4 w-4" />
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex items-end">
                      <div className="h-9 px-3 border rounded-md bg-muted/50 text-muted-foreground flex items-center">
                        {statusConfig.operator === 'is_in_future' ? 'Date is in past' :
                         statusConfig.operator === 'empty' ? 'Field is empty' :
                         statusConfig.operator === 'not_empty' ? 'Field is not empty' : ''}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
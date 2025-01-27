import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';
import { ColumnMapper } from './ColumnMapper';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
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
import { formatDate, normalizeRelationship, excelDateToJSDate, createLookupKey, sanitizeEmployeeId } from '@/lib/utils';
import { useWorkflow } from '../context/WorkflowContext';
import { Field } from '@/types';

interface UploadMoreDataProps {
  onDataUploaded: (newData: any[]) => void;
  fields: Field[];
  disabled: boolean;
}

export const UploadMoreData: React.FC<UploadMoreDataProps> = ({ onDataUploaded, fields, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMapper, setShowMapper] = useState(false);
  const [showSheetDialog, setShowSheetDialog] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});
  const [mappedData, setMappedData] = useState<any[]>([]);
  const { slabMapping, dataSources } = useWorkflow();
  const [autoMapDependentSumInsured, setAutoMapDependentSumInsured] = useState(false);

  const processExcelFile = (workbook: XLSX.WorkBook, sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      setHeaders(headers);
      setRawData(data);
      setShowMapper(true);
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
          setHeaders(headers);
          setRawData(cleanData);
          setShowMapper(true);
        }
      }
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Reset the input so the same file can be selected again
      e.target.value = '';
      
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          if (file.name.endsWith('.csv')) {
            processCsvFile(content);
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

  const handleMappingChange = (newMapping: { [key: string]: string }) => {
    setMapping(newMapping);
    
    // Get genome data for user_id lookup if available
    const genomeLookup = new Map(
      dataSources?.genome?.data?.map(record => [
        createLookupKey(record),
        record.user_id
      ])
    );

    // Group records by employee ID to find primary members
    const employeeGroups = new Map<string, any>();
    const transformedData = rawData.map(row => {
      const transformedRow: any = {};
      fields.forEach(field => {
        const sourceColumn = newMapping[field.key];
        if (sourceColumn) {
          let value = row[sourceColumn];
          
          if (field.type === 'date' && value) {
            if (typeof value === 'number') {
              value = excelDateToJSDate(value);
            } else {
              value = formatDate(value);
            }
          }
          if(field.key === "employee_id") {
            transformedRow[field.key] === sanitizeEmployeeId(value);
          }

          if (field.key === "relationship") {
            transformedRow[field.key] = normalizeRelationship(value);
          }
          else if (field.key === 'gender') {
            let updatedGender = '';
            if (['MALE', 'M'].includes(value?.toUpperCase())) updatedGender = 'Male';
            if (['FEMALE', 'F'].includes(value?.toUpperCase())) updatedGender = 'Female';
            transformedRow[field.key] = updatedGender;
          }
          else if (field.key === 'sum_insured') {
            transformedRow[field.key] = value;
            transformedRow['slab_id'] = slabMapping?.find(
              (slab) => Number(slab.sum_insured) === Number(value)
            )?.slab_id;
            // Store primary member sum insured
            if (transformedRow.relationship === 'SELF') {
              employeeGroups.set(transformedRow.employee_id, value);
            }
          }
          else {
            transformedRow[field.key] = value;
          }

          // Add user_id lookup for offboard and edit
          if (field.key === 'user_id' && !value) {
            const lookupKey = createLookupKey(transformedRow);
            const userId = genomeLookup.get(lookupKey);
            if (userId) {
              transformedRow.user_id = userId;
            }
          }

          // Add remarks based on source
          if (field.key === 'remark') {
            if (fields === ADD_FIELDS) {
              transformedRow.remark = 'Extra HR Addition';
            } else if (fields === OFFBOARD_FIELDS) {
              transformedRow.remark = 'Extra HR Deletion';
            } else if (fields === EDIT_FIELDS) {
              transformedRow.remark = 'Extra HR Correction';
            }
          }
        }
      });
      return transformedRow;
    });

    // If auto-mapping is enabled, update dependent sum insured
    if (autoMapDependentSumInsured) {
      transformedData.forEach(row => {
        if (row.relationship !== 'SELF' && row.employee_id) {
          const primarySumInsured = employeeGroups.get(row.employee_id);
          if (primarySumInsured) {
            row.sum_insured = primarySumInsured;
            
            // Update slab ID if needed
            const matchingSlab = slabMapping?.find(
              (slab) => Number(slab.sum_insured) === Number(primarySumInsured)
            );
            if (matchingSlab) {
              row.slab_id = matchingSlab.slab_id;
            }
          }
        }
      });
    }

    setMappedData(transformedData);
  };

  const handleClose = () => {
    setShowMapper(false);
    resetState();
  };

  const resetState = () => {
    setHeaders([]);
    setRawData([]);
    setMapping({});
    setMappedData([]);
    setWorkbook(null);
    setSelectedSheet('');
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="gap-2"
        disabled={disabled}
      >
        <Upload className="h-4 w-4" />
        Upload More Data
      </Button>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelect}
      />

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
            <Button variant="outline" onClick={() => {
              setShowSheetDialog(false);
              resetState();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSheetSelect} disabled={!selectedSheet}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showMapper && (
        <ColumnMapper
          headers={headers}
          fields={fields}
          mapping={mapping}
          data={rawData}
          onMappingChange={handleMappingChange}
          onClose={handleClose}
          onReset={() => {
            setShowMapper(false);
            resetState();
          }}
          onConfirm={() => {
            onDataUploaded(mappedData);
            setShowMapper(false);
            resetState();
          }}
        />
      )}
    </>
  );
};

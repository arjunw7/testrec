import React, { useState, useEffect, useMemo } from 'react';
import { Field, ColumnMapping } from '../types';
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
import { Button } from './ui/button';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Progress } from './ui/progress';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';
import { formatToStandardDate, filterFieldsByPolicyType } from '@/lib/utils';
import { useWorkflow } from '../context/WorkflowContext';

interface ColumnMapperProps {
  headers: string[];
  fields: Field[];
  mapping: ColumnMapping;
  data: any[];
  onMappingChange: (mapping: ColumnMapping) => void;
  onClose: () => void;
  onReset: () => void;
  onConfirm: () => void;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  headers,
  fields,
  mapping,
  data,
  onMappingChange,
  onClose,
  onReset,
  onConfirm,
}) => {
  const [previewColumn, setPreviewColumn] = useState<string | null>(null);
  const [showMissingFields, setShowMissingFields] = useState(false);
  const { policyType } = useWorkflow();
  const filteredFields = useMemo(() => 
    filterFieldsByPolicyType(fields, policyType), 
    [fields, policyType]
  );

  useEffect(() => {
    // Auto-map fields on initial load
    const newMapping = { ...mapping };
    filteredFields.forEach(field => {
      if (!newMapping[field.key]) {
        const matchingHeader = headers.find(
          header => header.toLowerCase().replace(/[^a-z0-9]/g, '') === 
                   field.key.toLowerCase().replace(/[^a-z0-9]/g, '')
        );
        if (matchingHeader) {
          newMapping[field.key] = matchingHeader;
        }
      }
    });
    if (Object.keys(newMapping).length > Object.keys(mapping).length) {
      handleMappingChange(newMapping);
    }
  }, []);

  const transformData = (rawData: any[], mapping: ColumnMapping, fields: Field[]) => {
    return rawData.map(row => {
      const transformedRow: any = {};
      filteredFields.forEach(field => {
        const sourceColumn = mapping[field.key];
        if (sourceColumn) {
          let value = row[sourceColumn];
          // Only transform date fields
          if (field.type === 'date' && value) {
            value = formatToStandardDate(value);
          }
          transformedRow[field.key] = value;
        }
      });
      return transformedRow;
    });
  };

  const handleMappingChange = (newMapping: ColumnMapping) => {
    onMappingChange(newMapping);
  };

  const getMissingMandatoryFields = () => {
    return filteredFields.filter(field => field.isMandatory && !mapping[field.key]);
  };

  const missingFields = getMissingMandatoryFields();
  const mappedCount = Object.keys(mapping).length;
  const totalMandatoryFields = filteredFields.filter(f => f.isMandatory).length;
  const progress = (mappedCount / totalMandatoryFields) * 100;

  const handleClose = () => {
    if (missingFields.length > 0) {
      onReset();
    }
    onClose();
  };

  const handleConfirm = () => {
    if (missingFields.length > 0) {
      setShowMissingFields(true);
    } else {
      onClose();
    }
  };

  const getMappedHeaders = () => {
    return Object.values(mapping);
  };

  const getColumnPreview = (header: string) => {
    if (!data || data.length === 0) return [];
    return data.slice(0, 5).map(row => row[header]);
  };

  const isFieldMapped = (field: Field) => {
    return !!mapping[field.key];
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-full h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Map Columns</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="bg-muted/50 border rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {missingFields.length > 0 ? (
                  <AlertCircle className="h-5 w-5 text-destructive" strokeWidth={3} />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" strokeWidth={3} />
                )}
                <h3 className="font-semibold">
                  {missingFields.length > 0 
                    ? `${missingFields.length} mandatory fields remaining`
                    : "All mandatory fields mapped"}
                </h3>
              </div>
              <span className="text-sm text-muted-foreground">
                {mappedCount} of {totalMandatoryFields} fields mapped
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            {missingFields.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Missing: {missingFields.map(f => f.label).join(', ')}
              </p>
            )}
          </div>
          <div className="grid grid-cols-[1fr,300px] gap-8 overflow-y-auto flex-1 p-1">
            <div className="space-y-4">
              <h3 className="font-semibold mb-4">Fields to Map</h3>
              {filteredFields.map((field) => {
                const mappedHeaders = getMappedHeaders();
                const isMapped = isFieldMapped(field);
                const isMissing = field.isMandatory && !isMapped;
                return (
                  <div 
                    key={field.key} 
                    className="flex items-center gap-4 p-4 rounded-lg transition-colors"
                  >
                    <div className="flex-1 flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {field.label}
                        {field.isMandatory && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </p>
                      {isMapped && (
                        <CheckCircle className="h-4 w-4 text-green-500" strokeWidth={3} />
                      )}
                      {showMissingFields && isMissing && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" strokeWidth={3} />
                      )}
                    </div>
                    <div className="w-1/2">
                      <Select
                        value={mapping[field.key] || "none"}
                        onValueChange={(value) => {
                          const newMapping = { ...mapping };
                          if (value === "none") {
                            delete newMapping[field.key];
                          } else {
                            newMapping[field.key] = value;
                          }
                          handleMappingChange(newMapping);
                        }}
                        onOpenChange={(open) => {
                          if (!open) setPreviewColumn(null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <span className="text-muted-foreground">Unselect column</span>
                          </SelectItem>
                          {headers
                            .filter((item) => item)
                            .map((header) => (
                              <SelectItem 
                                key={header} 
                                value={header}
                                disabled={mappedHeaders.includes(header) && mapping[field.key] !== header}
                                onMouseEnter={() => setPreviewColumn(header)}
                                onMouseLeave={() => setPreviewColumn(null)}
                              >
                                {header}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-l pl-8">
              {previewColumn && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Preview: {previewColumn}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getColumnPreview(previewColumn).map((value, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm ? onConfirm : handleConfirm}>
            Confirm Mapping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
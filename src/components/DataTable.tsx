import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { ReactGrid, Column, Row, CellChange, TextCell, Id, MenuOption } from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css';
import { Field } from '../types';
import { formatDate, RELATIONSHIP_OPTIONS, GENDER_OPTIONS, normalizeRelationship } from '../lib/utils';
import { Search, X, Trash2, Edit2, Download } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { validateDataSet } from '../lib/validation';
import { useWorkflow } from '../context/WorkflowContext';
import { cn, filterFieldsByPolicyType } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { UploadMoreData } from './UploadMoreData';
import { Label } from './ui/label';

interface DataTableProps {
  headers: string[];
  data: any[];
  mapping: { [key: string]: string };
  fields: Field[];
  onDataChange: (newData: any[]) => void;
  disableUploadMore: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  isInSummary?: boolean;
  summaryType?: 'add' | 'edit' | 'offboard';
  onDownload?: () => void;
}

type FilterMode = 'all' | 'valid' | 'invalid';

interface BulkEditValues {
  relationship?: string;
  gender?: string;
  coverage_start_date_dd_mmm_yyyy?: string;
  sum_insured?: string;
  mobile?: string;
  email_address?: string;
  enrolment_due_date_dd_mmm_yyyy?: string;
  date_of_leaving_dd_mmm_yyyy?: string;
  activeTab?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  fields,
  onDataChange,
  activeTab,
  disableUploadMore,
  searchTerm,
  onSearchChange,
  isInSummary,
  summaryType,
  onDownload,
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
  const [bulkEditValues, setBulkEditValues] = useState<BulkEditValues>({});
  const {slabMapping, policyType } = useWorkflow();
  const [fallbackSearch, setFallbackSearch] = useState<string>('');
  
  // Validate all data, not just filtered data
  const validationResults = useMemo(() => {
    return validateDataSet(data, slabMapping, activeTab);
  }, [data, slabMapping]);

  // Count valid/invalid records from all data
  const validationCounts = useMemo(() => {
    let valid = 0;
    let invalid = 0;
    validationResults.forEach(result => {
      result.isValid ? valid++ : invalid++;
    });
    return { valid, invalid };
  }, [validationResults]);

  const filteredFields = useMemo(() => filterFieldsByPolicyType(fields, policyType), [fields, policyType]);

  // Filter data based on search term and validation status
  const filteredData = useMemo(() => {
    return data.map((row, index) => ({ ...row, originalIndex: index }))
      .filter(({ originalIndex }) => {
        const searchKeyword = searchTerm || fallbackSearch;
        const matchesSearch = !searchKeyword || filteredFields.some(field => {
          const value = data[originalIndex][field.key]?.toString().toLowerCase() || '';
          return value.includes(searchKeyword.toLowerCase());
        });

        const validationResult = validationResults.get(originalIndex);
        const matchesValidation = 
          filterMode === 'all' || 
          (filterMode === 'valid' && validationResult?.isValid) ||
          (filterMode === 'invalid' && !validationResult?.isValid);

        return matchesSearch && matchesValidation;
      });
  }, [data, filteredFields, searchTerm, fallbackSearch, filterMode, validationResults]);

  useEffect(() => {
    if (filteredData.length === 0 && filterMode !== 'all') {
      setFilterMode('all');
    }
  }, [filteredData.length, filterMode]);

  const isCellEditable = (field: string) => {
    if (!isInSummary) {
      if(field === 'slab_id' || field === 'user_id') return false;
      return true
    };
    switch (summaryType) {
      case 'add':
        return ['coverage_start_date_dd_mmm_yyyy', 'enrolment_due_date_dd_mmm_yyyy'].includes(field);
      case 'offboard':
        return ['date_of_leaving_dd_mmm_yyyy', 'policy_exception'].includes(field);
      case 'edit':
        return false;
      default:
        return true;
    }
  };

  const getBulkEditFields = () => {
    const bulkEditFields = [
      'relationship',
      'gender',
      'coverage_start_date_dd_mmm_yyyy',
      'sum_insured',
      'mobile',
      'email_address',
      'enrolment_due_date_dd_mmm_yyyy',
      'date_of_leaving_dd_mmm_yyyy',
    ];
    if (!isInSummary) return bulkEditFields;
    switch (summaryType) {
      case 'add':
        return [
          'coverage_start_date_dd_mmm_yyyy',
          'enrolment_due_date_dd_mmm_yyyy'
        ];
      case 'edit':
        return ['date_of_leaving_dd_mmm_yyyy'];
      case 'offboard':
        return ['date_of_leaving_dd_mmm_yyyy'];
      default:
        return bulkEditFields;
    }
  };

  const getColumns = useMemo((): Column[] => {
    const cols = [];
    cols.push({ columnId: 'checkbox', width: 35 });
    filteredFields.map((field) => {
      cols.push({
        columnId: field.key,
        width: 180,
      })
    });
    return cols;
  }, [filteredFields]);

  const handleSelectRow = (rowIndex: number) => {
    setSelectedRows(prev => {
      const isSelected = prev.includes(rowIndex);
      if (isSelected) {
        return prev.filter(i => i !== rowIndex);
      } else {
        return [...prev, rowIndex];
      }
    });
  };

  const handleSelectAllRows = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredData.map((_, index) => index));
    }
  };

  const handleDeleteRows = () => {
    const newData = [...data];
    const originalIndexesToDelete = selectedRows.map(index => filteredData[index].originalIndex);
    originalIndexesToDelete.sort((a, b) => b - a); // Sort in descending order to remove from end first
    
    originalIndexesToDelete.forEach(index => {
      newData.splice(index, 1);
    });
    
    onDataChange(newData);
    setSelectedRows([]);
    setShowDeleteDialog(false);
  };

  const handleBulkEdit = () => {
    const newData = [...data];
    const originalIndexesToUpdate = selectedRows.map(index => filteredData[index].originalIndex);

    if (bulkEditValues.sum_insured) {
      const matchingSlab = slabMapping?.find(
        (slab) => Number(slab.sum_insured) === Number(bulkEditValues.sum_insured)
      );
      if (matchingSlab) {
        bulkEditValues.slab_id = matchingSlab.slab_id;
      }
    }
    originalIndexesToUpdate.forEach(index => {
      newData[index] = {
        ...newData[index],
        ...bulkEditValues
      };
    });
    
    onDataChange(newData);
    setSelectedRows([]);
    setShowBulkEditDialog(false);
    setBulkEditValues({});
  };

  const handleCellChange = useCallback((changes: CellChange[]) => {
    const newData = [...data];

    changes.forEach(change => {
      const rowIndex = (change.rowId as number);
      const field = filteredFields.find(f => f.key === change.columnId);
      
      if (field && rowIndex >= 0 && rowIndex < data.length) {
        const originalIndex = filteredData[rowIndex].originalIndex;
        // Handle special fields
        if (field.key === 'sum_insured') {
          const matchingSlab = slabMapping?.find(
            (slab) => Number(slab.sum_insured) === Number(change.newCell.text)
          );
          if (matchingSlab) {
            newData[originalIndex]['slab_id'] = matchingSlab.slab_id;
          }
          newData[originalIndex]['sum_insured'] = Number(change.newCell.text)
        }
        else if (field.key === 'relationship') {
          newData[originalIndex][field.key] = normalizeRelationship(change.newCell.text);
        } else if (field.key === 'gender') {
          newData[originalIndex][field.key] = change.newCell.text.toUpperCase();
        } else if (field.type === 'date') {
          newData[originalIndex][field.key] = formatDate(change.newCell.text);
        } else {
          newData[originalIndex][field.key] = change.newCell.text;
        }
      }
    });

    onDataChange(newData);
  }, [data, filteredFields, filteredData, onDataChange]);


  const handleUploadMore = (newData: any[]) => {
    // Append new data to existing data
    const updatedData = [...data, ...newData];
    onDataChange(updatedData);
  };

  const getFieldOptions = (field: Field) => {
    if (field.key === 'relationship') return RELATIONSHIP_OPTIONS;
    if (field.key === 'gender') return GENDER_OPTIONS;
    if (field.key === 'sum_insured') {
      return slabMapping.map(slab => ({
        value: slab.sum_insured,
        label: `₹${parseInt(slab.sum_insured).toLocaleString('en-IN')}`
      }));
    }
    return field.config?.options || [];
  };

  const getRows = useCallback((): Row[] => {
    const headerRow: Row = {
      rowId: 'header',
      height: 35,
      cells: [
        {
          type: 'text' as const,
          text: '',
          nonEditable: true,
          className: cn(
            'font-semibold bg-gray-50 border-b flex items-center justify-center',
            'cursor-pointer hover:bg-gray-100'
          ),
          onClick: handleSelectAllRows,
          renderer: () => (
            <div className="flex items-center justify-center h-full">
              <input
                type="checkbox"
                checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                onChange={handleSelectAllRows}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>
          ),
        },
        ...filteredFields.map((field) => ({
          type: 'text' as const,
          text: field.label,
          nonEditable: true,
          className: 'font-semibold bg-gray-50 border-b',
        })),
      ],
    };

    const dataRows: Row[] = filteredData.map((item, idx) => ({
      rowId: idx,
      height: 35,
      cells: [
        {
          type: 'text' as const,
          text: '',
          nonEditable: true,
          className: 'border-b flex items-center justify-center',
          renderer: () => (
            <div className="flex items-center justify-center h-full">
              <input
                type="checkbox"
                checked={selectedRows.includes(idx)}
                onChange={() => handleSelectRow(idx)}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>
          ),
        },
        ...filteredFields.map((field) => {
          let value = item[field.key]?.toString() || '';

          // Format dates
          if (field.type === 'date' && value) {
            value = formatDate(value);
          }

          // For dropdown fields, show the label instead of the value
          if (field.key === 'relationship' || field.key === 'gender' || field.type === 'enum') {
            const options = getFieldOptions(field);
            const normalizedValue = field.key === 'relationship' 
              ? normalizeRelationship(value)
              : value.toUpperCase();
            const option = options.find(opt => opt.value === normalizedValue);
            value = option?.label || value;
          }

          // Get validation status for the cell
          const validationResult = validationResults.get(item.originalIndex);
          const error = validationResult?.errors.find(e => e.field === field.key);

          return {
            type: 'text' as const,
            text: value,
            className: cn(
              'border-b transition-colors tooltip-cell',
              error && 'bg-red-50 text-red-600 hover:bg-red-100',
              (field.key === 'relationship' || field.key === 'gender' || field.type === 'enum') && 'cursor-pointer',
              !isCellEditable(field.key) && 'bg-gray-50 text-gray-500',
            ),
            nonEditable: !isCellEditable(field.key),
            renderer: error ? () => (
              <div className="relative flex items-center h-full group">
                <span className="p-0 truncate max-w-[180px]">{value}</span>
                <div className="absolute left-0 top-10 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-2 whitespace-nowrap z-50">
                  {error.message}
                </div>
              </div>
            ) : () => (
              <div className="p-0 truncate max-w-[180px]">
                {value}
              </div>
            )
          };
        }),
      ],
    }));

    return [headerRow, ...dataRows];
  }, [filteredData, filteredFields, validationResults, selectedRows]);
  const searchKeyword = searchTerm || fallbackSearch;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 pr-5">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchKeyword}
            onChange={(e) => onSearchChange ? onSearchChange(e.target.value): setFallbackSearch(e.target.value)}
            className="pl-9"
          />
          {(searchKeyword) && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 mr-4"
              onClick={() => onSearchChange ? onSearchChange(''): setFallbackSearch('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkEditDialog(true)}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit {selectedRows.length} row{selectedRows.length > 1 ? 's' : ''}
              </Button>
              {!isInSummary && <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2 text-red-600 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete {selectedRows.length} row{selectedRows.length > 1 ? 's' : ''}
              </Button>}
            </>
          )}
          {['add', 'edit', 'offboard'].includes(activeTab) && (
            <UploadMoreData
              onDataUploaded={handleUploadMore}
              fields={filteredFields}
              disabled={disableUploadMore}
            />
          )}
          {
            !isInSummary && <>
              <Button
                variant="secondary"
                size="sm"
                className={cn(
                  "px-4 transition-colors",
                  filterMode === 'valid' ? "bg-[#e6ffe6] hover:bg-[#d9ffd9]" : "hover:bg-[#e6ffe6]"
                )}
                onClick={() => setFilterMode(filterMode === 'valid' ? 'all' : 'valid')}
              >
                <span className={"text-green-700"}>{validationCounts.valid} Valid</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className={cn(
                  "px-4 transition-colors",
                  filterMode === 'invalid' ? "bg-[#ffe6e6] hover:bg-[#ffd9d9]" : "hover:bg-[#ffe6e6]"
                )}
                onClick={() => setFilterMode(filterMode === 'invalid' ? 'all' : 'invalid')}
              >
                <span className={"text-red-700"}>{validationCounts.invalid} Invalid</span>
              </Button>
            </>
          }
          {isInSummary && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export XLSX
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="h-[600px] overflow-auto">
          <ReactGrid
            rows={getRows()}
            columns={getColumns}
            enableColumnSelection={false}
            enableRowSelection={false}
            enableRangeSelection={false}
            stickyTopRows={1}
            onCellsChanged={handleCellChange}
            stickyLeftColumns={1}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedRows.length} selected row{selectedRows.length > 1 ? 's' : ''}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRows}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={showBulkEditDialog} onOpenChange={setShowBulkEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {selectedRows.length} Row{selectedRows.length > 1 ? 's' : ''}</DialogTitle>
            <DialogDescription>
              Update values for the selected rows. Leave fields empty to keep their current values.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {getBulkEditFields()?.includes('relationship') && <div className="grid gap-2">
              <Label>Relationship</Label>
              <Select
                value={bulkEditValues.relationship}
                onValueChange={(value) => 
                  setBulkEditValues(prev => ({ ...prev, relationship: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>}

            {getBulkEditFields()?.includes('gender') && <div className="grid gap-2">
              <Label>Gender</Label>
              <Select
                value={bulkEditValues.gender}
                onValueChange={(value) => 
                  setBulkEditValues(prev => ({ ...prev, gender: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>}

            {getBulkEditFields()?.includes('coverage_start_date_dd_mmm_yyyy') && <div className="grid gap-2">
              <Label>Coverage Start Date (DD/MM/YY)</Label>
              <Input
                type="text"
                placeholder="DD/MM/YY"
                value={bulkEditValues.coverage_start_date_dd_mmm_yyyy || ''}
                onChange={(e) => 
                  setBulkEditValues(prev => ({ 
                    ...prev, 
                    coverage_start_date_dd_mmm_yyyy: e.target.value 
                  }))
                }
              />
            </div>}

            {getBulkEditFields()?.includes('sum_insured') && <div className="grid gap-2">
              <Label>Sum Insured</Label>
              <Select
                value={bulkEditValues.sum_insured}
                onValueChange={(value) => 
                  setBulkEditValues(prev => ({ ...prev, sum_insured: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sum insured" />
                </SelectTrigger>
                <SelectContent>
                  {slabMapping.map(slab => (
                    <SelectItem key={slab.sum_insured} value={slab.sum_insured}>
                      ₹{parseInt(slab.sum_insured).toLocaleString('en-IN')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>}

            {getBulkEditFields()?.includes('mobile') && <div className="grid gap-2">
              <Label>Mobile</Label>
              <Input
                type="tel"
                placeholder="10-digit mobile number"
                value={bulkEditValues.mobile || ''}
                onChange={(e) => 
                  setBulkEditValues(prev => ({ ...prev, mobile: e.target.value }))
                }
              />
            </div>}

            {getBulkEditFields()?.includes('email_address') && <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Email address"
                value={bulkEditValues.email_address || ''}
                onChange={(e) => 
                  setBulkEditValues(prev => ({ ...prev, email_address: e.target.value }))
                }
              />
            </div>}

            {getBulkEditFields()?.includes('enrolment_due_date_dd_mmm_yyyy') && <div className="grid gap-2">
              <Label>Enrolment Due Date (DD/MM/YY)</Label>
              <Input
                type="text"
                placeholder="DD/MM/YY"
                value={bulkEditValues.enrolment_due_date_dd_mmm_yyyy || ''}
                onChange={(e) => 
                  setBulkEditValues(prev => ({ 
                    ...prev, 
                    enrolment_due_date_dd_mmm_yyyy: e.target.value 
                  }))
                }
              />
            </div>}
            {getBulkEditFields()?.includes('date_of_leaving_dd_mmm_yyyy') && <div className="grid gap-2">
              <Label>Date of Leaving (DD/MM/YY)</Label>
              <Input
                type="text"
                placeholder="DD/MM/YY"
                value={bulkEditValues.date_of_leaving_dd_mmm_yyyy || ''}
                onChange={(e) => 
                  setBulkEditValues(prev => ({ 
                    ...prev, 
                    date_of_leaving_dd_mmm_yyyy: e.target.value 
                  }))
                }
              />
            </div>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkEdit}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
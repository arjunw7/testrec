import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Badge } from "./ui/badge";
import { DataTable } from "./DataTable";
import { ADD_FIELDS, EDIT_FIELDS, OFFBOARD_FIELDS, GENOME_FIELDS } from '../config';
import { AlertTriangle, PartyPopper, Info, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { MismatchSummaryCards } from './MismatchSummaryCards';

interface SummaryList {
  members: any[];
  message: string;
  description: string;
  action?: string;
}

interface SummaryTabProps {
  reconData: {
    perfectMatches: SummaryList;
    tobeEndorsed_add: SummaryList;
    tobeEndorsed_add_manual: SummaryList;
    tobeEndorsed_edit: SummaryList;
    tobeEndorsed_offboard: SummaryList;
    toBeEndorsed_offboard_conf: SummaryList;
    toBeEndorsed_offboard_conf_manual: SummaryList;
    toBeEndorsed_offboard_or_add: SummaryList;
  };
}

export function SummaryTab({ reconData }: SummaryTabProps) {
  const safeReconData = {
    perfectMatches: { members: [], message: '', description: '' },
    tobeEndorsed_add: { members: [], message: '', description: '' },
    tobeEndorsed_add_manual: { members: [], message: '', description: '', action: '' },
    tobeEndorsed_add_ar_update_manual: { members: [], message: '', description: '', action: '' },
    tobeEndorsed_edit: { members: [], message: '', description: '' },
    tobeEndorsed_offboard: { members: [], message: '', description: '' },
    toBeEndorsed_offboard_conf: { members: [], message: '', description: '', action: '' },
    toBeEndorsed_offboard_conf_manual: { members: [], message: '', description: '', action: '' },
    toBeEndorsed_offboard_or_add: { members: [], message: '', description: '', action: '' },
    ...reconData
  };
  // Group lists by section
  const sections = {
    matches: [
      safeReconData.perfectMatches
    ].filter(list => list.members.length > 0),
    
    additions: [
      safeReconData.tobeEndorsed_add,
      safeReconData.tobeEndorsed_add_manual,
      safeReconData.toBeEndorsed_offboard_or_add,
      safeReconData.tobeEndorsed_add_ar_update_manual,
    ].filter(list => list.members.length > 0),
    
    deletions: [
      safeReconData.tobeEndorsed_offboard,
      safeReconData.toBeEndorsed_offboard_conf,
      safeReconData.toBeEndorsed_offboard_conf_manual,
    ].filter(list => list.members.length > 0),
    
    corrections: [
      safeReconData.tobeEndorsed_edit
    ].filter(list => list.members.length > 0)
  };

  // Check if all sections are empty
  const allEmpty = Object.values(sections).every(lists => lists.length === 0);

  // Calculate table height based on number of records
  const getTableHeight = (recordCount: number) => {
    const minHeight = 100;
    const rowHeight = 36;
    const headerHeight = 36;
    const padding = 60;
    
    const calculatedHeight = headerHeight + (rowHeight * recordCount) + padding;
    return Math.max(minHeight, Math.min(calculatedHeight, 660));
  };

  const handleDownload = (data: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, 'summary-data.xlsx');
  };

  const getMismatchSummary = (editData: any[]): MismatchSummary[] => {
    // Track individual field mismatches
    const individualFieldCounts = new Map<string, number>();
    // Track field combination mismatches
    const combinationCounts = new Map<string, number>();
    
    editData.forEach(record => {
      const fields = record.mismatch_fields?.split(', ') || [];
      
      // If only one field is mismatched, count as individual
      if (fields.length === 1) {
        individualFieldCounts.set(
          fields[0], 
          (individualFieldCounts.get(fields[0]) || 0) + 1
        );
      } 
      // If multiple fields are mismatched, count as combination
      else if (fields.length > 1) {
        const combinationKey = fields.sort().join(' and ');
        combinationCounts.set(
          combinationKey,
          (combinationCounts.get(combinationKey) || 0) + 1
        );
      }
    });

    const summary: MismatchSummary[] = [];

    // Add individual field mismatches
    for (const [field, count] of individualFieldCounts.entries()) {
      summary.push({
        field: `${field}`,
        count,
        type: 'individual'
      });
    }

    // Add combination mismatches
    for (const [fields, count] of combinationCounts.entries()) {
      summary.push({
        field: fields,
        count,
        type: 'combination'
      });
    }

    return summary;
  };

  const renderSection = (title: string, lists: SummaryList[], fields: any[], sectionType:string) => {
    if (lists.length === 0) return null;
    const mismatchSummary = getMismatchSummary(reconData.tobeEndorsed_edit?.members || []);
    return (
      <div className="space-y-4 -mt-6">
        <h3 className="text-xl font-semibold">{title}</h3>
        <Accordion type="single" collapsible className="space-y-4">
          {lists.map((list, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className={cn(
                "border rounded-lg px-4 bg-white shadow-sm transition-all hover:shadow-md",
                !title && "bg-green-50/50 border-green-100"
              )}
            >
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex-1">
                  <div className="flex items-start gap-4 text-left">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{list.message}</h3>
                        <Badge 
                          variant={!title ? "secondary" : "default"}
                          className={cn(
                            "shrink-0",
                            !title && "bg-green-100 text-green-700 hover:bg-green-100/80"
                          )}
                        >
                          {list.members.length} members
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {list.description}
                      </div>
                    </div>
                    {list.action && (
                      <div className="flex items-center gap-2 px-3 py-1.5 mr-5 bg-amber-50 text-amber-700 rounded-md border border-amber-200 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span>Action Required</span>
                      </div>
                    )}
                    {!title && (
                      <div className="flex items-center gap-2 px-3 py-1.5 mr-5 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        <span>All Data Matched</span>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                {list.action && (
                  <div className="mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent" />
                    <div className="relative flex gap-3 items-start p-2 bg-gradient-to-r from-amber-50 to-transparent rounded-lg border border-amber-200/60">
                      <div className="p-1 bg-amber-100 rounded-md">
                        <Info className="h-4 w-4 text-amber-700" />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <div className="font-medium text-amber-900">Action Required</div>
                        <div className="text-sm text-amber-700 mt-1">{list.action}</div>
                      </div>
                    </div>
                  </div>
                )}
                {title === 'Corrections' && mismatchSummary.length > 0 && (
                  <MismatchSummaryCards mismatches={mismatchSummary} />
                )}
                <div 
                  className="overflow-hidden"
                  style={{ height: getTableHeight(list.members.length) }}
                >
                  <DataTable
                    headers={fields.map(f => f.label)}
                    data={list.members}
                    mapping={{}}
                    fields={fields}
                    onDataChange={() => {}}
                    activeTab="summary"
                    disableUploadMore={true}
                    isInSummary={true}
                    summaryType={sectionType}
                    onDownload={() => handleDownload(list?.members)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  };

  if (allEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <div className="relative">
          <PartyPopper className="h-16 w-16 text-primary animate-in zoom-in-50 duration-500" />
          <div className="absolute -right-2 -top-2">
            <div className="animate-bounce">
              <span className="text-2xl">✨</span>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold mt-6 mb-2">
          All data is successfully synchronized! 🎉
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          There are no pending additions, deletions, or corrections needed.
          Everything is up to date across all systems.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto pb-4">
      <div className="space-y-12">
        {renderSection("", sections.matches, GENOME_FIELDS, '')}
        {renderSection("New Additions", sections.additions, ADD_FIELDS, 'add')}
        {renderSection("Member Deletions", sections.deletions, OFFBOARD_FIELDS, 'offboard')}
        {renderSection("Corrections", sections.corrections, EDIT_FIELDS, 'edit')}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
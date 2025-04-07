import React, { useEffect } from 'react';
import { RotateCcw, RefreshCw, User, Building2, Wallet, Download, History, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Company, Policy } from '@/types';
import * as XLSX from 'xlsx';
import { formatDate, formatDateToMMM } from '@/lib/utils';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { reconService } from '@/services/reconService';

interface HeaderProps {
  company: Company | null;
  policy: Policy | null;
  onRestart: () => void;
  onReconData: () => void;
  onReset: () => void;
  hasReconData: boolean;
  reconData: any | null;
  currentRecon?: any;
}

export function Header({ company, policy, onRestart, onReconData, onReset, hasReconData, reconData, currentRecon }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSetupMode = !company && !policy;
  const isHistoryPage = location.pathname === '/history';


  const handleExport = async () => {
    if (!currentRecon || !policy || !reconData) return;
    try {
     const workbook = XLSX.utils.book_new();
      const date = new Date();
      const formattedDate = formatDateToMMM(formatDate(date));
      
      // ADD sheet
      if (reconData.tobeEndorsed_add?.members?.length > 0 || reconData?.tobeEndorsed_add_ar_update_manual?.members?.length > 0 || reconData.tobeEndorsed_add_manual?.members?.length > 0 || reconData.toBeEndorsed_offboard_or_add?.members?.length > 0) {
        const addData = [
          ...reconData.tobeEndorsed_add?.members || [],
          ...reconData.tobeEndorsed_add_manual?.members || [],
          ...reconData.tobeEndorsed_add_ar_update_manual?.members || [],
          ...reconData.toBeEndorsed_offboard_or_add?.members || []
        ].map(member => ({
          'Employee ID': member.employee_id,
          'Relationship to Account Holder': member.relationship,
          'Name': member.name,
          'Coverage Start Date (DD/MMM/YYYY)': formatDateToMMM(member.coverage_start_date_dd_mmm_yyyy),
          'Enrolment Due Date (DD/MMM/YYYY)': formatDateToMMM(member.enrolment_due_date_dd_mmm_yyyy),
          'Slab ID': member.slab_id,
          'Mobile': member.mobile,
          'Email Address': member.email_address,
          'Date of Birth (DD/MMM/YYYY)': formatDateToMMM(member.date_of_birth_dd_mmm_yyyy),
          'Gender': member.gender,
          'CTC': member.ctc,
          'Exception': '',
          'Remark': member.remark
        }));
        
        const addSheet = XLSX.utils.json_to_sheet(addData);
        XLSX.utils.book_append_sheet(workbook, addSheet, 'ADD');
      }
    
      // EDIT sheet
      if (reconData.tobeEndorsed_edit?.members?.length > 0) {
        const editData = reconData.tobeEndorsed_edit.members.map(member => ({
          'User ID': member.user_id,
          'Relationship to Account Holder': member.relationship,
          'Name': member.name,
          'Coverage Start Date (DD/MMM/YYYY)': formatDateToMMM(member.coverage_start_date_dd_mmm_yyyy),
          'Enrolment Due Date (DD/MMM/YYYY)': formatDateToMMM(member.enrolment_due_date_dd_mmm_yyyy),
          'Slab ID': member.slab_id,
          'Mobile': member.mobile,
          'Email Address': member.email_address,
          'Date of Birth (DD/MMM/YYYY)': formatDateToMMM(member.date_of_birth_dd_mmm_yyyy),
          'Gender': member.gender,
          'CTC': member.ctc,
          'Exception': '',
          'Mismatch Fields': member.mismatch_fields,
          'HR Values': member.hr_values,
          'Insurer Values': member.insurer_values,
          'Genome Values': member.genome_values,
        }));
        
        const editSheet = XLSX.utils.json_to_sheet(editData);
        XLSX.utils.book_append_sheet(workbook, editSheet, 'EDIT');
      }
    
      // OFFBOARD sheet
      if (reconData.tobeEndorsed_offboard?.members?.length > 0 || 
          reconData.toBeEndorsed_offboard_conf?.members?.length > 0 ||
          reconData.toBeEndorsed_offboard_conf_manual?.members?.length > 0) {
        const offboardData = [
          ...reconData.tobeEndorsed_offboard?.members || [],
          ...reconData.toBeEndorsed_offboard_conf?.members || [],
          ...reconData.toBeEndorsed_offboard_conf_manual?.members || [],
          ...reconData.toBeEndorsed_offboard_or_add?.members || []
        ].map(member => ({
          'User ID': member.user_id,
          'Employee ID': member.employee_id,
          'Name': member.name,
          'Gender': member.gender,
          'Relationship to Account Holder': member.relationship,
          'Date of Leaving (DD/MMM/YYYY)': formatDateToMMM(member.date_of_leaving_dd_mmm_yyyy),
          'Policy Exception': member.policy_exception || '',
          'Remark': member.remark
        }));
        
        const offboardSheet = XLSX.utils.json_to_sheet(offboardData);
        XLSX.utils.book_append_sheet(workbook, offboardSheet, 'OFFBOARD');
      }
    
      // Save the file
      const fileName = `recon_${policy.nickName.replace(/\s+/g, '_')}_${formattedDate}_insync.xlsx`;
      XLSX.writeFile(workbook, fileName);
      await reconService.markExported(currentRecon.id);
    } catch (error) {
      console.error('Failed to mark recon as exported:', error);
    }
  };

  return (
    <div className="border-b shadow-sm">
      {/* Main Header */}
      <header className="bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h1 className="text-[#025F4C] text-3xl font-bold">inSync</h1>
            <span className="text-[#025F4C]/80 text-sm">by Loop</span>
          </div>
          
          <div className="flex items-center gap-3">
            {!isSetupMode && reconData && (
              <Button 
                variant="outline"
                onClick={handleExport}
                className="gap-2 border-[#025F4C]/20 text-[#025F4C] hover:bg-[#025F4C]/5 export-data-cta"
              >
                <Download className="w-4 h-4" />
                Export Data
              </Button>
            )}
            {isHistoryPage ? (
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="gap-2 border-[#025F4C]/20 text-[#025F4C] hover:bg-[#025F4C]/5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/history')}
                className="gap-2 border-[#025F4C]/20 text-[#025F4C] hover:bg-[#025F4C]/5"
              >
                <History className="w-4 h-4" />
                History
              </Button>
            )}
            {!isSetupMode && (
              <div>
                {hasReconData ? (
                  <Button 
                    onClick={onReset}
                    className="gap-2 bg-[#025F4C] text-white hover:bg-[#025F4C]/90"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Data
                  </Button>
                ) : (
                  <Button 
                    onClick={onReconData}
                    className="gap-2 bg-[#BCDD33] text-[#025F4C] hover:bg-[#BCDD33]/90 recon-cta"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Recon Data
                  </Button>
                )}
              </div>
            )}
            {!isSetupMode && (
              <Button 
                variant="outline"
                onClick={onRestart}
                className="gap-2 border-[#025F4C]/20 text-[#025F4C] hover:bg-[#025F4C]/5"
              >
                <RotateCcw className="w-4 h-4" />
                Restart
              </Button>
            )}
            <div className="ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-9 w-9 p-0 rounded-full"
                  >
                    <div className="h-9 w-9 bg-[#025F4C]/10 text-[#025F4C] rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="py-2">
                    <div className="flex flex-col">
                      <span className="font-medium text-[#025F4C]">{user?.displayName}</span>
                      <span className="text-xs text-[#025F4C]/70">{user?.email}</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => signOut()}
                    className="text-red-600 hover:text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Policy Details Bar */}
      {!isSetupMode && (
        <div className="bg-[#025F4C]/5 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Company Info */}
              <div className="flex items-center gap-2 text-[#025F4C]">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">{company?.name}</span>
              </div>

              <div className="h-4 w-px bg-[#025F4C]/20" />

              {/* Policy Info */}
              <div className="flex items-center gap-2">
                {policy?.insurerLogo ? (
                  <img 
                    src={policy.insurerLogo} 
                    alt="Insurer logo" 
                    className="h-5 w-5 object-contain"
                  />
                ) : null}
                <span className="font-medium text-[#025F4C]">{policy?.nickName}</span>
              </div>

              <div className="h-4 w-px bg-[#025F4C]/20" />

              {/* Policy Type */}
              <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-[#025F4C]/10 text-[#025F4C]">
                <span>{policy?.policyType}</span>
              </div>

              {/* Slabs */}
              {policy?.sumAssuredSlabs && policy.sumAssuredSlabs.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-[#025F4C]/10 text-[#025F4C] hover:bg-[#025F4C]/20">
                      <Wallet className="w-3.5 h-3.5" />
                      <span>{policy.sumAssuredSlabs.length} Slabs</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="font-medium text-[#025F4C]">Sum Insured Slabs</h4>
                        <span className="text-sm text-[#025F4C]/70">
                          {policy.sumAssuredSlabs.length} slabs
                        </span>
                      </div>
                      <div className="space-y-2">
                        {policy.sumAssuredSlabs.map((slab) => (
                          <div 
                            key={slab.slabId}
                            className="flex items-start justify-between gap-4 text-sm"
                          >
                            <div>
                              <div className="font-medium text-[#025F4C]">
                                ₹{slab.sumInsured.toLocaleString('en-IN')}
                              </div>
                              <div className="text-xs text-[#025F4C]/70">
                                {slab.familyDefinition}
                              </div>
                            </div>
                            <div className="text-xs text-[#025F4C]/70">
                              Slab {slab.slabId}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
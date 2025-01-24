import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Building2, FileText, Upload, CheckCircle2, RefreshCw, Users, FileSpreadsheet, FileCheck, ArrowLeftRight, AlertCircle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
        title: (
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full text-[#025F4C] bg-[#bcdd33] font-bold">
                1
              </div>
              <span>Start by selecting your company and policy</span>
            </div>
          ),
      description: (
        <div className="space-y-4">
          <p className="text-[#025F4C]/80 leading-relaxed">
            InSync supports all policy types and insurers and automatically imports:
          </p>
          <ul className="space-y-3 text-[#025F4C]/70">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#025F4C]" />
              <span>Active member roster from Genome</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#025F4C]" />
              <span>Policy slab information</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#025F4C]" />
              <span>Policy level configurations</span>
            </li>
          </ul>
          <div className="mt-6 p-4 bg-[#025F4C]/5 rounded-lg">
            <div className="flex items-center gap-2 text-[#025F4C]">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Pro Tip</span>
            </div>
            <p className="mt-2 text-sm text-[#025F4C]/70">
              Use the search feature in dropdowns to quickly find your company and policy.
            </p>
          </div>
        </div>
      ),
      visual: (
        <div className="space-y-6">
          <div className="relative h-[280px] bg-gradient-to-br from-[#025F4C]/5 via-[#BCDD33]/5 to-transparent rounded-lg p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#025F4C]/10 to-transparent" />
            <div className="relative space-y-6">
              {/* Company Selection Animation */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#025F4C]/70">
                  <Building2 className="w-4 h-4" />
                  <span>Select Company</span>
                </div>
                <div className="h-10 bg-white rounded border border-[#025F4C]/20 flex items-center px-3 gap-2">
                  <div className="flex-1">
                    <div className="h-2 w-2/3 bg-[#025F4C]/10 rounded animate-pulse" />
                  </div>
                  <RefreshCw className="w-4 h-4 text-[#025F4C] animate-spin" />
                </div>
              </div>

              {/* Policy Selection Animation */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#025F4C]/70">
                  <FileText className="w-4 h-4" />
                  <span>Select Policy</span>
                </div>
                <div className="h-10 bg-white rounded border border-[#025F4C]/20 flex items-center px-3 gap-2">
                  <div className="flex-1">
                    <div className="h-2 w-1/2 bg-[#025F4C]/10 rounded animate-pulse" />
                  </div>
                  <RefreshCw className="w-4 h-4 text-[#025F4C] animate-spin" />
                </div>
              </div>

              {/* Auto-fetch Animation */}
              <div className="mt-8 space-y-3">
                <div className="h-8 bg-white/50 rounded flex items-center px-3">
                  <div className="h-2 w-full bg-[#025F4C]/10 rounded overflow-hidden">
                    <div className="h-full w-2/3 bg-[#025F4C]/30 rounded animate-progress" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-[#025F4C]/60">
                  <span>Fetching roster...</span>
                  <span>67%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: (
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full text-[#025F4C] bg-[#bcdd33] font-bold">
            2
          </div>
          <span>Choose your endorsement type</span>
        </div>
      ),
      description: (
        <div className="space-y-4">
          <p className="text-[#025F4C]/80 leading-relaxed">
            InSync can perform complex recon across multiple datasets for first endorsement as well as the simpler recons for regular endorements 
          </p>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <ul className="space-y-3 text-sm text-[#025F4C]/70">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#025F4C] flex-shrink-0" />
                  <div>
                    <span className="font-medium text-[#025F4C]">First Endorsement</span>
                    <p className="mt-1">Complete data matching across employer, insurer, and Genome roster for First-time policy setup or renewals</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#025F4C] flex-shrink-0" />
                  <div>
                    <span className="font-medium text-[#025F4C]">Regular Endorsement</span>
                    <p className="mt-1">Routine updates and quick verification after every endorsement</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
      visual: (
        <div className="relative mt-12 h-[180px] bg-gradient-to-br from-[#025F4C]/5 via-[#BCDD33]/5 to-transparent rounded-lg p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#025F4C]/10 to-transparent" />
          <div className="relative h-full flex items-center">
            <div className="w-full space-y-8">
              {/* Full Reconciliation Flow */}
              <div className="relative">
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-24 bg-[#025F4C]/20 rounded-full">
                  <div className="w-full h-1/3 bg-[#025F4C] rounded-full animate-pulse" />
                </div>
                <div className="pl-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#025F4C]/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-[#025F4C]" />
                    </div>
                    <span className="text-sm text-[#025F4C]">HR Data</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#025F4C]/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#025F4C]" />
                    </div>
                    <span className="text-sm text-[#025F4C]">Insurer Data</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#025F4C]/10 flex items-center justify-center">
                      <FileCheck className="w-4 h-4 text-[#025F4C]" />
                    </div>
                    <span className="text-sm text-[#025F4C]">Genome Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: (
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full text-[#025F4C] bg-[#bcdd33] font-bold">
            3
          </div>
          <span>Import employer's active roster along with supplementary data shared by HR</span>
        </div>
      ),
      description: (
        <div className="space-y-4">
          <p className="text-[#025F4C]/80 leading-relaxed">
            Hassle free data import of employer roster or inception data from placement slip
          </p>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <ul className="space-y-3 text-sm text-[#025F4C]/70">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#025F4C]/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4 text-[#025F4C]" />
                  </div>
                  <div>
                    <span className="font-medium text-[#025F4C]">HR Roster</span>
                    <p className="text-xs mt-0.5">Complete employee database</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#025F4C]/10 flex items-center justify-center">
                    <FileCheck className="w-4 h-4 text-[#025F4C]" />
                  </div>
                  <div>
                    <span className="font-medium text-[#025F4C]">Placement Slip</span>
                    <p className="text-xs mt-0.5">Insurer's active member list</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-[#025F4C]/5 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#025F4C]" />
                <span className="text-sm font-medium text-[#025F4C]">Along with supplementary lives shared by employer</span>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-[#025F4C]/10 rounded text-[#025F4C]">Additions</span>
                <span className="px-2 py-1 bg-[#025F4C]/10 rounded text-[#025F4C]">Deletions</span>
                <span className="px-2 py-1 bg-[#025F4C]/10 rounded text-[#025F4C]">Corrections</span>
              </div>
            </div>
          </div>
        </div>
      ),
      visual: (
        <div className="relative h-[250px] bg-gradient-to-br mt-5 from-[#025F4C]/5 via-[#BCDD33]/5 to-transparent rounded-lg p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#025F4C]/10 to-transparent" />
          <div className="relative space-y-8">
            {/* Animated Roster View */}
            <div className="space-y-3">
              <div className="h-8 bg-white/50 rounded-t-lg border-b border-[#025F4C]/10 flex items-center px-3 gap-3">
                <div className="h-2 w-20 bg-[#025F4C]/20 rounded" />
                <div className="h-2 w-32 bg-[#025F4C]/20 rounded" />
                <div className="h-2 w-24 bg-[#025F4C]/20 rounded" />
              </div>
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div 
                    key={i}
                    className="h-10 bg-white/30 rounded flex items-center px-3 gap-3"
                  >
                    <div className="h-2 w-20 bg-[#025F4C]/10 rounded animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                    <div className="h-2 w-32 bg-[#025F4C]/10 rounded animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                    <div className="h-2 w-24 bg-[#025F4C]/10 rounded animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <div className="flex-1 h-9 bg-white/50 rounded border border-[#025F4C]/20 flex items-center justify-center gap-2">
                <Upload className="w-4 h-4 text-[#025F4C]" />
                <span className="text-sm text-[#025F4C]">Upload Data</span>
              </div>
              <div className="flex-1 h-9 bg-[#025F4C] rounded flex items-center justify-center gap-2 text-white">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Sync</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: (
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full text-[#025F4C] bg-[#bcdd33] font-bold">
            4
          </div>
          <span>Map desired columns and make corrections with excel-like experience</span>
        </div>
      ),
      description: (
        <div className="space-y-4">
          <p className="text-[#025F4C]/80 leading-relaxed">
            Ingest raw files in any data format or file format. inSync understands it all. 
          </p>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#025F4C]/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-[#025F4C]" />
                    <span className="text-sm text-[#025F4C]">.xlsx</span>
                  </div>
                </div>
                <div className="p-3 bg-[#025F4C]/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#025F4C]" />
                    <span className="text-sm text-[#025F4C]">.csv</span>
                  </div>
                </div>
                <div className="p-3 bg-[#025F4C]/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#025F4C]" />
                    <span className="text-sm text-[#025F4C]">.xml</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <ul className="space-y-3 text-sm text-[#025F4C]/70">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#025F4C]" />
                  <span className='font-medium'>Intelligent column mapping</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#025F4C]" />
                  <span className='font-medium'>Auto-validation of records & In-tool error correction</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-[#025F4C]/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-[#025F4C]" />
                <span className="text-sm font-medium text-[#025F4C]">Pro Tip</span>
              </div>
              <p className="text-xs text-[#025F4C]/70">
                Use "automatically set dependent SI" setting to map sum insured of dependents directly from primary members 
              </p>
            </div>
          </div>
        </div>
      ),
      visual: (
        <div className="relative h-[280px] bg-gradient-to-br from-[#025F4C]/5 via-[#BCDD33]/5 to-transparent rounded-lg p-6 mt-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#025F4C]/10 to-transparent" />
          <div className="relative space-y-6">
            {/* File Upload Animation */}
            <div className="h-32 border-2 border-dashed border-[#025F4C]/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Upload className="w-8 h-8 text-[#025F4C]/40 mx-auto mb-2" />
                <span className="text-sm text-[#025F4C]/60">Drop files here</span>
              </div>
            </div>

            {/* Column Mapping Animation */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-1/3 h-8 bg-white/50 rounded border border-[#025F4C]/20 flex items-center px-3">
                  <div className="h-2 w-full bg-[#025F4C]/10 rounded animate-pulse" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#025F4C]" />
                <div className="w-1/3 h-8 bg-[#025F4C]/10 rounded flex items-center px-3">
                  <div className="h-2 w-full bg-[#025F4C]/20 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1/3 h-8 bg-white/50 rounded border border-[#025F4C]/20 flex items-center px-3">
                  <div className="h-2 w-full bg-[#025F4C]/10 rounded animate-pulse" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#025F4C]" />
                <div className="w-1/3 h-8 bg-[#025F4C]/10 rounded flex items-center px-3">
                  <div className="h-2 w-full bg-[#025F4C]/20 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: (
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full text-[#025F4C] bg-[#bcdd33] font-bold">
            4
          </div>
          <span>Instantly generate comprehensive reconciliation report</span>
        </div>
      ),
      description: (
        <div className="space-y-4">
          <p className="text-[#025F4C]/80 leading-relaxed">
            inSync performs over 100+ validations across all data sets to ensure data accuracy
          </p>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <ul className="space-y-3 text-sm text-[#025F4C]/70">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#025F4C] flex-shrink-0" />
                  <div>
                    <span className="font-medium text-[#025F4C]">Cross-Reference Validation</span>
                    <p className="mt-1">Ensures data consistency across all systems</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#025F4C] flex-shrink-0" />
                  <div>
                    <span className="font-medium text-[#025F4C]">Instant Mismatch Detection</span>
                    <p className="mt-1">Quickly identifies and highlights discrepancies</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#025F4C] flex-shrink-0" />
                  <div>
                    <span className="font-medium text-[#025F4C]">Action-Ready Results</span>
                    <p className="mt-1">Clear next steps for each data point</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-[#025F4C]/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-[#025F4C]" />
                <span className="text-sm font-medium text-[#025F4C]">Pro Tip</span>
              </div>
              <p className="text-xs text-[#025F4C]/70">
                Results can be directly downloaded in Genome-ready format for immediate use.
              </p>
            </div>
          </div>
        </div>
      ),
      visual: (
        <div className="relative h-[280px] bg-gradient-to-br from-[#025F4C]/5 via-[#BCDD33]/5 to-transparent rounded-lg p-6 overflow-hidden mt-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#025F4C]/10 to-transparent" />
          <div className="relative space-y-6">
            {/* Validation Progress */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#025F4C]/70">Validating Records</span>
                  <span className="text-[#025F4C]">78%</span>
                </div>
                <div className="h-2 bg-[#025F4C]/10 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-[#025F4C] rounded-full animate-progress" />
                </div>
              </div>
              
              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">Valid</span>
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-green-700">
                    247
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-700">Review</span>
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-amber-700">
                    23
                  </div>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#025F4C]/70">Export Options</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-9 bg-white/50 rounded border border-[#025F4C]/20 flex items-center justify-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#025F4C]" />
                  <span className="text-sm text-[#025F4C]">Excel</span>
                </div>
                <div className="h-9 bg-[#025F4C] rounded flex items-center justify-center gap-2 text-white">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Genome Format</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    setCurrentSlide(0);
  }, [open])

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#025F4C]">
            {slides[currentSlide].title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 grid grid-cols-2 gap-8">
            {slides[currentSlide].visual}
          <div className="pl-8 border-l border-[#025F4C]/10">
            {slides[currentSlide].description}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-1">
            {slides.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  currentSlide === index 
                    ? "bg-[#025F4C]" 
                    : "bg-[#025F4C]/20"
                )}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentSlide === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            {currentSlide < slides.length - 1 ? (
              <Button
                size="sm"
                onClick={handleNext}
                className="gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onClose}
                className="gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
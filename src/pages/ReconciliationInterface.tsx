import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from '../components/FileUpload';
import { ColumnMapper } from '../components/ColumnMapper';
import { DataTable } from '../components/DataTable';
import { Header } from '../components/Header';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { HR_FIELDS, INSURER_FIELDS, GENOME_FIELDS, ADD_FIELDS, EDIT_FIELDS, OFFBOARD_FIELDS } from '../config';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { reconcileData } from '../lib/reconciliation';
import { CompanySelection } from '../components/setup/CompanySelection';
import { PolicySelection } from '../components/setup/PolicySelection';
import { EndorsementType } from '../components/setup/EndorsementType';
import { HrRosterAvailability } from '../components/setup/HrRosterAvailability';
import { HrDataAvailability } from '../components/setup/HrDataAvailability';
import { WarningDialog } from '../components/WarningDialog';
import { SummaryTab } from '../components/SummaryTab';
import { WorkflowProvider, useWorkflow } from '../context/WorkflowContext';
import { normalizeRelationship, formatToStandardDate, formatDate, excelDateToJSDate } from '../lib/utils';
import { validateDataSet } from '../lib/validation';
import { cn } from '@/lib/utils';
import { isRequiredDataAvailable, createLookupKey, cleanValue, hasNameErrors, sanitizeEmployeeId } from '@/lib/utils';
import { SanitizeNamesButton } from '../components/SanitizeNamesButton';
import { apiClient } from '../services/apiClient';
import { LoadingDialog } from '@/components/LoadingDialog';
import { reconService } from '@/services/reconService';

// In App.tsx, add this component:
const ValidationErrorDialog = ({
  invalidCounts,
  isOpen,
  onClose
}: {
  invalidCounts: { hr: number; insurer: number; genome: number; };
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invalid Records Found</DialogTitle>
          <DialogDescription>
            Please fix the following invalid records before proceeding with reconciliation:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {invalidCounts.hr > 0 && (
            <div className="flex items-center justify-between">
              <span>HR Active Roster:</span>
              <Badge variant="destructive">{invalidCounts.hr} invalid records</Badge>
            </div>
          )}
          {invalidCounts.insurer > 0 && (
            <div className="flex items-center justify-between">
              <span>Insurer Active Roster:</span>
              <Badge variant="destructive">{invalidCounts.insurer} invalid records</Badge>
            </div>
          )}
          {invalidCounts.genome > 0 && (
            <div className="flex items-center justify-between">
              <span>Genome Active Roster:</span>
              <Badge variant="destructive">{invalidCounts.genome} invalid records</Badge>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-[#025F4C]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white" />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-medium text-[#025F4C]">Loading Active Roster</h3>
          <p className="text-sm text-[#025F4C]/70">Please wait while we fetch the data...</p>
        </div>
      </div>
    </div>
  );
}


function ReconciliationInterfaceContent() {
  const {
    step,
    setStep,
    company,
    policy,
    hasHrRoster,
    isFirstEndorsement,
    hasAdditionalData,
    slabMapping,
    setCompany,
    setPolicy,
    setIsFirstEndorsement,
    setHasHrRoster,
    setHasAdditionalData,
    setSlabMapping,
    setGenomeRoster,
    policyType,
  } = useWorkflow();

  const [showMapper, setShowMapper] = useState<string | null>(null);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [currentRecon, setCurrentRecon] = useState<{ id: string } | null>(null);


  const [dataSources, setDataSources] = useState<{
    [key: string]: {
      headers: string[];
      rawData: any[];
      data: any[];
      mapping: { [key: string]: string };
      fields: typeof HR_FIELDS;
    } | null;
  }>({
    hr: null,
    insurer: null,
    genome: null,
    add: null,
    edit: null,
    offboard: null
  });

  const [activeTab, setActiveTab] = useState('insurer');
  const [reconData, setReconData] = useState(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [invalidCounts, setInvalidCounts] = useState({ hr: 0, insurer: 0, genome: 0 });
  const [showInsurerWarning, setShowInsurerWarning] = useState(false);
  const [autoMapDependentSumInsured, setAutoMapDependentSumInsured] = useState(false);
  const [searchTerms, setSearchTerms] = useState({
    hr: '',
    insurer: '',
    genome: '',
    add: '',
    edit: '',
    offboard: ''
  });
  const [showNamePreview, setShowNamePreview] = useState(false);
  const [nameChanges, setNameChanges] = useState<{ originalName: string; sanitizedName: string; }[]>([]);

  
  // Get available tabs based on workflow state
  const getAvailableTabs = useCallback(() => {
    const baseTabs = ['insurer', 'genome'];
    const additionalTabs = ['add', 'edit', 'offboard'];

    if (isFirstEndorsement && hasHrRoster) {
      if (hasAdditionalData) {
        return ['hr', ...baseTabs, ...additionalTabs];
      } else {
        return ['hr', ...baseTabs];
      }
    }

    if (isFirstEndorsement && !hasHrRoster && hasAdditionalData) {
      return [...baseTabs, ...additionalTabs];
    }

    return baseTabs;
  }, [isFirstEndorsement, hasHrRoster, hasAdditionalData]);


  // check if thereare any invalid records in the data uploaded by the user
  const checkInvalidRecords = () => {
    const invalidCounts = {
      hr: 0,
      insurer: 0,
      genome: 0
    };

    ['hr', 'insurer', 'genome'].forEach(source => {
      const sourceData = dataSources[source];
      if (sourceData) {
        const validationResults = validateDataSet(sourceData.data, slabMapping, source);
        validationResults.forEach(result => {
          if (!result.isValid) invalidCounts[source]++;
        });
      }
    });

    return invalidCounts;
  };

  // Load genome roster when policy is selected
  useEffect(() => {
    const loadGenomeRoster = async () => {
      if (!policy?.id) return;
      setLoadingRoster(true);
      try {
        const data = await apiClient.getGenomeRoster(company?.id, policy?.id);
        const roster = data?.data?.users;
        if (!roster) {
          console.warn('No genome roster data available');
          return;
        }

        const insurer  = policy?.insurerName;

        const transformedData = roster
          .filter((member) => member?.policyId === policy?.id)
          .map((member) => ({
            is_active: new Date(member.policyEndDate) > new Date() ? "Yes" : "No",
            user_id: member.userId,
            employee_id: sanitizeEmployeeId(member.employeeId, insurer),
            name: `${member?.firstName?.toProperCase()} ${member.lastName?.toProperCase()}`?.toString()?.replace(/\s+/g, ' '),
            relationship: normalizeRelationship(member.relationship),
            gender: member.gender,
            date_of_birth_dd_mmm_yyyy: formatDate(new Date(member.dob)?.getTime()),
            coverage_start_date_dd_mmm_yyyy: formatDate(new Date(member.policyStartDate)?.getTime()),
            sum_insured: member.sumInsured,
            slab_id: slabMapping?.find((i) => Number(i?.sum_insured) === Number(member.sumInsured))?.slab_id,
            mobile: member.mobile,
            email_address: member.email,
            ctc: member.ctc,
            enrolment_due_date_dd_mmm_yyyy: formatToStandardDate(member.enrolmentDueDate)
          }));

        setDataSources(prev => ({
          ...prev,
          genome: {
            headers: GENOME_FIELDS.map(f => f.key),
            rawData: transformedData,
            data: transformedData,
            mapping: GENOME_FIELDS.reduce((acc, field) => ({ ...acc, [field.key]: field.key }), {}),
            fields: GENOME_FIELDS
          }
        }));
      } catch (error) {
        console.error('Error loading genome roster:', error);
      } finally {
        setLoadingRoster(false);
      }
    };

    loadGenomeRoster();
  }, [policy]);

  useEffect(() => {
    if (company && policy && step === 6) {
      startNewRecon();
    }
  }, [company, policy, step]);
  
  // Set initial active tab based on available tabs
  useEffect(() => {
    const availableTabs = [...getAvailableTabs(), 'summary'].filter(Boolean);
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
  }, [getAvailableTabs, activeTab]);

  const handleRestart = () => {
    setCompany(null);
    setPolicy(null);
    setIsFirstEndorsement(null);
    setHasHrRoster(null);
    setHasAdditionalData(null);
    setSlabMapping([]);
    setGenomeRoster([]);
    setStep(1);
    setReconData(null);
    setDataSources({
      hr: null,
      insurer: null,
      genome: null,
      add: null,
      edit: null,
      offboard: null
    });
    setActiveTab('insurer');
    setShowMapper(null);
  };

  const handleReset = () => {
    setDataSources(prev => ({
      ...prev,
      add: null,
      edit: null,
      offboard: null
    }));
    setReconData(null);
  };

  const startNewRecon = async () => {
    if (!company || !policy) return;
    
    try {
      const recon = await reconService.startRecon({
        companyId: company.id,
        companyName: company.name,
        policyId: policy.id,
        policyName: policy.nickName,
        insurerName: policy.insurerName
      });
      setCurrentRecon(recon);
    } catch (error) {
      console.error('Failed to start recon:', error);
    }
  };

  const handleReconData = async () => {
    if (!currentRecon || isReconciling) return;
    
    if (!dataSources.insurer?.data || !dataSources.genome?.data) {
      setShowInsurerWarning(true);
      return;
    }
  
    const counts = checkInvalidRecords();
    const hasInvalidRecords = Object.values(counts).some(count => count > 0);
  
    if (hasInvalidRecords) {
      setInvalidCounts(counts);
      setShowValidationDialog(true);
      return;
    }
  
    setIsReconciling(true);
  
    try {
      setTimeout(async () => {
        const result = reconcileData(
          dataSources.hr?.data || [],
          dataSources.insurer.data,
          dataSources.genome.data,
          slabMapping,
          {
            add: dataSources.add?.data || [],
            edit: dataSources.edit?.data || [],
            offboard: dataSources.offboard?.data || []
          },
          policyType,
        );
  
        // Save recon results to Supabase
        await reconService.completeRecon(currentRecon.id, {
          perfectMatches: result.perfectMatches,
          tobeEndorsed_add: result.tobeEndorsed_add,
          tobeEndorsed_add_manual: result.tobeEndorsed_add_manual,
          tobeEndorsed_add_ar_update_manual: result.tobeEndorsed_add_ar_update_manual,
          tobeEndorsed_edit: result.tobeEndorsed_edit,
          tobeEndorsed_offboard: result.tobeEndorsed_offboard,
          toBeEndorsed_offboard_conf: result.toBeEndorsed_offboard_conf,
          toBeEndorsed_offboard_conf_manual: result.toBeEndorsed_offboard_conf_manual,
          toBeEndorsed_offboard_or_add: result.toBeEndorsed_offboard_or_add,
        });
  
        // Update local state
        setReconData({
          perfectMatches: result.perfectMatches,
          tobeEndorsed_add: result.tobeEndorsed_add,
          tobeEndorsed_add_manual: result.tobeEndorsed_add_manual,
          tobeEndorsed_add_ar_update_manual: result.tobeEndorsed_add_ar_update_manual,
          tobeEndorsed_edit: result.tobeEndorsed_edit,
          tobeEndorsed_offboard: result.tobeEndorsed_offboard,
          toBeEndorsed_offboard_conf: result.toBeEndorsed_offboard_conf,
          toBeEndorsed_offboard_conf_manual: result.toBeEndorsed_offboard_conf_manual,
          toBeEndorsed_offboard_or_add: result.toBeEndorsed_offboard_or_add,
        });
  
        // Update data sources
        setDataSources(prev => ({
          ...prev,
          add: {
            headers: ADD_FIELDS.map(f => f.key),
            rawData: result.addData,
            data: result.addData,
            mapping: ADD_FIELDS.reduce((acc, field) => ({ ...acc, [field.key]: field.key }), {}),
            fields: ADD_FIELDS
          },
          edit: {
            headers: EDIT_FIELDS.map(f => f.key),
            rawData: [...result.editData, ...result.dataMismatch],
            data: [...result.editData, ...result.dataMismatch],
            mapping: EDIT_FIELDS.reduce((acc, field) => ({ ...acc, [field.key]: field.key }), {}),
            fields: EDIT_FIELDS
          },
          offboard: {
            headers: OFFBOARD_FIELDS.map(f => f.key),
            rawData: [...result.offboardSheet, ...result.offboardSheet2],
            data: [...result.offboardSheet, ...result.offboardSheet2],
            mapping: OFFBOARD_FIELDS.reduce((acc, field) => ({ ...acc, [field.key]: field.key }), {}),
            fields: OFFBOARD_FIELDS
          }
        }));
  
        setActiveTab('summary');
        setIsReconciling(false);
      }, 5000);
    } catch (error) {
      console.error('Reconciliation failed:', error);
      setIsReconciling(false);
    }
  };

  const handleSearch = (tab: string, value: string) => {
    setSearchTerms(prev => ({
      ...prev,
      [tab]: value
    }));
  };

  const handleFileUpload = (source: string) => async (headers: string[], rawData: any[], autoMapDependentSI) => {
    if (!currentRecon) return;

    try {
      // Create a blob from the raw data
      const jsonData = JSON.stringify(rawData);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const file = new File([blob], `${source}_data.json`, { type: 'application/json' });
  
      // Upload file to Supabase
      await reconService.uploadFile(
        currentRecon.id,
        file,
        source as 'hr' | 'insurer' | 'genome',
        rawData.length
      );

      setDataSources((prev) => ({
        ...prev,
        [source]: {
          headers,
          rawData,
          data: [],
          mapping: {},
          fields: source === 'hr' ? HR_FIELDS :
            source === 'insurer' ? INSURER_FIELDS :
              source === 'genome' ? GENOME_FIELDS :
                source === 'add' ? ADD_FIELDS :
                  source === 'edit' ? EDIT_FIELDS : OFFBOARD_FIELDS,
        },
      }));
      setShowMapper(source);
      setAutoMapDependentSumInsured(autoMapDependentSI)
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const handleMappingChange = (source: string, mapping: { [key: string]: string }) => {
    
    const genomeLookup = new Map(
      dataSources.genome.data.map(record => [
        createLookupKey(record),
        record.user_id
      ])
    );

    setDataSources((prev) => {
      const dataSource = prev[source];
      if (!dataSource) return prev;
      // Group records by employee ID to find primary members
      const employeeGroups = new Map<string, any>();
      
      const transformedData = dataSource.rawData.map(row => {
        const transformedRow: any = {};
        dataSource.fields.forEach(field => {
          const sourceColumn = mapping[field.key];
          if (sourceColumn) {
            let value = row[sourceColumn];

            if (field.type === 'date' && value) {
              if (typeof value === 'number') {
                value = excelDateToJSDate(value);
              } else {
                value = formatDate(value);
              }
            }
            if (field.key === "relationship") {
              transformedRow[field.key] = normalizeRelationship(value);
            } else if(field.key === "name") {
              transformedRow[field.key] = value?.toString()?.replace(/\s+/g, ' ');
            }
            else if (field.key === 'gender') {
              let updatedGender = '';
              if (['MALE', 'M'].includes(value?.toString()?.toUpperCase())) updatedGender = 'Male';
              if (['FEMALE', 'F'].includes(value?.toString()?.toUpperCase())) updatedGender = 'Female';
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
            else if(field.key === "employee_id") {
              const insurer  = policy?.insurerName;
              transformedRow[field.key] = sanitizeEmployeeId(value, insurer);
            }
            else if (['mobile', 'email_address'].includes(field.key)) {
              value = cleanValue(value);
            } 
            else {
              transformedRow[field.key] = value;
            }
            if(source === 'offboard' || source === 'edit'){
              if (row.user_id) {
                transformedRow.user_id = row.user_id;
              } else {
                const lookupKey = createLookupKey(transformedRow);
                const userId = genomeLookup.get(lookupKey);
                if (userId) {
                  transformedRow.user_id = userId;
                }
              }
            }
            if(source === 'add') {
              transformedRow.remark = 'Extra HR Addition'
            } else if(source === 'offboard') {
              transformedRow.remark = 'Extra HR Deletion'
            } else if(source === 'edit') {
              transformedRow.remark = 'Extra HR Correctio'
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

      return {
        ...prev,
        [source]: {
          ...dataSource,
          mapping,
          data: transformedData,
        },
      };
    });
  };

  const handleDataChange = (source: string, newData: any[]) => {
    setDataSources((prev) => ({
      ...prev,
      [source]: prev[source] ? {
        ...prev[source]!,
        data: newData,
      } : null,
    }));
  };

  const handleSanitizeNames = (source: string) => (sanitizedData: any[]) => {
    setDataSources(prev => {
      const sourceData = prev[source];
      if (!sourceData) return prev;
  
      return {
        ...prev,
        [source]: {
          ...sourceData,
          data: sanitizedData
        }
      };
    });
  };
  

  if (loadingRoster) {
    return <LoadingScreen />;
  }

  if (step < 6) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
        <Header
          company={null}
          policy={null}
          onRestart={() => { }}
          onReconData={() => { }}
          onReset={() => { }}
          hasReconData={!!reconData}
          reconData={reconData}
          currentRecon={currentRecon}
        />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-2xl -mt-10">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8">
                {step === 1 && <CompanySelection onNext={() => setStep(2)} />}
                {step === 2 && <PolicySelection onNext={() => setStep(3)} onBack={() => setStep(1)} />}
                {step === 3 && <EndorsementType onNext={() => setStep(4)} onBack={() => setStep(2)} />}
                {step === 4 && <HrRosterAvailability onNext={(val) => setStep(5)} onBack={() => setStep(3)} />}
                {step === 5 && (
                  <HrDataAvailability onNext={() => setStep(6)} onBack={() => setStep(4)} />
                )}
              </div>
              <div className="bg-gray-50 px-8 py-5 border-t">
                <div className="text-sm text-gray-500">
                  Step {step} of {!hasHrRoster ? 5 : 4}
                </div>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${(step / (!hasHrRoster ? 5 : 4)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const availableTabs = getAvailableTabs()?.filter(Boolean);
  if(!!reconData) availableTabs.push('summary');

  return (
    <div className="min-h-screen bg-background">
      <Header
        company={company}
        policy={policy}
        onRestart={handleRestart}
        onReconData={handleReconData}
        onReset={handleReset}
        hasReconData={!!reconData}
        reconData={reconData}
      />

      <main>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-[calc(100vh-126px)]">
          <TabsList className="flex-shrink-0 w-72 h-full flex-col items-stretch justify-start rounded-none border-r bg-background">
            {availableTabs.map((source) => {
              // Get validation results for this tab's data
              const sourceData = dataSources[source];
              const validationResults = sourceData ? validateDataSet(sourceData.data, slabMapping, source) : null;

              // Count invalid records
              let invalidCount = 0;
              if (validationResults) {
                for (const [_, result] of validationResults) {
                  if (!result.isValid) invalidCount++;
                }
              }

              const reconDataWithoutMatches = JSON.parse(JSON.stringify(reconData));
              delete reconDataWithoutMatches?.perfectMatches;
              return (
                <TabsTrigger
                  key={source}
                  value={source}
                  className={cn(
                    "justify-start gap-2 px-4 py-3 rounded-none border-b last:border-b-0 data-[state=active]:bg-muted",
                    // Add green gradient for summary tab
                    source === 'summary' && "bg-gradient-to-r from-green-100 via-green-80 to-transparent hover:from-green-200 hover:via-green-100 hover:to-transparent"
                  )}
                >
                  <span className="text-left">
                    {source === 'hr' && 'HR Active Roster'}
                    {source === 'insurer' && 'Insurer Active Roster'}
                    {source === 'genome' && 'Genome Active Roster'}
                    {source === 'add' && 'Add Records'}
                    {source === 'edit' && 'Edit Records'}
                    {source === 'offboard' && 'Offboard Records'}
                    {source === 'summary' && 'Summary ✨'}
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    {reconData && source === 'summary' && (
                      <Badge className="ml-auto">
                        {Object.values(reconDataWithoutMatches).reduce((acc, curr) => acc + curr?.members?.length, 0)}
                      </Badge>
                    )}
                    {dataSources[source] && (
                      <Badge className="ml-auto">
                        {dataSources[source]!.data.length}
                      </Badge>
                    )}
                    {invalidCount > 0 && (
                      <Badge variant="destructive">
                        {invalidCount}
                      </Badge>
                    )}
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>
          <div className="flex-1 overflow-hidden">
            {availableTabs.map((source) => (
              <TabsContent
                key={source}
                value={source}
                className="flex-1 h-full m-0 data-[state=inactive]:hidden"
              >
                <div className="h-full p-5">
                  <div className="h-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold">
                        {source === 'hr' && 'HR Data'}
                        {source === 'insurer' && 'Insurer Active Roster'}
                        {source === 'genome' && 'Genome Active Roster'}
                        {source === 'add' && 'Add Records'}
                        {source === 'edit' && 'Edit Records'}
                        {source === 'offboard' && 'Offboard Records'}
                      </h3>
                      <div className="flex gap-2">
                      {['hr', 'insurer', 'genome'].includes(source) && 
                          dataSources[source]?.data && 
                          dataSources[source]?.data.length > 0 &&
                          hasNameErrors(validateDataSet(dataSources[source]!.data, slabMapping, source)) && (
                            <SanitizeNamesButton onClick={handleSanitizeNames(source)} data={dataSources[source]!.data} />

                        )}
                        {dataSources[source] && ['hr', 'insurer'].includes(source) && (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setDataSources(prev => ({
                                  ...prev,
                                  [source]: null
                                }));
                              }}
                              className="gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              Reupload
                            </Button>
                            <Button onClick={() => setShowMapper(source)}>
                              Edit Mapping
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {!dataSources[source] ? (
                      ['hr', 'insurer', 'add', 'edit', 'offboard'].includes(source) ? (
                        <FileUpload
                          onFileUpload={handleFileUpload(source, autoMapDependentSumInsured)}
                          disabled={!isRequiredDataAvailable(dataSources, hasHrRoster) && ['add', 'edit', 'offboard'].includes(source)}
                          source={source}
                        />
                      ) : source === 'genome' ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Genome roster will be loaded automatically when a policy is selected
                        </div>
                      ) : null
                    ) : (
                      <DataTable
                        headers={dataSources[source]!.fields.map(f => f.label)}
                        data={dataSources[source]!.data}
                        mapping={dataSources[source]!.mapping}
                        fields={dataSources[source]!.fields}
                        onDataChange={(newData) => handleDataChange(source, newData)}
                        activeTab={activeTab}
                        disableUploadMore={!!reconData}
                        searchTerm={searchTerms[activeTab]}
                        onSearchChange={(value) => handleSearch(activeTab, value)}
                      />
                    )}

                    {source === 'summary' && reconData ? (
                      <SummaryTab reconData={reconData} />
                    ) : source === 'summary' ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Click "Recon Data" to generate summary
                      </div>
                    ) : null}
                  </div>
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </main>

      {showMapper && dataSources[showMapper] && (
        <ColumnMapper
          headers={dataSources[showMapper]!.headers}
          fields={dataSources[showMapper]!.fields}
          mapping={dataSources[showMapper]!.mapping}
          data={dataSources[showMapper]!.rawData}
          onMappingChange={(mapping) => handleMappingChange(showMapper, mapping)}
          onClose={() => setShowMapper(null)}
          onReset={() => {
            setDataSources(prev => ({
              ...prev,
              [showMapper]: null
            }));
            setShowMapper(null);
          }}
        />
      )}
      <ValidationErrorDialog
        invalidCounts={invalidCounts}
        isOpen={showValidationDialog}
        onClose={() => setShowValidationDialog(false)}
      />
      <WarningDialog
        isOpen={showInsurerWarning}
        onClose={() => setShowInsurerWarning(false)}
      />
      <LoadingDialog isOpen={isReconciling} />
    </div>
  );
}

export function ReconciliationInterface() {
  return (
    <WorkflowProvider>
      <ReconciliationInterfaceContent />
    </WorkflowProvider>
  );
}
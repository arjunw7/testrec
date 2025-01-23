import React, { createContext, useContext, useState } from 'react';
import { Company, Policy, SlabMapping, WorkflowContextType } from '../types';

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1);
  const [company, setCompany] = useState<Company | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [isFirstEndorsement, setIsFirstEndorsement] = useState<boolean | null>(null);
  const [hasHrRoster, setHasHrRoster] = useState<boolean | null>(null);
  const [hasAdditionalData, setHasAdditionalData] = useState<boolean | null>(null);
  const [slabMapping, setSlabMapping] = useState<SlabMapping[]>([]);
  const [genomeRoster, setGenomeRoster] = useState<any[]>([]);
  const [policyType, setPolicyType] = useState<string | null>(null);

  const value = {
    step,
    company,
    policy,
    isFirstEndorsement,
    hasHrRoster,
    hasAdditionalData,
    slabMapping,
    genomeRoster,
    setStep,
    setCompany,
    setPolicy,
    setIsFirstEndorsement,
    setHasHrRoster,
    setHasAdditionalData,
    setSlabMapping,
    setGenomeRoster,
    policyType,
    setPolicyType,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}
export interface Field {
  key: string;
  label: string;
  type: string;
  isMandatory?: boolean;
  config?: {
    options?: Array<{
      value: string;
      label: string;
    }>;
  };
}

export interface ColumnMapping {
  [key: string]: string;
}

export interface ParsedData {
  [key: string]: string;
}

export interface Company {
  id: string;
  name: string;
}

export interface Policy {
  id: string;
  name: string;
  company_id: string;
  nickName?: string;
  policyType?: string;
  insurerLogo?: string;
  sumAssuredSlabs?: Array<{
    slabId: string;
    sumInsured: number;
    familyDefinition: string;
  }>;
}

export interface WorkflowContextType {
  step: number;
  company: Company | null;
  policy: Policy | null;
  isFirstEndorsement: boolean | null;
  hasHrRoster: boolean | null;
  hasAdditionalData: boolean | null;
  slabMapping: SlabMapping[];
  genomeRoster: any[];
  setStep: (step: number) => void;
  setCompany: (company: Company | null) => void;
  setPolicy: (policy: Policy | null) => void;
  setIsFirstEndorsement: (value: boolean | null) => void;
  setHasHrRoster: (value: boolean | null) => void;
  setHasAdditionalData: (value: boolean | null) => void;
  setSlabMapping: (mapping: SlabMapping[]) => void;
  setGenomeRoster: (roster: any[]) => void;
  policyType: string | null;
}

export interface SlabMapping {
  slab_id: string;
  sum_insured: string;
}
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ValidationResult } from "./validation";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to standard DD/MM/YY format
export function formatToStandardDate(dateStr: string): string {
  if (!dateStr) return '';
  
  const cleanDate = dateStr?.toString()?.toLowerCase()?.trim();
  
  // Already in DD/MM/YY format
  if (/^\d{2}\/\d{2}\/\d{2}$/.test(cleanDate)) {
    return cleanDate;
  }
  
  const monthNames: { [key: string]: string } = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
    'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
  };

  // Try different date patterns
  const patterns = [
    // DD/MMM/YY
    /^(\d{1,2})\/([a-z]{3})\/(\d{2})$/,
    // DD/MMM/YYYY
    /^(\d{1,2})\/([a-z]{3})\/(\d{4})$/,
    // DD-MMM-YY or DD MMM YY
    /^(\d{1,2})[-\s]([a-z]{3})[-\s](\d{2})$/,
    // DD-MMM-YYYY or DD MMM YYYY
    /^(\d{1,2})[-\s]([a-z]{3})[-\s](\d{4})$/,
    // YYYY-MM-DD
    /^(\d{4})-(\d{2})-(\d{2})$/,
    // DD/MM/YYYY
    /^(\d{2})\/(\d{2})\/(\d{4})$/,
    // DD-MM-YYYY
    /^(\d{2})-(\d{2})-(\d{4})$/
  ];

  for (const pattern of patterns) {
    const match = cleanDate.match(pattern);
    if (match) {
      if (pattern.source.includes('[a-z]{3}')) {
        // Handle DD/MMM/YY or DD-MMM-YY format
        const [_, day, month, year] = match;
        const monthNum = monthNames[month];
        if (monthNum) {
          const paddedDay = day.padStart(2, '0');
          const shortYear = year.length === 4 ? year.slice(-2) : year;
          return `${paddedDay}/${monthNum}/${shortYear}`;
        }
      } else if (pattern.source.startsWith('^(\\d{4})')) {
        // Handle YYYY-MM-DD format
        const [_, year, month, day] = match;
        return `${day}/${month}/${year.slice(-2)}`;
      } else {
        // Handle DD/MM/YYYY format
        const [_, day, month, year] = match;
        return `${day}/${month}/${year.slice(-2)}`;
      }
    }
  }

  // If it's a number (Excel date)
  if (!isNaN(Number(cleanDate)) && Number(cleanDate) > 21916) {
    return excelDateToJSDate(Number(cleanDate));
  }

  return cleanDate;
}

// Convert DD/MM/YY to Date object
export function standardDateToDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  const [day, month, year] = dateStr.split('/').map(Number);
  if (!day || !month || !year) return null;
  
  // Convert 2-digit year to full year
  const fullYear = year < 50 ? 2000 + year : 1900 + year;
  
  // Create date - note that months are 0-based in JavaScript
  return new Date(fullYear, month - 1, day);
}

// Format duration in seconds to human readable format
export function formatDuration(seconds: number): string {
  if (!seconds) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);

  return parts.join(' ');
}

// Date formatting utilities
export function formatDate(date: string | number | Date): string {
  if (!date) return '';
  
  let parsedDate: Date;
  
  // Handle timestamp
  if (typeof date === 'number') {
    parsedDate = new Date(date);
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = parsedDate.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  }
  // Handle string formats
  else if (typeof date === 'string') {
    return formatToStandardDate(date);
  }
  // Handle Date object
  else {
    parsedDate = date;
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = parsedDate.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  }
}

// Validation utilities
export const validators = {
  date: (value: string) => {
    if (!value) return true;
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(value)) return false;
    
    const [day, month, yearStr] = value.split('/').map(Number);
    const year = yearStr < 50 ? 2000 + yearStr : 1900 + yearStr;
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
  },
  
  email: (value: string) => {
    if (!value) return true;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  },
  
  mobile: (value: string) => {
    if (!value) return true;
    const regex = /^[0-9]{10}$/;
    return regex.test(value);
  },
  
  number: (value: string) => {
    if (!value) return true;
    return !isNaN(Number(value));
  }
};

export const RELATIONSHIP_OPTIONS = [
  { value: 'SELF', label: 'Self' },
  { value: 'SPOUSE', label: 'Spouse' },
  { value: 'CHILD', label: 'Child' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'PARENT-IN-LAW', label: 'Parent In Law' }
];

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' }
];

export const normalizeRelationship = (relationship: string): string => {
  if (!relationship) return '';
  
  const normalized = relationship?.toString()?.toUpperCase()?.trim();
  
  // Child relationships
  if (['SON', 'DAUGHTER', 'CHILDREN', 'REL_04', 'UDTR', 'SONM', 'Child 1', 'Child 2', 'Child 3', 'CHILD1', 'CHILD2', 'CHILD3'].includes(normalized)) {
    return 'CHILD';
  }
  
  // Spouse relationships
  if (['WIFE', 'HUSBAND','REL_03', 'REL_10', 'SPSE'].includes(normalized)) {
    return 'SPOUSE';
  }
  
  // Parent relationships
  if (['FATHER', 'MOTHER', 'EMOT', 'EFAT', 'REL_05', 'REL_06','REL_02', 'REL_11','REL_12'].includes(normalized)) {
    return 'PARENT';
  }

  if (['FATHER IN LAW', 'FATHER-IN-LAW', 'MOTHER IN LAW', 'MOTHER-IN-LAW', 'PARENT IN LAW', 'FLAW', 'MLAW', 'REL_09'].includes(normalized)) {
    return 'PARENT-IN-LAW';
  }

  // Return original if no match (but should be one of the base relationships)
  if (['SELF', 'SPOUSE', 'CHILD', 'PARENT','PARENT-IN-LAW'].includes(normalized)) {
    return normalized;
  }

  if (['REL_01', 'MMBR', 'Employee'].includes(normalized)) {
    return 'SELF';
  }
  
  return ''; // Default to empty if unknown
};

export function excelDateToJSDate(serial: number): string {
  // Excel's epoch starts from 1900-01-01
  const utc_days  = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;  
  const date_info = new Date(utc_value * 1000);
  
  const day = date_info.getDate().toString().padStart(2, '0');
  const month = (date_info.getMonth() + 1).toString().padStart(2, '0');
  const year = date_info.getFullYear().toString().slice(-2);
  
  return `${day}/${month}/${year}`;
}

export const isRequiredDataAvailable = (
  dataSources: { [key: string]: any },
  hasHrRoster: boolean,
) => {
  const hasInsurer = !!dataSources.insurer?.data;
  const hasGenome = !!dataSources.genome?.data;
  const hasHr = !!dataSources.hr?.data;
  return !hasHrRoster ? (hasInsurer && hasGenome) : (hasInsurer && hasGenome && hasHr);
};

export const filterFieldsByPolicyType = (fields: Field[], policyType: string | null): Field[] => {
  if (!policyType || policyType === 'GMC') {
    return fields;
  }
  
  return fields.filter(field => field.key !== 'date_of_birth_dd_mmm_yyyy');
};

export function formatDateToMMM(date: string): string {
  if (!date) return '';
  
  const [day, month, year] = date.split('/');
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  return `${day}/${months[parseInt(month) - 1]}/${year}`;
}

export const createLookupKey = (record: any): string => {
  return `${record.employee_id?.toString()?.toLowerCase()?.trim()}_${record.name?.toString()?.toLowerCase()?.trim()}_${normalizeRelationship(record.relationship)?.toLowerCase()}`;
};

export const sanitizeName = (name: string): string => {
  if (!name) return '';
  
  // Remove any titles (Mr., Mrs., etc)
  const withoutTitles = name.replace(/^(mr\.|mrs\.|ms\.|dr\.|miss\.|prof\.)?\s*/i, '');
  
  // Convert to proper case and remove any special characters
  return withoutTitles
    .toLowerCase()
    .replace(/[^a-z\s]/g, '') // Remove special characters
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
};

export const hasNameErrors = (validationResults: Map<number, ValidationResult>): boolean => {
  for (const [_, result] of validationResults) {
    if (result.errors.some(error => error.field === 'name')) {
      return true;
    }
  }
  return false;
};

export const sanitizeEmployeeId = (employeeId: string, insurer: string): string => {
  if (!employeeId) return '';
  
  // Trim whitespace first
  const trimmed = employeeId?.toString()?.trim();
  
  // Remove special characters from start and end, but preserve internal ones
  // This regex matches special characters at the start (^) or end ($)
  let eidWothoutSpecialChars =  trimmed?.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
  if (insurer === 'The Oriental Insurance Co Ltd') {
    eidWothoutSpecialChars = eidWothoutSpecialChars?.toString()
      ?.replace(/[^a-zA-Z0-9]/g, '')
      ?.replace(/[a-zA-Z]/g, '9');
  } else if (insurer === 'Care Health Insurance') {
    eidWothoutSpecialChars = eidWothoutSpecialChars?.toString()?.replace(/^0+/, '');
  }
  return eidWothoutSpecialChars;
};

//function to clean phone and email 
export const cleanValue = (value: any): string | null => {
  if (!value) return null;
  const cleanedValue = value?.toString()?.trim()?.toUpperCase();
  if (['N/A', '#N/A', 'NA', 'NULL', 'NIL'].includes(cleanedValue)) {
    return null;
  }
  return value;
};

export type InsurerStatusConfig = {
  field: string;
  operator: 'equals' | 'not_equals' | 'empty' | 'not_empty' | 'is_in_future' | 'in' | 'not_in';
  value?: string | string[];
};

export const INSURER_STATUS_CONFIGS: { [key: string]: InsurerStatusConfig } = {
  'Aditya Birla Health Insurance Co ltd': { field: 'Status  (Active /Inactive)', operator: 'in', value: ['ACTIVE'] },
  'Aditya Birla Sun Life Insurance Company Ltd': { field: 'Status  (Active /Inactive)', operator: 'in', value: ['ACTIVE'] },
  'Bajaj Allianz': { field: 'Member Status', operator: 'in', value: ['ACTIVE'] },
  'Bajaj Allianz General Insurance Co. Ltd.': { field: 'Member Status', operator: 'in', value: ['ACTIVE'] },
  'Care Health Insurance': { field: 'DTETRM', operator: 'empty' },
  'Cholamandalam MS General Insurance': { field: 'Flag Status', operator: 'in', value: ['A'] },
  'Edelweiss General Insurance Co.Ltd.': { field: 'Status', operator: 'in', value: ['Active'] },
  'Zuno General Insurance (Edelweiss)': { field: 'Status', operator: 'in', value: ['Active'] },
  'Edelweiss Tokio Life Insurance Co. Ltd': { field: 'Coverage Status', operator: 'in', value: ['Active'] },
  'Future Generali India Insurance Co Ltd': { field: 'Member Status', operator: 'in', value: ['Active'] },
  'Go Digit': { field: 'POLICY_STATUS', operator: 'in', value: ['A'] },
  'HDFC ERGO General Insurance Co. Ltd.': { field: 'COVER UNDER', operator: 'not_in', value: ['Delete Member'] },
  'ICICI Lombard': { field: 'UHID_STATUS', operator: 'in', value: ['ACTIVE'] },
  'ICICI Prudential Life Insurance': { field: 'memberStatus', operator: 'in', value: ['Inforce'] },
  'Iffco Tokio General Insurance Co Ltd': { field: 'Action', operator: 'in', value: ['A'] },
  'Kotak Mahindra General Insurance Co. Ltd.': { field: 'benef_status', operator: 'in', value: ['ACTIVE'] },
  'Magma HDI General Insurance Co Ltd': { field: 'DELETED', operator: 'equals', value: 'FALSE' },
  'Manipal Cigna Health Insurance Co Ltd': { field: 'Status', operator: 'in', value: ['ACTIVE'] },
  'Max Life Insurance Co Ltd': { field: 'Status', operator: 'in', value: ['ACTIVE'] },
  'Niva Bupa': { field: 'MemberStatus', operator: 'in', value: ['ACTIVE'] },
  'Reliance General Insurance': { field: 'EmpStatus', operator: 'in', value: ['Active'] },
  'SBI General Insurance': { field: 'Status', operator: 'in', value: ['Active'] },
  'Tata AIG General Insurance Co. Ltd.': { field: 'FLAGSTATUS', operator: 'in', value: ['A'] },
  'The Oriental Insurance Co Ltd': { field: 'RISK EFF TO DT', operator: 'is_in_future' },
  'Universal Sompo General Insurance Co. Ltd.': { field: 'Status', operator: 'in', value: ['A'] },
  'United India Insurance Co Ltd': { field: 'STATUS', operator: 'not_in', value: ['D'] }
};

// Special case for Magma HDI based on policy type
export const getMagmaHDIConfig = (policyType: string): InsurerStatusConfig => {
  if (policyType === 'GPA') {
    return { field: 'Status', operator: 'equals', value: 'A' };
  }
  return { field: 'DELETED', operator: 'equals', value: 'FALSE' };
};

// Add these insurers that always return active status
export const ALWAYS_ACTIVE_INSURERS = new Set([
  'Pramerica Life Insurance',
  'Royal Sundaram General Insurance Co Ltd',
  'Shriram General Insurance Co Ltd',
  'Star Health'
]);

export const getInsurerStatusConfig = (insurerName: string, policyType?: string): InsurerStatusConfig | null => {
  // Handle special case for Magma HDI
  if (insurerName === 'Magma HDI General Insurance Co Ltd' && policyType) {
    return getMagmaHDIConfig(policyType);
  }

  // Handle insurers that are always active
  if (ALWAYS_ACTIVE_INSURERS.has(insurerName)) {
    return null;
  }

  // Return the standard config or null if not found
  return INSURER_STATUS_CONFIGS[insurerName] || null;
};
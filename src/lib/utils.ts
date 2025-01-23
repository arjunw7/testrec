import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
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
  if (['SON', 'DAUGHTER', 'CHILDREN', 'REL_03', 'REL_04'].includes(normalized)) {
    return 'CHILD';
  }
  
  // Spouse relationships
  if (['WIFE', 'HUSBAND','REL_10'].includes(normalized)) {
    return 'SPOUSE';
  }
  
  // Parent relationships
  if (['FATHER', 'MOTHER', 'REL_05', 'REL_06'].includes(normalized)) {
    return 'PARENT';
  }

  if (['FATHER IN LAW', 'FATHER-IN-LAW', 'MOTHER IN LAW', 'MOTHER-IN-LAW', 'PARENT IN LAW', 'REL_07', 'REL_08'].includes(normalized)) {
    return 'PARENT-IN-LAW';
  }

  // Return original if no match (but should be one of the base relationships)
  if (['SELF', 'SPOUSE', 'CHILD', 'PARENT','PARENT-IN-LAW'].includes(normalized)) {
    return normalized;
  }
  
  return ''; // Default to SELF if unknown
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
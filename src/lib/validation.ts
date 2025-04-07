import { SlabMapping } from '../types';
import { normalizeRelationship, formatToStandardDate } from './utils';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationContext {
  slabMapping: SlabMapping[];
  duplicateKeys: Set<string>;
  source: 'hr' | 'genome' | 'insurer' | 'add' | 'edit' | 'offboard';
  employeeRelationships?: Map<string, Map<string, Set<string>>>;
}

const VALID_RELATIONSHIPS = ['SELF', 'SPOUSE', 'CHILD', 'PARENT', 'PARENT-IN-LAW'];
const VALID_GENDERS = ['MALE', 'FEMALE'];
const NAME_REGEX = /^[A-Za-z\s]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[0-9]{10}$/;
const DATE_REGEX = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{2}$/;
const FORBIDDEN_NAME_PREFIXES = ['mr.', 'mrs.', 'dr.'];

export const isValidDate = (dateStr: string): boolean => {
  // First try to standardize the date format
  const standardizedDate = formatToStandardDate(dateStr);
  
  // If formatToStandardDate returns empty string, the date was invalid
  if (!standardizedDate) return false;
  
  // Now check if it matches our standard format
  if (!DATE_REGEX.test(standardizedDate)) return false;
  
  // Parse the standardized date
  const [day, month, yearStr] = standardizedDate.split('/').map(Number);
  const year = yearStr < 50 ? 2000 + yearStr : 1900 + yearStr;
  const date = new Date(year, month - 1, day);
  
  return date.getDate() === day && 
         date.getMonth() === month - 1 && 
         date.getFullYear() === year;
};

export const validateRecord = (record: any, context: ValidationContext): ValidationResult => {
  const errors: ValidationError[] = [];

  // Check for duplicate key only if it's in the duplicates set
  const uniqueKey = `${record.employee_id}_${record.name}_${record?.relationship}`.toLowerCase();
  if (context.duplicateKeys.has(uniqueKey) && !['genome', 'insurer'].includes(context.source)) {
    errors.push({
      field: 'employee_id',
      message: 'Duplicate Employee ID + Name + Relationship combination found'
    });
  }

  // Name validation
  if (record.name) {
    const normalizedName = record?.name?.toString()?.toLowerCase()?.trim();
      if (!NAME_REGEX.test(record.name)) {
        errors.push({
          field: 'name',
          message: 'Name must contain only letters and spaces'
        });
      }
      if (FORBIDDEN_NAME_PREFIXES.some(prefix => normalizedName.startsWith(prefix))) {
        errors.push({
          field: 'name',
          message: 'Name should not start with titles (Mr, Mrs, Miss, etc)'
        });
      }
  } else {
    errors.push({
        field: 'name',
        message: 'Name is mandatory'
      });
  }

  // Gender validation
  if (record.gender && !VALID_GENDERS.includes(record?.gender?.toString()?.toUpperCase()) && !['offboard'].includes(context.source)) {
    errors.push({
      field: 'gender',
      message: 'Gender must be either Male or Female'
    });
  }

  // Relationship validation
  if (record.relationship) {
    const normalizedRelationship = normalizeRelationship(record.relationship);
    if (!VALID_RELATIONSHIPS.includes(normalizedRelationship)) {
      errors.push({
        field: 'relationship',
        message: 'Invalid relationship value'
      });
    }
    // Check for duplicate spouse and parent relationships
    if (context.source === 'hr' && context.employeeRelationships && record?.employee_id) {
      const employeeId = record?.employee_id?.toString()?.toLowerCase();
      const gender = record?.gender?.toString()?.toUpperCase();
      const relationship = normalizedRelationship;

      if (!context.employeeRelationships.has(employeeId)) {
        context.employeeRelationships.set(employeeId, new Map());
      }

      const employeeMap = context.employeeRelationships.get(employeeId)!;
      if (relationship === 'SPOUSE') {
        if (!employeeMap.has('SPOUSE')) {
          employeeMap.set('SPOUSE', new Set());
        }
        const spouseCount = employeeMap.get('SPOUSE')!.size;
        if (spouseCount >= 1) {
          errors.push({
            field: 'relationship',
            message: 'Multiple spouses found for the same employee'
          });
        }
        employeeMap.get('SPOUSE')!.add(record.name);
      }

      if (relationship === 'PARENT' && gender) {
        if (!employeeMap.has('PARENT')) {
          employeeMap.set('PARENT', new Set());
        }
        const parentGenders = employeeMap.get('PARENT')!;
        if (parentGenders.has(gender)) {
          errors.push({
            field: 'relationship',
            message: `Multiple ${gender?.toString().toLowerCase()} parents found for the same employee`
          });
        }
        parentGenders.add(gender);
      }
    }
  }

  // Contact information validation
  if (record.mobile && !MOBILE_REGEX.test(record.mobile) && !['genome', 'insurer', 'offboard'].includes(context.source)) {
    errors.push({
      field: 'mobile',
      message: 'Invalid mobile number format (10 digits required)'
    });
  }

  if (record.email_address && !EMAIL_REGEX.test(record.email_address) && !['genome', 'insurer', 'offboard'].includes(context.source)) {
    errors.push({
      field: 'email_address',
      message: 'Invalid email format'
    });
  }

  // Sum Insured validation
  if(!['add', 'edit', 'offboard'].includes(context?.source)) {
    if (record.sum_insured) {
      const sumInsuredExists = context.slabMapping.some(
        slab => Number(slab.sum_insured) === Number(record.sum_insured)
      );
      if (!sumInsuredExists) {
        errors.push({
          field: 'sum_insured',
          message: 'Sum insured value does not match any predefined slab'
        });
      }
    } else {
      errors.push({
          field: 'sum_insured',
          message: 'Sum insured is mandatory'
        });
    }
  }

  // CTC validation
  if (record.ctc) {
    const cleanedCtc = record.ctc.toString().replace(/,/g, '');
    if (isNaN(Number(cleanedCtc))) {
      errors.push({
        field: 'ctc',
        message: 'CTC must be a valid number'
      });
    }
  }

  // Date validations
  const dateFields = [
    'date_of_birth_dd_mmm_yyyy',
    'coverage_start_date_dd_mmm_yyyy',
    'enrolment_due_date_dd_mmm_yyyy',
    'date_of_leaving_dd_mmm_yyyy'
  ];

  dateFields.forEach(field => {
    if (record[field] && !isValidDate(record[field])) {
      errors.push({
        field,
        message: 'Invalid date format (DD/MM/YY required)'
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateDataSet = (
  data: any[],
  slabMapping: SlabMapping[],
  source: string,
): Map<number, ValidationResult> => {
  const results = new Map<number, ValidationResult>();
  const keyCount = new Map<string, number>();
  const duplicateKeys = new Set<string>();
  const employeeRelationships = new Map<string, Map<string, Set<string>>>();

  // First pass: count occurrences of each key
  data.forEach(record => {
    if (record.employee_id && record.name) {
      const key = `${record.employee_id}_${record.name}_${record?.relationship}`.toLowerCase();
      keyCount.set(key, (keyCount.get(key) || 0) + 1);
      
      // If we've seen this key more than once, add it to duplicates
      if (keyCount.get(key)! > 1) {
        duplicateKeys.add(key);
      }
    }
  });

  // Second pass: validate each record
  data.forEach((record, index) => {
    const context: ValidationContext = {
      slabMapping,
      duplicateKeys,
      source,
      employeeRelationships,
    };
    results.set(index, validateRecord(record, context));
  });

  return results;
};

export const preprocessData = (data: any[]): any[] => {
  return data.map(record => ({
    ...record,
    ctc: record.ctc?.toString().replace(/,/g, ''),
    relationship: normalizeRelationship(record.relationship)
  }));
};
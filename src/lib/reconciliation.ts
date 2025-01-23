import { ColumnMapping } from '../types';
import { formatToStandardDate, normalizeRelationship } from './utils';

interface ReconData {
  addData: any[];
  editData: any[];
  dataMismatch: any[];
  offboardSheet: any[];
  offboardSheet2: any[];
  tobeEndorsed_add: any;
  tobeEndorsed_add_manual: any;
  tobeEndorsed_edit: any;
  tobeEndorsed_offboard: any;
  toBeEndorsed_offboard_conf: any;
  toBeEndorsed_offboard_conf_manual: any;
  toBeEndorsed_offboard_or_add: any;
  perfectMatches: {
    members: any[];
    message: string;
    description: string;
  };
}

const normalizeFieldValue = (field: string, value: any): string => {
  if (!value) return '';
  
  switch (field) {
    case 'relationship':
      return normalizeRelationship(value).toLowerCase();
    case 'gender':
      return value.toString().toLowerCase();
    case 'date_of_birth_dd_mmm_yyyy':
      return formatToStandardDate(value).toLowerCase();
    case 'name':
      return value?.toString()?.toLowerCase()?.trim();
    case 'employee_id':
      return value?.toString()?.toLowerCase()?.trim();
    case 'sum_insured':
      return value?.toString()?.toLowerCase()?.trim();
    default:
      return value?.toString()?.toLowerCase()?.trim();
  }
};

// Create multiple keys for matching records
const createMatchingKeys = (record: any): string[] => {
  const keys = [];
  
  // Key 1: EID + name + gender + DOB + relationship
  keys.push([
    'employee_id',
    'name',
    'gender',
    'date_of_birth_dd_mmm_yyyy',
    'relationship'
  ].map(field => normalizeFieldValue(field, record[field])).join('|'));
  
  // Key 2: EID + name + gender + DOB + sum insured
  keys.push([
    'employee_id',
    'name',
    'gender',
    'date_of_birth_dd_mmm_yyyy',
    'sum_insured'
  ].map(field => normalizeFieldValue(field, record[field])).join('|'));
  
  // Key 3: EID + name + gender + relationship + sum insured
  keys.push([
    'employee_id',
    'name',
    'gender',
    'relationship',
    'sum_insured'
  ].map(field => normalizeFieldValue(field, record[field])).join('|'));

  // Key 4: EID + name + dob + relationship + sum insured
  keys.push([
    'employee_id',
    'name',
    'date_of_birth_dd_mmm_yyyy',
    'relationship',
    'sum_insured'
  ].map(field => normalizeFieldValue(field, record[field])).join('|'));

  // Key 5: EID + gender + dob + relationship + sum insured
  keys.push([
    'employee_id',
    'gender',
    'date_of_birth_dd_mmm_yyyy',
    'relationship',
    'sum_insured'
  ].map(field => normalizeFieldValue(field, record[field])).join('|'));

  // Key 6: name + gender + dob + relationship + sum insured
  keys.push([
    'name',
    'gender',
    'date_of_birth_dd_mmm_yyyy',
    'relationship',
    'sum_insured'
  ].map(field => normalizeFieldValue(field, record[field])).join('|'));

  // Key 7: name + gender + relationship + sum insured
  keys.push([
    'name',
    'gender',
    'relationship',
    'sum_insured'
  ].map(field => normalizeFieldValue(field, record[field])).join('|'));

  // Key 8: name +  dob + relationship + sum insured
  keys.push([
    'name',
    'date_of_birth_dd_mmm_yyyy',
    'relationship',
    'sum_insured'
  ].map(field => normalizeFieldValue(field, record[field])).join('|'));

  return keys;
};

// Function to find matching record using multiple keys
const findMatchingRecord = (record: any, records: Map<string, any>[]): any => {
  const keys = createMatchingKeys(record);
  for (const key of keys) {
    for (const recordMap of records) {
      const match = recordMap.get(key);
      if (match) return match;
    }
  }
  return null;
};

const createUniqueKey = (record: any) => {
  const employeeId = record.employee_id || '';
  const name = record.name || '';
  const relationship = record.relationship || '';
  return `${employeeId?.toString()?.trim()}_${name?.toString()?.trim()}_${relationship?.toString()?.trim()}`.toLowerCase();
};

const createRelationshipKey = (record: any, relationship: string) => {
  return `${record.employee_id?.toString()?.trim()}_${relationship?.toString()?.trim()}`.toLowerCase();
}; 

const isDuplicate = (record: any, existingRecords: any[]): boolean => {
  const key = createUniqueKey(record);
  return existingRecords.some(existing => createUniqueKey(existing) === key);
};

const calculateSlabId = (sumInsured: number, slabMapping: SlabMapping[]) => {
  const matchingSlab = slabMapping.find(
    slab => Number(slab.sum_insured) === sumInsured
  );
  return matchingSlab?.slab_id;
};

const compareFields = (hrRecord: any, insurerRecord: any, genomeRecord: any, policyType?: string) => {
  const mismatches: string[] = [];
  console.log('policyType', policyType)
  const fieldsToCompare = policyType === 'GMC' ? [
    { key: 'name', label: 'Name', normalize: (value: string) => value?.toString()?.trim()?.toLowerCase() },
    { key: 'employee_id', label: 'Employee ID', normalize: (value: string) => value?.toString()?.trim()?.toLowerCase() },
    { key: 'relationship', label: 'Relationship', normalize: (value: string) => normalizeRelationship(value?.toString())?.toLowerCase() },
    { key: 'gender', label: 'Gender', normalize: (value: string) => value?.toString()?.toLowerCase() },
    { 
      key: 'date_of_birth_dd_mmm_yyyy', 
      label: 'DOB', 
      normalize: (value: string) => formatToStandardDate(value)
    },
    { key: 'sum_insured', label: 'Sum Insured', normalize: (value: string) => value?.toLowerCase() }
  ] : [
    { key: 'name', label: 'Name', normalize: (value: string) => value?.toString()?.trim()?.toLowerCase() },
    { key: 'employee_id', label: 'Employee ID', normalize: (value: string) => value?.toString()?.trim()?.toLowerCase() },
    { key: 'ctc', label: 'CTC', normalize: (value: string) => value?.toString()?.trim()?.toLowerCase() },
    { key: 'gender', label: 'Gender', normalize: (value: string) => value?.toString()?.toLowerCase() },
    { key: 'sum_insured', label: 'Sum Insured', normalize: (value: string) => value?.toString()?.toLowerCase() }
  ];

  fieldsToCompare.forEach(field => {
    const values = {
      hr: hrRecord ? field.normalize(hrRecord[field.key]?.toString() || '') : null,
      insurer: field.normalize(insurerRecord[field.key]?.toString() || ''),
      genome: field.normalize(genomeRecord[field.key]?.toString() || '')
    };

    // Compare values based on available data
    if (hrRecord) {
      // 3-way comparison when HR data is available
      if (values.hr && values.insurer && values.genome) {
        const allMatch = values.hr === values.insurer && values.insurer === values.genome;
        if (!allMatch) {
          mismatches.push(
            `${field.label}: HR=${hrRecord[field.key]}, Insurer=${insurerRecord[field.key]}, Genome=${genomeRecord[field.key]}`
          );
        }
      }
    } else {
      // 2-way comparison between Insurer and Genome when no HR data
      if (values.insurer && values.genome && values.insurer !== values.genome) {
        mismatches.push(
          `${field.label}: Insurer=${insurerRecord[field.key]}, Genome=${genomeRecord[field.key]}`
        );
      }
    }
  });

  return mismatches;
};

export const reconcileData = (
  hrData: any[] = [],
  insurerData: any[],
  genomeData: any[],
  slabMapping: SlabMapping[],
  existingData?: {
    add?: any[];
    edit?: any[];
    offboard?: any[];
  },
  policyType?: string,
): ReconData => {
  const addData: any[] = existingData?.add || [];
  const editData: any[] = existingData?.edit || [];
  const dataMismatch: any[] = [];
  const offboardSheet: any[] = existingData?.offboard || [];
  const offboardSheet2: any[] = [];

  // Create sets to track unique keys
  const addKeys = new Set(addData.map(createUniqueKey));
  const editKeys = new Set(editData.map(createUniqueKey));
  const offboardKeys = new Set(offboardSheet.map(createUniqueKey));
  
  const tobeEndorsed_add = {
    members: JSON.parse(JSON.stringify(addData)) || [],
    message: 'New member additions from HR',
    description: 'These are the new members who are required to be endorsed.'
  };

  const tobeEndorsed_add_manual = {
    members: [],
    message: 'New member additions from HR',
    description: 'These members are present in HR and Loop active roster but are not endorsed with Insurer.',
    action: 'Please add these members manually in the upcoming endorsement.'
  };

  const tobeEndorsed_edit = {
    members: JSON.parse(JSON.stringify(editData)) || [],
    message: 'New corrections in member details',
    description: 'These members have mismatch of member details in active roster across Loop, HR and Insurer.',
  };

  const tobeEndorsed_offboard = {
    members: JSON.parse(JSON.stringify(offboardSheet)) || [],
    message: 'Member deletion request from HR',
    description: 'HR has requested offboarding of these members.',
  };

  const toBeEndorsed_offboard_conf = {
    members: [],
    message: 'Members missing in HRs roster but are present in Insurer and Loop\s roster.',
    description: 'These members can be offboarded via regular endorsement flow post confirmation.',
    action: 'Please confirm the offboarding of these members with HR.'
  };

  const toBeEndorsed_offboard_conf_manual = {
    members: [],
    message: 'Members endorsed in the policy but are not present in HR/Insurer active roster.',
    description: 'These member deletions have to be added manually in the insurer format for upcoming endorsement',
    action: 'Please confirm the offboarding of these members with HR.'
  };

  const toBeEndorsed_offboard_or_add = {
    members: [],
    message: 'Active members in Genome but missing in HR and Insurer\'s active roster.',
    description: 'If HR wants to add these members, they have to be manually added in the insurer format for upcominng endorsement. If HR wants to delete them, please remove them via regular endorsement flow post confirmation',
    action: 'Please confirm with HR if these members need to be offboarded or added.'
  };

  // Create maps for each key type for each dataset
  const hrMaps = hrData.map(record => {
    const maps: Map<string, any>[] = [];
    createMatchingKeys(record).forEach(key => {
      const map = new Map();
      map.set(key, record);
      maps.push(map);
    });
    return maps;
  }).flat();

  const insurerMaps = insurerData.map(record => {
    const maps: Map<string, any>[] = [];
    createMatchingKeys(record).forEach(key => {
      const map = new Map();
      map.set(key, record);
      maps.push(map);
    });
    return maps;
  }).flat();

  const genomeMaps = genomeData.map(record => {
    const maps: Map<string, any>[] = [];
    createMatchingKeys(record).forEach(key => {
      const map = new Map();
      map.set(key, record);
      maps.push(map);
    });
    return maps;
  }).flat();

  // Create lookup maps for SELF/SPOUSE relationships
  const hrSelfSpouseMap = new Map(
    hrData
      .filter(record => ['SELF', 'SPOUSE'].includes(normalizeRelationship(record.relationship)))
      .map(record => [createRelationshipKey(record, record.relationship), record])
  );
  
  const insurerSelfSpouseMap = new Map(
    insurerData
      .filter(record => ['SELF', 'SPOUSE'].includes(normalizeRelationship(record.relationship)))
      .map(record => [createRelationshipKey(record, record.relationship), record])
  );
  
  const genomeSelfSpouseMap = new Map(
    genomeData
      .filter(record => ['SELF', 'SPOUSE'].includes(normalizeRelationship(record.relationship)))
      .map(record => [createRelationshipKey(record, record.relationship), record])
  );

  const perfectlyMatchedMembers = [];

  // Process HR data if available
  if (hrData.length > 0) {
    hrData.forEach(hrRecord => {
      const insurerRecord = findMatchingRecord(hrRecord, insurerMaps);
      const genomeRecord = findMatchingRecord(hrRecord, genomeMaps);

      if (insurerRecord && genomeRecord) {
        const mismatches = compareFields(hrRecord, insurerRecord, genomeRecord, policyType);
        if (mismatches.length > 0) {
          dataMismatch.push({
            ...hrRecord,
            slab_id: calculateSlabId(Number(hrRecord.sum_insured), slabMapping),
            mismatch: mismatches.join('; ')
          });
          tobeEndorsed_edit.members.push({
            ...hrRecord,
            slab_id: calculateSlabId(Number(hrRecord.sum_insured), slabMapping),
            mismatch: mismatches.join('; ')
          });
        }
        if (mismatches.length === 0) {
          perfectlyMatchedMembers.push({
            ...hrRecord,
            slab_id: calculateSlabId(Number(hrRecord.sum_insured), slabMapping)
          });
        }
      } else if (!insurerRecord && !genomeRecord) {
        // New addition
        if (!isDuplicate(hrRecord, addData)) {
          const newRecord = {
            ...hrRecord,
            slab_id: calculateSlabId(Number(hrRecord.sum_insured), slabMapping),
            remark: 'New HR Addition'
          };
          addData.push(newRecord);
          tobeEndorsed_add.members.push(newRecord);
        }
      } else if (insurerRecord && !genomeRecord) {
        if (!addKeys.has(createUniqueKey(hrRecord))) {
          const newRecord = {
            ...hrRecord,
            slab_id: calculateSlabId(Number(hrRecord.sum_insured), slabMapping),
            remark: 'HR✅, LOOP❌, IC✅'
          };
          addData.push(newRecord);
          addKeys.add(createUniqueKey(hrRecord));
          tobeEndorsed_add_manual.members.push(newRecord);
        }
      } else if (!insurerRecord && genomeRecord) {
        if (!addKeys.has(createUniqueKey(hrRecord))) {
          const newRecord = {
            ...hrRecord,
            slab_id: calculateSlabId(Number(hrRecord.sum_insured), slabMapping),
            remark: 'HR✅, LOOP✅, IC❌'
          };
          addData.push(newRecord);
          addKeys.add(createUniqueKey(hrRecord));
          tobeEndorsed_add_manual.members.push(newRecord);
        }
      }
    });
  } else {
    // When no HR data, check mismatches between Insurer and Genome
    insurerData.forEach(insurerRecord => {
      const genomeRecord = findMatchingRecord(insurerRecord, genomeMaps);
      
      if (genomeRecord) {
        const mismatches = compareFields(null, insurerRecord, genomeRecord, policyType);
        if (mismatches.length > 0) {
          dataMismatch.push({
            ...genomeRecord,
            slab_id: calculateSlabId(Number(genomeRecord.sum_insured), slabMapping),
            mismatch: mismatches.join('; ')
          });
          tobeEndorsed_edit.members.push({
            ...genomeRecord,
            slab_id: calculateSlabId(Number(genomeRecord.sum_insured), slabMapping),
            mismatch: mismatches.join('; ')
          });
        }
        if (mismatches.length === 0) {
          perfectlyMatchedMembers.push({
            ...genomeRecord,
            slab_id: calculateSlabId(Number(genomeRecord.sum_insured), slabMapping)
          });
        }
      }
    });
  }

  // Handle offboarding scenarios
  insurerData.forEach(insurerRecord => {
    if (hrData.length > 0) {
      const inHR = findMatchingRecord(insurerRecord, hrMaps);
      const inGenome = findMatchingRecord(insurerRecord, genomeMaps);
  
      if (!inHR && inGenome && !isDuplicate(insurerRecord, offboardSheet)) {
        if (!offboardKeys.has(createUniqueKey(insurerRecord))) {
          const offboardRecord = {
            ...insurerRecord,
            user_id: inGenome?.user_id,
            slab_id: calculateSlabId(Number(insurerRecord.sum_insured), slabMapping),
            remark: 'HR❌, LOOP✅, IC✅'
          };
          offboardSheet.push(offboardRecord);
          offboardKeys.add(createUniqueKey(insurerRecord));
          toBeEndorsed_offboard_conf.members.push(offboardRecord);
        }
      } else if (!inHR && !inGenome) {
        const offboardRecord = {
          ...insurerRecord,
          slab_id: calculateSlabId(Number(insurerRecord.sum_insured), slabMapping),
          remark: 'HR❌, LOOP❌, IC✅'
        };
        offboardSheet2.push(offboardRecord);
        toBeEndorsed_offboard_conf_manual.members.push(offboardRecord);
      }
    } else {
      const inGenome = findMatchingRecord(insurerRecord, genomeMaps);
      if (!inGenome) {
        const offboardRecord = {
          ...insurerRecord,
          slab_id: calculateSlabId(Number(insurerRecord.sum_insured), slabMapping),
          remark: 'LOOP❌, IC✅'
        };
        offboardSheet2.push(offboardRecord);
        toBeEndorsed_offboard_conf_manual.members.push(offboardRecord);
      }
    }
  });

  genomeData.forEach(genomeRecord => {
    if (hrData?.length > 0) {
      const inHR = findMatchingRecord(genomeRecord, hrMaps);
      const inInsurer = findMatchingRecord(genomeRecord, insurerMaps);
      if (!inHR && !inInsurer && !offboardSheet2.some(r => createUniqueKey(r) === createUniqueKey(genomeRecord))) {
        const offboardRecord = {
          ...genomeRecord,
          slab_id: calculateSlabId(Number(genomeRecord.sum_insured), slabMapping),
          remark: 'HR❌, LOOP✅, IC❌'
        };
        offboardSheet2.push(offboardRecord);
        toBeEndorsed_offboard_or_add.members.push(offboardRecord);
      }
    } else {
      const inInsurer = findMatchingRecord(genomeRecord, insurerMaps);
      if (!inInsurer && !offboardSheet2.some(r => createUniqueKey(r) === createUniqueKey(genomeRecord))) {
        const offboardRecord = {
          ...genomeRecord,
          slab_id: calculateSlabId(Number(genomeRecord.sum_insured), slabMapping),
          remark: 'LOOP✅, IC❌'
        };
        offboardSheet2.push(offboardRecord);
        toBeEndorsed_offboard_or_add.members.push(offboardRecord);
      }
    }
  });

  // Process SELF/SPOUSE duplicates
  const addDataOnlyHRAdditions = addData?.filter((record) => record?.remark === "New HR Addition");
  const processedOnlyHRAdditions = addDataOnlyHRAdditions.filter(record => {
    const relationship = normalizeRelationship(record.relationship);
    if (!['SELF', 'SPOUSE'].includes(relationship)) {
      return true; // Keep non-SELF/SPOUSE records as is
    }
  
    const relationshipKey = createRelationshipKey(record, relationship);
    const existsInHr = hrSelfSpouseMap.has(relationshipKey);
    const existsInInsurer = insurerSelfSpouseMap.has(relationshipKey);
    const existsInGenome = genomeSelfSpouseMap.has(relationshipKey);
    
    if (existsInInsurer || existsInGenome) {
      // Move to edit data
      const editRecord = {
        ...record,
        mismatch: 'Duplicate SELF/SPOUSE record found'
      };
      editData.push(editRecord);
      tobeEndorsed_edit.members.push({
        ...record,
        slab_id: calculateSlabId(Number(record.sum_insured), slabMapping),
        mismatch: 'Duplicate SELF/SPOUSE record found',
      });
      tobeEndorsed_add.members = tobeEndorsed_add.members?.filter((item) => 
        createUniqueKey(record) !== createUniqueKey(item)
      );
      return false; // Remove from add data
    }
  
    return true; // Keep in add data
  });
  
  return {
    addData: [...addData?.filter((record) => record?.remark !== "New HR Addition"), ...processedOnlyHRAdditions],
    editData,
    dataMismatch,
    offboardSheet,
    offboardSheet2,
    tobeEndorsed_add,
    tobeEndorsed_add_manual,
    tobeEndorsed_edit,
    tobeEndorsed_offboard,
    toBeEndorsed_offboard_conf,
    toBeEndorsed_offboard_conf_manual,
    toBeEndorsed_offboard_or_add,
    perfectMatches: {
      members: perfectlyMatchedMembers,
      message: hrData.length > 0 
        ? 'Members perfectly matched across HR, Insurer, and Loop data' 
        : 'Members perfectly matched between Insurer and Loop data',
      description: hrData.length > 0
        ? 'These members have identical data in HR, Insurer, and Loop systems'
        : 'These members have identical data in Insurer and Loop systems'
    }
  };
};
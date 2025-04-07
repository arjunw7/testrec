import { formatToStandardDate, normalizeRelationship } from './utils';

interface ReconData {
  addData: any[];
  editData: any[];
  dataMismatch: any[];
  offboardSheet: any[];
  offboardSheet2: any[];
  tobeEndorsed_add: any;
  tobeEndorsed_add_manual: any;
  tobeEndorsed_add_ar_update_manual: any;
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
      return value?.toString()?.toLowerCase()?.trim()?.replace(/\s+/g, ' ');
    case 'employee_id':
      return value?.toString()?.toLowerCase()?.trim();
    case 'sum_insured':
      return value?.toString()?.toLowerCase()?.trim();
    default:
      return value?.toString()?.toLowerCase()?.trim();
  }
};

// Create multiple keys for matching records
const createMatchingKeys = (record: any, policyType: any): string[] => {
  const keys = [];
  
  if(policyType === 'GMC') {

    //============KEYS WITH 5 FIELD COMBINATIONS============
    
    // Key 1: EID + name + gender + DOB + relationship -> SI mismatch
    keys.push(['employee_id','name','gender','date_of_birth_dd_mmm_yyyy','relationship']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));
    
    // Key 2: EID + name + gender + DOB + sum insured -> relationship mismatch
    keys.push(['employee_id','name','gender','date_of_birth_dd_mmm_yyyy','sum_insured']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));
    
    // Key 3: EID + name + gender + relationship + sum insured -> DOB mismatch
    keys.push(['employee_id','name','gender','relationship','sum_insured']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    // Key 4: EID + name + dob + relationship + sum insured + gender mismatch
    keys.push(['employee_id','name','date_of_birth_dd_mmm_yyyy','relationship','sum_insured']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    // Key 5: EID + gender + dob + relationship + sum insured -> name mismatch
    keys.push(['employee_id','gender','date_of_birth_dd_mmm_yyyy','relationship','sum_insured']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    // Key 6: name + gender + dob + relationship + sum insured -> EID mismatch
    keys.push(['name','gender','date_of_birth_dd_mmm_yyyy','relationship','sum_insured']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    //============KEYS WITH 4 FIELD COMBINATIONS============

    // MISMATCH of SI along with some other field

    // Key 7: employee_id + name +  dob + relationship -> SI and EID mismatch
    keys.push(['name', 'gender','date_of_birth_dd_mmm_yyyy','relationship']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));
    
    // Key 8: employee id +  name + relationship + gender -> SI and DOB mismatch
    keys.push(['employee_id','name', 'relationship', 'gender']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    // Key 9: employee id +  name + date_of_birth_dd_mmm_yyyy + gender -> SI and relationshp mismatch
    keys.push(['employee_id','name', 'date_of_birth_dd_mmm_yyyy', 'gender']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));
    
    // Key 10: employee id +  name + relationship + dob -> SI & gender mismatch
    keys.push(['employee_id','name', 'relationship', 'date_of_birth_dd_mmm_yyyy']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));
    
    // Key 11: employee id +  relationship + gender + dob -> SI & name
    keys.push(['employee_id','relationship', 'gender', 'date_of_birth_dd_mmm_yyyy']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    // MISMATCH of RELATIONSHIP along with some other field  

    // Key 12: name + gender + dob + SI -> RELATIONSHIP and EID mismatch
    keys.push(['name', 'gender', 'date_of_birth_dd_mmm_yyyy', 'sum_insured']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    // Key 13: EID + gender + dob + SI -> RELATIONSHIP and name mismatch
    keys.push(['employee_id', 'gender', 'date_of_birth_dd_mmm_yyyy', 'sum_insured']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    // Key 14: EID + name + dob + SI -> RELATIONSHIP and gender mismatch
    keys.push(['employee_id', 'name', 'date_of_birth_dd_mmm_yyyy', 'sum_insured']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    // Key 15: EID + name + gender + SI -> RELATIONSHIP and dob mismatch [This key will give incorrect results if SELF/PARENT or SELF/CHILD have same name and gender]
    keys.push(['employee_id', 'name', 'gender', 'sum_insured']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    // MISMATCH of GENDER along with some other field  

    // Key 16: employee_id + relationship + dob + SI -> GENDER and name mismatch
    keys.push(['employee_id', 'relationship', 'date_of_birth_dd_mmm_yyyy', 'sum_insured']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    // Key 17: name + relationship + dob + SI -> GENDER and EID mismatch
    keys.push(['name', 'relationship', 'date_of_birth_dd_mmm_yyyy', 'sum_insured']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    // Key 18: employee_id + name + relationship + SI -> GENDER and DOB mismatch
    keys.push(['employee_id', 'name', 'relationship', 'sum_insured']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    // MISMATCH of DOB along with some other field  

    // Key 19: employee_id + relationship + gender + SI -> DOB and name mismatch
    keys.push(['employee_id', 'relationship', 'gender', 'sum_insured']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    // Key 20: name + relationship + gender + SI -> DOB and EID mismatch
    keys.push(['name', 'relationship', 'gender', 'sum_insured']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    // MISMATCH of Name along with some other field

    // Key 21: relationship + gender + DOB + SI -> Name and EID mismatch
    // keys.push(['relationship', 'gender', 'date_of_birth_dd_mmm_yyyy', 'sum_insured']
    //   .map(field => normalizeFieldValue(field, record[field])).join('|'));
      
  } else {
    // Key 1: name + gender + sum_insured + ctc -> eid
    keys.push(['name','gender','sum_insured','ctc']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    // Key 2: employee_id + gender + sum_insured + ctc -> name
    keys.push(['employee_id','gender','sum_insured','ctc']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));
     
    // Key 3: employee_id + name + sum_insured + ctc -> gender
    keys.push(['employee_id','name','sum_insured','ctc']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    // Key 4: employee_id + name + gender + sum_insured -> ctc
    keys.push(['employee_id','name','gender', 'sum_insured']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));

    // Key 5: employee_id + name + gender + ctc -> SI
    keys.push(['employee_id','name','gender','ctc']
      .map(field => normalizeFieldValue(field, record[field])).join('|'));
    
  }
  return keys;
};

// Function to find matching record using multiple keys
const findMatchingRecord = (record: any, records: Map<string, any>[], policyType: any): any => {
  const keys = createMatchingKeys(record, policyType);
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
  const name = record.name?.replace(/\s+/g, ' ') || '';
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
  const mismatches: {
    fields: string[];
    hr: string[];
    insurer: string[];
    genome: string[];
  } = {
    fields: [],
    hr: [],
    insurer: [],
    genome: []
  };
  const fieldsToCompare = policyType === 'GMC' ? [
    { key: 'name', label: 'Name', normalize: (value: string) => value?.toString()?.trim()?.toLowerCase() },
    { key: 'employee_id', label: 'Employee ID', normalize: (value: string) => value?.toString()?.trim()?.toLowerCase() },
    { key: 'relationship', label: 'Relationship', normalize: (value: string) => normalizeRelationship(value?.toString())?.toLowerCase() },
    { key: 'gender', label: 'Gender', normalize: (value: string) => value?.toString()?.toLowerCase() },
    { key: 'date_of_birth_dd_mmm_yyyy', label: 'DOB', normalize: (value: string) => formatToStandardDate(value) },
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
          mismatches.fields.push(field.label);
          mismatches.hr.push(hrRecord[field.key]?.toString()?.toProperCase());
          mismatches.insurer.push(insurerRecord[field.key]?.toString()?.toProperCase());
          mismatches.genome.push(genomeRecord[field.key]?.toString()?.toProperCase());
        }
      }
    } else {
      // 2-way comparison between Insurer and Genome when no HR data
      if (values.insurer && values.genome && values.insurer !== values.genome) {
        mismatches.fields.push(field.label);
        mismatches.insurer.push(insurerRecord[field.key]?.toString()?.toProperCase());
        mismatches.genome.push(genomeRecord[field.key]?.toString()?.toProperCase());
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
    message: 'Member additions due to inconsistency between rosters',
    description: 'These members are missing from either Loop or insurers roster.',
    action: 'Please add these members manually in the upcoming endorsement.'
  };

  const tobeEndorsed_add_ar_update_manual = {
    members: [],
    message: 'Inactive members in Genome present in HR/insurer data',
    description: 'These members are inactive in Genome\'s active roster but are present in insurer/HR data.',
    action: 'Please validate if these members need to be activated in Genome.'
  }

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
    createMatchingKeys(record, policyType).forEach(key => {
      const map = new Map();
      map.set(key, record);
      maps.push(map);
    });
    return maps;
  }).flat();

  const insurerMaps = insurerData.map(record => {
    const maps: Map<string, any>[] = [];
    createMatchingKeys(record, policyType).forEach(key => {
      const map = new Map();
      map.set(key, record);
      maps.push(map);
    });
    return maps;
  }).flat();

  const genomeMaps = genomeData.map(record => {
    const maps: Map<string, any>[] = [];
    createMatchingKeys(record, policyType).forEach(key => {
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
      const insurerRecord = findMatchingRecord(hrRecord, insurerMaps, policyType);
      const genomeRecord = findMatchingRecord(hrRecord, genomeMaps, policyType);

      if (insurerRecord && genomeRecord) {
        const mismatches = compareFields(hrRecord, insurerRecord, genomeRecord, policyType);
        if (mismatches.fields?.length > 0 && genomeRecord?.is_active === 'Yes' && insurerRecord?.is_active === 'Yes') {
          dataMismatch.push({
            ...hrRecord,
            user_id: genomeRecord?.user_id,
            slab_id: calculateSlabId(Number(hrRecord.sum_insured), slabMapping),
            mismatch_fields: mismatches.fields.join(', '),
            hr_values: mismatches.hr.join(', '),
            insurer_values: mismatches.insurer.join(', '),
            genome_values: mismatches.genome.join(', ')
          });
          tobeEndorsed_edit.members.push({
            ...hrRecord,
            user_id: genomeRecord?.user_id,
            slab_id: calculateSlabId(Number(hrRecord.sum_insured), slabMapping),
            mismatch_fields: mismatches.fields.join(', '),
            hr_values: mismatches.hr.join(', '),
            insurer_values: mismatches.insurer.join(', '),
            genome_values: mismatches.genome.join(', ')
          });
        }
        if (mismatches.fields?.length === 0 && genomeRecord?.is_active === 'Yes' && insurerRecord?.is_active === 'Yes') {
          perfectlyMatchedMembers.push({
            ...genomeRecord,
            slab_id: calculateSlabId(Number(hrRecord.sum_insured), slabMapping)
          });
        } else if(mismatches.fields?.length === 0 && genomeRecord?.is_active === 'No' && insurerRecord?.is_active === 'Yes') {
          const newRecord = {
            ...genomeRecord,
            slab_id: calculateSlabId(Number(genomeRecord.sum_insured), slabMapping),
            remark: 'Update Active Roster',
          };
          addData.push(newRecord);
          tobeEndorsed_add_ar_update_manual.members.push({
            ...genomeRecord,
            slab_id: calculateSlabId(Number(genomeRecord.sum_insured), slabMapping),
            remark: 'Inactive in Genome but present in HR/Insurer roster.',
          });
       }
       //TO DO: what to do if members in inactive in insurer and active in genome - ADD THEM TO ADD SHEET IN GENOME
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
      } else if (insurerRecord && !genomeRecord && insurerRecord?.is_active === 'Yes') {
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
        //TO DO: what to do if members in inactive in insurer and missing in genome - ADD THEM TO ADD SHEET FOR HR CONFIRMATION
      } else if (!insurerRecord && genomeRecord && genomeRecord?.is_active === 'Yes') {
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
        //TO DO: what to do if members in inactive in genome and missing in insurer - ADD THEM TO ADD SHEET FOR HR CONFIRMATION
      }
    });
  } else {
    // When no HR data, check mismatches between Insurer and Genome
    insurerData.forEach(insurerRecord => {
      const genomeRecord = findMatchingRecord(insurerRecord, genomeMaps, policyType);
      if (genomeRecord) {
        // TO DO : what to do if the member is inactive in genome? if inactive, add to update active roster sheet
        const mismatches = compareFields(null, insurerRecord, genomeRecord, policyType);
        if (mismatches.fields?.length > 0 && genomeRecord?.is_active === 'Yes' && insurerRecord?.is_active === 'Yes') {
          dataMismatch.push({
            ...genomeRecord,
            slab_id: calculateSlabId(Number(genomeRecord.sum_insured), slabMapping),
            mismatch_fields: mismatches.fields.join(', '),
            hr_values: mismatches.hr.join(', '),
            insurer_values: mismatches.insurer.join(', '),
            genome_values: mismatches.genome.join(', ')
          });
          tobeEndorsed_edit.members.push({
            ...genomeRecord,
            slab_id: calculateSlabId(Number(genomeRecord.sum_insured), slabMapping),
            mismatch_fields: mismatches.fields.join(', '),
            hr_values: mismatches.hr.join(', '),
            insurer_values: mismatches.insurer.join(', '),
            genome_values: mismatches.genome.join(', ')
          });
        }
        if (mismatches.fields?.length === 0 && genomeRecord?.is_active === 'Yes' && insurerRecord?.is_active === 'Yes') {
          perfectlyMatchedMembers.push({
            ...genomeRecord,
            slab_id: calculateSlabId(Number(genomeRecord.sum_insured), slabMapping)
          });
        } else if(mismatches.fields?.length === 0 && genomeRecord?.is_active === 'No' && insurerRecord?.is_active === 'Yes') {
          const newRecord = {
            ...genomeRecord,
            slab_id: calculateSlabId(Number(genomeRecord.sum_insured), slabMapping),
            remark: 'Update Active Roster',
          };
          addData.push(newRecord);
          tobeEndorsed_add_ar_update_manual.members.push({
            ...genomeRecord,
            slab_id: calculateSlabId(Number(genomeRecord.sum_insured), slabMapping),
            remark: 'Inactive in Genome but present in HR/Insurer roster.',
          });
        }
        // TO DO: what to do if member is inactive in insurer but active in genome - ADD TO OFFBOARD SHEET
      }
    });
  }

  // Handle offboarding scenarios
  insurerData.forEach(insurerRecord => {
    if (hrData.length > 0) {
      const inHR = findMatchingRecord(insurerRecord, hrMaps, policyType);
      const inGenome = findMatchingRecord(insurerRecord, genomeMaps, policyType);
  
      if (!inHR && inGenome && !isDuplicate(insurerRecord, offboardSheet) && (insurerRecord?.is_active === 'Yes' || inGenome?.is_active === 'Yes')) {
        // TO DO : what to do if the member is inactive in genome?
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
      } else if (!inHR && !inGenome && insurerRecord?.is_active === 'Yes') {
        const offboardRecord = {
          ...insurerRecord,
          slab_id: calculateSlabId(Number(insurerRecord.sum_insured), slabMapping),
          remark: 'HR❌, LOOP❌, IC✅'
        };
        offboardSheet2.push(offboardRecord);
        toBeEndorsed_offboard_conf_manual.members.push(offboardRecord);
      }
    } else {
      const inGenome = findMatchingRecord(insurerRecord, genomeMaps, policyType);
      if (!inGenome && insurerRecord?.is_active === 'Yes') {
        if (!addKeys.has(createUniqueKey(insurerRecord))) {
          const newRecord = {
            ...insurerRecord,
            slab_id: calculateSlabId(Number(insurerRecord.sum_insured), slabMapping),
            remark: 'LOOP❌, IC✅'
          };
          addData.push(newRecord);
          addKeys.add(createUniqueKey(insurerRecord));
          tobeEndorsed_add_manual.members.push(newRecord);
        } 
      }
    }
  });

  genomeData.forEach(genomeRecord => {
    if (hrData?.length > 0) {
      const inHR = findMatchingRecord(genomeRecord, hrMaps, policyType);
      const inInsurer = findMatchingRecord(genomeRecord, insurerMaps, policyType);
      if (!inHR && !inInsurer && !addKeys.has(createUniqueKey(genomeRecord)) && genomeRecord?.is_active === 'Yes') {
        const newRecord = {
          ...genomeRecord,
          slab_id: calculateSlabId(Number(genomeRecord.sum_insured), slabMapping),
          remark: 'HR❌, LOOP✅, IC❌'
        };
        addData.push(newRecord);
        addKeys.add(createUniqueKey(genomeRecord));
        toBeEndorsed_offboard_or_add.members.push(newRecord);
      }
    } else {
      const inInsurer = findMatchingRecord(genomeRecord, insurerMaps, policyType);
      if ((!inInsurer || inInsurer?.is_active === 'No') && !addKeys.has(createUniqueKey(genomeRecord)) && genomeRecord?.is_active === 'Yes') {
        const newRecord = {
          ...genomeRecord,
          slab_id: calculateSlabId(Number(genomeRecord.sum_insured), slabMapping),
          remark: 'LOOP✅, IC❌'
        };
        addData.push(newRecord);
        addKeys.add(createUniqueKey(genomeRecord));
        toBeEndorsed_offboard_or_add.members.push(newRecord);
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
    tobeEndorsed_add_ar_update_manual,
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
import { Field } from './types';

export const HR_FIELDS = [
  {
    key: "employee_id",
    label: "Employee ID",
    type: "string",
    isMandatory: true
  },
  {
    key: "relationship",
    label: "Relationship",
    type: "string",
    isMandatory: true
  },
  {
    key: "name",
    label: "Name",
    type: "string",
    isMandatory: true
  },
  {
    key: "gender",
    label: "Gender",
    type: "string",
    isMandatory: true
  },
  {
    key: "date_of_birth_dd_mmm_yyyy",
    label: "Date of Birth",
    type: "date",
    isMandatory: true
  },
  {
    key: "sum_insured",
    label: "Sum Insured",
    type: "string",
    isMandatory: true
  },
  {
    key: "mobile",
    label: "Mobile",
    type: "string",
    isMandatory: false
  },
  {
    key: "email_address",
    label: "Email",
    type: "string",
    isMandatory: false
  },
  {
    key: "ctc",
    label: "CTC",
    type: "string",
    isMandatory: false
  },
  {
    key: "coverage_start_date_dd_mmm_yyyy",
    label: "Coverage Start Date",
    type: "date",
    isMandatory: false
  }
];

export const INSURER_FIELDS = [
  {
    key: "employee_id",
    label: "Employee ID",
    type: "string",
    isMandatory: true
  },
  {
    key: "name",
    label: "Name",
    type: "string",
    isMandatory: true
  },
  {
    key: "relationship",
    label: "Relationship",
    type: "string",
    isMandatory: true
  },
  {
    key: "gender",
    label: "Gender",
    type: "string",
    isMandatory: true
  },
  {
    key: "date_of_birth_dd_mmm_yyyy",
    label: "Date of Birth",
    type: "date",
    isMandatory: true
  },
  {
    key: "sum_insured",
    label: "Sum Insured",
    type: "string",
    isMandatory: true
  },
  {
    key: "slab_id",
    label: "Slab ID",
    type: "string",
    isMandatory: false
  },
  {
    key: "coverage_start_date_dd_mmm_yyyy",
    label: "Coverage Start Date",
    type: "date",
    isMandatory: false
  },
];

export const GENOME_FIELDS = [
  {
    key: "user_id",
    label: "User ID",
    type: "string",
    isMandatory: true
  },
  {
    key: "is_active",
    label: "Active",
    type: "enum",
    isMandatory: true,
    config: {
      options: [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" }
      ]
    }
  },
  {
    key: "employee_id",
    label: "Employee ID",
    type: "string",
    isMandatory: true
  },
  {
    key: "name",
    label: "Name",
    type: "string",
    isMandatory: true
  },
  {
    key: "relationship",
    label: "Relationship",
    type: "string",
    isMandatory: true
  },
  {
    key: "gender",
    label: "Gender",
    type: "string",
    isMandatory: true
  },
  {
    key: "date_of_birth_dd_mmm_yyyy",
    label: "Date of Birth",
    type: "date",
    isMandatory: true
  },
  {
    key: "sum_insured",
    label: "Sum Insured",
    type: "string",
    isMandatory: true
  },
  {
    key: "slab_id",
    label: "Slab ID",
    type: "string",
    isMandatory: false
  },
  {
    key: "mobile",
    label: "Mobile",
    type: "string",
    isMandatory: false
  },
  {
    key: "email_address",
    label: "Email",
    type: "string",
    isMandatory: false
  },
  {
    key: "ctc",
    label: "CTC",
    type: "string",
    isMandatory: false
  },
  {
    key: "coverage_start_date_dd_mmm_yyyy",
    label: "Coverage Start Date",
    type: "date",
    isMandatory: false
  },
  {
    key: "enrolment_due_date_dd_mmm_yyyy",
    label: "Enrolment Due Date",
    type: "date",
    isMandatory: true
  }
];

export const ADD_FIELDS: Field[] = [
  {
    key: "employee_id",
    label: "Employee ID",
    type: "string",
    isMandatory: true
  },
  {
    key: "name",
    label: "Name",
    type: "string",
    isMandatory: true
  },
  {
    key: "gender",
    label: "Gender",
    type: "string",
    isMandatory: true
  },
  {
    key: "relationship",
    label: "Relationship",
    type: "string",
    isMandatory: true
  },
  {
    key: "date_of_birth_dd_mmm_yyyy",
    label: "Date of Birth",
    type: "date",
    isMandatory: true
  },
  {
    key: "sum_insured",
    label: "Sum Insured",
    type: "string",
    isMandatory: true
  },
  {
    key: "slab_id",
    label: "Slab ID",
    type: "string",
    isMandatory: false
  },
  {
    key: "mobile",
    label: "Mobile",
    type: "string",
    isMandatory: false
  },
  {
    key: "email_address",
    label: "Email",
    type: "string",
    isMandatory: false
  },
  {
    key: "ctc",
    label: "CTC",
    type: "string",
    isMandatory: false
  },
  {
    key: "coverage_start_date_dd_mmm_yyyy",
    label: "Coverage Start Date",
    type: "date",
    isMandatory: false
  },
  {
    key: "enrolment_due_date_dd_mmm_yyyy",
    label: "Enrolment Due Date",
    type: "date",
    isMandatory: false
  },
  {
    key: "remark",
    label: "Remark",
    type: "string",
    isMandatory: false
  }
];

export const EDIT_FIELDS: Field[] = [
  ...ADD_FIELDS?.filter((i) => i?.key !== 'remark'),
  {
    key: "mismatch",
    label: "Mismatch",
    type: "string",
    isMandatory: false
  }
];

export const OFFBOARD_FIELDS: Field[] = [
  {
    key: "user_id",
    label: "User ID",
    type: "string",
    isMandatory: true
  },
  {
    key: "employee_id",
    label: "Employee ID",
    type: "string",
    isMandatory: true
  },
  {
    key: "name",
    label: "Name",
    type: "string",
    isMandatory: true
  },
  {
    key: "relationship",
    label: "Relationship",
    type: "string",
    isMandatory: true
  },
  {
    key: "date_of_leaving_dd_mmm_yyyy",
    label: "Date of Leaving",
    type: "date",
    isMandatory: true
  },
  {
    key: "policy_exception",
    label: "Policy Exception",
    type: "string",
    isMandatory: false
  },
  {
    key: "remark",
    label: "Remark",
    type: "string",
    isMandatory: false
  }
];
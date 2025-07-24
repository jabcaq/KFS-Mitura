// Complete mapping of all select field options from Airtable
// Generated: 2025-07-24 from actual Airtable schema

export const SELECT_OPTIONS = {
  // Company table (Dane podmiotu) - select fields
  company_size: ["mikro", "mały", "średni", "duży", "inne"],
  balance_under_2m: ["tak", "nie"],
  status: ["Szkic", "Wysłane", "W trakcie", "Zaakceptowane"],
  responsible_person: ["Rafał", "Karolina", "Karol", ""],
  account_not_interest_bearing: ["tak", "nie"], // Boolean field mapped to select
  
  // Employee table (Pracownicy) - select fields  
  gender: ["M", "K"],
  education: [
    "podstawowe", 
    "gimnazjalne", 
    "zawodowe", 
    "srednie ogólnokształcące", 
    "średnie zawodowe", 
    "policealne", 
    "wyższe"
  ],
  contract_type: [
    "umowa o prace", 
    "umowa zlecenie", 
    "umowa dzielo", 
    "b2b", 
    "powolanie", 
    "inne", 
    "właściciel firmy"
  ]
} as const;

// Type definitions for better TypeScript support
export type CompanySize = typeof SELECT_OPTIONS.company_size[number];
export type BalanceUnder2M = typeof SELECT_OPTIONS.balance_under_2m[number];
export type Status = typeof SELECT_OPTIONS.status[number];
export type ResponsiblePerson = typeof SELECT_OPTIONS.responsible_person[number];
export type Gender = typeof SELECT_OPTIONS.gender[number];
export type Education = typeof SELECT_OPTIONS.education[number];
export type ContractType = typeof SELECT_OPTIONS.contract_type[number];

// Helper function to validate select values
export const isValidSelectOption = <T extends keyof typeof SELECT_OPTIONS>(
  field: T, 
  value: string
): boolean => {
  return (SELECT_OPTIONS[field] as readonly string[]).includes(value);
};

// Export individual field options for easier imports
export const COMPANY_SIZE_OPTIONS = SELECT_OPTIONS.company_size;
export const BALANCE_UNDER_2M_OPTIONS = SELECT_OPTIONS.balance_under_2m;
export const STATUS_OPTIONS = SELECT_OPTIONS.status;
export const RESPONSIBLE_PERSON_OPTIONS = SELECT_OPTIONS.responsible_person;
export const GENDER_OPTIONS = SELECT_OPTIONS.gender;
export const EDUCATION_OPTIONS = SELECT_OPTIONS.education;
export const CONTRACT_TYPE_OPTIONS = SELECT_OPTIONS.contract_type;
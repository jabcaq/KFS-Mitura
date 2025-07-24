// Utilities for text formatting and normalization

/**
 * Capitalize first letter of each word, handling Polish characters
 */
export const capitalizeWords = (text: string): string => {
  if (!text) return '';
  
  return text
    .split(' ')
    .map(word => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

/**
 * Capitalize only the first letter of the entire string
 */
export const capitalizeFirst = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Format education level for display
 */
export const formatEducation = (education: string): string => {
  if (!education) return '';
  
  const educationMap: Record<string, string> = {
    'podstawowe': 'Podstawowe',
    'gimnazjalne': 'Gimnazjalne', 
    'zawodowe': 'Zawodowe',
    'srednie ogólnokształcące': 'Średnie ogólnokształcące',
    'średnie ogólnokształcące': 'Średnie ogólnokształcące',
    'srednie zawodowe': 'Średnie zawodowe',
    'średnie zawodowe': 'Średnie zawodowe',
    'policealne': 'Policealne',
    'wyższe': 'Wyższe'
  };
  
  return educationMap[education] || capitalizeFirst(education);
};

/**
 * Format contract type for display
 */
export const formatContractType = (contractType: string): string => {
  if (!contractType) return '';
  
  const contractMap: Record<string, string> = {
    'umowa o prace': 'Umowa o pracę',
    'umowa o pracę': 'Umowa o pracę',
    'umowa zlecenie': 'Umowa zlecenie',
    'umowa dzielo': 'Umowa dzieło',
    'umowa dzieło': 'Umowa dzieło',
    'b2b': 'B2B',
    'powolanie': 'Powołanie',
    'inne': 'Inne',
    'właściciel firmy': 'Właściciel firmy',
    'wlasciciel firmy': 'Właściciel firmy'
  };
  
  return contractMap[contractType] || capitalizeFirst(contractType);
};

/**
 * Format company size for display
 */
export const formatCompanySize = (size: string): string => {
  if (!size) return '';
  
  const sizeMap: Record<string, string> = {
    'mikro': 'Mikro',
    'mały': 'Mały',
    'maly': 'Mały',
    'średni': 'Średni',
    'sredni': 'Średni',
    'duży': 'Duży',
    'duzy': 'Duży',
    'inne': 'Inne'
  };
  
  return sizeMap[size] || capitalizeFirst(size);
};

/**
 * Format gender for display
 */
export const formatGender = (gender: string): string => {
  if (!gender) return '';
  
  const genderMap: Record<string, string> = {
    'M': 'Mężczyzna',
    'm': 'Mężczyzna',
    'K': 'Kobieta',
    'k': 'Kobieta'
  };
  
  return genderMap[gender] || gender;
};

/**
 * Normalize old values with underscores to new values with spaces
 * This handles legacy data from localStorage or old database records
 */
export const normalizeEmployeeData = (employee: any): any => {
  if (!employee) return employee;
  
  const normalized = { ...employee };
  
  // Normalize education values
  const educationMap: Record<string, string> = {
    'srednie_ogolne': 'srednie ogólnokształcące',
    'srednie_zawodowe': 'średnie zawodowe',
    'wyzsze': 'wyższe', // Handle old spelling
  };
  
  if (normalized.education && educationMap[normalized.education]) {
    normalized.education = educationMap[normalized.education];
  }
  
  // Normalize contract type values
  const contractMap: Record<string, string> = {
    'umowa_o_prace': 'umowa o prace',
    'umowa_zlecenie': 'umowa zlecenie',
    'umowa_dzielo': 'umowa dzielo',
    'wlasciciel': 'właściciel firmy',
  };
  
  if (normalized.contract_type && contractMap[normalized.contract_type]) {
    normalized.contract_type = contractMap[normalized.contract_type];
  }
  
  return normalized;
};
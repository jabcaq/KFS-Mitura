import type { CompanyData } from '../types';

// Use our backend proxy instead of direct API call
const GUS_PROXY_URL = '/api/gus';
const KAS_PROXY_URL = '/api/kas';

export interface KASCompanyData {
  subject: {
    name: string;
    nip: string;
    statusVat: string;
    regon: string;
    pesel?: string;
    krs?: string;
    residenceAddress?: string;
    workingAddress?: string;
    representatives?: Array<{
      companyName: string;
      firstName: string;
      lastName: string;
      pesel: string;
      nip: string;
    }>;
    authorizedClerks?: Array<{
      companyName: string;
      firstName: string;
      lastName: string;  
      pesel: string;
      nip: string;
    }>;
    partners?: Array<{
      companyName: string;
      firstName: string;
      lastName: string;
      pesel: string;
      nip: string;
    }>;
    registrationLegalDate?: string;
    accountNumbers?: string[];
    hasVirtualAccounts?: boolean;
  };
}

export interface GUSCompanyData {
  id: number;
  typ: string;
  numery: {
    nip: string;
    regon: string;
    krs: string;
  };
  nazwy: {
    pelna: string;
    skrocona?: string;
  };
  adres: {
    ulica?: string;
    nr_domu: string;
    miejscowosc: string;
    kod: string;
    poczta: string;
    panstwo: string;
  };
  stan: {
    forma_prawna: string;
    pkd_przewazajace_dzial: string;
    czy_wykreslona: boolean;
    wielkosc: string;
  };
  glowna_osoba?: {
    id: string;
    imiona_i_nazwisko: string;
  };
  krs_rejestry?: {
    rejestr_przedsiebiorcow_data_wpisu: string;
  };
}

export interface GUSApiResponse {
  success: boolean;
  data?: GUSCompanyData | any; // Can be either GUS or KAS data
  error?: string;
  message?: string;
  source?: 'KAS' | 'GUS';
}

// Function to fetch company data from KAS (free API)
export const fetchCompanyDataFromKAS = async (nip: string): Promise<GUSApiResponse> => {
  try {
    const cleanNip = nip.replace(/[-\s]/g, '');
    
    if (!/^\d{10}$/.test(cleanNip)) {
      return {
        success: false,
        error: 'Nieprawidłowy format NIP. NIP powinien zawierać 10 cyfr.'
      };
    }

    console.log(`🆓 Trying free KAS API for NIP: ${cleanNip}`);

    const response = await fetch(`${KAS_PROXY_URL}?nip=${cleanNip}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🆓 KAS API response:', data);

    if (data.success && data.result && data.result.subject) {
      const subject = data.result.subject;
      console.log('🆓 KAS subject data:', subject);

      console.log('🆓 KAS returning raw result with source');
      const result = {
        success: true,
        data: data.result, // Return raw KAS data
        source: 'KAS' as 'KAS' | 'GUS'
      };
      console.log('🆓 KAS returning result:', result);
      return result;
    }

    return {
      success: false,
      error: 'Brak danych w darmowym API KAS'
    };
  } catch (error) {
    console.error('🆓 KAS API error:', error);
    return {
      success: false,
      error: 'Błąd podczas pobierania danych z darmowego API KAS'
    };
  }
};

// Function to fetch company data from GUS by NIP (through our proxy) - PAID
export const fetchCompanyDataFromGUS = async (nip: string): Promise<GUSApiResponse> => {
  try {
    // Clean NIP - remove dashes and spaces
    const cleanNip = nip.replace(/[-\s]/g, '');
    
    // Validate NIP format (10 digits)
    if (!/^\d{10}$/.test(cleanNip)) {
      return {
        success: false,
        error: 'Nieprawidłowy format NIP. NIP powinien zawierać 10 cyfr.'
      };
    }

    console.log(`💰 Trying paid GUS API for NIP: ${cleanNip} through proxy`);

    const response = await fetch(`${GUS_PROXY_URL}?nip=${cleanNip}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('💰 GUS proxy response:', data);
    
    if (data.success && data.data) {
      return {
        success: true,
        data: data.data,
        source: 'GUS'
      };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Nie znaleziono danych dla podanego NIP'
      };
    }
  } catch (error) {
    console.error('💰 Error fetching GUS data:', error);
    return {
      success: false,
      error: 'Błąd podczas pobierania danych z płatnego API GUS. Sprawdź połączenie internetowe.'
    };
  }
};

// Cascade function: try free KAS first, then paid GUS
export const fetchCompanyDataByNIP = async (nip: string): Promise<GUSApiResponse> => {
  console.log('🔄 Starting cascade search for NIP:', nip);
  
  // Step 1: Try free KAS API
  const kasResult = await fetchCompanyDataFromKAS(nip);
  if (kasResult.success) {
    console.log('✅ Found data in free KAS API');
    return kasResult;
  }
  
  console.log('⚠️ KAS API failed, trying paid GUS API...');
  
  // Step 2: If KAS fails, try paid GUS API
  const gusResult = await fetchCompanyDataFromGUS(nip);
  if (gusResult.success) {
    console.log('✅ Found data in paid GUS API');
    return gusResult;
  }
  
  console.log('❌ Both APIs failed');
  return {
    success: false,
    error: 'Nie znaleziono danych firmy ani w darmowym API KAS, ani w płatnym API GUS'
  };
};

// Function to map KAS data to our CompanyData format
export const mapKASDataToCompanyData = (kasData: any): Partial<CompanyData> => {
  const subject = kasData.subject || kasData;
  
  // Parse address from KAS format
  const workingAddress = subject.workingAddress || '';
  const addressParts = workingAddress.split(',').map((part: string) => part.trim());
  
  let street = '';
  let postalCode = '';
  let city = '';
  
  if (addressParts.length >= 2) {
    street = addressParts[0] || '';
    const lastPart = addressParts[addressParts.length - 1];
    const postalMatch = lastPart.match(/(\d{2}-\d{3})\s+(.+)/);
    
    if (postalMatch) {
      postalCode = postalMatch[1];
      city = postalMatch[2];
    } else {
      city = lastPart;
    }
  }

  // Try to get representative from KAS data
  let representativePerson = '';
  
  // Check representatives array first
  if (subject.representatives && subject.representatives.length > 0) {
    const rep = subject.representatives[0];
    representativePerson = `${rep.firstName || ''} ${rep.lastName || ''}`.trim();
  }
  
  // If no representatives, check authorized clerks
  if (!representativePerson && subject.authorizedClerks && subject.authorizedClerks.length > 0) {
    const clerk = subject.authorizedClerks[0];
    representativePerson = `${clerk.firstName || ''} ${clerk.lastName || ''}`.trim();
  }
  
  // If no specific person found, leave empty for user to fill
  console.log('🆓 KAS representative data:', { 
    representatives: subject.representatives, 
    authorizedClerks: subject.authorizedClerks,
    selectedRepresentative: representativePerson 
  });

  return {
    company_name: subject.name || '',
    company_nip: formatNIP(subject.nip) || '',
    company_pkd: '', // KAS nie ma PKD - użytkownik musi wypełnić
    company_street: street,
    company_postal_code: postalCode,
    company_city: city,
    company_size: 'mikro' as '' | 'mikro' | 'mały' | 'średni' | 'duży' | 'inne',
    representative_person: representativePerson,
    // Legacy fields for compatibility
    company_address: workingAddress,
    activity_place: workingAddress,
    correspondence_address: workingAddress
  };
};

// Function to map GUS data to our CompanyData format
export const mapGUSDataToCompanyData = (gusData: GUSCompanyData): Partial<CompanyData> => {
  // Build street address
  let street = '';
  if (gusData.adres.ulica) {
    street = `${gusData.adres.ulica} ${gusData.adres.nr_domu}`;
  } else {
    street = gusData.adres.nr_domu;
  }

  // Build full address for legacy fields
  const fullAddress = `${street}, ${gusData.adres.kod} ${gusData.adres.miejscowosc}`;

  // Extract PKD code from description (try to find pattern like "62.01.Z")
  const pkdMatch = gusData.stan.pkd_przewazajace_dzial.match(/(\d{2}\.\d{2}\.[\w])/);
  const pkdCode = pkdMatch ? pkdMatch[1] : '';

  // Use company size from GUS data
  let companySize = '';
  switch(gusData.stan.wielkosc?.toLowerCase()) {
    case 'mikro':
      companySize = 'mikro';
      break;
    case 'mały':
    case 'mala':
      companySize = 'mały';
      break;
    case 'średni':
    case 'sredni':
      companySize = 'średni';
      break;
    case 'duży':
    case 'duzy':
      companySize = 'duży';
      break;
    default:
      companySize = 'mikro'; // default for most companies
  }

  // Use representative person from GUS data
  const representativePerson = gusData.glowna_osoba?.imiona_i_nazwisko || '';

  return {
    company_name: gusData.nazwy.pelna || '',
    company_nip: formatNIP(gusData.numery.nip) || '',
    company_pkd: pkdCode,
    company_street: street,
    company_postal_code: gusData.adres.kod || '',
    company_city: gusData.adres.miejscowosc || '',
    company_size: companySize as '' | 'mikro' | 'mały' | 'średni' | 'duży' | 'inne',
    representative_person: representativePerson,
    // Also set the legacy fields for compatibility
    company_address: fullAddress,
    activity_place: fullAddress,
    correspondence_address: fullAddress
  };
};

// Function to format NIP with dashes
export const formatNIP = (nip: string): string => {
  const cleanNip = nip.replace(/[-\s]/g, '');
  if (cleanNip.length === 10) {
    return `${cleanNip.slice(0, 3)}-${cleanNip.slice(3, 6)}-${cleanNip.slice(6, 8)}-${cleanNip.slice(8, 10)}`;
  }
  return nip;
};

// Function to validate NIP checksum
export const validateNIP = (nip: string): boolean => {
  const cleanNip = nip.replace(/[-\s]/g, '');
  
  if (cleanNip.length !== 10 || !/^\d{10}$/.test(cleanNip)) {
    return false;
  }

  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanNip[i]) * weights[i];
  }
  
  const checksum = sum % 11;
  const lastDigit = parseInt(cleanNip[9]);
  
  return checksum === lastDigit;
};
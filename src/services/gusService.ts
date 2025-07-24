import type { CompanyData } from '../types';

// Use our backend proxy instead of direct API call
const GUS_PROXY_URL = '/api/gus';
const KAS_PROXY_URL = '/api/kas';

export interface KASCompanyData {
  subjects: Array<{
    name: string;
    nip: string;
    statusVat: string;
    regon: string;
    pesel?: string;
    krs?: string;
    residenceAddress: string;
    workingAddress: string;
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
  }>;
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
  data?: GUSCompanyData;
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

    if (data.success && data.result && data.result.subjects && data.result.subjects.length > 0) {
      const subject = data.result.subjects[0];
      
      // Convert KAS data to our format
      const mappedData: Partial<GUSCompanyData> = {
        nazwy: {
          pelna: subject.name
        },
        numery: {
          nip: subject.nip,
          regon: subject.regon || '',
          krs: subject.krs || ''
        },
        adres: {
          // Parse address from KAS format
          nr_domu: '',
          miejscowosc: '',
          kod: '',
          poczta: '',
          panstwo: 'POLSKA'
        }
      };

      // Try to parse address
      if (subject.workingAddress || subject.residenceAddress) {
        const address = subject.workingAddress || subject.residenceAddress;
        const addressParts = address.split(',').map((part: string) => part.trim());
        
        if (addressParts.length >= 2) {
          const lastPart = addressParts[addressParts.length - 1];
          const postalMatch = lastPart.match(/(\d{2}-\d{3})\s+(.+)/);
          
          if (postalMatch) {
            mappedData.adres!.kod = postalMatch[1];
            mappedData.adres!.miejscowosc = postalMatch[2];
            mappedData.adres!.poczta = postalMatch[2];
          }
          
          if (addressParts.length >= 2) {
            mappedData.adres!.ulica = addressParts[0];
            // Extract house number from street
            const streetMatch = addressParts[0].match(/(.+)\s+(\d+.*)/);
            if (streetMatch) {
              mappedData.adres!.ulica = streetMatch[1];
              mappedData.adres!.nr_domu = streetMatch[2];
            }
          }
        }
      }

      return {
        success: true,
        data: mappedData as GUSCompanyData,
        source: 'KAS'
      };
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
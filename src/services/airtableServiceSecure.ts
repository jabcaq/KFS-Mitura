import type {
  AirtableSubmissionResult,
  CompanyData,
  EmployeeCollection,
  Employee
} from '../types';

// Helper function to calculate age from birth date
const calculateAgeFromDate = (birthDate: string): number => {
  if (!birthDate) return 0;
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Helper function to convert age back to approximate birth date for frontend compatibility
const approximateBirthDate = (age: number): string => {
  if (!age || age <= 0) return '';
  
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - age;
  return `${birthYear}-01-01`; // Approximate birth date
};

// Rozszerzony typ zwrotny dla danych aplikacji z submission_id
export interface ApplicationData extends CompanyData {
  submission_id?: string;
}

// Secure configuration - używa backend proxy
const AIRTABLE_CONFIG = {
  proxyUrl: '/api/airtable',
  applicationsTableId: 'tbl2SOkYU0eBG2ZGj',
  employeesTableId: 'tblh7tsaWWwXxBgSi'
};

// Field ID mappings for resilience to field name changes
const COMPANY_FIELD_IDS = {
  submission_id: 'fldb2lUUPqVyg3qHJ',
  submission_date: 'fldCN9HqjH2MXBpV5',
  company_name: 'fldWKTMxAQILBkDKr',
  company_nip: 'fldOrZL39rXQFy41x',
  company_pkd: 'fldFtX8Mzf5HF8Mhd',
  representative_person: 'fldJBWA0L39GHhbzN',
  representative_phone: 'fldVV8Y2CG7AX8pWm',
  representative_email: 'fld2L1bM5FxT4p2Vs',
  contact_person_name: 'fldBtMGRyLrSt6OzZ',
  contact_person_phone: 'fldlxCbkCQbFSSKoH',
  contact_person_email: 'fldFjZGqz6IM5lZLn',
  company_street: 'fld4HKGj5DIQKXV29',
  company_postal_code: 'fldddPZKOJVJrYQ5x',
  company_city: 'fldkNsJM3TaKUZzBV',
  activity_street: 'fldyLBE7UDIgw4Kza',
  activity_postal_code: 'fldBgVyFGf5V6uPrm',
  activity_city: 'fldLw9QPWe2NfN6lQ',
  correspondence_street: 'fldYLQhOPK8F9Cc1W',
  correspondence_postal_code: 'fldxN5Cj8nJV1hUzS',
  correspondence_city: 'fldmLJKgKQe1VVz9c',
  company_address: 'fldXkzqjGrUGqGOzB',
  activity_place: 'fldPWHZF5QWKi1qfp',
  correspondence_address: 'fldnJdrvHqb6y9NDZ',
  bank_name: 'fld5fxPR0q05C7LCE',
  bank_account: 'fldWdZFsN2Q4nTy6n',
  account_not_interest_bearing: 'fldAcKXHX3z32M8XT',
  total_employees: 'fldKzKZbkQYCxglF4',
  company_size: 'fldvXwWNsm9aOZaIv',
  balance_under_2m: 'fldPrAmHTFCBJPo6A',
  status: 'fld2mJSTGy7pGZ9ZV',
  link_do_formularza: 'fldGAYlZU8vRDh7lG'
};

const EMPLOYEE_FIELD_IDS = {
  id: 'fldKUmOLFrSFtjGqH',
  employee_name: 'fld42KA9aezSe7K7k',
  gender: 'fldl8rKWB7NTlJzKa',
  age: 'fldp6hHfLWHs9p4zP',
  date: 'fldGRwfYgr9WOYLbZ',
  education: 'fldQjfALgtcEAjg1m',
  position: 'fldQGMKAJcVwU2lAQ',
  contract_type: 'fldhBZdS4nfT8BHID',
  contract_start: 'fldGWaKLCCJp1v9BD',
  contract_end: 'fldNVYP2qRf5gCp1A',
  application_id: 'fldX8Bp2PpYuVFpjy',
  employees: 'fldkzgfGHnAojhgBH'
};

// Helper function for making secure proxy requests
const makeProxyRequest = async (endpoint: string, options: { method?: string; data?: unknown } = {}) => {
  const response = await fetch(AIRTABLE_CONFIG.proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      method: options.method || 'GET',
      endpoint: endpoint,
      data: options.data || null
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Proxy error: ${response.status} - ${errorData}`);
  }

  return response.json();
};

// Pobieranie ostatniego ID z Airtable przez proxy
export const getLastSubmissionId = async (): Promise<number> => {
  try {
    const endpoint = `${AIRTABLE_CONFIG.applicationsTableId}?maxRecords=1&sort%5B0%5D%5Bfield%5D=${COMPANY_FIELD_IDS.submission_id}&sort%5B0%5D%5Bdirection%5D=desc`;
    const data = await makeProxyRequest(endpoint);
    
    if (data.records && data.records.length > 0) {
      const lastId = data.records[0].fields[COMPANY_FIELD_IDS.submission_id];
      if (lastId && lastId.startsWith('KFS-')) {
        return parseInt(lastId.replace('KFS-', ''), 10);
      }
      return parseInt(lastId, 10) || 0;
    }
    
    return 0;
  } catch (error) {
    console.warn('Nie udało się pobrać ostatniego ID, używam wartości domyślnej:', error);
    return 0;
  }
};

// Generowanie nowego submission ID
export const generateSubmissionId = async (): Promise<string> => {
  const lastId = await getLastSubmissionId();
  const newId = lastId + 1;
  return `KFS-${newId.toString().padStart(4, '0')}`;
};

// Rzeczywiste wysyłanie do Airtable przez proxy
export const submitToAirtable = async (
  formData: CompanyData,
  employees: EmployeeCollection
): Promise<AirtableSubmissionResult> => {
  try {
    const submissionId = await generateSubmissionId();
    console.log('Wygenerowane submission ID:', submissionId);

    // KROK 1: Wyślij dane głównego wniosku
    const applicationData = {
      records: [{
        fields: {
          [COMPANY_FIELD_IDS.submission_id]: submissionId,
          [COMPANY_FIELD_IDS.submission_date]: new Date().toISOString(),
          [COMPANY_FIELD_IDS.company_name]: formData.company_name || '',
          [COMPANY_FIELD_IDS.company_nip]: formData.company_nip || '',
          [COMPANY_FIELD_IDS.company_pkd]: formData.company_pkd || '',
          [COMPANY_FIELD_IDS.representative_person]: formData.representative_person || '',
          [COMPANY_FIELD_IDS.representative_phone]: formData.representative_phone || '',
          [COMPANY_FIELD_IDS.representative_email]: formData.representative_email || '',
          [COMPANY_FIELD_IDS.contact_person_name]: formData.contact_person_name || '',
          [COMPANY_FIELD_IDS.contact_person_phone]: formData.contact_person_phone || '',
          [COMPANY_FIELD_IDS.contact_person_email]: formData.contact_person_email || '',
          [COMPANY_FIELD_IDS.company_street]: formData.company_street || '',
          [COMPANY_FIELD_IDS.company_postal_code]: formData.company_postal_code || '',
          [COMPANY_FIELD_IDS.company_city]: formData.company_city || '',
          [COMPANY_FIELD_IDS.activity_street]: formData.activity_street || '',
          [COMPANY_FIELD_IDS.activity_postal_code]: formData.activity_postal_code || '',
          [COMPANY_FIELD_IDS.activity_city]: formData.activity_city || '',
          [COMPANY_FIELD_IDS.correspondence_street]: formData.correspondence_street || '',
          [COMPANY_FIELD_IDS.correspondence_postal_code]: formData.correspondence_postal_code || '',
          [COMPANY_FIELD_IDS.correspondence_city]: formData.correspondence_city || '',
          [COMPANY_FIELD_IDS.company_address]: formData.company_address || '',
          [COMPANY_FIELD_IDS.activity_place]: formData.activity_place || '',
          [COMPANY_FIELD_IDS.correspondence_address]: formData.correspondence_address || '',
          [COMPANY_FIELD_IDS.bank_name]: formData.bank_name || '',
          [COMPANY_FIELD_IDS.bank_account]: formData.bank_account || '',
          [COMPANY_FIELD_IDS.account_not_interest_bearing]: formData.account_not_interest_bearing || '',
          [COMPANY_FIELD_IDS.total_employees]: parseInt(formData.total_employees, 10) || 0,
          [COMPANY_FIELD_IDS.company_size]: formData.company_size || '',
          [COMPANY_FIELD_IDS.balance_under_2m]: formData.balance_under_2m || '',
          [COMPANY_FIELD_IDS.status]: 'Submitted',
          [COMPANY_FIELD_IDS.link_do_formularza]: `${window.location.origin}/wniosek/RECORD_ID_PLACEHOLDER`
        }
      }]
    };

    const applicationResult = await makeProxyRequest(AIRTABLE_CONFIG.applicationsTableId, {
      method: 'POST',
      data: applicationData
    });

    const applicationRecordId = applicationResult.records[0].id;
    console.log('Utworzono główny rekord wniosku:', applicationRecordId);

    // Update the form link with the actual record ID
    await makeProxyRequest(`${AIRTABLE_CONFIG.applicationsTableId}/${applicationRecordId}`, {
      method: 'PATCH',
      data: {
        fields: {
          [COMPANY_FIELD_IDS.link_do_formularza]: `${window.location.origin}/wniosek/${applicationRecordId}`
        }
      }
    });

    // KROK 2: Wyślij pracowników
    const employeeRecords: Array<{ fields: Record<string, unknown> }> = [];
    let employeeIndex = 1;

    Object.keys(employees).forEach(employeeId => {
      const emp = employees[employeeId];
      const employeeRecord = {
        fields: {
          [EMPLOYEE_FIELD_IDS.id]: `${submissionId}-${employeeIndex}`,
          [EMPLOYEE_FIELD_IDS.employee_name]: emp.name || '',
          [EMPLOYEE_FIELD_IDS.gender]: emp.gender || '',
          [EMPLOYEE_FIELD_IDS.age]: emp.birth_date ? calculateAgeFromDate(emp.birth_date) : null,
          [EMPLOYEE_FIELD_IDS.date]: emp.birth_date || '', // New Date field in Airtable
          [EMPLOYEE_FIELD_IDS.education]: emp.education || '',
          [EMPLOYEE_FIELD_IDS.position]: emp.position || '',
          [EMPLOYEE_FIELD_IDS.contract_type]: emp.contract_type || '',
          [EMPLOYEE_FIELD_IDS.contract_start]: emp.contract_start || '',
          [EMPLOYEE_FIELD_IDS.contract_end]: emp.contract_end || '',
          [EMPLOYEE_FIELD_IDS.application_id]: [applicationRecordId]
        }
      };
      employeeRecords.push(employeeRecord);
      employeeIndex++;
    });

    if (employeeRecords.length > 0) {
      const employeeData = {
        records: employeeRecords
      };

      await makeProxyRequest(AIRTABLE_CONFIG.employeesTableId, {
        method: 'POST',
        data: employeeData
      });

      console.log('Utworzono pracowników');
    }

    return {
      success: true,
      submissionId: submissionId,
      applicationRecordId: applicationRecordId,
      employeeCount: employeeRecords.length
    };

  } catch (error) {
    console.error('Błąd podczas wysyłania do Airtable:', error);
    throw error;
  }
};

// Pobierz dane aplikacji po ID
export const getApplicationById = async (recordId: string): Promise<ApplicationData> => {
  try {
    const data = await makeProxyRequest(`${AIRTABLE_CONFIG.applicationsTableId}/${recordId}`);
    console.log('📊 Pobrane dane aplikacji:', JSON.stringify(data, null, 2));
    const fields = data.fields;
    
    return {
      submission_id: fields[COMPANY_FIELD_IDS.submission_id] || '',
      company_name: fields[COMPANY_FIELD_IDS.company_name] || '',
      company_nip: fields[COMPANY_FIELD_IDS.company_nip] || '',
      company_pkd: fields[COMPANY_FIELD_IDS.company_pkd] || '',
      representative_person: fields[COMPANY_FIELD_IDS.representative_person] || '',
      representative_phone: fields[COMPANY_FIELD_IDS.representative_phone] || '',
      representative_email: fields[COMPANY_FIELD_IDS.representative_email] || '',
      contact_person_name: fields[COMPANY_FIELD_IDS.contact_person_name] || '',
      contact_person_phone: fields[COMPANY_FIELD_IDS.contact_person_phone] || '',
      contact_person_email: fields[COMPANY_FIELD_IDS.contact_person_email] || '',
      company_street: fields[COMPANY_FIELD_IDS.company_street] || '',
      company_postal_code: fields[COMPANY_FIELD_IDS.company_postal_code] || '',
      company_city: fields[COMPANY_FIELD_IDS.company_city] || '',
      activity_street: fields[COMPANY_FIELD_IDS.activity_street] || '',
      activity_postal_code: fields[COMPANY_FIELD_IDS.activity_postal_code] || '',
      activity_city: fields[COMPANY_FIELD_IDS.activity_city] || '',
      correspondence_street: fields[COMPANY_FIELD_IDS.correspondence_street] || '',
      correspondence_postal_code: fields[COMPANY_FIELD_IDS.correspondence_postal_code] || '',
      correspondence_city: fields[COMPANY_FIELD_IDS.correspondence_city] || '',
      company_address: fields[COMPANY_FIELD_IDS.company_address] || '',
      activity_place: fields[COMPANY_FIELD_IDS.activity_place] || '',
      correspondence_address: fields[COMPANY_FIELD_IDS.correspondence_address] || '',
      bank_name: fields[COMPANY_FIELD_IDS.bank_name] || '',
      bank_account: fields[COMPANY_FIELD_IDS.bank_account] || '',
      account_not_interest_bearing: fields[COMPANY_FIELD_IDS.account_not_interest_bearing] || '',
      total_employees: fields[COMPANY_FIELD_IDS.total_employees]?.toString() || '',
      company_size: fields[COMPANY_FIELD_IDS.company_size] || '',
      balance_under_2m: fields[COMPANY_FIELD_IDS.balance_under_2m] || ''
    };
  } catch (error) {
    console.error('Błąd podczas pobierania danych aplikacji:', error);
    throw error;
  }
};

// Pobierz pracowników dla aplikacji
export const getEmployeesByApplicationId = async (applicationRecordId: string): Promise<EmployeeCollection> => {
  try {
    console.log('🔍 Pobieranie pracowników dla aplikacji:', applicationRecordId);
    
    // KROK 1: Pobierz dane aplikacji żeby dostać listę ID pracowników
    const appData = await makeProxyRequest(`${AIRTABLE_CONFIG.applicationsTableId}/${applicationRecordId}`);
    const employeeIds = appData.fields[EMPLOYEE_FIELD_IDS.employees] || [];
    
    console.log('👥 ID pracowników z aplikacji:', employeeIds);

    if (employeeIds.length === 0) {
      console.log('ℹ️ Brak pracowników dla tej aplikacji');
      return {};
    }

    // KROK 2: Pobierz dane każdego pracownika
    const employees: EmployeeCollection = {};
    
    for (let i = 0; i < employeeIds.length; i++) {
      const empId = employeeIds[i];
      console.log(`🔍 Pobieranie pracownika ${i + 1}/${employeeIds.length}:`, empId);
      
      try {
        const empData = await makeProxyRequest(`${AIRTABLE_CONFIG.employeesTableId}/${empId}`);
        const fields = empData.fields;
        
        console.log(`👤 Pracownik ${i + 1} dane:`, {
          id: empData.id,
          name: fields[EMPLOYEE_FIELD_IDS.employee_name],
          position: fields[EMPLOYEE_FIELD_IDS.position],
          contract_start: fields[EMPLOYEE_FIELD_IDS.contract_start]
        });

        employees[i + 1] = {
          id: empData.id,
          name: fields[EMPLOYEE_FIELD_IDS.employee_name] || '',
          gender: fields[EMPLOYEE_FIELD_IDS.gender] || '',
          birth_date: fields[EMPLOYEE_FIELD_IDS.date] || approximateBirthDate(fields[EMPLOYEE_FIELD_IDS.age]) || '',
          education: fields[EMPLOYEE_FIELD_IDS.education] || '',
          position: fields[EMPLOYEE_FIELD_IDS.position] || '',
          contract_type: fields[EMPLOYEE_FIELD_IDS.contract_type] || '',
          contract_start: fields[EMPLOYEE_FIELD_IDS.contract_start] || '',
          contract_end: fields[EMPLOYEE_FIELD_IDS.contract_end] || '',
          isEditing: false,
          isNew: false
        };
      } catch (error) {
        console.warn(`❌ Nie udało się pobrać pracownika ${empId}:`, error);
      }
    }

    console.log('✅ Zwracane pracownicy:', employees);
    return employees;
  } catch (error) {
    console.error('Błąd podczas pobierania pracowników:', error);
    throw error;
  }
};

// Aktualizuj dane aplikacji
export const updateApplication = async (recordId: string, data: Partial<CompanyData>): Promise<void> => {
  try {
    const updateFields: Record<string, unknown> = {};
    
    if (data.company_name !== undefined) updateFields[COMPANY_FIELD_IDS.company_name] = data.company_name;
    if (data.company_nip !== undefined) updateFields[COMPANY_FIELD_IDS.company_nip] = data.company_nip;
    if (data.company_pkd !== undefined) updateFields[COMPANY_FIELD_IDS.company_pkd] = data.company_pkd;
    // Add more field mappings as needed

    const requestBody = {
      fields: updateFields
    };

    await makeProxyRequest(`${AIRTABLE_CONFIG.applicationsTableId}/${recordId}`, {
      method: 'PATCH',
      data: requestBody
    });

    console.log('Dane aplikacji zaktualizowane pomyślnie');
  } catch (error) {
    console.error('Błąd podczas aktualizacji aplikacji:', error);
    throw error;
  }
};

// Aktualizuj pojedynczego pracownika
export const updateEmployee = async (employeeRecordId: string, data: Partial<Employee>): Promise<void> => {
  try {
    const updateFields: Record<string, unknown> = {};
    
    if (data.name !== undefined) updateFields[EMPLOYEE_FIELD_IDS.employee_name] = data.name;
    if (data.gender !== undefined) updateFields[EMPLOYEE_FIELD_IDS.gender] = data.gender;
    if (data.birth_date !== undefined) {
      updateFields[EMPLOYEE_FIELD_IDS.age] = data.birth_date ? calculateAgeFromDate(data.birth_date) : null;
      updateFields[EMPLOYEE_FIELD_IDS.date] = data.birth_date || '';
    }
    // Add more field mappings as needed

    const requestBody = {
      fields: updateFields
    };

    await makeProxyRequest(`${AIRTABLE_CONFIG.employeesTableId}/${employeeRecordId}`, {
      method: 'PATCH',
      data: requestBody
    });

    console.log('Dane pracownika zaktualizowane pomyślnie');
  } catch (error) {
    console.error('Błąd podczas aktualizacji pracownika:', error);
    throw error;
  }
};

// Dodaj nowego pracownika do istniejącej aplikacji
export const addEmployeeToApplication = async (applicationRecordId: string, submissionId: string, employee: Employee): Promise<string> => {
  try {
    const employeeRecord = {
      fields: {
        [EMPLOYEE_FIELD_IDS.id]: `${submissionId}-${Date.now()}`, // Unikalny ID
        [EMPLOYEE_FIELD_IDS.employee_name]: employee.name || '',
        [EMPLOYEE_FIELD_IDS.gender]: employee.gender || '',
        [EMPLOYEE_FIELD_IDS.age]: employee.birth_date ? calculateAgeFromDate(employee.birth_date) : null,
        [EMPLOYEE_FIELD_IDS.date]: employee.birth_date || '',
        [EMPLOYEE_FIELD_IDS.education]: employee.education || '',
        [EMPLOYEE_FIELD_IDS.position]: employee.position || '',
        [EMPLOYEE_FIELD_IDS.contract_type]: employee.contract_type || '',
        [EMPLOYEE_FIELD_IDS.contract_start]: employee.contract_start || '',
        [EMPLOYEE_FIELD_IDS.contract_end]: employee.contract_end || '',
        [EMPLOYEE_FIELD_IDS.application_id]: [applicationRecordId]
      }
    };

    const result = await makeProxyRequest(AIRTABLE_CONFIG.employeesTableId, {
      method: 'POST',
      data: { records: [employeeRecord] }
    });

    console.log('Dodano nowego pracownika:', result.records[0].id);
    return result.records[0].id;
  } catch (error) {
    console.error('Błąd podczas dodawania pracownika:', error);
    throw error;
  }
};

// Usuń pracownika
export const deleteEmployee = async (employeeRecordId: string): Promise<void> => {
  try {
    await makeProxyRequest(`${AIRTABLE_CONFIG.employeesTableId}/${employeeRecordId}`, {
      method: 'DELETE'
    });

    console.log('Pracownik usunięty pomyślnie');
  } catch (error) {
    console.error('Błąd podczas usuwania pracownika:', error);
    throw error;
  }
};
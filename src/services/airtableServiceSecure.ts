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

// Helper function for making secure proxy requests
const makeProxyRequest = async (endpoint: string, options: any = {}) => {
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
    const endpoint = `${AIRTABLE_CONFIG.applicationsTableId}?maxRecords=1&sort%5B0%5D%5Bfield%5D=submission_id&sort%5B0%5D%5Bdirection%5D=desc`;
    const data = await makeProxyRequest(endpoint);
    
    if (data.records && data.records.length > 0) {
      const lastId = data.records[0].fields.submission_id;
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
          submission_id: submissionId,
          submission_date: new Date().toISOString(),
          company_name: formData.company_name || '',
          company_nip: formData.company_nip || '',
          company_pkd: formData.company_pkd || '',
          representative_person: formData.representative_person || '',
          representative_phone: formData.representative_phone || '',
          representative_email: formData.representative_email || '',
          contact_person_name: formData.contact_person_name || '',
          contact_person_phone: formData.contact_person_phone || '',
          contact_person_email: formData.contact_person_email || '',
          company_address: formData.company_address || '',
          activity_place: formData.activity_place || '',
          correspondence_address: formData.correspondence_address || '',
          bank_name: formData.bank_name || '',
          bank_account: formData.bank_account || '',
          account_not_interest_bearing: formData.account_not_interest_bearing || '',
          total_employees: parseInt(formData.total_employees, 10) || 0,
          company_size: formData.company_size || '',
          balance_under_2m: formData.balance_under_2m || '',
          status: 'Submitted',
          'Link do formularza': `${window.location.origin}/wniosek/RECORD_ID_PLACEHOLDER`
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
          'Link do formularza': `${window.location.origin}/wniosek/${applicationRecordId}`
        }
      }
    });

    // KROK 2: Wyślij pracowników
    const employeeRecords: Array<any> = [];
    let employeeIndex = 1;

    Object.keys(employees).forEach(employeeId => {
      const emp = employees[employeeId];
      const employeeRecord = {
        fields: {
          Id: `${submissionId}-${employeeIndex}`,
          employee_name: emp.name || '',
          gender: emp.gender || '',
          age: emp.birth_date ? calculateAgeFromDate(emp.birth_date) : null,
          Date: emp.birth_date || '', // New Date field in Airtable
          education: emp.education || '',
          position: emp.position || '',
          contract_type: emp.contract_type || '',
          contract_start: emp.contract_start || '',
          contract_end: emp.contract_end || '',
          application_id: [applicationRecordId]
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
      submission_id: fields.submission_id || '',
      company_name: fields.company_name || '',
      company_nip: fields.company_nip || '',
      company_pkd: fields.company_pkd || '',
      representative_person: fields.representative_person || '',
      representative_phone: fields.representative_phone || '',
      representative_email: fields.representative_email || '',
      contact_person_name: fields.contact_person_name || '',
      contact_person_phone: fields.contact_person_phone || '',
      contact_person_email: fields.contact_person_email || '',
      company_street: fields.company_street || '',
      company_postal_code: fields.company_postal_code || '',
      company_city: fields.company_city || '',
      activity_street: fields.activity_street || '',
      activity_postal_code: fields.activity_postal_code || '',
      activity_city: fields.activity_city || '',
      correspondence_street: fields.correspondence_street || '',
      correspondence_postal_code: fields.correspondence_postal_code || '',
      correspondence_city: fields.correspondence_city || '',
      company_address: fields.company_address || '',
      activity_place: fields.activity_place || '',
      correspondence_address: fields.correspondence_address || '',
      bank_name: fields.bank_name || '',
      bank_account: fields.bank_account || '',
      account_not_interest_bearing: fields.account_not_interest_bearing || '',
      total_employees: fields.total_employees?.toString() || '',
      company_size: fields.company_size || '',
      balance_under_2m: fields.balance_under_2m || ''
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
    const employeeIds = appData.fields.Employees || [];
    
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
          name: fields.employee_name,
          position: fields.position,
          contract_start: fields.contract_start
        });

        employees[i + 1] = {
          id: empData.id,
          name: fields.employee_name || '',
          gender: fields.gender || '',
          birth_date: fields.Date || approximateBirthDate(fields.age) || '',
          education: fields.education || '',
          position: fields.position || '',
          contract_type: fields.contract_type || '',
          contract_start: fields.contract_start || '',
          contract_end: fields.contract_end || '',
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
    const updateFields: any = {};
    
    if (data.company_name !== undefined) updateFields.company_name = data.company_name;
    if (data.company_nip !== undefined) updateFields.company_nip = data.company_nip;
    if (data.company_pkd !== undefined) updateFields.company_pkd = data.company_pkd;
    // ... więcej pól

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
    const updateFields: any = {};
    
    if (data.name !== undefined) updateFields.employee_name = data.name;
    if (data.gender !== undefined) updateFields.gender = data.gender;
    if (data.birth_date !== undefined) {
      updateFields.age = data.birth_date ? calculateAgeFromDate(data.birth_date) : null;
      updateFields.Date = data.birth_date || '';
    }
    // ... więcej pól

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
        Id: `${submissionId}-${Date.now()}`, // Unikalny ID
        employee_name: employee.name || '',
        gender: employee.gender || '',
        age: employee.birth_date ? calculateAgeFromDate(employee.birth_date) : null,
        Date: employee.birth_date || '',
        education: employee.education || '',
        position: employee.position || '',
        contract_type: employee.contract_type || '',
        contract_start: employee.contract_start || '',
        contract_end: employee.contract_end || '',
        application_id: [applicationRecordId]
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
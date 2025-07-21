import type {
  AirtableConfig,
  AirtableSubmissionResult,
  CompanyData,
  EmployeeCollection,
  ApplicationRecord,
  EmployeeRecord,
  Employee
} from '../types';

// Rozszerzony typ zwrotny dla danych aplikacji z submission_id
export interface ApplicationData extends CompanyData {
  submission_id?: string;
}

// Konfiguracja Airtable z zmiennych środowiskowych
const AIRTABLE_CONFIG: AirtableConfig = {
  pat: import.meta.env.VITE_AIRTABLE_PAT || '',
  baseId: import.meta.env.VITE_AIRTABLE_BASE_ID || '',
  applicationsTableId: import.meta.env.VITE_AIRTABLE_APPLICATIONS_TABLE_ID || '',
  employeesTableId: import.meta.env.VITE_AIRTABLE_EMPLOYEES_TABLE_ID || '',
  baseUrl: 'https://api.airtable.com/v0'
};

// Walidacja konfiguracji
if (!AIRTABLE_CONFIG.pat || !AIRTABLE_CONFIG.baseId || !AIRTABLE_CONFIG.applicationsTableId || !AIRTABLE_CONFIG.employeesTableId) {
  console.error('⚠️ BŁĄD: Brak wymaganych zmiennych środowiskowych Airtable:', {
    pat: !!AIRTABLE_CONFIG.pat,
    baseId: !!AIRTABLE_CONFIG.baseId,
    applicationsTableId: !!AIRTABLE_CONFIG.applicationsTableId,
    employeesTableId: !!AIRTABLE_CONFIG.employeesTableId
  });
}

// Pobieranie ostatniego ID z Airtable
export const getLastSubmissionId = async (): Promise<number> => {
  try {
    const response = await fetch(
      `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.applicationsTableId}?maxRecords=1&sort%5B0%5D%5Bfield%5D=submission_id&sort%5B0%5D%5Bdirection%5D=desc`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.pat}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.records && data.records.length > 0) {
      const lastId = data.records[0].fields.submission_id;
      // Jeśli submission_id jest w formacie KFS-XXXX, wyciągnij numer
      if (lastId && lastId.startsWith('KFS-')) {
        return parseInt(lastId.replace('KFS-', ''), 10);
      }
      // Jeśli to tylko numer
      return parseInt(lastId, 10) || 0;
    }
    
    return 0; // Jeśli brak rekordów, zaczynamy od 0
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

// Rzeczywiste wysyłanie do Airtable
export const submitToAirtable = async (
  formData: CompanyData,
  employees: EmployeeCollection
): Promise<AirtableSubmissionResult> => {
  try {
    // Generuj nowe submission ID
    const submissionId = await generateSubmissionId();
    console.log('Wygenerowane submission ID:', submissionId);

    // KROK 1: Wyślij dane głównego wniosku do tabeli Applications
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
          contact_person_name: formData.contact_person_name || '',
          contact_person_phone: formData.contact_person_phone || '',
          contact_person_email: formData.contact_person_email || '',
          company_address: formData.company_address || '',
          activity_place: formData.activity_place || '',
          correspondence_address: formData.correspondence_address || '',
          bank_name: formData.bank_name || '',
          bank_account: formData.bank_account || '',
          total_employees: parseInt(formData.total_employees, 10) || 0,
          company_size: formData.company_size || '',
          balance_under_2m: formData.balance_under_2m || '',
          status: 'Submitted'
        } as ApplicationRecord
      }]
    };

    console.log('Dane głównego wniosku:', applicationData);

    // Wyślij dane głównego wniosku
    const applicationResponse = await fetch(
      `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.applicationsTableId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.pat}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      }
    );

    if (!applicationResponse.ok) {
      const errorData = await applicationResponse.json();
      console.error('Błąd wysyłania wniosku:', errorData);
      throw new Error(`Błąd Airtable Applications: ${applicationResponse.status} - ${errorData.error?.message || 'Nieznany błąd'}`);
    }

    const applicationResult = await applicationResponse.json();
    const applicationRecordId = applicationResult.records[0].id;
    console.log('Utworzono główny rekord wniosku:', applicationRecordId);

    // KROK 2: Zbierz i wyślij pracowników do tabeli Employees
    const employeeRecords: Array<{ fields: EmployeeRecord }> = [];
    let employeeIndex = 1;

    // Używaj zapisanych danych z obiektu employees
    Object.keys(employees).forEach(employeeId => {
      const emp = employees[employeeId];
      const employeeRecord = {
        fields: {
          Id: `${submissionId}-${employeeIndex}`,
          employee_name: emp.name || '',
          gender: emp.gender || '',
          birth_date: emp.birth_date || '',
          education: emp.education || '',
          position: emp.position || '',
          contract_type: emp.contract_type || '',
          contract_start: emp.contract_start || '',
          contract_end: emp.contract_end || '',
          application_id: [applicationRecordId]
        } as EmployeeRecord
      };
      employeeRecords.push(employeeRecord);
      employeeIndex++;
    });

    if (employeeRecords.length > 0) {
      const employeeData = {
        records: employeeRecords
      };

      console.log('Dane pracowników:', employeeData);

      // Wyślij pracowników (batch do 10 rekordów na raz)
      const batchSize = 10;
      for (let i = 0; i < employeeRecords.length; i += batchSize) {
        const batch = employeeRecords.slice(i, i + batchSize);
        const batchData = { records: batch };

        const employeeResponse = await fetch(
          `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.employeesTableId}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${AIRTABLE_CONFIG.pat}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(batchData)
          }
        );

        if (!employeeResponse.ok) {
          const errorData = await employeeResponse.json();
          console.error('Błąd wysyłania pracowników:', errorData);
          throw new Error(`Błąd Airtable Employees: ${employeeResponse.status} - ${errorData.error?.message || 'Nieznany błąd'}`);
        }

        const employeeResult = await employeeResponse.json();
        console.log(`Utworzono batch pracowników (${i+1}-${i+batch.length}):`, employeeResult.records.map((r: any) => `${r.fields.Id} (${r.id})`));
      }
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

// ===== NOWE FUNKCJE DO EDYCJI ====== //


// Pobierz dane aplikacji po ID
export const getApplicationById = async (recordId: string): Promise<ApplicationData> => {
  try {
    const response = await fetch(
      `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.applicationsTableId}/${recordId}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.pat}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📊 Pobrane dane aplikacji:', JSON.stringify(data, null, 2));
    const fields = data.fields;
    
    // Mapuj pola Airtable na ApplicationData (CompanyData + submission_id)
    return {
      submission_id: fields.submission_id || '',
      company_name: fields.company_name || '',
      company_nip: fields.company_nip || '',
      company_pkd: fields.company_pkd || '',
      representative_person: fields.representative_person || '',
      representative_phone: fields.representative_phone || '',
      contact_person_name: fields.contact_person_name || '',
      contact_person_phone: fields.contact_person_phone || '',
      contact_person_email: fields.contact_person_email || '',
      
      // Rozbij adresy na składowe (jeśli są w formacie połączonym)
      company_street: fields.company_street || '',
      company_postal_code: fields.company_postal_code || '',
      company_city: fields.company_city || '',
      
      activity_street: fields.activity_street || '',
      activity_postal_code: fields.activity_postal_code || '',
      activity_city: fields.activity_city || '',
      
      correspondence_street: fields.correspondence_street || '',
      correspondence_postal_code: fields.correspondence_postal_code || '',
      correspondence_city: fields.correspondence_city || '',
      
      // Legacy fields
      company_address: fields.company_address || '',
      activity_place: fields.activity_place || '',
      correspondence_address: fields.correspondence_address || '',
      
      bank_name: fields.bank_name || '',
      bank_account: fields.bank_account || '',
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
    const appResponse = await fetch(
      `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.applicationsTableId}/${applicationRecordId}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.pat}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!appResponse.ok) {
      throw new Error(`Błąd pobierania aplikacji: ${appResponse.status}`);
    }

    const appData = await appResponse.json();
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
      
      const empResponse = await fetch(
        `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.employeesTableId}/${empId}`,
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.pat}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (empResponse.ok) {
        const empData = await empResponse.json();
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
          birth_date: fields.birth_date || fields.contract_start || '', // Fallback jeśli birth_date nie istnieje
          education: fields.education || '',
          position: fields.position || '',
          contract_type: fields.contract_type || '',
          contract_start: fields.contract_start || '',
          contract_end: fields.contract_end || '',
          isEditing: false,
          isNew: false
        };
      } else {
        console.warn(`❌ Nie udało się pobrać pracownika ${empId}`);
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
    
    // Mapuj tylko zmienione pola
    if (data.company_name !== undefined) updateFields.company_name = data.company_name;
    if (data.company_nip !== undefined) updateFields.company_nip = data.company_nip;
    if (data.company_pkd !== undefined) updateFields.company_pkd = data.company_pkd;
    if (data.representative_person !== undefined) updateFields.representative_person = data.representative_person;
    if (data.representative_phone !== undefined) updateFields.representative_phone = data.representative_phone;
    if (data.contact_person_name !== undefined) updateFields.contact_person_name = data.contact_person_name;
    if (data.contact_person_phone !== undefined) updateFields.contact_person_phone = data.contact_person_phone;
    if (data.contact_person_email !== undefined) updateFields.contact_person_email = data.contact_person_email;
    if (data.bank_name !== undefined) updateFields.bank_name = data.bank_name;
    if (data.bank_account !== undefined) updateFields.bank_account = data.bank_account;
    if (data.total_employees !== undefined) updateFields.total_employees = parseInt(data.total_employees, 10) || 0;
    if (data.company_size !== undefined) updateFields.company_size = data.company_size;
    if (data.balance_under_2m !== undefined) updateFields.balance_under_2m = data.balance_under_2m;

    const requestBody = {
      fields: updateFields
    };

    const response = await fetch(
      `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.applicationsTableId}/${recordId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.pat}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Błąd aktualizacji aplikacji:', errorData);
      throw new Error(`Błąd aktualizacji: ${response.status}`);
    }

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
    if (data.birth_date !== undefined) updateFields.birth_date = data.birth_date;
    if (data.education !== undefined) updateFields.education = data.education;
    if (data.position !== undefined) updateFields.position = data.position;
    if (data.contract_type !== undefined) updateFields.contract_type = data.contract_type;
    if (data.contract_start !== undefined) updateFields.contract_start = data.contract_start;
    if (data.contract_end !== undefined) updateFields.contract_end = data.contract_end;

    const requestBody = {
      fields: updateFields
    };

    const response = await fetch(
      `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.employeesTableId}/${employeeRecordId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.pat}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Błąd aktualizacji pracownika:', errorData);
      throw new Error(`Błąd aktualizacji pracownika: ${response.status}`);
    }

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
        birth_date: employee.birth_date || '',
        education: employee.education || '',
        position: employee.position || '',
        contract_type: employee.contract_type || '',
        contract_start: employee.contract_start || '',
        contract_end: employee.contract_end || '',
        application_id: [applicationRecordId]
      }
    };

    const response = await fetch(
      `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.employeesTableId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.pat}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ records: [employeeRecord] })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Błąd dodawania pracownika:', errorData);
      throw new Error(`Błąd dodawania pracownika: ${response.status}`);
    }

    const result = await response.json();
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
    const response = await fetch(
      `${AIRTABLE_CONFIG.baseUrl}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.employeesTableId}/${employeeRecordId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.pat}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Błąd usuwania pracownika:', errorData);
      throw new Error(`Błąd usuwania pracownika: ${response.status}`);
    }

    console.log('Pracownik usunięty pomyślnie');
  } catch (error) {
    console.error('Błąd podczas usuwania pracownika:', error);
    throw error;
  }
};
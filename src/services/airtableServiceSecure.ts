import type {
    AirtableSubmissionResult,
    CompanyData,
    EmployeeCollection,
    Employee
} from '../types';
import { STATUS_OPTIONS } from '../constants/selectOptions';

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

// Secure proxy configuration
// For local development, use production URLs since Vite dev server doesn't support serverless functions
const isLocalhost = window.location.hostname === 'localhost';
const BASE_URL = isLocalhost ? 'https://kfs-mitel.vercel.app' : '';
const AIRTABLE_CONFIG = {
    proxyUrl: `${BASE_URL}/api/airtable`,
    applicationsTableId: 'tbl2SOkYU0eBG2ZGj',
    employeesTableId: 'tblh7tsaWWwXxBgSi'
};

// COMPLETE Field ID mappings for Polish field names (verified 2025-07-24)
const COMPANY_FIELD_IDS = {
    // Podstawowe dane
    submission_id: 'fldb2lUUPqVyg3qHJ',              // 'ID formularza'
    company_name: 'fldWKTMxAQILBkDKr',               // 'Nazwa firmy'
    company_nip: 'fldOrZL39rXQFy41x',                // 'NIP firmy'
    company_pkd: 'fldYsGfFe1D8up19H',                // 'PKD firmy'

    // Osoby
    representative_person: 'fldJBWA0L39GHhbzN',      // 'Osoba uprawniona'
    representative_phone: 'fldfOB2CjNM49XXrG',       // 'Telefon przedstawiciela'
    representative_email: 'fldQ4DHHTBAcgfpSX',       // 'Email osoby uprawnionej'
    contact_person_name: 'fld3Bh5roCuUOA4Bf',        // 'Imię i nazwisko osoby kontaktowej'
    contact_person_phone: 'fldxplyEUdpO6ruC4',       // 'Telefon osoby kontaktowej'
    contact_person_email: 'fldtwLBYR0UfcWTEy',       // 'Email osoby kontaktowej'
    responsible_person: 'fldWyVXSr2YYp3ceu',         // 'Osoba odpowiedzialna'
    responsible_person_phone: 'fldpSrs1mbCg4PqIA',   // 'Telefon osoby uprawnionej'

    // Adresy
    company_address: 'fldKmJwLQIsrhacL8',             // 'Adres firmy'
    activity_place: 'flds5jdpXJnt0QpHB',             // 'Miejsce prowadzenia działalności'
    correspondence_address: 'fld7zP7tV4cOQOiEg',     // 'Adres korespondencyjny'

    // Dane bankowe
    bank_name: 'fldmhu2mXfMWbft1e',                  // 'Nazwa banku'
    bank_account: 'fldzm2E1GpMWZO7i6',               // 'rachunek bankowy'
    account_not_interest_bearing: 'fldb31oM7S69Iw4op', // 'Konto nieoprocentowane'

    // Charakterystyka firmy
    total_employees: 'fldD75gRcJwNmPu74',            // 'Liczba pracowników'
    company_size: 'fld10KKuthgPzMfEm',               // 'Wielkość firmy'
    balance_under_2m: 'fld9IwmSY5nJjLyXU',           // 'saldo poniżej 2 mln'

    // Metadane
    status: 'fldHwKZarbtaEYVL1',                     // 'Status'
    submission_date: 'fldLAEWXsVNjcPwAM',            // 'Data złożenia'
    created: 'fldh8HPFPpSIPgf5C',                    // 'Utworzono'
    form_link: 'fldTVQ8oIhA6qhhKp',                  // 'Link do formularza'
    employees_link: 'fldEVgeMp8zVI5xpk'              // 'Pracownicy'
};

const EMPLOYEE_FIELD_IDS = {
    // Podstawowe dane
    id: 'fldjNHuDfah6i1D6A',                        // 'Id'
    employee_name: 'fld2z5G2cb5cxeuOP',             // 'Imię i nazwisko'
    gender: 'fldzYdLbAH6RfPSUN',                    // 'Płeć'
    age: 'fldbciv6U2QXtJZgZ',                       // 'Wiek'
    birth_date: 'fldMLKZq9EJY9Rvk8',                // 'Data urodzenia'
    position: 'fldNCgGkvXYGuHpR7',                  // 'Stanowisko'
    education: 'fldRRQmwMtOjvyTKT',                 // 'Wykształcenie'

    // Zatrudnienie
    contract_type: 'fldVxJrPOaMQcvL85',             // 'Typ umowy'
    contract_start: 'fldNZlLDeo94m3zkl',            // 'Początek umowy'
    contract_end: 'fldvpiCNqjHvchH4T',              // 'Koniec umowy'

    // Metadane
    created: 'fld8u4udfJZZj0Jg2',                  // 'Utworzono'
    company_link: 'fldXDojrCPy6vnmp2'               // 'Dane podmiotu'
};

// Secure proxy helper
const makeAirtableRequest = async (endpoint: string, options: { method?: string; data?: unknown } = {}) => {
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

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.error || 'Unknown proxy error');
    }

    return result.data;
};

// Pobieranie ostatniego ID z Airtable przez proxy
export const getLastSubmissionId = async (): Promise<number> => {
    try {
        const endpoint = `${AIRTABLE_CONFIG.applicationsTableId}?maxRecords=1&sort%5B0%5D%5Bfield%5D=${COMPANY_FIELD_IDS.submission_id}&sort%5B0%5D%5Bdirection%5D=desc&returnFieldsByFieldId=true`;
        const data = await makeAirtableRequest(endpoint);

        console.log('🔍 DEBUG: getLastSubmissionId response:', data);

        if (data.records && data.records.length > 0) {
            const lastId = data.records[0].fields[COMPANY_FIELD_IDS.submission_id];
            console.log('🔍 DEBUG: last submission_id from DB:', lastId);

            if (lastId && lastId.startsWith('KFS-')) {
                const numericPart = parseInt(lastId.replace('KFS-', ''), 10);
                console.log('🔍 DEBUG: extracted numeric part:', numericPart);
                return numericPart;
            }
            return parseInt(lastId, 10) || 0;
        }

        console.log('🔍 DEBUG: No records found, returning 0');
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
    const formattedId = `KFS-${newId.toString().padStart(4, '0')}`;
    console.log('🔍 DEBUG: generateSubmissionId - lastId:', lastId, 'newId:', newId, 'formatted:', formattedId);
    return formattedId;
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
                    [COMPANY_FIELD_IDS.responsible_person_phone]: formData.responsible_person_phone || '',
                    [COMPANY_FIELD_IDS.company_address]: formData.company_address || '',
                    [COMPANY_FIELD_IDS.activity_place]: formData.activity_place || '',
                    [COMPANY_FIELD_IDS.correspondence_address]: formData.correspondence_address || '',
                    [COMPANY_FIELD_IDS.bank_name]: formData.bank_name || '',
                    [COMPANY_FIELD_IDS.bank_account]: formData.bank_account || '',
                    [COMPANY_FIELD_IDS.account_not_interest_bearing]: formData.account_not_interest_bearing === 'tak',
                    [COMPANY_FIELD_IDS.total_employees]: parseInt(formData.total_employees, 10) || 0,
                    [COMPANY_FIELD_IDS.company_size]: formData.company_size || '',
                    [COMPANY_FIELD_IDS.balance_under_2m]: formData.balance_under_2m || '',
                    [COMPANY_FIELD_IDS.status]: STATUS_OPTIONS[1], // 'Wysłane'
                    [COMPANY_FIELD_IDS.form_link]: `${window.location.origin}/wniosek/RECORD_ID_PLACEHOLDER`
                }
            }]
        };

        const applicationResult = await makeAirtableRequest(AIRTABLE_CONFIG.applicationsTableId, {
            method: 'POST',
            data: applicationData
        });

        const applicationRecordId = applicationResult.records[0].id;
        console.log('Utworzono główny rekord wniosku:', applicationRecordId);

        // Update the form link with the actual record ID
        await makeAirtableRequest(`${AIRTABLE_CONFIG.applicationsTableId}/${applicationRecordId}`, {
            method: 'PATCH',
            data: {
                fields: {
                    [COMPANY_FIELD_IDS.form_link]: `${window.location.origin}/wniosek/${applicationRecordId}`
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
                    [EMPLOYEE_FIELD_IDS.birth_date]: emp.birth_date || null,
                    [EMPLOYEE_FIELD_IDS.education]: emp.education || '',
                    [EMPLOYEE_FIELD_IDS.position]: emp.position || '',
                    [EMPLOYEE_FIELD_IDS.contract_type]: emp.contract_type || '',
                    [EMPLOYEE_FIELD_IDS.contract_start]: emp.contract_start || null,
                    [EMPLOYEE_FIELD_IDS.contract_end]: emp.contract_end || null,
                    [EMPLOYEE_FIELD_IDS.created]: new Date().toISOString(),
                    [EMPLOYEE_FIELD_IDS.company_link]: [applicationRecordId]
                }
            };
            employeeRecords.push(employeeRecord);
            employeeIndex++;
        });

        if (employeeRecords.length > 0) {
            const employeeData = {
                records: employeeRecords
            };

            await makeAirtableRequest(AIRTABLE_CONFIG.employeesTableId, {
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
        const data = await makeAirtableRequest(`${AIRTABLE_CONFIG.applicationsTableId}/${recordId}?returnFieldsByFieldId=true`);
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
            responsible_person_phone: fields[COMPANY_FIELD_IDS.responsible_person_phone] || '',
            company_address: fields[COMPANY_FIELD_IDS.company_address] || '',
            activity_place: fields[COMPANY_FIELD_IDS.activity_place] || '',
            correspondence_address: fields[COMPANY_FIELD_IDS.correspondence_address] || '',
            // Nowe pola adresowe - mapped to empty strings as they don't exist in Airtable yet
            company_street: '',
            company_postal_code: '',
            company_city: '',
            activity_street: '',
            activity_postal_code: '',
            activity_city: '',
            correspondence_street: '',
            correspondence_postal_code: '',
            correspondence_city: '',
            bank_name: fields[COMPANY_FIELD_IDS.bank_name] || '',
            bank_account: fields[COMPANY_FIELD_IDS.bank_account] || '',
            account_not_interest_bearing: fields[COMPANY_FIELD_IDS.account_not_interest_bearing] ? 'tak' : 'nie',
            total_employees: fields[COMPANY_FIELD_IDS.total_employees]?.toString() || '',
            company_size: fields[COMPANY_FIELD_IDS.company_size] || '',
            balance_under_2m: fields[COMPANY_FIELD_IDS.balance_under_2m] || '',
            planned_employee_count: '' // Not stored in Airtable - only for local validation
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
        const appData = await makeAirtableRequest(`${AIRTABLE_CONFIG.applicationsTableId}/${applicationRecordId}?returnFieldsByFieldId=true`);
        const employeeIds = appData.fields[COMPANY_FIELD_IDS.employees_link] || [];

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
                const empData = await makeAirtableRequest(`${AIRTABLE_CONFIG.employeesTableId}/${empId}?returnFieldsByFieldId=true`);
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
                    birth_date: fields[EMPLOYEE_FIELD_IDS.birth_date] || approximateBirthDate(fields[EMPLOYEE_FIELD_IDS.age]) || '',
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

        await makeAirtableRequest(`${AIRTABLE_CONFIG.applicationsTableId}/${recordId}`, {
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
            updateFields[EMPLOYEE_FIELD_IDS.birth_date] = data.birth_date || null;
        }
        // Add more field mappings as needed

        const requestBody = {
            fields: updateFields
        };

        await makeAirtableRequest(`${AIRTABLE_CONFIG.employeesTableId}/${employeeRecordId}`, {
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
                [EMPLOYEE_FIELD_IDS.birth_date]: employee.birth_date || null,
                [EMPLOYEE_FIELD_IDS.education]: employee.education || '',
                [EMPLOYEE_FIELD_IDS.position]: employee.position || '',
                [EMPLOYEE_FIELD_IDS.contract_type]: employee.contract_type || '',
                [EMPLOYEE_FIELD_IDS.contract_start]: employee.contract_start || null,
                [EMPLOYEE_FIELD_IDS.contract_end]: employee.contract_end || null,
                [EMPLOYEE_FIELD_IDS.company_link]: [applicationRecordId]
            }
        };

        const result = await makeAirtableRequest(AIRTABLE_CONFIG.employeesTableId, {
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
        await makeAirtableRequest(`${AIRTABLE_CONFIG.employeesTableId}/${employeeRecordId}`, {
            method: 'DELETE'
        });

        console.log('Pracownik usunięty pomyślnie');
    } catch (error) {
        console.error('Błąd podczas usuwania pracownika:', error);
        throw error;
    }
};
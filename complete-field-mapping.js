// COMPLETE FIELD ID MAPPING dla polskich nazw pól
console.log(`
// ===== COMPLETE FIELD ID MAPPING =====
// Updated: 2025-07-24 - All Polish field names mapped to IDs

// COMPANY TABLE (tbl2SOkYU0eBG2ZGj) - Dane podmiotu
const COMPANY_FIELD_IDS = {
  // Podstawowe dane
  submission_id: 'fldb2lUUPqVyg3qHJ',              // 'ID formularza'
  company_name: 'fldWKTMxAQILBkDKr',               // 'Nazwa firmy'  
  company_nip: 'fldOrZL39rXQFy41x',                // 'NIP firmy'
  company_pkd: 'fldYsGfFe1D8up19H',                // 'PKD firmy'
  
  // Osoby
  representative_person: 'fldJBWA0L39GHhbzN',      // 'Osoba uprawniona'
  representative_phone: 'fldfOB2CjNM49XXrG',       // 'Telefon przedstawiciela'
  contact_person_name: 'fld3Bh5roCuUOA4Bf',        // 'Imię i nazwisko osoby kontaktowej'
  contact_person_phone: 'fldxplyEUdpO6ruC4',       // 'Telefon osoby kontaktowej'
  contact_person_email: 'fldtwLBYR0UfcWTEy',       // 'Email osoby kontaktowej'
  responsible_person: 'fldWyVXSr2YYp3ceu',         // 'Osoba odpowiedzialna'
  responsible_person_email: 'fldQ4DHHTBAcgfpSX',   // 'Email osoby odpowiedzialnej'
  responsible_person_phone: 'fldpSrs1mbCg4PqIA',   // 'Telefon osoby odpowiedzialnej'
  
  // Adresy
  company_address: 'fldKmJwLQIsrhacL8',             // 'Adres firmy'
  activity_place: 'flds5jdpXJnt0QpHB',             // 'Miejsce prowadzenia działalności'
  correspondence_address: 'fld7zP7tV4cOQOiEg',     // 'Adres korespondencyjny'
  
  // Dane bankowe
  bank_name: 'fldmhu2mXfMWbft1e',                  // 'Nazwa banku'
  bank_account: 'fldzm2E1GpMWZO7i6',               // 'rachunek bankowy'
  account_not_interest_bearing: 'fldb31oM7S69Iw4op', // 'Konto nieoprocentowane' (boolean)
  
  // Charakterystyka firmy
  total_employees: 'fldD75gRcJwNmPu74',            // 'Liczba pracowników'
  company_size: 'fld10KKuthgPzMfEm',               // 'Wielkość firmy'
  balance_under_2m: 'fld9IwmSY5nJjLyXU',           // 'saldo poniżej 2 mln'
  
  // Metadane
  status: 'fldHwKZarbtaEYVL1',                     // 'Status'
  submission_date: 'fldLAEWXsVNjcPwAM',            // 'Data złożenia'
  created: 'fldh8HPFPpSIPgf5C',                    // 'Utworzono'
  form_link: 'fldTVQ8oIhA6qhhKp',                  // 'Link do formularza'
  employees_link: 'fldEVgeMp8zVI5xpk'              // 'Pracownicy' (linked records)
};

// EMPLOYEE TABLE (tblh7tsaWWwXxBgSi) - Pracownicy  
const EMPLOYEE_FIELD_IDS = {
  // Podstawowe dane
  id: 'fldjNHuDfah6i1D6A',                        // 'Id'
  employee_name: 'fld2z5G2cb5cxeuOP',             // 'Imię i nazwisko'
  gender: 'fldzYdLbAH6RfPSUN',                    // 'Płeć'
  age: 'fldbciv6U2QXtJZgZ',                       // 'Wiek'
  position: 'fldNCgGkvXYGuHpR7',                  // 'Stanowisko'
  education: 'fldRRQmwMtOjvyTKT',                 // 'Wykształcenie'
  
  // Zatrudnienie
  contract_type: 'fldVxJrPOaMQcvL85',             // 'Typ umowy'
  contract_start: 'fldNZlLDeo94m3zkl',            // 'Początek umowy'
  contract_end: 'fldvpiCNqjHvchH4T',              // 'Koniec umowy'
  
  // Metadane
  created: 'fld8u4udfJZZj0Jg2',                  // 'Utworzono'
  company_link: 'fldXDojrCPy6vnmp2'               // 'Dane podmiotu' (linked records)
};

// ===== SELECT FIELD OPTIONS =====
const SELECT_OPTIONS = {
  // Company fields
  company_size: ['mikro', 'mały', 'średni', 'duży'],
  balance_under_2m: ['tak', 'nie'],
  status: ['Szkic', 'Submitted', 'Approved', 'Rejected'], // guessed values
  
  // Employee fields  
  gender: ['M', 'K'],
  education: ['podstawowe', 'gimnazjalne', 'zawodowe', 'średnie ogólnokształcące', 'średnie zawodowe', 'policealne', 'wyższe'],
  contract_type: ['umowa o prace', 'umowa zlecenie', 'umowa o dzieło', 'b2b', 'powołanie', 'brak - właściciel firmy', 'inne']
};

console.log("✅ COMPLETE FIELD MAPPING READY!");
console.log("📋 Company fields: " + Object.keys(COMPANY_FIELD_IDS).length);
console.log("👥 Employee fields: " + Object.keys(EMPLOYEE_FIELD_IDS).length);
`);

// Test the mapping
async function testCompleteMapping() {
  console.log("\\n🧪 Testing complete field mapping...");
  
  const testCompanyData = {
    [COMPANY_FIELD_IDS.submission_id]: 'KFS-COMPLETE-MAP-001',
    [COMPANY_FIELD_IDS.company_name]: 'TEST Complete Mapping Sp. z o.o.',
    [COMPANY_FIELD_IDS.company_nip]: '9999999999',
    [COMPANY_FIELD_IDS.company_pkd]: '62.01.Z',
    [COMPANY_FIELD_IDS.representative_person]: 'Jan Kompletny',
    [COMPANY_FIELD_IDS.representative_phone]: '999888777',
    [COMPANY_FIELD_IDS.contact_person_name]: 'Anna Kompletna',
    [COMPANY_FIELD_IDS.contact_person_phone]: '777888999',
    [COMPANY_FIELD_IDS.contact_person_email]: 'anna@complete.pl',
    [COMPANY_FIELD_IDS.responsible_person]: 'Piotr Odpowiedzialny',
    [COMPANY_FIELD_IDS.responsible_person_email]: 'piotr@complete.pl',
    [COMPANY_FIELD_IDS.responsible_person_phone]: '555666777',
    [COMPANY_FIELD_IDS.company_address]: 'ul. Kompletna 123, 00-001 Warszawa',
    [COMPANY_FIELD_IDS.activity_place]: 'ul. Kompletna 123, 00-001 Warszawa',
    [COMPANY_FIELD_IDS.correspondence_address]: 'ul. Korespondencyjna 456, 00-002 Warszawa',
    [COMPANY_FIELD_IDS.bank_name]: 'PKO Bank Complete',
    [COMPANY_FIELD_IDS.bank_account]: 'PL 99 8888 7777 6666 5555 4444 3333',
    [COMPANY_FIELD_IDS.account_not_interest_bearing]: false,
    [COMPANY_FIELD_IDS.total_employees]: 5,
    [COMPANY_FIELD_IDS.company_size]: 'mikro',
    [COMPANY_FIELD_IDS.balance_under_2m]: 'tak',
    [COMPANY_FIELD_IDS.status]: 'Submitted',
    [COMPANY_FIELD_IDS.submission_date]: new Date().toISOString(),
    [COMPANY_FIELD_IDS.created]: new Date().toISOString().split('T')[0],
    [COMPANY_FIELD_IDS.form_link]: 'https://example.com/complete-test'
  };
  
  try {
    const companyPayload = {
      records: [{ fields: testCompanyData }]
    };

    const companyResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'POST',
        endpoint: 'tbl2SOkYU0eBG2ZGj',
        data: companyPayload
      })
    });

    if (companyResponse.ok) {
      const companyResult = await companyResponse.json();
      const applicationRecordId = companyResult.records[0].id;
      console.log("✅ Company complete mapping test successful!");
      console.log("Record ID:", applicationRecordId);

      // Test employee with complete mapping
      const testEmployeeData = {
        [EMPLOYEE_FIELD_IDS.id]: 'KFS-COMPLETE-MAP-001-1',
        [EMPLOYEE_FIELD_IDS.employee_name]: 'Maria Kompletna',
        [EMPLOYEE_FIELD_IDS.gender]: 'K',
        [EMPLOYEE_FIELD_IDS.age]: 28,
        [EMPLOYEE_FIELD_IDS.position]: 'Complete Mapping Specialist',
        [EMPLOYEE_FIELD_IDS.education]: 'wyższe',
        [EMPLOYEE_FIELD_IDS.contract_type]: 'umowa o prace',
        [EMPLOYEE_FIELD_IDS.contract_start]: '2024-01-01',
        [EMPLOYEE_FIELD_IDS.contract_end]: '2024-12-31',
        [EMPLOYEE_FIELD_IDS.created]: new Date().toISOString(),
        [EMPLOYEE_FIELD_IDS.company_link]: [applicationRecordId]
      };

      const employeePayload = {
        records: [{ fields: testEmployeeData }]
      };

      const employeeResponse = await fetch('http://localhost:3001/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'POST',
          endpoint: 'tblh7tsaWWwXxBgSi',
          data: employeePayload
        })
      });

      if (employeeResponse.ok) {
        const employeeResult = await employeeResponse.json();
        console.log("✅ Employee complete mapping test successful!");
        console.log("Employee record ID:", employeeResult.records[0].id);
        console.log("\\n🎉 COMPLETE FIELD MAPPING TEST PASSED!");
        console.log("Check your Airtable - all fields should be properly mapped!");
      } else {
        console.log("❌ Employee mapping failed:", await employeeResponse.text());
      }
    } else {
      console.log("❌ Company mapping failed:", await companyResponse.text());
    }

  } catch (error) {
    console.error("❌ Complete mapping test error:", error);
  }
}

testCompleteMapping();
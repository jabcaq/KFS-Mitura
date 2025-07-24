// Create complete field mapping based on discovered IDs
console.log("🗺️ Creating complete field ID mapping for Polish field names...");

console.log(`
// Field ID mappings for current Polish field names
const COMPANY_FIELD_IDS = {
  // Based on discovery results - Company Table (tbl2SOkYU0eBG2ZGj)
  submission_id: 'fldb2lUUPqVyg3qHJ',        // 'ID formularza'
  company_name: 'fldWKTMxAQILBkDKr',          // 'Nazwa firmy'
  company_nip: 'fldOrZL39rXQFy41x',           // 'NIP firmy'
  company_pkd: 'fldYsGfFe1D8up19H',           // 'PKD firmy'
  representative_person: 'fldJBWA0L39GHhbzN', // 'Osoba uprawniona'
  representative_phone: 'fldfOB2CjNM49XXrG',  // 'Telefon przedstawiciela'
  contact_person_name: 'fld3Bh5roCuUOA4Bf',   // 'Imię i nazwisko osoby kontaktowej'
  contact_person_phone: 'fldxplyEUdpO6ruC4',  // 'Telefon osoby kontaktowej'
  contact_person_email: 'fldtwLBYR0UfcWTEy',  // 'Email osoby kontaktowej'
  bank_name: 'fldmhu2mXfMWbft1e',             // 'Nazwa banku'
  bank_account: 'fldzm2E1GpMWZO7i6',          // 'rachunek bankowy'
  total_employees: 'fldD75gRcJwNmPu74',       // 'Liczba pracowników'
  submission_date: 'fldLAEWXsVNjcPwAM',       // 'Data złożenia'
  created: 'fldh8HPFPpSIPgf5C'                // 'Utworzono'
  // Note: 'Osoba odpowiedzialna' field exists but no mapping in our form yet
};

const EMPLOYEE_FIELD_IDS = {
  // Based on discovery results - Employee Table (tblh7tsaWWwXxBgSi)
  id: 'fldjNHuDfah6i1D6A',                   // 'Id'
  employee_name: 'fld2z5G2cb5cxeuOP',        // 'Imię i nazwisko'
  age: 'fldbciv6U2QXtJZgZ',                 // 'Wiek'
  position: 'fldNCgGkvXYGuHpR7',             // 'Stanowisko'
  contract_start: 'fldNZlLDeo94m3zkl'        // 'Początek umowy'
  // Note: 'Koniec umowy' and 'Utworzono' fields exist but weren't in our test
};
`);

console.log("\n📋 MISSING FIELDS ANALYSIS:");
console.log("Our form has these fields that don't exist in current Airtable:");
console.log("❌ representative_email");
console.log("❌ company addresses (street, postal_code, city)"); 
console.log("❌ activity_place, correspondence_address");
console.log("❌ account_not_interest_bearing");
console.log("❌ company_size, balance_under_2m");
console.log("❌ employee: gender, birth_date, education, contract_type, contract_end");

console.log("\n✅ EXISTING FIELDS IN AIRTABLE (not in our form):");
console.log("+ 'Osoba odpowiedzialna' (in company table)");
console.log("+ 'Koniec umowy' (in employee table)");

console.log("\n🚨 RECOMMENDATION:");
console.log("Either:");
console.log("1. Add missing fields to Airtable tables, OR");
console.log("2. Remove missing fields from our form, OR"); 
console.log("3. Create additional tables for addresses/details");

async function testMappingWithRealData() {
  console.log("\n🧪 Testing complete mapping with real form data...");
  
  // Test data that matches our current Airtable structure
  const testCompanyData = {
    'fldb2lUUPqVyg3qHJ': 'KFS-MAPPING-TEST-001',
    'fldWKTMxAQILBkDKr': 'TEST Firma Mapping Polskich Pól',
    'fldOrZL39rXQFy41x': '1111111111',
    'fldYsGfFe1D8up19H': '62.01.Z',
    'fldJBWA0L39GHhbzN': 'Jan Kowalski Mapping',
    'fldfOB2CjNM49XXrG': '111222333',
    'fld3Bh5roCuUOA4Bf': 'Anna Nowak Mapping',
    'fldxplyEUdpO6ruC4': '444555666',
    'fldtwLBYR0UfcWTEy': 'anna@mappingtest.pl',
    'fldmhu2mXfMWbft1e': 'PKO Bank Mapping',
    'fldzm2E1GpMWZO7i6': 'PL 11 2222 3333 4444 5555 6666 7777',
    'fldD75gRcJwNmPu74': 3,
    'fldLAEWXsVNjcPwAM': new Date().toISOString(),
    'fldh8HPFPpSIPgf5C': new Date().toISOString().split('T')[0]
  };

  const testEmployeeData = [
    {
      'fldjNHuDfah6i1D6A': 'KFS-MAPPING-TEST-001-1',
      'fld2z5G2cb5cxeuOP': 'Paweł Mapping Test',
      'fldbciv6U2QXtJZgZ': 30,
      'fldNCgGkvXYGuHpR7': 'Senior Mapping Developer',
      'fldNZlLDeo94m3zkl': '2024-01-01'
    },
    {
      'fldjNHuDfah6i1D6A': 'KFS-MAPPING-TEST-001-2',
      'fld2z5G2cb5cxeuOP': 'Maria Mapping Test',
      'fldbciv6U2QXtJZgZ': 28,
      'fldNCgGkvXYGuHpR7': 'Mapping Specialist',
      'fldNZlLDeo94m3zkl': '2024-02-01'
    }
  ];

  try {
    // Test company submission
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
      console.log("✅ Company mapping test successful!");
      console.log("Record ID:", companyResult.records[0].id);

      // Test employee submissions
      const employeePayload = {
        records: testEmployeeData.map(emp => ({ fields: emp }))
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
        console.log("✅ Employee mapping test successful!");
        console.log("Employee count:", employeeResult.records.length);
        console.log("\n🎉 COMPLETE FIELD ID MAPPING TEST PASSED!");
        console.log("Check your Airtable to see the records created with field IDs!");
      } else {
        console.log("❌ Employee test failed:", await employeeResponse.text());
      }
    } else {
      console.log("❌ Company test failed:", await companyResponse.text());
    }

  } catch (error) {
    console.error("❌ Mapping test error:", error);
  }
}

testMappingWithRealData();
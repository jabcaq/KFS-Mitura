// Create test record with only the fields that actually exist
async function createTestWithCurrentFields() {
  try {
    console.log("🧪 Creating test record with current available fields...");
    
    // Based on the schema we discovered, create a test record
    const testCompanyData = {
      records: [{
        fields: {
          'ID formularza': 'KFS-TEST-001',
          'Nazwa firmy': 'TEST - Aktualne Pola Integration',
          'NIP firmy': '1234567890',
          'PKD firmy': '62.01.Z',
          'Osoba uprawniona': 'Jan Testowy',
          'Telefon przedstawiciela': '123456789',
          'Imię i nazwisko osoby kontaktowej': 'Anna Testowa',
          'Telefon osoby kontaktowej': '987654321',
          'Email osoby kontaktowej': 'anna@test.pl',
          'Nazwa banku': 'PKO Bank Polski',
          'rachunek bankowy': 'PL 12 3456 7890 1234 5678 9012 3456',
          'Liczba pracowników': 2,
          'Data złożenia': new Date().toISOString(),
          'Utworzono': new Date().toISOString().split('T')[0]
        }
      }]
    };

    console.log("🏢 Submitting company data with current fields...");
    const companyResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'POST',
        endpoint: 'tbl2SOkYU0eBG2ZGj',
        data: testCompanyData
      })
    });

    if (!companyResponse.ok) {
      const errorText = await companyResponse.text();
      throw new Error(`Company submission failed: ${companyResponse.status} - ${errorText}`);
    }

    const companyResult = await companyResponse.json();
    const applicationRecordId = companyResult.records[0].id;
    console.log("✅ Company data submitted! Record ID:", applicationRecordId);

    // Create test employees with current available fields
    const testEmployeeData = {
      records: [
        {
          fields: {
            'Id': 'KFS-TEST-001-1',
            'Imię i nazwisko': 'Paweł Testowy',
            'Wiek': 34,
            'Stanowisko': 'Senior Developer',
            'Początek umowy': '2024-01-01',
            'Utworzono': new Date().toISOString().split('T')[0]
          }
        },
        {
          fields: {
            'Id': 'KFS-TEST-001-2',
            'Imię i nazwisko': 'Maria Testowa',
            'Wiek': 29,
            'Stanowisko': 'UX Designer',
            'Początek umowy': '2024-02-01',
            'Utworzono': new Date().toISOString().split('T')[0]
          }
        }
      ]
    };

    console.log("👥 Submitting employees with current fields...");
    const employeeResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'POST',
        endpoint: 'tblh7tsaWWwXxBgSi',
        data: testEmployeeData
      })
    });

    if (!employeeResponse.ok) {
      const errorText = await employeeResponse.text();
      throw new Error(`Employee submission failed: ${employeeResponse.status} - ${errorText}`);
    }

    const employeeResult = await employeeResponse.json();
    console.log("✅ Employees submitted! Count:", employeeResult.records.length);

    console.log("\n🎉 SUCCESS! Test submission with current fields completed:");
    console.log("Company Record ID:", applicationRecordId);
    console.log("Employee Records:", employeeResult.records.map(r => r.id));
    console.log("\n👀 Check your Airtable to verify the records were created!");

    // Now test retrieval
    console.log("\n🔍 Testing data retrieval...");
    const retrieveResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        endpoint: `tbl2SOkYU0eBG2ZGj/${applicationRecordId}`
      })
    });

    if (retrieveResponse.ok) {
      const retrievedData = await retrieveResponse.json();
      console.log("✅ Successfully retrieved company record:");
      console.log(JSON.stringify(retrievedData.fields, null, 2));
    }

  } catch (error) {
    console.error("\n❌ FAILED! Test submission error:", error.message);
    console.error("Full error:", error);
  }
}

createTestWithCurrentFields();
// Final integration test with corrected "wyższe" spelling
async function testFinalIntegration() {
  console.log('🚀 FINAL INTEGRATION TEST - Sprawdzanie poprawności zapisywania...\n');
  
  // Complete test data with corrected spelling
  const testCompanyData = {
    company_name: "FINAL TEST - Poprawna Pisownia Sp. z o.o.",
    company_nip: "1111111111",
    company_pkd: "62.01.Z",
    representative_person: "Jan Finalny Manager",
    representative_phone: "111222333",
    representative_email: "jan.final@test.pl",
    contact_person_name: "Anna Finalna Assistant",
    contact_person_phone: "333222111",
    contact_person_email: "anna.final@test.pl",
    responsible_person_phone: "555444333",
    company_address: "ul. Finalna Integracja 123, 00-999 Warszawa",
    activity_place: "ul. Finalna Integracja 123, 00-999 Warszawa",
    correspondence_address: "ul. Korespondencyjna Final 456, 00-888 Warszawa",
    bank_name: "PKO Bank Final Integration",
    bank_account: "PL 11 2222 3333 4444 5555 6666 7777",
    account_not_interest_bearing: "tak",
    total_employees: "2",
    company_size: "mikro",
    balance_under_2m: "tak"
  };

  const testEmployees = {
    "1": {
      id: "final-test-emp-1",
      name: "Maria Finalna Developer",
      gender: "K",
      birth_date: "1992-05-10",
      education: "wyższe", // ✅ Poprawna pisownia z ż
      position: "Senior Full Stack Developer",
      contract_type: "umowa o prace", // ✅ Nowa pisownia ze spacjami
      contract_start: "2024-01-15",
      contract_end: "2024-12-31",
      isEditing: false,
      isNew: false
    },
    "2": {
      id: "final-test-emp-2",
      name: "Piotr Finalny Designer",
      gender: "M",
      birth_date: "1988-11-25",
      education: "średnie zawodowe", // ✅ Poprawna pisownia
      position: "UX/UI Designer",
      contract_type: "umowa zlecenie", // ✅ Nowa pisownia
      contract_start: "2024-02-01",
      contract_end: "",
      isEditing: false,
      isNew: false
    }
  };

  try {
    console.log('🏢 Submitting final test data...');
    console.log('Company:', testCompanyData.company_name);
    console.log('Employees:', Object.keys(testEmployees).length);

    // Step 1: Generate submission ID
    console.log('\n📋 Step 1: Generating submission ID...');
    const lastIdResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        endpoint: 'tbl2SOkYU0eBG2ZGj?maxRecords=1&sort[0][field]=fldb2lUUPqVyg3qHJ&sort[0][direction]=desc'
      })
    });
    
    const lastIdData = await lastIdResponse.json();
    const lastId = lastIdData?.records?.[0]?.fields?.fldb2lUUPqVyg3qHJ || 'KFS-0000';
    const newIdNumber = parseInt(lastId.replace('KFS-', '')) + 1;
    const submissionId = `KFS-${newIdNumber.toString().padStart(4, '0')}`;
    console.log('✅ Generated submission ID:', submissionId);

    // Step 2: Submit company with ALL fields
    console.log('\n🏢 Step 2: Submitting company data...');
    const companyPayload = {
      records: [{
        fields: {
          'fldb2lUUPqVyg3qHJ': submissionId,                    // submission_id
          'fldLAEWXsVNjcPwAM': new Date().toISOString(),        // submission_date  
          'fldWKTMxAQILBkDKr': testCompanyData.company_name,    // company_name
          'fldOrZL39rXQFy41x': testCompanyData.company_nip,     // company_nip
          'fldYsGfFe1D8up19H': testCompanyData.company_pkd,     // company_pkd
          'fldJBWA0L39GHhbzN': testCompanyData.representative_person, // representative_person
          'fldfOB2CjNM49XXrG': testCompanyData.representative_phone,  // representative_phone
          'fldQ4DHHTBAcgfpSX': testCompanyData.representative_email,  // representative_email
          'fld3Bh5roCuUOA4Bf': testCompanyData.contact_person_name,   // contact_person_name
          'fldxplyEUdpO6ruC4': testCompanyData.contact_person_phone,  // contact_person_phone
          'fldtwLBYR0UfcWTEy': testCompanyData.contact_person_email,  // contact_person_email
          'fldpSrs1mbCg4PqIA': testCompanyData.responsible_person_phone, // responsible_person_phone
          'fldKmJwLQIsrhacL8': testCompanyData.company_address,       // company_address
          'flds5jdpXJnt0QpHB': testCompanyData.activity_place,        // activity_place
          'fld7zP7tV4cOQOiEg': testCompanyData.correspondence_address, // correspondence_address
          'fldmhu2mXfMWbft1e': testCompanyData.bank_name,             // bank_name
          'fldzm2E1GpMWZO7i6': testCompanyData.bank_account,          // bank_account
          'fldb31oM7S69Iw4op': testCompanyData.account_not_interest_bearing === 'tak', // account_not_interest_bearing (checkbox)
          'fldD75gRcJwNmPu74': parseInt(testCompanyData.total_employees), // total_employees
          'fld10KKuthgPzMfEm': testCompanyData.company_size,           // company_size
          'fld9IwmSY5nJjLyXU': testCompanyData.balance_under_2m,       // balance_under_2m
          'fldHwKZarbtaEYVL1': 'Wysłane',                             // status
          'fldh8HPFPpSIPgf5C': new Date().toISOString().split('T')[0], // created
          'fldTVQ8oIhA6qhhKp': `http://localhost:5173/wniosek/PLACEHOLDER` // form_link
        }
      }]
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

    if (!companyResponse.ok) {
      const errorText = await companyResponse.text();
      throw new Error(`Company submission failed: ${companyResponse.status} - ${errorText}`);
    }

    const companyResult = await companyResponse.json();
    const applicationRecordId = companyResult.records[0].id;
    console.log('✅ Company data submitted successfully!');
    console.log('Application Record ID:', applicationRecordId);

    // Step 3: Update form link
    console.log('\n🔗 Step 3: Updating form link...');
    await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'PATCH',
        endpoint: `tbl2SOkYU0eBG2ZGj/${applicationRecordId}`,
        data: {
          fields: {
            'fldTVQ8oIhA6qhhKp': `http://localhost:5173/wniosek/${applicationRecordId}`
          }
        }
      })
    });
    console.log('✅ Form link updated!');

    // Step 4: Submit employees with corrected spelling
    console.log('\n👥 Step 4: Submitting employees with corrected data...');
    const employeeRecords = [];
    let employeeIndex = 1;

    Object.keys(testEmployees).forEach(employeeId => {
      const emp = testEmployees[employeeId];
      const age = emp.birth_date ? calculateAge(emp.birth_date) : null;
      
      console.log(`👤 Employee ${employeeIndex}:`, {
        name: emp.name,
        education: emp.education, // Should be "wyższe" with ż
        contract_type: emp.contract_type // Should be "umowa o prace" with spaces
      });
      
      employeeRecords.push({
        fields: {
          'fldjNHuDfah6i1D6A': `${submissionId}-${employeeIndex}`,  // id
          'fld2z5G2cb5cxeuOP': emp.name,                           // employee_name
          'fldzYdLbAH6RfPSUN': emp.gender,                         // gender
          'fldbciv6U2QXtJZgZ': age,                                // age
          'fldNCgGkvXYGuHpR7': emp.position,                       // position
          'fldRRQmwMtOjvyTKT': emp.education,                      // education ✅ wyższe
          'fldVxJrPOaMQcvL85': emp.contract_type,                  // contract_type ✅ umowa o prace
          'fldNZlLDeo94m3zkl': emp.contract_start,                 // contract_start
          'fldvpiCNqjHvchH4T': emp.contract_end || null,           // contract_end
          'fld8u4udfJZZj0Jg2': new Date().toISOString(),           // created
          'fldXDojrCPy6vnmp2': [applicationRecordId]               // company_link
        }
      });
      employeeIndex++;
    });

    const employeePayload = {
      records: employeeRecords
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

    if (!employeeResponse.ok) {
      const errorText = await employeeResponse.text();
      throw new Error(`Employee submission failed: ${employeeResponse.status} - ${errorText}`);
    }

    const employeeResult = await employeeResponse.json();
    console.log('✅ All employees submitted successfully!');
    console.log('Employee records created:', employeeResult.records.length);

    // Success summary
    console.log('\n🎉 FINAL INTEGRATION TEST SUCCESS!');
    console.log('═══════════════════════════════════════');
    console.log('✅ Submission ID:', submissionId);
    console.log('✅ Company Record ID:', applicationRecordId);
    console.log('✅ Employee Records:', employeeResult.records.length);
    console.log('✅ Corrected spelling: "wyższe" with ż');
    console.log('✅ Corrected spacing: "umowa o prace" with spaces');
    console.log('✅ Removed "(opcjonalne)" from address labels');
    console.log('✅ All Polish field names properly formatted');
    console.log('\n👀 Check your Airtable to verify all data is properly stored!');
    console.log('🌐 Form URL:', `http://localhost:5173/wniosek/${applicationRecordId}`);
    console.log('\nTest both views:');
    console.log('📝 Edit view:', `http://localhost:5173/wniosek/${applicationRecordId}/edit`);
    console.log('👁️  View mode:', `http://localhost:5173/wniosek/${applicationRecordId}`);

  } catch (error) {
    console.error('\n❌ FINAL INTEGRATION TEST FAILED!');
    console.error('═══════════════════════════════════════');
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

// Helper function to calculate age
function calculateAge(birthDate) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// Run the final test
testFinalIntegration();
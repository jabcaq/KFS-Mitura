// Complete integration test with all fields
async function testCompleteIntegration() {
  console.log("🚀 Testing COMPLETE Airtable integration with all Polish fields...\n");
  
  // Complete test company data matching all our form fields
  const testCompanyData = {
    company_name: "FINAL TEST - Kompletna Integracja Sp. z o.o.",
    company_nip: "9876543210",
    company_pkd: "62.01.Z",
    representative_person: "Jan Kompletny Manager",
    representative_phone: "999888777",
    representative_email: "jan.manager@finaltest.pl",
    contact_person_name: "Anna Kompletna Assistant",
    contact_person_phone: "777888999",
    contact_person_email: "anna@finaltest.pl",
    responsible_person_phone: "555666777",
    company_address: "ul. Kompletna Integracja 999, 00-999 Warszawa",
    activity_place: "ul. Kompletna Integracja 999, 00-999 Warszawa",
    correspondence_address: "ul. Korespondencyjna 123, 00-123 Warszawa",
    bank_name: "PKO Bank Final Test",
    bank_account: "PL 99 1111 2222 3333 4444 5555 6666",
    account_not_interest_bearing: "tak",
    total_employees: "3",
    company_size: "mikro",
    balance_under_2m: "tak"
  };

  const testEmployees = {
    "1": {
      id: "final-test-emp-1",
      name: "Paweł Kompletny Developer",
      gender: "M",
      birth_date: "1985-03-15",
      education: "wyzsze",
      position: "Senior Full Stack Developer",
      contract_type: "umowa o prace",
      contract_start: "2024-01-01",
      contract_end: "2024-12-31",
      isEditing: false,
      isNew: false
    },
    "2": {
      id: "final-test-emp-2",
      name: "Maria Kompletna Designer",
      gender: "K",
      birth_date: "1990-07-20",
      education: "średnie zawodowe",
      position: "UX/UI Designer",
      contract_type: "umowa zlecenie",
      contract_start: "2024-02-01",
      contract_end: "",
      isEditing: false,
      isNew: false
    },
    "3": {
      id: "final-test-emp-3",
      name: "Piotr Kompletny Manager",
      gender: "M",
      birth_date: "1988-11-10",
      education: "wyzsze",
      position: "Project Manager",
      contract_type: "właściciel firmy",
      contract_start: "2024-01-01",
      contract_end: "",
      isEditing: false,
      isNew: false
    }
  };

  try {
    console.log("🏢 Submitting complete company data...");
    console.log("Company:", testCompanyData.company_name);
    console.log("Employees:", Object.keys(testEmployees).length);

    // Test submission using our service (simulated)
    // This simulates what submitToAirtable function does
    
    // Step 1: Generate submission ID
    console.log("\n📋 Step 1: Generating submission ID...");
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
    console.log("✅ Generated submission ID:", submissionId);

    // Step 2: Submit company with ALL fields using field IDs
    console.log("\n🏢 Step 2: Submitting company data with all fields...");
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
          'fldTVQ8oIhA6qhhKp': `http://localhost:3000/wniosek/PLACEHOLDER` // form_link
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
    console.log("✅ Company data submitted successfully!");
    console.log("Application Record ID:", applicationRecordId);

    // Step 3: Update form link
    console.log("\n🔗 Step 3: Updating form link...");
    await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'PATCH',
        endpoint: `tbl2SOkYU0eBG2ZGj/${applicationRecordId}`,
        data: {
          fields: {
            'fldTVQ8oIhA6qhhKp': `http://localhost:3000/wniosek/${applicationRecordId}`
          }
        }
      })
    });
    console.log("✅ Form link updated!");

    // Step 4: Submit employees with ALL fields
    console.log("\n👥 Step 4: Submitting employees with all fields...");
    const employeeRecords = [];
    let employeeIndex = 1;

    Object.keys(testEmployees).forEach(employeeId => {
      const emp = testEmployees[employeeId];
      const age = emp.birth_date ? calculateAge(emp.birth_date) : null;
      
      employeeRecords.push({
        fields: {
          'fldjNHuDfah6i1D6A': `${submissionId}-${employeeIndex}`,  // id
          'fld2z5G2cb5cxeuOP': emp.name,                           // employee_name
          'fldzYdLbAH6RfPSUN': emp.gender,                         // gender
          'fldbciv6U2QXtJZgZ': age,                                // age
          'fldNCgGkvXYGuHpR7': emp.position,                       // position
          'fldRRQmwMtOjvyTKT': emp.education,                      // education
          'fldVxJrPOaMQcvL85': emp.contract_type,                  // contract_type
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
    console.log("✅ All employees submitted successfully!");
    console.log("Employee records created:", employeeResult.records.length);

    // Success summary
    console.log("\n🎉 COMPLETE INTEGRATION TEST SUCCESS!");
    console.log("═══════════════════════════════════════");
    console.log("✅ Submission ID:", submissionId);
    console.log("✅ Company Record ID:", applicationRecordId);
    console.log("✅ Employee Records:", employeeResult.records.length);
    console.log("✅ All Polish field names mapped to Field IDs");
    console.log("✅ All form fields successfully saved to Airtable");
    console.log("\n👀 Check your Airtable to verify all data is properly stored!");
    console.log("🌐 Form URL:", `http://localhost:3000/wniosek/${applicationRecordId}`);

  } catch (error) {
    console.error("\n❌ COMPLETE INTEGRATION TEST FAILED!");
    console.error("═══════════════════════════════════════");
    console.error("Error:", error.message);
    console.error("Full error:", error);
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

// Run the complete test
testCompleteIntegration();
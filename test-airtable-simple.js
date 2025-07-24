// Simple test to submit data to Airtable using our local API
const testCompanyData = {
  company_name: "TEST Field IDs Integration Sp. z o.o.",
  company_nip: "123-456-78-90",
  company_pkd: "62.01.Z",
  representative_person: "Jan Testowy Field IDs",
  representative_phone: "123456789",
  representative_email: "jan@fieldidstest.pl",
  contact_person_name: "Anna Testowa Field IDs",
  contact_person_phone: "987654321",
  contact_person_email: "anna@fieldidstest.pl",
  company_street: "ul. Testowa Field IDs 999",
  company_postal_code: "00-001",
  company_city: "Warszawa",
  company_address: "ul. Testowa Field IDs 999, 00-001 Warszawa",
  activity_place: "ul. Testowa Field IDs 999, 00-001 Warszawa",
  correspondence_address: "",
  bank_name: "PKO Bank Polski",
  bank_account: "PL 12 3456 7890 1234 5678 9012 3456",
  account_not_interest_bearing: "nie",
  total_employees: "2",
  company_size: "mikro",
  balance_under_2m: "tak"
};

const testEmployees = {
  "1": {
    id: "test-field-ids-1",
    name: "Paweł Field IDs",
    gender: "M", 
    birth_date: "1990-05-15",
    education: "wyzsze",
    position: "Senior Field ID Developer",
    contract_type: "umowa_o_prace",
    contract_start: "2024-01-01",
    contract_end: "2024-12-31",
    isEditing: false,
    isNew: false
  },
  "2": {
    id: "test-field-ids-2",
    name: "Maria Field IDs",
    gender: "K",
    birth_date: "1985-03-20", 
    education: "srednie_zawodowe",
    position: "Field ID Specialist",
    contract_type: "umowa_zlecenie",
    contract_start: "2024-02-01",
    contract_end: "",
    isEditing: false,
    isNew: false
  }
};

async function testAirtableSubmission() {
  console.log("🧪 Testing Airtable Field ID Integration...");
  console.log("Company:", testCompanyData.company_name);
  console.log("Employees:", Object.keys(testEmployees).length);

  try {
    // Simulate the API call flow that our frontend does
    
    // Step 1: Generate submission ID
    const submissionIdResponse = await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'GET',
        endpoint: 'tbl2SOkYU0eBG2ZGj?maxRecords=1&sort%5B0%5D%5Bfield%5D=fldb2lUUPqVyg3qHJ&sort%5B0%5D%5Bdirection%5D=desc'
      })
    });
    
    const submissionData = await submissionIdResponse.json();
    console.log("📋 Got last submission data:", submissionData);
    
    // Generate new ID
    const lastId = submissionData?.records?.[0]?.fields?.fldb2lUUPqVyg3qHJ || 'KFS-0000';
    const newIdNumber = parseInt(lastId.replace('KFS-', '')) + 1;
    const submissionId = `KFS-${newIdNumber.toString().padStart(4, '0')}`;
    console.log("🆔 New submission ID:", submissionId);
    
    // Step 2: Submit company data with field IDs
    const companyPayload = {
      records: [{
        fields: {
          'fldb2lUUPqVyg3qHJ': submissionId, // submission_id
          'fldCN9HqjH2MXBpV5': new Date().toISOString(), // submission_date
          'fldWKTMxAQILBkDKr': testCompanyData.company_name, // company_name
          'fldOrZL39rXQFy41x': testCompanyData.company_nip, // company_nip
          'fldFtX8Mzf5HF8Mhd': testCompanyData.company_pkd, // company_pkd
          'fldJBWA0L39GHhbzN': testCompanyData.representative_person, // representative_person
          'fldVV8Y2CG7AX8pWm': testCompanyData.representative_phone, // representative_phone
          'fld2L1bM5FxT4p2Vs': testCompanyData.representative_email, // representative_email
          'fldBtMGRyLrSt6OzZ': testCompanyData.contact_person_name, // contact_person_name
          'fldlxCbkCQbFSSKoH': testCompanyData.contact_person_phone, // contact_person_phone
          'fldFjZGqz6IM5lZLn': testCompanyData.contact_person_email, // contact_person_email
          'fld4HKGj5DIQKXV29': testCompanyData.company_street, // company_street
          'fldddPZKOJVJrYQ5x': testCompanyData.company_postal_code, // company_postal_code
          'fldkNsJM3TaKUZzBV': testCompanyData.company_city, // company_city
          'fldXkzqjGrUGqGOzB': testCompanyData.company_address, // company_address
          'fldPWHZF5QWKi1qfp': testCompanyData.activity_place, // activity_place
          'fldnJdrvHqb6y9NDZ': testCompanyData.correspondence_address, // correspondence_address
          'fld5fxPR0q05C7LCE': testCompanyData.bank_name, // bank_name
          'fldWdZFsN2Q4nTy6n': testCompanyData.bank_account, // bank_account
          'fldAcKXHX3z32M8XT': testCompanyData.account_not_interest_bearing, // account_not_interest_bearing
          'fldKzKZbkQYCxglF4': parseInt(testCompanyData.total_employees), // total_employees
          'fldvXwWNsm9aOZaIv': testCompanyData.company_size, // company_size
          'fldPrAmHTFCBJPo6A': testCompanyData.balance_under_2m, // balance_under_2m
          'fld2mJSTGy7pGZ9ZV': 'Submitted', // status
          'fldGAYlZU8vRDh7lG': `http://localhost:3000/wniosek/PLACEHOLDER` // link_do_formularza
        }
      }]
    };

    console.log("🏢 Submitting company data...");
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
    console.log("✅ Company data submitted! Record ID:", applicationRecordId);

    // Step 3: Update form link
    console.log("🔗 Updating form link...");
    await fetch('http://localhost:3001/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'PATCH',
        endpoint: `tbl2SOkYU0eBG2ZGj/${applicationRecordId}`,
        data: {
          fields: {
            'fldGAYlZU8vRDh7lG': `http://localhost:3000/wniosek/${applicationRecordId}`
          }
        }
      })
    });

    // Step 4: Submit employees with field IDs
    const employeeRecords = [];
    let employeeIndex = 1;

    Object.keys(testEmployees).forEach(employeeId => {
      const emp = testEmployees[employeeId];
      employeeRecords.push({
        fields: {
          'fldKUmOLFrSFtjGqH': `${submissionId}-${employeeIndex}`, // id
          'fld42KA9aezSe7K7k': emp.name, // employee_name
          'fldl8rKWB7NTlJzKa': emp.gender, // gender
          'fldp6hHfLWHs9p4zP': emp.birth_date ? calculateAge(emp.birth_date) : null, // age
          'fldGRwfYgr9WOYLbZ': emp.birth_date, // date
          'fldQjfALgtcEAjg1m': emp.education, // education
          'fldQGMKAJcVwU2lAQ': emp.position, // position
          'fldhBZdS4nfT8BHID': emp.contract_type, // contract_type
          'fldGWaKLCCJp1v9BD': emp.contract_start, // contract_start
          'fldNVYP2qRf5gCp1A': emp.contract_end, // contract_end
          'fldX8Bp2PpYuVFpjy': [applicationRecordId] // application_id
        }
      });
      employeeIndex++;
    });

    if (employeeRecords.length > 0) {
      console.log("👥 Submitting employees...");
      const employeeResponse = await fetch('http://localhost:3001/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'POST',
          endpoint: 'tblh7tsaWWwXxBgSi',
          data: { records: employeeRecords }
        })
      });

      if (!employeeResponse.ok) {
        const errorText = await employeeResponse.text();
        throw new Error(`Employee submission failed: ${employeeResponse.status} - ${errorText}`);
      }

      const employeeResult = await employeeResponse.json();
      console.log("✅ Employees submitted! Count:", employeeResult.records.length);
    }

    console.log("\n🎉 SUCCESS! Test submission completed:");
    console.log("Submission ID:", submissionId);
    console.log("Application Record ID:", applicationRecordId);
    console.log("Employee Count:", employeeRecords.length);
    console.log("\n👀 Check your Airtable to verify the records were created with field IDs!");

  } catch (error) {
    console.error("\n❌ FAILED! Test submission error:", error.message);
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

// Run the test
testAirtableSubmission();
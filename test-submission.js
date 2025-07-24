import { submitToAirtable } from './src/services/airtableServiceSecure.ts';

// Test data
const testCompanyData = {
  company_name: "TEST Firma Field IDs Sp. z o.o.",
  company_nip: "123-456-78-90",
  company_pkd: "62.01.Z",
  representative_person: "Jan Testowy",
  representative_phone: "123456789",
  representative_email: "jan@testfieldsids.pl",
  contact_person_name: "Anna Testowa",
  contact_person_phone: "987654321", 
  contact_person_email: "anna@testfieldsids.pl",
  company_street: "ul. Testowa Field IDs 123",
  company_postal_code: "00-001",
  company_city: "Warszawa",
  company_address: "ul. Testowa Field IDs 123, 00-001 Warszawa",
  activity_place: "ul. Testowa Field IDs 123, 00-001 Warszawa",
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
    id: "test-field-emp-1",
    name: "Paweł Field ID Test",
    gender: "M",
    birth_date: "1990-05-15",
    education: "wyzsze",
    position: "Programista Field IDs",
    contract_type: "umowa_o_prace",
    contract_start: "2024-01-01",
    contract_end: "2024-12-31",
    isEditing: false,
    isNew: false
  },
  "2": {
    id: "test-field-emp-2",
    name: "Maria Field ID Test", 
    gender: "K",
    birth_date: "1985-03-20",
    education: "srednie_zawodowe",
    position: "Księgowa Field IDs",
    contract_type: "umowa_zlecenie",
    contract_start: "2024-02-01",
    contract_end: "",
    isEditing: false,
    isNew: false
  }
};

console.log("🧪 Testing Airtable Field ID Integration...");
console.log("Company:", testCompanyData.company_name);
console.log("Employees:", Object.keys(testEmployees).length);

try {
  const result = await submitToAirtable(testCompanyData, testEmployees);
  console.log("✅ SUCCESS! Test submission completed:", result);
  console.log("Submission ID:", result.submissionId);
  console.log("Application Record ID:", result.applicationRecordId);
  console.log("Employee Count:", result.employeeCount);
} catch (error) {
  console.error("❌ FAILED! Test submission error:", error);
  console.error("Error details:", error.message);
}
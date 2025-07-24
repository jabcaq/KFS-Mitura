// Test script to verify Airtable field ID integration
const testData = {
  companyData: {
    company_name: "Test Firma Sp. z o.o.",
    company_nip: "123-456-78-90",
    company_pkd: "62.01.Z",
    representative_person: "Jan Kowalski",
    representative_phone: "123456789",
    representative_email: "jan@testfirma.pl",
    contact_person_name: "Anna Nowak",
    contact_person_phone: "987654321",
    contact_person_email: "anna@testfirma.pl",
    company_street: "ul. Testowa 123",
    company_postal_code: "00-001",
    company_city: "Warszawa",
    company_address: "ul. Testowa 123, 00-001 Warszawa",
    activity_place: "ul. Testowa 123, 00-001 Warszawa",
    correspondence_address: "",
    bank_name: "PKO Bank Polski",
    bank_account: "PL 12 3456 7890 1234 5678 9012 3456",
    account_not_interest_bearing: "nie",
    total_employees: "5",
    company_size: "mikro",
    balance_under_2m: "tak"
  },
  employees: {
    "1": {
      id: "test-emp-1",
      name: "Paweł Testowy",
      gender: "M",
      birth_date: "1990-05-15",
      education: "wyzsze",
      position: "Programista",
      contract_type: "umowa_o_prace",
      contract_start: "2024-01-01",
      contract_end: "2024-12-31",
      isEditing: false,
      isNew: false
    },
    "2": {
      id: "test-emp-2", 
      name: "Maria Testowa",
      gender: "K",
      birth_date: "1985-03-20",
      education: "srednie_zawodowe",
      position: "Księgowa",
      contract_type: "umowa_zlecenie",
      contract_start: "2024-02-01",
      contract_end: "",
      isEditing: false,
      isNew: false
    }
  }
};

console.log("Test data prepared:");
console.log("Company:", testData.companyData.company_name);
console.log("Employees:", Object.keys(testData.employees).length);
console.log("Ready to test Airtable submission");
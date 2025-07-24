# 🎯 COMPLETE AIRTABLE FIELD MAPPING
**Generated: 2025-07-24** | **Status: ✅ WORKING**

## 📊 Company Table (tbl2SOkYU0eBG2ZGj) - Dane podmiotu
**Total Fields: 26**

```typescript
const COMPANY_FIELD_IDS = {
  // Podstawowe dane
  submission_id: 'fldb2lUUPqVyg3qHJ',              // 'ID formularza'
  company_name: 'fldWKTMxAQILBkDKr',               // 'Nazwa firmy'  
  company_nip: 'fldOrZL39rXQFy41x',                // 'NIP firmy'
  company_pkd: 'fldYsGfFe1D8up19H',                // 'PKD firmy'
  
  // Osoby
  representative_person: 'fldJBWA0L39GHhbzN',      // 'Osoba uprawniona'
  representative_phone: 'fldfOB2CjNM49XXrG',       // 'Telefon przedstawiciela'
  representative_email: 'fldQ4DHHTBAcgfpSX',       // 'Email osoby uprawnionej' ⭐ NEW
  contact_person_name: 'fld3Bh5roCuUOA4Bf',        // 'Imię i nazwisko osoby kontaktowej'
  contact_person_phone: 'fldxplyEUdpO6ruC4',       // 'Telefon osoby kontaktowej'
  contact_person_email: 'fldtwLBYR0UfcWTEy',       // 'Email osoby kontaktowej'
  responsible_person: 'fldWyVXSr2YYp3ceu',         // 'Osoba odpowiedzialna'
  responsible_person_phone: 'fldpSrs1mbCg4PqIA',   // 'Telefon osoby uprawnionej' ⭐ NEW
  
  // Adresy
  company_address: 'fldKmJwLQIsrhacL8',             // 'Adres firmy'
  activity_place: 'flds5jdpXJnt0QpHB',             // 'Miejsce prowadzenia działalności'
  correspondence_address: 'fld7zP7tV4cOQOiEg',     // 'Adres korespondencyjny'
  
  // Dane bankowe
  bank_name: 'fldmhu2mXfMWbft1e',                  // 'Nazwa banku'
  bank_account: 'fldzm2E1GpMWZO7i6',               // 'rachunek bankowy'
  account_not_interest_bearing: 'fldb31oM7S69Iw4op', // 'Konto nieoprocentowane' ⭐ NEW (checkbox)
  
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
```

## 👥 Employee Table (tblh7tsaWWwXxBgSi) - Pracownicy
**Total Fields: 11**

```typescript
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
  company_link: 'fldXDojrCPy6vnmp2'               // 'Dane podmiotu'
};
```

## 🎯 Select Field Options

```typescript
const SELECT_OPTIONS = {
  // Company fields
  company_size: ["mikro", "mały", "średni", "duży", "inne"],
  balance_under_2m: ["tak", "nie"],
  status: ["Szkic", "Wysłane", "W trakcie", "Zaakceptowane"],
  responsible_person: ["Rafał", "Karolina", "Karol", ""],
  
  // Employee fields  
  gender: ["M", "K"],
  education: [
    "podstawowe", 
    "gimnazjalne", 
    "zawodowe", 
    "srednie ogólnokształcące", 
    "średnie zawodowe", 
    "policealne", 
    "wyzsze"
  ],
  contract_type: [
    "umowa o prace", 
    "umowa zlecenie", 
    "umowa dzielo", 
    "b2b", 
    "powolanie", 
    "inne", 
    "właściciel firmy"
  ]
};
```

## ✅ Test Results

**Last Test:** 2025-07-24  
**Status:** ✅ SUCCESS  
**Record ID:** `recQUFFnOwsCK4jTT`  
**Company Fields:** 26/26 mapped  
**Employee Fields:** 11/11 mapped  

### Test Data Used:
- ✅ Company with ALL 26 fields
- ✅ 3 Employees with all fields
- ✅ All select options validated
- ✅ Proper field ID mapping
- ✅ Checkbox field (Konto nieoprocentowane)
- ✅ Email validation fields
- ✅ Phone number fields

## 🔧 Implementation Notes

1. **Field IDs vs Names:** Using field IDs for resilience to schema changes
2. **Select Options:** All options retrieved from live Airtable schema
3. **Data Types:** 
   - `checkbox` → boolean
   - `email` → string with validation
   - `phoneNumber` → string
   - `number` → parsed integer
   - `singleSelect` → exact string match required
4. **Status Mapping:** Form uses "Wysłane" status when submitted
5. **Missing Fields:** All 26 company fields now mapped (was 23)

## 🚀 Next Steps

- [ ] Update form components to use new fields
- [ ] Add validation for new email/phone fields  
- [ ] Update TypeScript types
- [ ] Deploy updated service to Vercel

**All fields successfully tested and working! 🎉**
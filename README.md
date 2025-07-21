# Formularz KFS 2025 - Vite + React + TypeScript

🚀 **Nowoczesna aplikacja formularza w React z TypeScript i Vite**

## ✨ Funkcjonalności

- **Sekcja 1: Dane podmiotu** - formularz z danymi firmy, kontaktami i informacjami bankowymi
- **Sekcja 2: Dane pracowników** - dynamiczne zarządzanie pracownikami z możliwością dodawania, edycji i usuwania
- **Walidacja formularza** - sprawdzanie wymaganych pól w czasie rzeczywistym z TypeScript
- **Podgląd wniosku** - modal z podsumowaniem danych przed wysłaniem
- **Integracja z Airtable** - automatyczne zapisywanie danych do bazy
- **Responsywny design** - dostosowanie do urządzeń mobilnych
- **TypeScript** - pełne typowanie dla lepszego developer experience

## 🛠️ Technologie

- **React 18** - Nowoczesny React z hooks
- **TypeScript** - Statyczne typowanie
- **Vite** - Szybki bundler i dev server
- **Bootstrap 5.3.2** - Framework CSS
- **FontAwesome 6.4.0** - Ikony
- **Airtable API** - Baza danych

## 📁 Struktura projektu

```
src/
├── components/           # Komponenty React
│   ├── FormContainer.tsx
│   ├── CompanyDataSection.tsx
│   ├── EmployeeSection.tsx
│   ├── EmployeeCard.tsx
│   ├── PreviewModal.tsx
│   └── ThankYouPage.tsx
├── services/            # Serwisy API
│   └── airtableService.ts
├── types/               # Typy TypeScript
│   └── index.ts
├── App.tsx              # Główny komponent
├── main.tsx             # Entry point
└── App.css              # Style CSS
```

## 🚀 Instalacja i uruchomienie

```bash
# Instalacja zależności
npm install

# Uruchomienie w trybie deweloperskim
npm run dev

# Budowanie wersji produkcyjnej
npm run build

# Podgląd wersji produkcyjnej
npm run preview
```

## ⚙️ Konfiguracja Airtable

Zaktualizuj plik `src/services/airtableService.ts`:

```typescript
const AIRTABLE_CONFIG: AirtableConfig = {
  pat: 'TU_WSTAW_SWOJ_PERSONAL_ACCESS_TOKEN',
  baseId: 'TU_WSTAW_BASE_ID',
  applicationsTableId: 'TU_WSTAW_APPLICATIONS_TABLE_ID',
  employeesTableId: 'TU_WSTAW_EMPLOYEES_TABLE_ID',
  baseUrl: 'https://api.airtable.com/v0'
};
```

## 📊 Struktura danych

### Tabela Applications (Wnioski)
```typescript
interface ApplicationRecord {
  submission_id: string;
  company_name: string;
  company_nip: string;
  company_pkd: string;
  representative_person: string;
  representative_phone: string;
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_email: string;
  company_address: string;
  activity_place: string;
  correspondence_address: string;
  bank_name: string;
  bank_account: string;
  total_employees: number;
  company_size: string;
  balance_under_2m: string;
  status: string;
}
```

### Tabela Employees (Pracownicy)
```typescript
interface EmployeeRecord {
  Id: string;
  employee_name: string;
  gender: string;
  age: number;
  education: string;
  position: string;
  contract_type: string;
  contract_start: string;
  contract_end: string;
  application_id: string[];
}
```

## 🎯 Komponenty TypeScript

### FormContainer.tsx
- Główny kontener formularza
- Zarządzanie stanem formularza
- Walidacja i wysyłanie danych

### CompanyDataSection.tsx
- Sekcja danych firmy
- Kontrolowane inputy z walidacją
- TypeScript props validation

### EmployeeSection.tsx
- Zarządzanie kolekcją pracowników
- Dodawanie/usuwanie pracowników
- State management z TypeScript

### EmployeeCard.tsx
- Indywidualna karta pracownika
- Tryb edycji/zapisany
- Pełne typowanie formularza

### PreviewModal.tsx
- Modal podglądu danych
- Generowanie tabel podglądu
- TypeScript event handlers

### ThankYouPage.tsx
- Strona podziękowania
- Wyświetlanie danych submission
- Restart aplikacji

## 🔧 Typy TypeScript

Wszystkie typy są zdefiniowane w `src/types/index.ts`:

- `CompanyData` - Dane firmy
- `Employee` - Dane pracownika
- `EmployeeCollection` - Kolekcja pracowników
- `ValidationErrors` - Błędy walidacji
- `AirtableSubmissionResult` - Wynik wysyłania
- Props dla wszystkich komponentów

## 🎨 Style CSS

- Kolorystyka: Pomarańczowo-żółty gradient
- Responsywny design
- Animacje CSS
- Bootstrap 5 components
- Custom CSS classes

## 🚀 Przewagi nad poprzednią wersją

### Vite vs Create React App
- ⚡ **10x szybszy** development server
- 🔥 **Instant HMR** - Hot Module Replacement
- 📦 **Mniejszy bundle** size
- 🛠️ **Lepsze tooling** - ESBuild, Rollup
- 🔧 **Zero konfiguracji** dla TypeScript

### TypeScript vs JavaScript
- 🛡️ **Type safety** - łapanie błędów na etapie kompilacji
- 🔍 **Lepsze IntelliSense** - autocomplete, refaktoryzacja
- 📝 **Samodokumentujący** kod
- 🔧 **Łatwiejszy maintenance** - refaktoryzacja, zmiany
- 👥 **Lepsze team development**

## 📝 Migracja z HTML/JavaScript

Wszystkie funkcjonalności zostały przeniesione i ulepszone:

- ✅ **Dynamiczne pracownicy** - lepsze state management
- ✅ **Walidacja** - typesafe validation
- ✅ **Podgląd** - typowane dane
- ✅ **Airtable** - typesafe API calls
- ✅ **Responsywność** - Bootstrap + custom CSS
- ✅ **Animacje** - zachowane wszystkie efekty
- ✅ **UX** - ulepszone user experience

## 🔥 Performance

- **Fast build**: Vite + ESBuild
- **Small bundle**: Tree shaking
- **Fast dev**: Hot Module Replacement
- **Type checking**: TypeScript compiler
- **Optimized**: Production build

## 📱 Uruchomienie

1. `npm run dev` - Development server na http://localhost:5173
2. Skonfiguruj Airtable credentials
3. Testuj funkcjonalności formularza
4. `npm run build` - Build dla produkcji

**Aplikacja gotowa do użycia!** 🎉
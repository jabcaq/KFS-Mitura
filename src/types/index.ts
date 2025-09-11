// Company data types - Updated to match actual Airtable fields
export interface CompanyData {
    company_name: string;
    company_nip: string;
    company_pkd: string;
    representative_person: string;
    representative_phone: string;
    representative_email: string;
    contact_person_name: string;
    contact_person_phone: string;
    contact_person_email: string;
    responsible_person_phone: string;

    // Adresy jako pełne teksty (tak jak w Airtable)
    company_address: string;
    activity_place: string;
    correspondence_address: string;

    // Nowe pola adresowe (rozłożone na części)
    company_street: string;
    company_postal_code: string;
    company_city: string;
    activity_street: string;
    activity_postal_code: string;
    activity_city: string;
    correspondence_street: string;
    correspondence_postal_code: string;
    correspondence_city: string;

    bank_name: string;
    bank_account: string;
    account_not_interest_bearing: 'tak' | 'nie' | '';
    total_employees: string;
    company_size: 'mikro' | 'mały' | 'średni' | 'duży' | 'inne' | '';
    balance_under_2m: 'tak' | 'nie' | '';
    planned_employee_count: string; // New field for planned training count
}

// Employee data types - Updated to match actual Airtable options
export interface Employee {
    id?: string;
    name: string;
    gender: 'M' | 'K' | '';
    birth_date: string;
    disability_status: boolean;
    education: 'podstawowe' | 'gimnazjalne' | 'zawodowe' | 'srednie ogólnokształcące' | 'średnie zawodowe' | 'policealne' | 'wyższe' | '';
    position: string;
    contract_type: 'umowa o prace' | 'umowa zlecenie' | 'umowa dzielo' | 'b2b' | 'powolanie' | 'inne' | 'właściciel firmy' | '';
    contract_start: string;
    contract_end: string;
    isEditing: boolean;
    isNew?: boolean;
}

// Employee collection type
export type EmployeeCollection = Record<string, Employee>;

// Validation errors
export interface ValidationErrors {
    [key: string]: string | undefined;
}

// Form submission data
export interface FormSubmissionData {
    company: CompanyData;
    employees: EmployeeCollection;
}

// Airtable configuration
export interface AirtableConfig {
    pat: string;
    baseId: string;
    applicationsTableId: string;
    employeesTableId: string;
    baseUrl: string;
}

// Airtable submission result
export interface AirtableSubmissionResult {
    success: boolean;
    submissionId: string;
    applicationRecordId: string;
    employeeCount: number;
}

// Application record for Airtable
export interface ApplicationRecord {
    submission_id: string;
    submission_date: string;
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

// Employee record for Airtable
export interface EmployeeRecord {
    id: string;
    employee_name: string;
    gender: string;
    birth_date: string;
    education: string;
    position: string;
    contract_type: string;
    contract_start: string;
    contract_end: string;
    created: string;
    company_link: string;
    application_id: string;
}

// Component props
export interface CompanyDataSectionProps {
    formData: CompanyData;
    onChange: (field: keyof CompanyData, value: string) => void;
    validationErrors: ValidationErrors;
}

export interface EmployeeSectionProps {
    employees: EmployeeCollection;
    setEmployees: React.Dispatch<React.SetStateAction<EmployeeCollection>>;
    validationErrors: ValidationErrors;
}

export interface EmployeeCardProps {
    employee: Employee;
    employeeNumber: number;
    onUpdate: (data: Partial<Employee>) => void;
    onRemove: () => void;
}

export interface PreviewModalProps {
    formData: CompanyData;
    employees: EmployeeCollection;
    onClose: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export interface ThankYouPageProps {
    submissionData: AirtableSubmissionResult;
    onNewSubmission: () => void;
}

export interface FormContainerProps {
    onSubmissionSuccess: (data: AirtableSubmissionResult) => void;
}

// Message types
export type MessageType = 'success' | 'error';

// Preview data
export interface PreviewData {
    companyData: string[][];
    employeeData: (string | number)[][];
    employeeCount: number;
}
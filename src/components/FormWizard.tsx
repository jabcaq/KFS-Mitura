import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressSteps } from './ui/ProgressSteps';
import CompanyDataStep from './steps/CompanyDataStep';
import EmployeesStep from './steps/EmployeesStep';
import ReviewStep from './steps/ReviewStep';
import SuccessStep from './steps/SuccessStep';
import { submitToAirtable } from '../services/airtableServiceSecure';
import type { CompanyData, EmployeeCollection } from '../types';

interface FormWizardProps {
  onSubmissionSuccess: (data: { companyData: CompanyData; employees: EmployeeCollection }) => void;
}

interface WizardData {
  companyData: CompanyData;
  employees: EmployeeCollection;
}

const STEPS = [
  {
    id: 'company',
    title: 'Dane firmy',
    description: 'Podstawowe informacje o firmie',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"/>
        <path d="M8 6h4v2H8V6zm0 4h4v2H8v-2z"/>
      </svg>
    )
  },
  {
    id: 'employees',
    title: 'Pracownicy',
    description: 'Dodaj pracowników do szkolenia',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
      </svg>
    )
  },
  {
    id: 'review',
    title: 'Przegląd',
    description: 'Sprawdź wprowadzone dane',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
      </svg>
    )
  }
];

const STORAGE_KEY = 'formularz_wizard_data';

const getDefaultWizardData = (): WizardData => ({
  companyData: {
    company_name: '',
    company_nip: '',
    company_pkd: '',
    representative_person: '',
    representative_phone: '',
    contact_person_name: '',
    contact_person_phone: '',
    contact_person_email: '',
    
    // Nowe pola adresowe
    company_street: '',
    company_postal_code: '',
    company_city: '',
    activity_street: '',
    activity_postal_code: '',
    activity_city: '',
    correspondence_street: '',
    correspondence_postal_code: '',
    correspondence_city: '',
    
    // Stare pola (kompatybilność)
    company_address: '',
    activity_place: '',
    correspondence_address: '',
    
    bank_name: '',
    bank_account: '',
    total_employees: '',
    company_size: '',
    balance_under_2m: ''
  },
  employees: {}
});

const loadSavedData = (): WizardData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsedData = JSON.parse(saved);
      console.log('📁 Przywrócono dane z localStorage:', Object.keys(parsedData.companyData).filter(key => parsedData.companyData[key]).length, 'pól wypełnionych');
      return parsedData;
    }
  } catch (error) {
    console.warn('❌ Błąd podczas odczytywania danych z localStorage:', error);
  }
  return getDefaultWizardData();
};

const FormWizard: React.FC<FormWizardProps> = ({ onSubmissionSuccess }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1); // DEBUG: Start at company step
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [wizardData, setWizardData] = useState<WizardData>(loadSavedData);

  // Auto-save do localStorage przy każdej zmianie danych
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wizardData));
      console.log('💾 Dane zapisane do localStorage');
    } catch (error) {
      console.warn('❌ Błąd podczas zapisywania do localStorage:', error);
    }
  }, [wizardData]);

  // Funkcja do czyszczenia localStorage
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ Dane usunięte z localStorage');
    } catch (error) {
      console.warn('❌ Błąd podczas usuwania z localStorage:', error);
    }
  }, []);

  const updateCompanyData = useCallback((data: Partial<CompanyData>) => {
    setWizardData(prev => ({
      ...prev,
      companyData: { ...prev.companyData, ...data }
    }));
  }, []);

  const updateEmployees = useCallback((employees: EmployeeCollection) => {
    setWizardData(prev => ({
      ...prev,
      employees
    }));
  }, []);

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        // Validate company data - required fields only (activity and correspondence addresses are optional)
        const required = [
          'company_name', 'company_nip', 'company_pkd', 
          'representative_person', 'representative_phone',
          'contact_person_name', 'contact_person_phone', 'contact_person_email',
          'company_street', 'company_postal_code', 'company_city',
          'bank_name', 'bank_account', 'total_employees', 'company_size', 'balance_under_2m'
        ];
        return required.every(field => 
          wizardData.companyData[field as keyof CompanyData]?.toString().trim()
        );
      
      case 2:
        // Validate employees
        const employeeList = Object.values(wizardData.employees);
        return employeeList.length > 0 && employeeList.every(emp => 
          emp.name && emp.gender && emp.birth_date && emp.education && 
          emp.position && emp.contract_type && emp.contract_start
        );
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    console.log('🔍 handleNext called, currentStep:', currentStep);
    console.log('📊 Current wizard data:', wizardData);
    
    const isValid = validateStep();
    console.log('✅ Validation result:', isValid);
    
    if (isValid) {
      console.log('✅ Validation passed, moving to next step');
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    } else {
      console.log('❌ Validation failed, staying on current step');
      // Trigger visual validation in current step component
      if (currentStep === 1 && (window as any).validateCompanyStep) {
        (window as any).validateCompanyStep();
      }
    }
  };


  const handlePrevious = () => {
    const newStep = Math.max(currentStep - 1, 1);
    setCurrentStep(newStep);
    
    // Remove completed steps that come after the new current step
    setCompletedSteps(prev => prev.filter(step => step < newStep));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Wyślij dane do Airtable
      const result = await submitToAirtable(wizardData.companyData, wizardData.employees);
      
      // Po udanym wysłaniu, usuń dane z localStorage
      clearSavedData();
      
      // NATYCHMIASTOWE PRZEKIEROWANIE DO WNIOSKU
      console.log('Formularz wysłany pomyślnie, przekierowuję do wniosku:', result.applicationRecordId);
      navigate(`/wniosek/${result.applicationRecordId}`);
      
      onSubmissionSuccess({ 
        companyData: wizardData.companyData,
        employees: wizardData.employees
      });
    } catch (error) {
      console.error('Submission failed:', error);
      // W przypadku błędu, pokaż komunikat użytkownikowi
      alert('Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewSubmission = () => {
    // Wyczyść dane z localStorage i zresetuj formularz
    clearSavedData();
    setShowSuccess(false);
    setCurrentStep(1);
    setCompletedSteps([]);
    setWizardData(getDefaultWizardData());
  };

  if (showSuccess) {
    return <SuccessStep onNewSubmission={handleNewSubmission} />;
  }

  const isLastStep = currentStep === STEPS.length;
  const isFirstStep = currentStep === 1;

  return (
    <div className="form-wizard">
      <div className="form-wizard-header">
        <div className="container">
          <div className="form-wizard-title">
            <h1>
              Wniosek o sfinansowanie kształcenia ustawicznego
            </h1>
            <p>
              Wypełnij formularz krok po kroku, aby podać dane do wniosku
            </p>
          </div>
          
          <ProgressSteps
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            className="mt-8"
          />
        </div>
      </div>

      <div className="form-wizard-content">
        <div className="container">
          <div className="form-wizard-step">
            {currentStep === 1 && (
              <CompanyDataStep
                data={wizardData.companyData}
                onChange={updateCompanyData}
                onValidate={() => true}
              />
            )}
            
            {currentStep === 2 && (
              <EmployeesStep
                employees={wizardData.employees}
                onChange={updateEmployees}
              />
            )}
            
            {currentStep === 3 && (
              <ReviewStep
                companyData={wizardData.companyData}
                employees={wizardData.employees}
              />
            )}
          </div>

          <div className="form-wizard-actions">
            <div className="flex justify-between items-center relative">
              <div>
                {!isFirstStep && (
                  <div className="wizard-nav-button" onClick={handlePrevious}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="button-icon button-icon-left">
                      <path fillRule="evenodd" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" clipRule="evenodd"/>
                    </svg>
                    <span className="button-text">Wstecz</span>
                  </div>
                )}
              </div>

              <div className="flex justify-center items-center" style={{position: 'absolute', left: '50%', transform: 'translateX(-50%)'}}>
                <div className="wizard-status-bar">
                  Krok {currentStep} z {STEPS.length}
                </div>
              </div>

              <div>
                {isLastStep ? (
                  <div className="wizard-nav-button" onClick={handleSubmit}>
                    {isSubmitting ? (
                      <svg className="animate-spin button-icon button-icon-right" style={{width: '20px', height: '20px'}} viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="button-icon button-icon-right">
                        <path fillRule="evenodd" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" clipRule="evenodd"/>
                      </svg>
                    )}
                    <span className="button-text">Wyślij wniosek</span>
                  </div>
                ) : (
                  <div className="wizard-nav-button" onClick={handleNext}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="button-icon button-icon-right">
                      <path fillRule="evenodd" d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12l-4.58 4.59z" clipRule="evenodd"/>
                    </svg>
                    <span className="button-text">Dalej</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormWizard;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import ApplicationSummary from './ApplicationSummary';
import { Button } from './ui/Button';
import { ProgressSteps } from './ui/ProgressSteps';
import CompanyDataStep from './steps/CompanyDataStep';
import EmployeesStep from './steps/EmployeesStep';
import type { CompanyData, EmployeeCollection } from '../types';
import * as airtableService from '../services/airtableServiceSecure';

const EditForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isEditMode = location.pathname.includes('/edit') || searchParams.get('mode') === 'edit';
  
  console.log('EditForm loaded:', { id, isEditMode, pathname: location.pathname, mode: searchParams.get('mode') });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('app'); // 'app' | 'employees' | 'complete'
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [companyData, setCompanyData] = useState<CompanyData>({
    company_name: '',
    company_nip: '',
    company_pkd: '',
    representative_person: '',
    representative_phone: '',
    representative_email: '',
    contact_person_name: '',
    contact_person_phone: '',
    contact_person_email: '',
    responsible_person_phone: '',
    company_address: '',
    activity_place: '',
    correspondence_address: '',
    bank_name: '',
    bank_account: '',
    account_not_interest_bearing: '',
    total_employees: '',
    company_size: '',
    balance_under_2m: ''
  });
  
  const [employees, setEmployees] = useState<EmployeeCollection>({});
  const [originalEmployees, setOriginalEmployees] = useState<EmployeeCollection>({});

  // Ładowanie danych z Airtable
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError('Brak ID rekordu w URL');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Krok 1: Pobierz dane aplikacji
        setLoadingStep('app');
        const appData = await airtableService.getApplicationById(id);
        setCompanyData(appData);

        // Krok 2: Pobierz pracowników
        setLoadingStep('employees');
        const empData = await airtableService.getEmployeesByApplicationId(id);
        setEmployees(empData);
        setOriginalEmployees(empData);
        
        // Krok 3: Finalizacja
        setLoadingStep('complete');

        console.log('Załadowano dane:', { appData, empData });
      } catch (err: any) {
        console.error('Błąd ładowania danych:', err);
        setError(err.message || 'Nie udało się załadować danych');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleCompanyDataChange = (updates: Partial<CompanyData>) => {
    setCompanyData(prev => ({ ...prev, ...updates }));
  };

  const handleEmployeesChange = (newEmployees: EmployeeCollection) => {
    setEmployees(newEmployees);
  };

  const handleSaveChanges = async () => {
    if (!id) return;

    try {
      setIsSaving(true);
      setError(null);

      // Zapisz dane aplikacji
      await airtableService.updateApplication(id, companyData);

      // Zapisz zmiany w pracownikach
      const currentEmployeeKeys = Object.keys(employees);
      const originalEmployeeKeys = Object.keys(originalEmployees);

      // Aktualizuj istniejących pracowników
      for (const key of currentEmployeeKeys) {
        const employee = employees[key];
        const originalEmployee = originalEmployees[key];

        if (employee.id && originalEmployee) {
          // Sprawdź czy są zmiany
          const hasChanges = 
            employee.name !== originalEmployee.name ||
            employee.gender !== originalEmployee.gender ||
            employee.birth_date !== originalEmployee.birth_date ||
            employee.education !== originalEmployee.education ||
            employee.position !== originalEmployee.position ||
            employee.contract_type !== originalEmployee.contract_type ||
            employee.contract_start !== originalEmployee.contract_start ||
            employee.contract_end !== originalEmployee.contract_end;

          if (hasChanges) {
            await airtableService.updateEmployee(employee.id, employee);
          }
        } else if (employee.isNew && !employee.id) {
          // Dodaj nowego pracownika
          const submissionId = `KFS-EDIT-${Date.now()}`;
          const newEmployeeId = await airtableService.addEmployeeToApplication(id, submissionId, employee);
          
          // Aktualizuj lokalny stan z nowym ID
          setEmployees(prev => ({
            ...prev,
            [key]: { ...employee, id: newEmployeeId, isNew: false, isEditing: false }
          }));
        }
      }

      // Usuń pracowników którzy zostali usunięci
      for (const key of originalEmployeeKeys) {
        if (!currentEmployeeKeys.includes(key) && originalEmployees[key].id) {
          await airtableService.deleteEmployee(originalEmployees[key].id!);
        }
      }

      // Aktualizuj stan po zapisaniu
      setOriginalEmployees(employees);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      console.log('Wszystkie zmiany zostały zapisane');
    } catch (err: any) {
      console.error('Błąd zapisywania:', err);
      setError(err.message || 'Nie udało się zapisać zmian');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToSummary = () => {
    navigate(`/wniosek/${id}`);
  };

  const handleBackToForm = () => {
    navigate('/');
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="professional-loading">
        {/* Floating background shapes */}
        <div className="loading-background-shapes">
          <div className="floating-shape"></div>
          <div className="floating-shape"></div>
          <div className="floating-shape"></div>
        </div>

        {/* Main loading container */}
        <div className="loading-container">
          {/* Animated spinner */}
          <div className="loading-spinner-container">
            <div className="loading-spinner-outer"></div>
            <div className="loading-spinner-inner"></div>
            <div className="loading-icon">📊</div>
          </div>

          {/* Loading text */}
          <h1 className="loading-text">Ładowanie wniosku</h1>
          <p className="loading-subtitle">
            {loadingStep === 'app' && 'Pobieranie danych aplikacji...'}
            {loadingStep === 'employees' && 'Ładowanie pracowników...'}
            {loadingStep === 'complete' && 'Finalizowanie...'}
          </p>

          {/* Progress bar */}
          <div className="loading-progress">
            <div className="loading-progress-bar"></div>
          </div>

          {/* Loading steps */}
          <div className="loading-steps">
            <div className={`loading-step ${loadingStep === 'app' ? 'active' : ''}`}>
              🏢 Dane firmy
            </div>
            <div className={`loading-step ${loadingStep === 'employees' ? 'active' : ''}`}>
              👥 Pracownicy
            </div>
            <div className={`loading-step ${loadingStep === 'complete' ? 'active' : ''}`}>
              ✅ Gotowe
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="professional-loading">
        <div className="loading-container" style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          border: '2px solid var(--error-200)',
          animation: 'fadeIn 0.8s ease-out'
        }}>
          {/* Error Icon */}
          <div style={{
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, var(--error-100), var(--error-200))',
            borderRadius: '50%',
            margin: '0 auto var(--space-8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            animation: 'pulse 2s infinite'
          }}>
            💥
          </div>

          {/* Error Text */}
          <h1 style={{ 
            fontSize: 'var(--text-2xl)', 
            fontWeight: 'var(--font-bold)', 
            color: 'var(--error-700)', 
            marginBottom: 'var(--space-2)' 
          }}>
            Ups! Coś poszło nie tak
          </h1>
          <p style={{ 
            fontSize: 'var(--text-lg)', 
            color: 'var(--neutral-600)', 
            marginBottom: 'var(--space-8)',
            maxWidth: '400px',
            lineHeight: '1.6'
          }}>
            {error}
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="outline" onClick={() => window.location.reload()}>
              🔄 Spróbuj ponownie
            </Button>
            <Button variant="primary" onClick={handleBackToForm}>
              🏠 Powrót do formularza
            </Button>
          </div>

          {/* Error details (for debugging) */}
          <details style={{ 
            marginTop: 'var(--space-6)', 
            padding: 'var(--space-4)', 
            background: 'var(--neutral-50)', 
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-sm)',
            color: 'var(--neutral-600)',
            maxWidth: '500px'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'var(--font-medium)' }}>
              Szczegóły błędu (dla administratora)
            </summary>
            <code style={{ display: 'block', marginTop: 'var(--space-2)', whiteSpace: 'pre-wrap' }}>
              {error}
            </code>
          </details>
        </div>
      </div>
    );
  }

  // Jeśli nie jesteśmy w trybie edycji, pokaż podsumowanie z danymi
  if (!isEditMode) {
    console.log('Not in edit mode, rendering summary with data');
    return <ApplicationSummary companyData={companyData} employees={employees} submissionId={(companyData as any).submission_id || ''} />;
  }
  
  console.log('In edit mode, rendering edit form');

  return (
    <div className="form-wizard animate-fade-in">
      <div className="form-wizard-header">
        <div className="container">
          <div className="form-wizard-title">
            <h1>Edycja wniosku</h1>
            <p>Modyfikuj dane swojej aplikacji i zarządzaj pracownikami</p>
          </div>

          <ProgressSteps 
            steps={[
              { 
                id: 'company', 
                title: 'Dane firmy', 
                description: 'Edytuj informacje o firmie',
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
                description: 'Zarządzaj listą pracowników',
                icon: (
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                )
              }
            ]}
            currentStep={currentStep}
            completedSteps={currentStep > 1 ? [1] : []}
          />
        </div>
      </div>

      <div className="form-wizard-content">
        <div className="container">
          <div className="form-wizard-step">
            {currentStep === 1 && (
              <CompanyDataStep 
                data={companyData} 
                onChange={handleCompanyDataChange} 
              />
            )}
            
            {currentStep === 2 && (
              <EmployeesStep
                employees={employees}
                onChange={handleEmployeesChange}
              />
            )}
          </div>

          {/* Success message */}
          {saveSuccess && (
            <div className="animate-scale-in" style={{
              background: 'linear-gradient(135deg, var(--success-50), var(--success-100))',
              border: '2px solid var(--success-400)',
              borderRadius: '16px',
              padding: '20px 32px',
              margin: '20px -6rem',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(34, 197, 94, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Success glow effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                animation: 'shimmer 2s ease-in-out'
              }}></div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 'var(--space-3)',
                position: 'relative',
                zIndex: 1
              }}>
                <span style={{ fontSize: '1.5rem', animation: 'bounce 1s infinite' }}>🎉</span>
                <span style={{ 
                  color: 'var(--success-800)', 
                  fontWeight: '700', 
                  fontSize: '18px',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}>
                  Zmiany zostały zapisane pomyślnie!
                </span>
                <span style={{ fontSize: '1.5rem', animation: 'bounce 1s infinite 0.5s' }}>✨</span>
              </div>
            </div>
          )}

          <div className="form-wizard-actions">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-start' }}>
                <div className="wizard-nav-button-wide" onClick={handleBackToSummary}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="button-icon button-icon-left">
                    <path fillRule="evenodd" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" clipRule="evenodd"/>
                  </svg>
                  <span className="button-text">Powrót do podsumowania</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center' }}>
                {currentStep > 1 && (
                  <div className="wizard-nav-button" onClick={prevStep}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="button-icon button-icon-left">
                      <path fillRule="evenodd" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" clipRule="evenodd"/>
                    </svg>
                    <span className="button-text">Poprzedni krok</span>
                  </div>
                )}
                
                {error && (
                  <span style={{ color: 'var(--error-600)', fontSize: '14px', fontWeight: '500' }}>
                    Błąd: {error}
                  </span>
                )}
              </div>
              
              <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-end' }}>
                {currentStep < 2 ? (
                  <div className="wizard-nav-button" onClick={nextStep}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="button-icon button-icon-right">
                      <path fillRule="evenodd" d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12l-4.58 4.59z" clipRule="evenodd"/>
                    </svg>
                    <span className="button-text">Następny krok</span>
                  </div>
                ) : (
                  <div className={`wizard-nav-button-wide ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`} onClick={isSaving ? undefined : handleSaveChanges}>
                    {isSaving ? (
                      <svg className="animate-spin button-icon button-icon-right" style={{width: '20px', height: '20px'}} viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="button-icon button-icon-right">
                        <path fillRule="evenodd" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" clipRule="evenodd"/>
                      </svg>
                    )}
                    <span className="button-text">{isSaving ? 'Zapisywanie...' : 'Zapisz wszystkie zmiany'}</span>
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

export default EditForm;
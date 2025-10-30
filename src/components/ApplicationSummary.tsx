import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { formatEducation, formatContractType } from '../utils/textUtils';
import type { EmployeeCollection, CompanyData } from '../types';
import * as airtableService from '../services/airtableServiceSecure';
import type { ApplicationData } from '../services/airtableServiceSecure';

interface ApplicationSummaryProps {
  companyData?: CompanyData;
  employees?: EmployeeCollection;
  submissionId?: string;
}

const ApplicationSummary: React.FC<ApplicationSummaryProps> = ({ 
  companyData: propCompanyData, 
  employees: propEmployees, 
  submissionId: propSubmissionId 
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(!propCompanyData); // Only load if no props provided
  const [loadingStep, setLoadingStep] = useState('app'); // 'app' | 'employees' | 'complete'
  const [error, setError] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<ApplicationData | null>(propCompanyData || null);
  const [employees, setEmployees] = useState<EmployeeCollection>(propEmployees || {});
  const [submissionId, setSubmissionId] = useState<string>(propSubmissionId || '');
  console.log('🔍 ApplicationSummary render - current submissionId state:', submissionId);

  // Ładowanie danych z Airtable - tylko jeśli nie przekazano przez props
  useEffect(() => {
    // Jeśli dane są już przekazane przez props, nie ładuj ponownie
    if (propCompanyData && propEmployees) {
      console.log('ApplicationSummary: Using data from props, skipping loading');
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      if (!id) {
        setError('Brak ID formularza w URL');
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

        // Krok 3: Finalizacja
        setLoadingStep('complete');
        
        // Ustaw submission_id z danych aplikacji - jeśli puste, stwórz z record ID
        let displayId = appData.submission_id;
        if (!displayId && id) {
          // Konwertuj record ID na format KFS-XXXX
          const idNumber = id.slice(-4); // Ostatnie 4 znaki record ID
          displayId = `KFS-${idNumber.toUpperCase()}`;
        }
        setSubmissionId(displayId || 'Brak numeru');

        console.log('Załadowano dane wniosku:', { appData, empData });
        console.log('🔍 DEBUG: submission_id z Airtable:', appData.submission_id);
        console.log('🔍 DEBUG: record ID from URL:', id);
        console.log('🔍 DEBUG: final displayId:', displayId);
      } catch (err: any) {
        console.error('Błąd ładowania wniosku:', err);
        setError(err.message || 'Nie udało się załadować wniosku');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, propCompanyData, propEmployees]);

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
            <div className="loading-icon">📋</div>
          </div>

          {/* Loading text */}
          <h1 className="loading-text">Ładowanie wniosku</h1>
          <p className="loading-subtitle">
            {loadingStep === 'app' && 'Pobieranie danych wniosku...'}
            {loadingStep === 'employees' && 'Ładowanie pracowników...'}
            {loadingStep === 'complete' && 'Przygotowywanie podsumowania...'}
          </p>

          {/* Progress bar */}
          <div className="loading-progress">
            <div className="loading-progress-bar"></div>
          </div>

          {/* Loading steps */}
          <div className="loading-steps">
            <div className={`loading-step ${loadingStep === 'app' ? 'active' : ''}`}>
              📋 Formularz
            </div>
            <div className={`loading-step ${loadingStep === 'employees' ? 'active' : ''}`}>
              👥 Pracownicy
            </div>
            <div className={`loading-step ${loadingStep === 'complete' ? 'active' : ''}`}>
              ✅ Podsumowanie
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !companyData) {
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
            📋❌
          </div>

          {/* Error Text */}
          <h1 style={{ 
            fontSize: 'var(--text-2xl)', 
            fontWeight: 'var(--font-bold)', 
            color: 'var(--error-700)', 
            marginBottom: 'var(--space-2)' 
          }}>
            Formularz nie został znaleziony
          </h1>
          <p style={{ 
            fontSize: 'var(--text-lg)', 
            color: 'var(--neutral-600)', 
            marginBottom: 'var(--space-8)',
            maxWidth: '400px',
            lineHeight: '1.6'
          }}>
            {error || 'Nie udało się załadować danych wniosku'}
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="outline" onClick={() => window.location.reload()}>
              🔄 Spróbuj ponownie
            </Button>
            <Button variant="primary" onClick={() => navigate('/')}>
              🏠 Wróć do formularza
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const employeesList = Object.values(employees);

  return (
    <div className="form-wizard animate-fade-in">
      <div className="form-wizard-header">
        <div className="container">
          <div className="form-wizard-title">
            <h1>Podsumowanie wniosku</h1>
            <p>Przegląd złożonej aplikacji o sfinansowanie kształcenia</p>
          </div>

          {/* Status bar w stylu progress steps */}
          <div className="progress-steps">
            <ol className="progress-steps-list">
              {/* Status wniosku */}
              <li className="progress-step completed">
                <div className="progress-step-content">
                  <div className="progress-step-indicator">
                    <svg className="progress-step-check" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="progress-step-text">
                    <div className="progress-step-title">Status wniosku</div>
                    <div className="progress-step-description">Złożony pomyślnie</div>
                  </div>
                </div>
              </li>

              {/* Numer wniosku */}
              <li className="progress-step completed">
                <div className="progress-step-content">
                  <div className="progress-step-indicator">
                    <div className="progress-step-icon">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"/>
                        <path d="M8 6h4v2H8V6zm0 4h4v2H8v-2z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="progress-step-text">
                    <div className="progress-step-title">Numer wniosku</div>
                    <div className="progress-step-description" style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold' }}>{submissionId || 'Ładowanie...'}</div>
                  </div>
                </div>
              </li>

              {/* Liczba pracowników */}
              <li className="progress-step completed">
                <div className="progress-step-content">
                  <div className="progress-step-indicator">
                    <div className="progress-step-icon">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="progress-step-text">
                    <div className="progress-step-title">Pracownicy</div>
                    <div className="progress-step-description">{employeesList.length} osób w szkoleniu</div>
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div className="form-wizard-content">
        <div className="container">
          <div className="form-wizard-step">
            {/* Sekcja danych firmy */}
            <div className="mb-8">
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
                Dane firmy
              </h2>
              
              <div style={{
                backgroundColor: 'var(--neutral-50)',
                border: '2px solid var(--neutral-300)',
                borderRadius: '12px',
                padding: '32px'
              }} className="shadow-lg">
                <h4 style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--neutral-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--neutral-100)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--neutral-500)'}} className="shadow-sm">
                  <span style={{marginRight: '8px'}}>🏢</span>
                  Dane podmiotu
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{marginLeft: '16px', marginRight: '16px'}}>
                  <div style={{display: 'flex', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-200)', gap: '8px'}}>
                    <label className="text-sm font-medium text-neutral-500">Nazwa podmiotu:</label>
                    <p className="text-neutral-900 font-medium">{companyData.company_name}</p>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-200)', gap: '8px'}}>
                    <label className="text-sm font-medium text-neutral-500">NIP:</label>
                    <p className="text-neutral-900 font-medium">{companyData.company_nip}</p>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-200)', gap: '8px'}}>
                    <label className="text-sm font-medium text-neutral-500">PKD:</label>
                    <p className="text-neutral-900 font-medium">{companyData.company_pkd}</p>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-200)', gap: '8px'}}>
                    <label className="text-sm font-medium text-neutral-500">Wybrane szkolenie:</label>
                    <p className="text-neutral-900 font-medium">{companyData.selected_training || 'Brak wyboru'}</p>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-200)', gap: '8px'}}>
                    <label className="text-sm font-medium text-neutral-500">Reprezentant:</label>
                    <p className="text-neutral-900 font-medium">{companyData.representative_person}</p>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-200)', gap: '8px'}}>
                    <label className="text-sm font-medium text-neutral-500">Stanowisko reprezentanta:</label>
                    <p className="text-neutral-900 font-medium">{companyData.representative_position || 'Brak'}</p>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-200)', gap: '8px'}}>
                    <label className="text-sm font-medium text-neutral-500">Telefon repr.:</label>
                    <p className="text-neutral-900 font-medium">{companyData.representative_phone}</p>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-200)', gap: '8px'}}>
                    <label className="text-sm font-medium text-neutral-500">Osoba kontaktowa:</label>
                    <p className="text-neutral-900 font-medium">{companyData.contact_person_name}</p>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-200)', gap: '8px'}}>
                    <label className="text-sm font-medium text-neutral-500">Stanowisko osoby kontaktowej:</label>
                    <p className="text-neutral-900 font-medium">{companyData.contact_person_position || 'Brak'}</p>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-200)', gap: '8px'}}>
                    <label className="text-sm font-medium text-neutral-500">Tel. kontaktowy:</label>
                    <p className="text-neutral-900 font-medium">{companyData.contact_person_phone}</p>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-200)', gap: '8px'}}>
                    <label className="text-sm font-medium text-neutral-500">E-mail:</label>
                    <p className="text-neutral-900 font-medium">{companyData.contact_person_email}</p>
                  </div>
                  
                  <div className="md:col-span-2" style={{display: 'flex', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-200)', gap: '8px'}}>
                    <label className="text-sm font-medium text-neutral-500">Adres siedziby:</label>
                    <p className="text-neutral-900 font-medium">{companyData.company_address}</p>
                  </div>
                  
                  <div className="md:col-span-2" style={{display: 'flex', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-200)', gap: '8px'}}>
                    <label className="text-sm font-medium text-neutral-500">Miejsce działalności:</label>
                    <p className="text-neutral-900 font-medium">{companyData.activity_place}</p>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-200)', gap: '8px'}}>
                    <label className="text-sm font-medium text-neutral-500">Bank:</label>
                    <p className="text-neutral-900 font-medium">{companyData.bank_name}</p>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-200)', gap: '8px'}}>
                    <label className="text-sm font-medium text-neutral-500">Numer konta:</label>
                    <p className="text-neutral-900 font-medium font-mono">{companyData.bank_account}</p>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-200)', gap: '8px'}}>
                    <label className="text-sm font-medium text-neutral-500">Liczba pracowników:</label>
                    <p className="text-neutral-900 font-medium">{companyData.total_employees}</p>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-200)', gap: '8px'}}>
                    <label className="text-sm font-medium text-neutral-500">Wielkość podmiotu:</label>
                    <p className="text-neutral-900 font-medium capitalize">{companyData.company_size}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sekcja pracowników */}
            <div className="mb-8">
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
                Lista pracowników ({employeesList.length})
              </h2>
              
              {employeesList.length === 0 ? (
                <div style={{
                  backgroundColor: 'var(--neutral-50)',
                  border: '2px solid var(--neutral-300)',
                  borderRadius: '12px',
                  padding: '48px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                  <p style={{ fontSize: '18px', color: 'var(--neutral-600)' }}>
                    Brak dodanych pracowników
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {employeesList.map((employee, index) => (
                    <div key={employee.id || index} style={{
                      backgroundColor: 'var(--neutral-50)',
                      border: '2px solid var(--neutral-300)',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      minHeight: '50px'
                    }} className="shadow-md">
                      
                      {/* Numer pracownika */}
                      <div style={{
                        width: '30px', 
                        height: '30px', 
                        backgroundColor: 'var(--success-600)', 
                        color: 'white', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        flexShrink: 0,
                        marginLeft: '0px'
                      }} className="shadow-md">
                        {index + 1}
                      </div>

                      {/* Imię i nazwisko */}
                      <div style={{ flex: '1 1 0', textAlign: 'center', margin: '0 5px' }}>
                        <div style={{fontSize: '12px', color: 'var(--neutral-500)', marginBottom: '2px'}}>Imię i nazwisko</div>
                        <div style={{fontSize: '14px', fontWeight: 'bold', color: 'var(--neutral-800)'}}>
                          {employee.name || 'Bez nazwy'}
                        </div>
                      </div>

                      {/* Stanowisko */}
                      <div style={{ flex: '1 1 0', textAlign: 'center', margin: '0 5px' }}>
                        <div style={{fontSize: '12px', color: 'var(--neutral-500)', marginBottom: '2px'}}>Stanowisko</div>
                        <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--neutral-800)'}}>
                          {employee.position || 'Bez stanowiska'}
                        </div>
                      </div>

                      {/* Płeć */}
                      <div style={{ flex: '1 1 0', textAlign: 'center', margin: '0 5px' }}>
                        <div style={{fontSize: '12px', color: 'var(--neutral-500)', marginBottom: '2px'}}>Płeć</div>
                        <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--neutral-800)'}}>
                          {employee.gender === 'M' ? 'Mężczyzna' : employee.gender === 'K' ? 'Kobieta' : '—'}
                        </div>
                      </div>

                      {/* Data urodzenia */}
                      <div style={{ flex: '1 1 0', textAlign: 'center', margin: '0 5px' }}>
                        <div style={{fontSize: '12px', color: 'var(--neutral-500)', marginBottom: '2px'}}>Urodzenie</div>
                        <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--neutral-800)', fontFamily: 'monospace'}}>
                          {employee.birth_date || '—'}
                        </div>
                      </div>

                      {/* Wykształcenie */}
                      <div style={{ flex: '1 1 0', textAlign: 'center', margin: '0 5px' }}>
                        <div style={{fontSize: '12px', color: 'var(--neutral-500)', marginBottom: '2px'}}>Wykształcenie</div>
                        <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--neutral-800)'}}>
                          {formatEducation(employee.education) || '—'}
                        </div>
                      </div>

                      {/* Typ umowy */}
                      <div style={{ flex: '1 1 0', textAlign: 'center', margin: '0 5px' }}>
                        <div style={{fontSize: '12px', color: 'var(--neutral-500)', marginBottom: '2px'}}>Umowa</div>
                        <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--neutral-800)'}}>
                          {formatContractType(employee.contract_type) || '—'}
                        </div>
                      </div>
                      {/* Orzeczenie */}
                      <div style={{ flex: '1 1 0', textAlign: 'center', margin: '0 5px', marginRight: '0px' }}>
                        <div style={{fontSize: '12px', color: 'var(--neutral-500)', marginBottom: '2px'}}>Orzeczenie</div>
                        <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--neutral-800)'}}>
                          {employee.disability_status ? 'Ma' : '—'}
                        </div>
                      </div>

                      {/* Okres zatrudnienia */}
                      <div style={{ flex: '2.2 1 0', textAlign: 'center', margin: '0 10px' }}>
                        <div style={{fontSize: '12px', color: 'var(--neutral-500)', marginBottom: '2px'}}>Okres zatrudnienia</div>
                        <div style={{fontSize: '13px', fontWeight: '600', color: 'var(--neutral-800)', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                          {employee.contract_start && employee.contract_end ? 
                            `${employee.contract_start} - ${employee.contract_end}` :
                            employee.contract_start ? 
                              `${employee.contract_start} - beztermin.` : 
                              '—'}
                        </div>
                      </div>

                      {/* Status */}
                      <div style={{ flex: '0 0 80px', textAlign: 'center' }}>
                        <div style={{fontSize: '12px', color: 'var(--neutral-500)', marginBottom: '2px'}}>Status</div>
                        <div style={{
                          backgroundColor: 'var(--success-500)', 
                          color: 'white', 
                          padding: '3px 8px', 
                          borderRadius: '10px', 
                          fontSize: '10px', 
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                          display: 'inline-block'
                        }} className="shadow-sm">
                          ✓ ZAPISANY
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Akcje */}
          <div className="form-wizard-actions">
            <div className="flex justify-between items-center relative">
              <div>
                <div className="wizard-nav-button" onClick={() => navigate('/')}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="button-icon button-icon-left">
                    <path fillRule="evenodd" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" clipRule="evenodd"/>
                  </svg>
                  <span className="button-text">Wróć do formularza</span>
                </div>
              </div>

              <div className="flex justify-center items-center" style={{position: 'absolute', left: '50%', transform: 'translateX(-50%)'}}>
                <div className="wizard-status-bar" onClick={() => window.print()} style={{cursor: 'pointer'}}>
                  <svg viewBox="0 0 20 20" fill="currentColor" style={{width: '24px', height: '24px', marginRight: '8px'}}>
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Drukuj dane</span>
                </div>
              </div>

              <div>
                <div className="wizard-nav-button" onClick={() => navigate(`/wniosek/${id}/edit`)}>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="button-icon button-icon-right">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                  </svg>
                  <span className="button-text">Edytuj dane</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSummary;
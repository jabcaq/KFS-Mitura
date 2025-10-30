import React, { useState, useRef, useEffect } from 'react';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { TEXTS } from '../../constants/texts';
import { fetchCompanyDataByNIP, mapKASDataToCompanyData, mapGUSDataToCompanyData, validateNIP, formatNIP } from '../../services/gusService';
import type { CompanyData } from '../../types';

interface CompanyDataStepProps {
  data: CompanyData;
  onChange: (data: Partial<CompanyData>) => void;
  onValidate?: () => boolean;
}

// Lista dostępnych szkoleń
const TRAINING_OPTIONS = [
  'Kompleksowy dedykowany dla (branża) kurs sztucznej inteligencji A.I.',
  'Automatyzacja procesów w (branża) z zastosowaniem technologii A.I.',
  'Silna marka B2B w (branża). Jak zbudować mocny brand, który sprzedaje z wykorzystaniem technologii A.I.',
  'Kompleksowy dedykowany dla (branża) kurs Video Marketing w Biznesie.',
  'StresOUT – zarządzanie stresem oraz profilaktyka zdrowia psychicznego (branża)',
  'PowerMind – trening zarządzania osobistym potencjałem (branża)',
  'EffectiveTeam – poprawa zarządzania i komunikacji w firmie (branża)'
];

const CompanyDataStep: React.FC<CompanyDataStepProps> = ({ data, onChange, onValidate }) => {
  const [showActivityAddress, setShowActivityAddress] = useState(false);
  const [showCorrespondenceAddress, setShowCorrespondenceAddress] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // GUS integration state  
  const [isLoadingGUS, setIsLoadingGUS] = useState(false);
  const [gusMessage, setGusMessage] = useState<string>('');
  const [gusMessageType, setGusMessageType] = useState<'success' | 'error' | ''>('');

  const handleChange = (field: keyof CompanyData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const updates: Partial<CompanyData> = { [field]: e.target.value };
    
    // Auto-fill contact person with representative person when representative changes
    if (field === 'representative_person' && e.target.value && !data.contact_person_name) {
      updates.contact_person_name = e.target.value;
      console.log('👤 Auto-filled contact person:', e.target.value);
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    onChange(updates);
  };

  const handleDropdownSelect = (field: keyof CompanyData, value: string) => {
    onChange({ [field]: value });
    setOpenDropdown(null);
  };

  // Handle GUS data fetch
  const handleFetchGUSData = async () => {
    if (!data.company_nip) {
      setGusMessage('Wprowadź NIP aby pobrać dane z GUS');
      setGusMessageType('error');
      return;
    }

    if (!validateNIP(data.company_nip)) {
      setGusMessage('Nieprawidłowy NIP. Sprawdź poprawność numeru.');
      setGusMessageType('error');
      return;
    }

    setIsLoadingGUS(true);
    setGusMessage('');
    setGusMessageType('');

    try {
      const result = await fetchCompanyDataByNIP(data.company_nip);
      console.log('GUS API result:', result);
      
      if (result.success && result.data) {
        
        let mappedData: Partial<CompanyData>;
        let companyName: string;
        
        try {
          if (result.source === 'KAS') {
            mappedData = mapKASDataToCompanyData(result.data);
            companyName = result.data.result?.subject?.name || result.data.subject?.name || result.data?.name || 'Nieznana firma';
          } else {
            const dataToMap = result.data.result || result.data;
            mappedData = mapGUSDataToCompanyData(result.data);
            companyName = dataToMap.subject?.name || 'Nieznana firma';
          }
        } catch (mappingError) {
          console.error('Error during data mapping:', mappingError instanceof Error ? mappingError.message : 'Unknown mapping error');
          setGusMessage('Błąd podczas przetwarzania danych z GUS');
          setGusMessageType('error');
          setIsLoadingGUS(false);
          return;
        }
        
        onChange(mappedData);
        setGusMessage(`Pobrano dane dla: ${companyName}`);
        setGusMessageType('success');
      } else {
        setGusMessage(result.error || 'Nie udało się pobrać danych z GUS');
        setGusMessageType('error');
      }
    } catch (error) {
      console.error('GUS data fetch error:', error instanceof Error ? error.message : 'Unknown error');
      setGusMessage('Błąd podczas pobierania danych z GUS');
      setGusMessageType('error');
    } finally {
      setIsLoadingGUS(false);
    }
  };

  // Handle NIP change with formatting
  const handleNIPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNIP = formatNIP(e.target.value);
    onChange({ company_nip: formattedNIP });
    
    // Clear GUS message when NIP changes
    if (gusMessage) {
      setGusMessage('');
      setGusMessageType('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && dropdownRefs.current[openDropdown] && 
          !dropdownRefs.current[openDropdown]?.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Expose validation function to parent
  useEffect(() => {
    if (onValidate) {
      (window as any).validateCompanyStep = () => {
        const newErrors: Record<string, string> = {};
        
        // Check required fields
        const requiredFields = [
          { field: 'company_name', label: 'Nazwa firmy' },
          { field: 'company_nip', label: 'NIP firmy' },
          { field: 'company_pkd', label: 'Główne PKD' },
          { field: 'selected_training', label: 'Wybór szkolenia' },
          { field: 'representative_person', label: 'Osoba uprawniona' },
          { field: 'representative_position', label: 'Stanowisko osoby uprawnionej' },
          { field: 'representative_phone', label: 'Telefon osoby uprawnionej' },
          { field: 'representative_email', label: 'Email osoby uprawnionej' },
          { field: 'contact_person_name', label: 'Osoba kontaktowa' },
          { field: 'contact_person_position', label: 'Stanowisko osoby kontaktowej' },
          { field: 'contact_person_phone', label: 'Telefon osoby kontaktowej' },
          { field: 'contact_person_email', label: 'Email osoby kontaktowej' },
          { field: 'company_street', label: 'Adres siedziby - ulica' },
          { field: 'company_postal_code', label: 'Adres siedziby - kod pocztowy' },
          { field: 'company_city', label: 'Adres siedziby - miejscowość' },
          { field: 'bank_name', label: 'Nazwa banku' },
          { field: 'bank_account', label: 'Numer konta bankowego' },
          { field: 'total_employees', label: 'Liczba pracowników' },
          { field: 'company_size', label: 'Wielkość podmiotu' },
          { field: 'balance_under_2m', label: 'Suma bilansowa < 2 mln EUR' }
        ];

        requiredFields.forEach(({ field }) => {
          const value = data[field as keyof CompanyData];
          if (!value?.toString().trim()) {
            newErrors[field] = 'Pole wymagane';
          }
        });

        setErrors(newErrors);
        
        if (Object.keys(newErrors).length > 0) {
          // Scroll to first error
          setTimeout(() => {
            const firstErrorField = document.querySelector('.form-error');
            if (firstErrorField) {
              firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }

        return Object.keys(newErrors).length === 0;
      };
    }
  }, [data, onValidate]);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Dane podmiotu
        </h2>
        <p className="text-white">
          Wprowadź podstawowe informacje o firmie składającej wniosek
        </p>
      </div>

      <div style={{
        backgroundColor: 'var(--neutral-50)',
        border: '2px solid var(--neutral-300)',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: 'none',
        width: '100%'
      }} className="animate-fade-in shadow-lg">

        {/* Sekcja NIP i pobierania danych z GUS */}
        <div className="mb-6">
          <h4 style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--neutral-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--primary-100)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--primary-500)'}} className="shadow-sm">
            <span style={{marginRight: '8px'}}>🔍</span>Dane z GUS (automatyczne wypełnianie)
          </h4>
          
          <div style={{marginLeft: '16px', marginRight: '16px'}}>
            <div className="flex gap-4 items-end mb-4">
              <div className="flex-1">
                <FormField label={<><i className="fas fa-hashtag" style={{marginRight: '8px', color: 'var(--primary-600)'}}></i>NIP firmy</>} required error={errors.company_nip}>
                  <Input
                    value={data.company_nip}
                    onChange={handleNIPChange}
                    pattern="[0-9]{3}-?[0-9]{3}-?[0-9]{2}-?[0-9]{2}"
                    placeholder="123-456-78-90"
                    maxLength={13}
                    error={!!errors.company_nip}
                  />
                </FormField>
              </div>
              <div style={{marginTop: '39px'}}>
                <Button
                  variant="primary"
                  onClick={handleFetchGUSData}
                  disabled={isLoadingGUS || !data.company_nip}
                  style={{minWidth: '160px', height: '48px'}}
                >
                  <i className="fas fa-download mr-2"></i>
                  {isLoadingGUS ? 'Pobieranie...' : 'Pobierz dane z GUS'}
                </Button>
              </div>
            </div>
            
            {/* GUS Message */}
            {gusMessage && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                backgroundColor: gusMessageType === 'success' ? 'var(--success-100)' : 'var(--error-100)',
                border: `1px solid ${gusMessageType === 'success' ? 'var(--success-300)' : 'var(--error-300)'}`,
                color: gusMessageType === 'success' ? 'var(--success-800)' : 'var(--error-800)'
              }}>
                <div className="flex items-center">
                  <span style={{marginRight: '8px'}}>
                    {gusMessageType === 'success' ? '✅' : '❌'}
                  </span>
                  {gusMessage}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sekcja wyboru szkolenia */}
        <div className="mb-6">
          <h4 style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--neutral-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--neutral-100)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--neutral-500)'}} className="shadow-sm">
            <span style={{marginRight: '8px'}}>🎓</span>Wybór szkolenia
          </h4>
          <div className="mb-4" style={{marginLeft: '16px', marginRight: '16px'}}>
            <FormField label={<><i className="fas fa-graduation-cap" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Wybrane szkolenie</>} required error={errors.selected_training}>
              <div className={`custom-dropdown ${openDropdown === 'selected_training' ? 'open' : ''}`} ref={el => { if (el) dropdownRefs.current['selected_training'] = el; }}>
                <div className="custom-dropdown-input" onClick={() => setOpenDropdown(openDropdown === 'selected_training' ? null : 'selected_training')}>
                  <Input
                    value={data.selected_training}
                    onChange={handleChange('selected_training')}
                    placeholder="Wybierz szkolenie"
                    onFocus={() => setOpenDropdown('selected_training')}
                    error={!!errors.selected_training}
                  />
                  <span className="dropdown-arrow">▼</span>
                </div>
                {openDropdown === 'selected_training' && (
                  <div className="custom-dropdown-options">
                    {TRAINING_OPTIONS.map(option => (
                      <div
                        key={option}
                        className={`dropdown-option ${data.selected_training === option ? 'selected' : ''}`}
                        onClick={() => handleDropdownSelect('selected_training', option)}
                      >
                        <span className="option-checkmark"></span>
                        <span className="option-label">{option}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormField>
          </div>
        </div>

        {/* Sekcja podstawowych danych firmy */}
        <div className="mb-6">
          <h4 style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--neutral-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--neutral-100)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--neutral-500)'}} className="shadow-sm">
            <span style={{marginRight: '8px'}}>🏢</span>Dane podstawowe firmy
          </h4>
          
          <div className="mb-4" style={{marginLeft: '16px', marginRight: '16px'}}>
            <FormField
              label={<><i className="fas fa-building" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>{TEXTS.LABELS.COMPANY_NAME}</>}
              required
              error={errors.company_name}
            >
              <Input
                value={data.company_name}
                onChange={handleChange('company_name')}
                placeholder="Pełna nazwa firmy"
                error={!!errors.company_name}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" style={{marginLeft: '16px', marginRight: '16px'}}>
            <div>
              <FormField label={<><i className="fas fa-industry" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Główne PKD</>} required error={errors.company_pkd}>
                <Input
                  value={data.company_pkd}
                  onChange={handleChange('company_pkd')}
                  placeholder="62.01.Z"
                  error={!!errors.company_pkd}
                />
              </FormField>
            </div>

            <div>
              <FormField label={<><i className="fas fa-user-tie" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Osoba uprawniona do podpisania dokumentów</>} required error={errors.representative_person}>
                <Input
                  value={data.representative_person}
                  onChange={handleChange('representative_person')}
                  placeholder="Imię i nazwisko"
                  error={!!errors.representative_person}
                />
              </FormField>
            </div>
          </div>

          <div className="mb-4" style={{marginLeft: '16px', marginRight: '16px'}}>
            <FormField label={<><i className="fas fa-briefcase" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Stanowisko osoby uprawnionej</>} required error={errors.representative_position}>
              <Input
                value={data.representative_position}
                onChange={handleChange('representative_position')}
                placeholder="np. Dyrektor, Prezes, Właściciel"
                error={!!errors.representative_position}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{marginLeft: '16px', marginRight: '16px'}}>
            <div>
              <FormField label={<><i className="fas fa-phone" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Telefon osoby uprawnionej</>} required error={errors.representative_phone}>
                <Input
                  placeholder="123 456 789"
                  type="tel"
                  value={data.representative_phone}
                  onChange={handleChange('representative_phone')}
                  error={!!errors.representative_phone}
                />
              </FormField>
            </div>
            
            <div>
              <FormField label={<><i className="fas fa-envelope" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Email osoby uprawnionej</>} required error={errors.representative_email}>
                <Input
                  placeholder="email@firma.pl"
                  type="email"
                  value={data.representative_email}
                  onChange={handleChange('representative_email')}
                  error={!!errors.representative_email}
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Sekcja charakterystyki firmy */}
        <div className="mb-6">
          <h4 style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--neutral-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--neutral-100)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--neutral-500)'}} className="shadow-sm">
            <span style={{marginRight: '8px'}}>📊</span>Charakterystyka firmy
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{marginLeft: '16px', marginRight: '16px'}}>
            <div>
              <FormField label={<><i className="fas fa-users" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>{TEXTS.LABELS.TOTAL_EMPLOYEES}</>} required error={errors.total_employees}>
                <Input
                  placeholder={TEXTS.PLACEHOLDERS.EMPLOYEE_COUNT}
                  type="number"
                  min="1"
                  value={data.total_employees}
                  onChange={handleChange('total_employees')}
                  error={!!errors.total_employees}
                />
              </FormField>
            </div>
            
            <div>
              <FormField label={<><i className="fas fa-chart-bar" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Wielkość podmiotu</>} required error={errors.company_size}>
                <div className={`custom-dropdown ${openDropdown === 'company_size' ? 'open' : ''}`} ref={el => { if (el) dropdownRefs.current['company_size'] = el; }}>
                  <div className="custom-dropdown-input" onClick={() => setOpenDropdown(openDropdown === 'company_size' ? null : 'company_size')}>
                    <Input
                      value={data.company_size}
                      onChange={handleChange('company_size')}
                      placeholder="Wybierz lub wpisz wielkość podmiotu"
                      onFocus={() => setOpenDropdown('company_size')}
                      error={!!errors.company_size}
                    />
                    <span className="dropdown-arrow">▼</span>
                  </div>
                  {openDropdown === 'company_size' && (
                    <div className="custom-dropdown-options">
                      {[
                        { value: 'mikro', label: TEXTS.COMPANY_SIZE.MICRO },
                        { value: 'mały', label: TEXTS.COMPANY_SIZE.SMALL },
                        { value: 'średni', label: TEXTS.COMPANY_SIZE.MEDIUM },
                        { value: 'duży', label: TEXTS.COMPANY_SIZE.LARGE },
                        { value: 'inne', label: TEXTS.COMPANY_SIZE.OTHER }
                      ].map(option => (
                        <div
                          key={option.value}
                          className={`dropdown-option ${data.company_size === option.value ? 'selected' : ''}`}
                          onClick={() => handleDropdownSelect('company_size', option.value)}
                        >
                          <span className="option-checkmark"></span>
                          <span className="option-label">{option.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormField>
            </div>
            
            <div>
              <FormField label={<><i className="fas fa-euro-sign" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Suma bilansowa &lt; 2 mln EUR?</>} required error={errors.balance_under_2m}>
                <div className={`custom-dropdown ${openDropdown === 'balance_under_2m' ? 'open' : ''}`} ref={el => { if (el) dropdownRefs.current['balance_under_2m'] = el; }}>
                  <div className="custom-dropdown-input" onClick={() => setOpenDropdown(openDropdown === 'balance_under_2m' ? null : 'balance_under_2m')}>
                    <Input
                      value={data.balance_under_2m}
                      onChange={handleChange('balance_under_2m')}
                      placeholder="Wybierz tak lub nie"
                      onFocus={() => setOpenDropdown('balance_under_2m')}
                      error={!!errors.balance_under_2m}
                    />
                    <span className="dropdown-arrow">▼</span>
                  </div>
                  {openDropdown === 'balance_under_2m' && (
                    <div className="custom-dropdown-options">
                      {[
                        { value: 'tak', label: TEXTS.YES_NO.YES },
                        { value: 'nie', label: TEXTS.YES_NO.NO }
                      ].map(option => (
                        <div
                          key={option.value}
                          className={`dropdown-option ${data.balance_under_2m === option.value ? 'selected' : ''}`}
                          onClick={() => handleDropdownSelect('balance_under_2m', option.value)}
                        >
                          <span className="option-checkmark"></span>
                          <span className="option-label">{option.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormField>
            </div>
          </div>
        </div>

        {/* Sekcja kontaktu */}
        <div className="mb-6">
          <h4 style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--neutral-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--neutral-100)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--neutral-500)'}} className="shadow-sm">
            <span style={{marginRight: '8px'}}>📞</span>Kontakt
          </h4>
          <div className="mb-4" style={{marginLeft: '16px', marginRight: '16px'}}>
            <FormField label={<><i className="fas fa-user" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Osoba kontaktowa</>} required error={errors.contact_person_name}>
              <Input
                placeholder="Imię i nazwisko"
                value={data.contact_person_name}
                onChange={handleChange('contact_person_name')}
                error={!!errors.contact_person_name}
              />
            </FormField>
          </div>

          <div className="mb-4" style={{marginLeft: '16px', marginRight: '16px'}}>
            <FormField label={<><i className="fas fa-briefcase" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Stanowisko osoby kontaktowej</>} required error={errors.contact_person_position}>
              <Input
                value={data.contact_person_position}
                onChange={handleChange('contact_person_position')}
                placeholder="np. Dyrektor, Prezes, Właściciel"
                error={!!errors.contact_person_position}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{marginLeft: '16px', marginRight: '16px'}}>
            <div>
              <FormField label={<><i className="fas fa-mobile-alt" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>{TEXTS.LABELS.CONTACT_PHONE}</>} required error={errors.contact_person_phone}>
                <Input
                  placeholder={TEXTS.PLACEHOLDERS.PHONE}
                  type="tel"
                  value={data.contact_person_phone}
                  onChange={handleChange('contact_person_phone')}
                  error={!!errors.contact_person_phone}
                />
              </FormField>
            </div>
            
            <div>
              <FormField label={<><i className="fas fa-envelope" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>{TEXTS.LABELS.CONTACT_EMAIL}</>} required error={errors.contact_person_email}>
                <Input
                  placeholder={TEXTS.PLACEHOLDERS.EMAIL}
                  type="email"
                  value={data.contact_person_email}
                  onChange={handleChange('contact_person_email')}
                  error={!!errors.contact_person_email}
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Sekcja danych bankowych */}
        <div className="mb-6">
          <h4 style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--neutral-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--neutral-100)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--neutral-500)'}} className="shadow-sm">
            <span style={{marginRight: '8px'}}>🏦</span>Dane bankowe
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{marginLeft: '16px', marginRight: '16px'}}>
            <div>
              <FormField label={<><i className="fas fa-university" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Nazwa banku</>} required error={errors.bank_name}>
                <Input
                  value={data.bank_name}
                  onChange={handleChange('bank_name')}
                  placeholder="PKO Bank Polski"
                  error={!!errors.bank_name}
                />
              </FormField>
            </div>
            
            <div>
              <FormField label={<><i className="fas fa-credit-card" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Numer konta bankowego</>} required error={errors.bank_account}>
                <Input
                  value={data.bank_account}
                  onChange={handleChange('bank_account')}
                  placeholder="PL 12 3456 7890 1234 5678 9012 3456"
                  pattern="PL\s?[0-9]{2}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}"
                  error={!!errors.bank_account}
                />
              </FormField>
            </div>
          </div>
          
          <div className="mt-4" style={{marginLeft: '16px', marginRight: '16px'}}>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.account_not_interest_bearing === 'tak'}
                onChange={(e) => onChange({ account_not_interest_bearing: e.target.checked ? 'tak' : 'nie' })}
                style={{
                  width: '18px',
                  height: '18px',
                  marginRight: '12px',
                  accentColor: 'var(--primary-600)',
                  cursor: 'pointer'
                }}
              />
              <span style={{
                color: 'var(--neutral-700)',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                Konto nie jest oprocentowane
              </span>
            </label>
          </div>
        </div>

        {/* Sekcja adresów */}
        <div className="mb-6">
          <h4 style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--neutral-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--neutral-100)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--neutral-500)'}} className="shadow-sm">
            <span style={{marginRight: '8px'}}>🏢</span>Adres siedziby
          </h4>
          <div className="address-form-layout">
            <div className="address-street">
              <FormField label={<><i className="fas fa-map-marker-alt" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Ulica i numer</>} required error={errors.company_street}>
                <Input
                  value={data.company_street}
                  onChange={handleChange('company_street')}
                  placeholder="ul. Marszałkowska 1/2"
                  error={!!errors.company_street}
                />
              </FormField>
            </div>
            <div className="address-postal">
              <FormField label={<><i className="fas fa-mail-bulk" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Kod pocztowy</>} required error={errors.company_postal_code}>
                <Input
                  value={data.company_postal_code}
                  onChange={handleChange('company_postal_code')}
                  placeholder="00-000"
                  pattern="[0-9]{2}-[0-9]{3}"
                  error={!!errors.company_postal_code}
                />
              </FormField>
            </div>
            <div className="address-city">
              <FormField label={<><i className="fas fa-city" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Miejscowość</>} required error={errors.company_city}>
                <Input
                  value={data.company_city}
                  onChange={handleChange('company_city')}
                  placeholder="Warszawa"
                  error={!!errors.company_city}
                />
              </FormField>
            </div>
          </div>

          {/* Toggle dla adresu działalności */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowActivityAddress(!showActivityAddress)}
              style={{
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: 'var(--neutral-700)', 
                marginBottom: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                backgroundColor: showActivityAddress ? 'var(--primary-100)' : 'var(--neutral-100)', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                borderLeft: '4px solid var(--neutral-500)',
                border: '1px solid var(--neutral-300)',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                justifyContent: 'space-between'
              }}
              className="shadow-sm hover:bg-neutral-200 transition-colors"
            >
              <span>
                <span style={{marginRight: '8px'}}>🏭</span>Adres działalności inny niż adres siedziby
              </span>
              <span style={{ transform: showActivityAddress ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                ▼
              </span>
            </button>
          </div>

          {/* Pola adresu działalności */}
          {showActivityAddress && (
            <div className="address-form-layout animate-fade-in">
              <div className="address-street">
                <FormField label={<><i className="fas fa-map-marker-alt" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Ulica i numer (działalność)</>}>
                  <Input
                    value={data.activity_street}
                    onChange={handleChange('activity_street')}
                    placeholder="ul. Przemysłowa 10"
                  />
                </FormField>
              </div>
              <div className="address-postal">
                <FormField label={<><i className="fas fa-mail-bulk" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Kod pocztowy</>}>
                  <Input
                    value={data.activity_postal_code}
                    onChange={handleChange('activity_postal_code')}
                    placeholder="00-000"
                    pattern="[0-9]{2}-[0-9]{3}"
                  />
                </FormField>
              </div>
              <div className="address-city">
                <FormField label={<><i className="fas fa-city" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Miejscowość</>}>
                  <Input
                    value={data.activity_city}
                    onChange={handleChange('activity_city')}
                    placeholder="Warszawa"
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* Toggle dla adresu korespondencji */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowCorrespondenceAddress(!showCorrespondenceAddress)}
              style={{
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: 'var(--neutral-700)', 
                marginBottom: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                backgroundColor: showCorrespondenceAddress ? 'var(--primary-100)' : 'var(--neutral-100)', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                borderLeft: '4px solid var(--neutral-500)',
                border: '1px solid var(--neutral-300)',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                justifyContent: 'space-between'
              }}
              className="shadow-sm hover:bg-neutral-200 transition-colors"
            >
              <span>
                <span style={{marginRight: '8px'}}>📮</span>Adres korespondencji inny niż adres siedziby
              </span>
              <span style={{ transform: showCorrespondenceAddress ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                ▼
              </span>
            </button>
          </div>

          {/* Pola adresu korespondencji */}
          {showCorrespondenceAddress && (
            <div className="address-form-layout animate-fade-in">
              <div className="address-street">
                <FormField label={<><i className="fas fa-map-marker-alt" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Ulica i numer (korespondencja)</>}>
                  <Input
                    value={data.correspondence_street}
                    onChange={handleChange('correspondence_street')}
                    placeholder="ul. Korespondencyjna 5"
                  />
                </FormField>
              </div>
              <div className="address-postal">
                <FormField label={<><i className="fas fa-mail-bulk" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Kod pocztowy</>}>
                  <Input
                    value={data.correspondence_postal_code}
                    onChange={handleChange('correspondence_postal_code')}
                    placeholder="00-000"
                    pattern="[0-9]{2}-[0-9]{3}"
                  />
                </FormField>
              </div>
              <div className="address-city">
                <FormField label={<><i className="fas fa-city" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Miejscowość</>}>
                  <Input
                    value={data.correspondence_city}
                    onChange={handleChange('correspondence_city')}
                    placeholder="Warszawa"
                  />
                </FormField>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDataStep;
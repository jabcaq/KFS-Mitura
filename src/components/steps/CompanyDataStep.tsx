import React, { useState, useRef, useEffect } from 'react';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { TEXTS } from '../../constants/texts';
import type { CompanyData } from '../../types';

interface CompanyDataStepProps {
  data: CompanyData;
  onChange: (data: Partial<CompanyData>) => void;
}

const CompanyDataStep: React.FC<CompanyDataStepProps> = ({ data, onChange }) => {
  const [showActivityAddress, setShowActivityAddress] = useState(false);
  const [showCorrespondenceAddress, setShowCorrespondenceAddress] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleChange = (field: keyof CompanyData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    onChange({ [field]: e.target.value });
  };

  const handleDropdownSelect = (field: keyof CompanyData, value: string) => {
    onChange({ [field]: value });
    setOpenDropdown(null);
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

        {/* Sekcja podstawowych danych firmy */}
        <div className="mb-6">
          <h4 style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--neutral-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--neutral-100)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--neutral-500)'}} className="shadow-sm">
            <span style={{marginRight: '8px'}}>🏢</span>Dane podstawowe firmy
          </h4>
          
          <div className="mb-4" style={{marginLeft: '16px', marginRight: '16px'}}>
            <FormField
              label={<><i className="fas fa-building" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>{TEXTS.LABELS.COMPANY_NAME}</>}
              required
            >
              <Input
                value={data.company_name}
                onChange={handleChange('company_name')}
                placeholder="Pełna nazwa firmy"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{marginLeft: '16px', marginRight: '16px'}}>
            <div>
              <FormField label={<><i className="fas fa-hashtag" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>NIP</>} required>
                <Input
                  value={data.company_nip}
                  onChange={handleChange('company_nip')}
                  pattern="[0-9]{3}-?[0-9]{3}-?[0-9]{2}-?[0-9]{2}"
                  placeholder="123-456-78-90"
                />
              </FormField>
            </div>
            
            <div>
              <FormField label={<><i className="fas fa-industry" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Główne PKD</>} required>
                <Input
                  value={data.company_pkd}
                  onChange={handleChange('company_pkd')}
                  placeholder="62.01.Z"
                />
              </FormField>
            </div>

            <div>
              <FormField label={<><i className="fas fa-user-tie" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Reprezentant</>} required>
                <Input
                  value={data.representative_person}
                  onChange={handleChange('representative_person')}
                  placeholder="Imie i nazwisko"
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
              <FormField label={<><i className="fas fa-users" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>{TEXTS.LABELS.TOTAL_EMPLOYEES}</>} required>
                <Input
                  placeholder={TEXTS.PLACEHOLDERS.EMPLOYEE_COUNT}
                  type="number"
                  min="1"
                  value={data.total_employees}
                  onChange={handleChange('total_employees')}
                />
              </FormField>
            </div>
            
            <div>
              <FormField label={<><i className="fas fa-chart-bar" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Wielkość podmiotu</>} required>
                <div className={`custom-dropdown ${openDropdown === 'company_size' ? 'open' : ''}`} ref={el => { if (el) dropdownRefs.current['company_size'] = el; }}>
                  <div className="custom-dropdown-input" onClick={() => setOpenDropdown(openDropdown === 'company_size' ? null : 'company_size')}>
                    <Input
                      value={data.company_size}
                      onChange={handleChange('company_size')}
                      placeholder="Wybierz lub wpisz wielkość podmiotu"
                      onFocus={() => setOpenDropdown('company_size')}
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
              <FormField label={<><i className="fas fa-euro-sign" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Suma bilansowa &lt; 2 mln EUR?</>} required>
                <div className={`custom-dropdown ${openDropdown === 'balance_under_2m' ? 'open' : ''}`} ref={el => { if (el) dropdownRefs.current['balance_under_2m'] = el; }}>
                  <div className="custom-dropdown-input" onClick={() => setOpenDropdown(openDropdown === 'balance_under_2m' ? null : 'balance_under_2m')}>
                    <Input
                      value={data.balance_under_2m}
                      onChange={handleChange('balance_under_2m')}
                      placeholder="Wybierz tak lub nie"
                      onFocus={() => setOpenDropdown('balance_under_2m')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" style={{marginLeft: '16px', marginRight: '16px'}}>
            <div>
              <FormField label={<><i className="fas fa-phone" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>{TEXTS.LABELS.REPRESENTATIVE_PHONE}</>} required>
                <Input
                  placeholder={TEXTS.PLACEHOLDERS.PHONE}
                  type="tel"
                  value={data.representative_phone}
                  onChange={handleChange('representative_phone')}
                />
              </FormField>
            </div>
            
            <div>
              <FormField label={<><i className="fas fa-user" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Osoba kontaktowa</>} required>
                <Input
                  placeholder="Imię i nazwisko"
                  value={data.contact_person_name}
                  onChange={handleChange('contact_person_name')}
                />
              </FormField>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{marginLeft: '16px', marginRight: '16px'}}>
            <div>
              <FormField label={<><i className="fas fa-mobile-alt" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>{TEXTS.LABELS.CONTACT_PHONE}</>} required>
                <Input
                  placeholder={TEXTS.PLACEHOLDERS.PHONE}
                  type="tel"
                  value={data.contact_person_phone}
                  onChange={handleChange('contact_person_phone')}
                />
              </FormField>
            </div>
            
            <div>
              <FormField label={<><i className="fas fa-envelope" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>{TEXTS.LABELS.CONTACT_EMAIL}</>} required>
                <Input
                  placeholder={TEXTS.PLACEHOLDERS.EMAIL}
                  type="email"
                  value={data.contact_person_email}
                  onChange={handleChange('contact_person_email')}
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
              <FormField label={<><i className="fas fa-university" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Nazwa banku</>} required>
                <Input
                  value={data.bank_name}
                  onChange={handleChange('bank_name')}
                  placeholder="PKO Bank Polski"
                />
              </FormField>
            </div>
            
            <div>
              <FormField label={<><i className="fas fa-credit-card" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Numer konta bankowego</>} required>
                <Input
                  value={data.bank_account}
                  onChange={handleChange('bank_account')}
                  placeholder="PL 12 3456 7890 1234 5678 9012 3456"
                  pattern="PL\s?[0-9]{2}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}"
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Sekcja adresów */}
        <div className="mb-6">
          <h4 style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--neutral-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--neutral-100)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--neutral-500)'}} className="shadow-sm">
            <span style={{marginRight: '8px'}}>🏢</span>Adres siedziby
          </h4>
          <div style={{display: 'flex', gap: '16px', alignItems: 'end', marginBottom: '24px', marginLeft: '16px', marginRight: '16px'}}>
            <div style={{flex: '3'}}>
              <FormField label={<><i className="fas fa-map-marker-alt" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Ulica i numer</>} required>
                <Input
                  value={data.company_street}
                  onChange={handleChange('company_street')}
                  placeholder="ul. Marszałkowska 1/2"
                />
              </FormField>
            </div>
            <div style={{flex: '1'}}>
              <FormField label={<><i className="fas fa-mail-bulk" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Kod pocztowy</>} required>
                <Input
                  value={data.company_postal_code}
                  onChange={handleChange('company_postal_code')}
                  placeholder="00-000"
                  pattern="[0-9]{2}-[0-9]{3}"
                />
              </FormField>
            </div>
            <div style={{flex: '1'}}>
              <FormField label={<><i className="fas fa-city" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Miejscowość</>} required>
                <Input
                  value={data.company_city}
                  onChange={handleChange('company_city')}
                  placeholder="Warszawa"
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
            <div style={{display: 'flex', gap: '16px', alignItems: 'end', marginBottom: '24px', marginLeft: '16px', marginRight: '16px'}} className="animate-fade-in">
              <div style={{flex: '3'}}>
                <FormField label={<><i className="fas fa-map-marker-alt" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Ulica i numer (działalność)</>} required>
                  <Input
                    value={data.activity_street}
                    onChange={handleChange('activity_street')}
                    placeholder="ul. Przemysłowa 10"
                  />
                </FormField>
              </div>
              <div style={{flex: '1'}}>
                <FormField label={<><i className="fas fa-mail-bulk" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Kod pocztowy</>} required>
                  <Input
                    value={data.activity_postal_code}
                    onChange={handleChange('activity_postal_code')}
                    placeholder="00-000"
                    pattern="[0-9]{2}-[0-9]{3}"
                  />
                </FormField>
              </div>
              <div style={{flex: '1'}}>
                <FormField label={<><i className="fas fa-city" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Miejscowość</>} required>
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
            <div style={{display: 'flex', gap: '16px', alignItems: 'end', marginLeft: '16px', marginRight: '16px'}} className="animate-fade-in">
              <div style={{flex: '3'}}>
                <FormField label={<><i className="fas fa-map-marker-alt" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Ulica i numer (korespondencja)</>} required>
                  <Input
                    value={data.correspondence_street}
                    onChange={handleChange('correspondence_street')}
                    placeholder="ul. Korespondencyjna 5"
                  />
                </FormField>
              </div>
              <div style={{flex: '1'}}>
                <FormField label={<><i className="fas fa-mail-bulk" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Kod pocztowy</>} required>
                  <Input
                    value={data.correspondence_postal_code}
                    onChange={handleChange('correspondence_postal_code')}
                    placeholder="00-000"
                    pattern="[0-9]{2}-[0-9]{3}"
                  />
                </FormField>
              </div>
              <div style={{flex: '1'}}>
                <FormField label={<><i className="fas fa-city" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>Miejscowość</>} required>
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
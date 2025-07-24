import React, { useState, useEffect, useRef } from 'react';
import { FormField } from './ui/FormField';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { TEXTS } from '../constants/texts';
import type { Employee } from '../types';

interface ModernEmployeeCardProps {
  employee: Employee;
  employeeNumber: number;
  onUpdate: (updates: Partial<Employee>) => void;
  onRemove: () => void;
}

const ModernEmployeeCard: React.FC<ModernEmployeeCardProps> = ({
  employee,
  employeeNumber,
  onUpdate,
  onRemove
}) => {
  const [formData, setFormData] = useState(employee);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement>>({});

  useEffect(() => {
    setFormData(employee);
  }, [employee]);

  const handleChange = (field: keyof Employee) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let value = e.target.value;
    
    // No automatic date corrections - let user input naturally
    // Date validation will be handled during form submission
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error first
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // No real-time validation for dates - validate only on blur/save for better UX
  };

  // Handle date field blur for smooth UX
  const handleDateBlur = (field: keyof Employee) => (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only validate on blur if field has value
    if (value && (field === 'birth_date' || field === 'contract_start' || field === 'contract_end')) {
      const dateError = validateDate(value);
      if (dateError) {
        setErrors(prev => ({ ...prev, [field]: dateError }));
      } else {
        // Clear error if date is now valid
        if (errors[field]) {
          setErrors(prev => ({ ...prev, [field]: '' }));
        }
      }
    }
  };

  const handleDropdownSelect = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    setOpenDropdown(null);
    
    // Clear error if exists
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (openDropdown && !Object.values(dropdownRefs.current).some(ref => ref?.contains(target))) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdown]);

  // Date validation function
  const validateDate = (dateString: string): string | null => {
    if (!dateString) return null;
    
    // Check format YYYY-MM-DD
    const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = dateString.match(datePattern);
    
    if (!match) {
      return 'Data musi być w formacie YYYY-MM-DD';
    }
    
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    
    // Validate year (1900-2100)
    if (year < 1900 || year > 2100) {
      return 'Rok musi być między 1900 a 2100';
    }
    
    // Validate month (1-12)
    if (month < 1 || month > 12) {
      return 'Miesiąc musi być między 01 a 12';
    }
    
    // Validate day (1-31, considering month)
    if (day < 1 || day > 31) {
      return 'Dzień musi być między 01 a 31';
    }
    
    // Check if date actually exists (handles leap years, month lengths)
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return 'Nieprawidłowa data';
    }
    
    return null;
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    
    // Basic validation
    if (!formData.name?.trim()) newErrors.name = 'Pole wymagane';
    if (!formData.gender) newErrors.gender = 'Pole wymagane';
    if (!formData.birth_date) newErrors.birth_date = 'Pole wymagane';
    if (!formData.education) newErrors.education = 'Pole wymagane';
    if (!formData.position?.trim()) newErrors.position = 'Pole wymagane';
    if (!formData.contract_type) newErrors.contract_type = 'Pole wymagane';
    if (!formData.contract_start) newErrors.contract_start = 'Pole wymagane';

    // Date validation
    if (formData.birth_date) {
      const birthDateError = validateDate(formData.birth_date);
      if (birthDateError) newErrors.birth_date = birthDateError;
    }
    
    if (formData.contract_start) {
      const contractStartError = validateDate(formData.contract_start);
      if (contractStartError) newErrors.contract_start = contractStartError;
    }
    
    if (formData.contract_end) {
      const contractEndError = validateDate(formData.contract_end);
      if (contractEndError) newErrors.contract_end = contractEndError;
      
      // Check if contract end is after contract start
      if (!contractEndError && !newErrors.contract_start && formData.contract_start) {
        const startDate = new Date(formData.contract_start);
        const endDate = new Date(formData.contract_end);
        if (endDate <= startDate) {
          newErrors.contract_end = 'Data końca musi być późniejsza niż data rozpoczęcia';
        }
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const updateData = { ...formData, isEditing: false, isNew: false };
      console.log('💾 ModernEmployeeCard: handleSave calling onUpdate with:', { 
        updateData, 
        originalEmployeeId: employee.id,
        formDataId: formData.id 
      });
      onUpdate(updateData);
    }
  };

  const handleEdit = () => {
    console.log('🖊️ ModernEmployeeCard: Edit button clicked for employee:', { 
      id: employee.id, 
      name: employee.name, 
      currentIsEditing: employee.isEditing 
    });
    
    onUpdate({ isEditing: true });
    
    console.log('🖊️ ModernEmployeeCard: onUpdate called with isEditing: true');
  };

  const handleCancel = () => {
    if (employee.isNew) {
      onRemove();
    } else {
      setFormData(employee);
      onUpdate({ isEditing: false });
    }
  };

  if (employee.isEditing) {
    console.log('🔥 EMPLOYEE EDITING MODE - ZMIENIONY NA CSS VARIABLES!', {
      employeeId: employee.id,
      isEditing: employee.isEditing,
      style: 'backgroundColor: var(--neutral-100), border: var(--neutral-300)'
    });
    return (
      <div style={{
        backgroundColor: 'var(--neutral-50)',
        border: '2px solid var(--neutral-400)',
        borderRadius: '6px',
        padding: '24px'
      }} className="animate-fade-in shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div style={{backgroundColor: 'var(--neutral-500)', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600'}}>
              {employeeNumber}
            </div>
            <div>
              <h3 style={{fontSize: '20px', fontWeight: 'bold', color: 'var(--neutral-800)'}}>
                {employee.isNew ? 'NOWY PRACOWNIK' : 'EDYCJA PRACOWNIKA'}
              </h3>
              <p style={{fontSize: '16px', color: 'var(--neutral-600)', fontWeight: '500'}}>Wypełnij wszystkie wymagane pola</p>
            </div>
          </div>
          <div style={{fontSize: '12px', backgroundColor: 'var(--neutral-400)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontWeight: '600'}}>
            #{employeeNumber}
          </div>
        </div>

        {/* Sekcja podstawowych danych */}
        <div className="mb-6">
          <h4 style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--neutral-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--neutral-100)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--neutral-500)'}} className="shadow-sm">
            <span style={{marginRight: '8px'}}>👤</span>Dane osobowe
          </h4>
          <div style={{display: 'flex', gap: '16px', alignItems: 'end', marginLeft: '16px', marginRight: '16px'}}>
            <div style={{flex: '2'}}>
              <FormField label={<><i className="fas fa-user" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>{TEXTS.LABELS.NAME}</>} required error={errors.name}>
                <Input
                  value={formData.name || ''}
                  onChange={handleChange('name')}
                  error={!!errors.name}
                  placeholder="Imię i nazwisko"
                />
              </FormField>
            </div>
            
            <div style={{flex: '1'}}>
              <FormField label={<><i className="fas fa-venus-mars" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>{TEXTS.LABELS.GENDER}</>} required error={errors.gender}>
                <div className={`custom-dropdown ${openDropdown === 'gender' ? 'open' : ''}`} ref={el => { if (el) dropdownRefs.current['gender'] = el; }}>
                  <div className="custom-dropdown-input" onClick={() => setOpenDropdown(openDropdown === 'gender' ? null : 'gender')}>
                    <Input
                      value={formData.gender === 'M' ? TEXTS.GENDER.MALE : formData.gender === 'K' ? TEXTS.GENDER.FEMALE : ''}
                      onChange={() => {}}
                      placeholder="Wybierz płeć"
                      readOnly
                    />
                    <span className="dropdown-arrow">▼</span>
                  </div>
                  {openDropdown === 'gender' && (
                    <div className="custom-dropdown-options">
                      {[
                        { value: 'M', label: TEXTS.GENDER.MALE },
                        { value: 'K', label: TEXTS.GENDER.FEMALE }
                      ].map(option => (
                        <div
                          key={option.value}
                          className={`dropdown-option ${formData.gender === option.value ? 'selected' : ''}`}
                          onClick={() => handleDropdownSelect('gender', option.value)}
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

            <div style={{flex: '1'}}>
              <FormField label={<><i className="fas fa-calendar-alt" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>{TEXTS.LABELS.BIRTH_DATE}</>} required error={errors.birth_date}>
                <Input
                  placeholder="dd.mm.yyyy lub wybierz datę"
                  type="date"
                  value={formData.birth_date || ''}
                  onChange={handleChange('birth_date')}
                  onBlur={handleDateBlur('birth_date')}
                  error={!!errors.birth_date}
                  min="1900-01-01"
                  max="2100-12-31"
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Sekcja wykształcenia i stanowiska */}
        <div className="mb-6">
          <h4 style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--neutral-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--neutral-100)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--neutral-500)'}} className="shadow-sm">
            <span style={{marginRight: '8px'}}>🎓</span>Wykształcenie i stanowisko
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{marginLeft: '16px', marginRight: '16px'}}>
            <FormField label={<><i className="fas fa-graduation-cap" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>{TEXTS.LABELS.EDUCATION}</>} required error={errors.education}>
              <div className={`custom-dropdown ${openDropdown === 'education' ? 'open' : ''}`} ref={el => { if (el) dropdownRefs.current['education'] = el; }}>
                <div className="custom-dropdown-input" onClick={() => setOpenDropdown(openDropdown === 'education' ? null : 'education')}>
                  <Input
                    value={
                      formData.education === 'podstawowe' ? TEXTS.EDUCATION.PRIMARY :
                      formData.education === 'gimnazjalne' ? TEXTS.EDUCATION.MIDDLE :
                      formData.education === 'zawodowe' ? TEXTS.EDUCATION.VOCATIONAL :
                      formData.education === 'srednie_ogolne' ? TEXTS.EDUCATION.SECONDARY_GENERAL :
                      formData.education === 'srednie_zawodowe' ? TEXTS.EDUCATION.SECONDARY_VOCATIONAL :
                      formData.education === 'policealne' ? TEXTS.EDUCATION.POST_SECONDARY :
                      formData.education === 'wyzsze' ? TEXTS.EDUCATION.HIGHER : ''
                    }
                    onChange={() => {}}
                    placeholder="Wybierz wykształcenie"
                    readOnly
                  />
                  <span className="dropdown-arrow">▼</span>
                </div>
                {openDropdown === 'education' && (
                  <div className="custom-dropdown-options">
                    {[
                      { value: 'podstawowe', label: TEXTS.EDUCATION.PRIMARY },
                      { value: 'gimnazjalne', label: TEXTS.EDUCATION.MIDDLE },
                      { value: 'zawodowe', label: TEXTS.EDUCATION.VOCATIONAL },
                      { value: 'srednie_ogolne', label: TEXTS.EDUCATION.SECONDARY_GENERAL },
                      { value: 'srednie_zawodowe', label: TEXTS.EDUCATION.SECONDARY_VOCATIONAL },
                      { value: 'policealne', label: TEXTS.EDUCATION.POST_SECONDARY },
                      { value: 'wyzsze', label: TEXTS.EDUCATION.HIGHER }
                    ].map(option => (
                      <div
                        key={option.value}
                        className={`dropdown-option ${formData.education === option.value ? 'selected' : ''}`}
                        onClick={() => handleDropdownSelect('education', option.value)}
                      >
                        <span className="option-checkmark"></span>
                        <span className="option-label">{option.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormField>

            <FormField label={<><i className="fas fa-briefcase" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>{TEXTS.LABELS.POSITION}</>} required error={errors.position}>
              <Input
                value={formData.position || ''}
                onChange={handleChange('position')}
                error={!!errors.position}
                placeholder="np. Programista, Księgowy"
              />
            </FormField>
          </div>
        </div>

        {/* Sekcja zatrudnienia */}
        <div className="mb-6">
          <h4 style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--neutral-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--neutral-100)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--neutral-500)'}} className="shadow-sm">
            <span style={{marginRight: '8px'}}>📋</span>Zatrudnienie
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{marginLeft: '16px', marginRight: '16px'}}>
            <FormField label={<><i className="fas fa-file-contract" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>{TEXTS.LABELS.CONTRACT_TYPE}</>} required error={errors.contract_type}>
              <div className={`custom-dropdown ${openDropdown === 'contract_type' ? 'open' : ''}`} ref={el => { if (el) dropdownRefs.current['contract_type'] = el; }}>
                <div className="custom-dropdown-input" onClick={() => setOpenDropdown(openDropdown === 'contract_type' ? null : 'contract_type')}>
                  <Input
                    value={
                      formData.contract_type === 'umowa_o_prace' ? TEXTS.CONTRACT_TYPE.EMPLOYMENT :
                      formData.contract_type === 'umowa_zlecenie' ? TEXTS.CONTRACT_TYPE.MANDATE :
                      formData.contract_type === 'umowa_dzielo' ? TEXTS.CONTRACT_TYPE.SPECIFIC_WORK :
                      formData.contract_type === 'b2b' ? TEXTS.CONTRACT_TYPE.B2B :
                      formData.contract_type === 'powolanie' ? TEXTS.CONTRACT_TYPE.APPOINTMENT :
                      formData.contract_type === 'wlasciciel' ? TEXTS.CONTRACT_TYPE.OWNER :
                      formData.contract_type === 'inne' ? TEXTS.CONTRACT_TYPE.OTHER : ''
                    }
                    onChange={() => {}}
                    placeholder="Wybierz typ umowy"
                    readOnly
                  />
                  <span className="dropdown-arrow">▼</span>
                </div>
                {openDropdown === 'contract_type' && (
                  <div className="custom-dropdown-options">
                    {[
                      { value: 'umowa_o_prace', label: TEXTS.CONTRACT_TYPE.EMPLOYMENT },
                      { value: 'umowa_zlecenie', label: TEXTS.CONTRACT_TYPE.MANDATE },
                      { value: 'umowa_dzielo', label: TEXTS.CONTRACT_TYPE.SPECIFIC_WORK },
                      { value: 'b2b', label: TEXTS.CONTRACT_TYPE.B2B },
                      { value: 'powolanie', label: TEXTS.CONTRACT_TYPE.APPOINTMENT },
                      { value: 'wlasciciel', label: TEXTS.CONTRACT_TYPE.OWNER },
                      { value: 'inne', label: TEXTS.CONTRACT_TYPE.OTHER }
                    ].map(option => (
                      <div
                        key={option.value}
                        className={`dropdown-option ${formData.contract_type === option.value ? 'selected' : ''}`}
                        onClick={() => handleDropdownSelect('contract_type', option.value)}
                      >
                        <span className="option-checkmark"></span>
                        <span className="option-label">{option.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormField>

            <FormField label={<><i className="fas fa-play-circle" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>{TEXTS.LABELS.CONTRACT_START}</>} required error={errors.contract_start}>
              <Input
                placeholder={TEXTS.PLACEHOLDERS.DATE}
                type="date"
                value={formData.contract_start || ''}
                onChange={handleChange('contract_start')}
                onBlur={handleDateBlur('contract_start')}
                error={!!errors.contract_start}
                min="1900-01-01"
                max="2100-12-31"
              />
            </FormField>

            <FormField label={<><i className="fas fa-stop-circle" style={{marginRight: '8px', color: 'var(--neutral-500)'}}></i>{TEXTS.LABELS.CONTRACT_END}</>} error={errors.contract_end}>
              <Input
                placeholder={TEXTS.PLACEHOLDERS.DATE}
                type="date"
                value={formData.contract_end || ''}
                onChange={handleChange('contract_end')}
                onBlur={handleDateBlur('contract_end')}
                error={!!errors.contract_end}
                min="1900-01-01"
                max="2100-12-31"
              />
            </FormField>
          </div>
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--neutral-200)', backgroundColor: 'var(--neutral-50)', margin: '0 -24px -24px -24px', padding: '16px 24px 24px 24px', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px'}}>
          <div style={{fontSize: '14px', color: 'var(--neutral-600)', fontWeight: '500'}}>
            * Pola wymagane do zapisania pracownika
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>
              {employee.isNew ? 'Anuluj' : 'Cofnij zmiany'}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {employee.isNew ? 'Dodaj pracownika' : 'Zapisz zmiany'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--neutral-50)',
      border: '2px solid var(--neutral-300)',
      borderRadius: '6px',
      padding: '16px'
    }} className="shadow-sm">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div style={{width: '32px', height: '32px', backgroundColor: 'var(--success-600)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold'}} className="shadow-md">
            {employeeNumber}
          </div>
          <div>
            <h3 style={{fontWeight: 'bold', color: 'var(--success-800)', fontSize: '18px'}}>
              {formData.name}
            </h3>
            <p style={{fontSize: '14px', color: 'var(--success-700)', fontWeight: '500'}}>
              {formData.position}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div style={{backgroundColor: 'var(--success-500)', color: 'white', padding: '8px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'}} className="shadow-md">
            ✓ ZAPISANO
          </div>
          <button
            onClick={handleEdit}
            style={{padding: '8px 12px', backgroundColor: 'var(--neutral-500)', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease'}}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-600)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-500)'}
            title="EDYTUJ PRACOWNIKA"
          >
            ✏️ EDYTUJ
          </button>
          <button
            onClick={onRemove}
            style={{padding: '8px 12px', backgroundColor: 'var(--error-500)', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease'}}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--error-600)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--error-500)'}
            title="USUŃ PRACOWNIKA"
          >
            🗑️ USUŃ
          </button>
        </div>
      </div>

      {/* Info Grid - ALL DETAILS */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', fontSize: '14px', backgroundColor: 'var(--neutral-50)', borderRadius: '6px', padding: '16px', border: '1px solid var(--neutral-300)'}} className="shadow-inner">
        <div className="flex items-center gap-2" style={{height: '24px'}}>
          <span style={{color: 'var(--neutral-600)'}}>👤</span>
          <span style={{color: 'var(--neutral-800)', fontWeight: '600'}}>
            {formData.gender === 'M' ? TEXTS.GENDER.MALE : formData.gender === 'K' ? TEXTS.GENDER.FEMALE : formData.gender}, {formData.birth_date}
          </span>
        </div>
        
        <div className="flex items-center gap-2" style={{height: '24px'}}>
          <span style={{color: 'var(--neutral-600)'}}>🎓</span>
          <span style={{color: 'var(--neutral-800)', fontWeight: '600'}}>
            {formData.education === 'podstawowe' ? TEXTS.EDUCATION.PRIMARY :
             formData.education === 'gimnazjalne' ? TEXTS.EDUCATION.MIDDLE :
             formData.education === 'zawodowe' ? TEXTS.EDUCATION.VOCATIONAL :
             formData.education === 'srednie_ogolne' ? TEXTS.EDUCATION.SECONDARY_GENERAL :
             formData.education === 'srednie_zawodowe' ? TEXTS.EDUCATION.SECONDARY_VOCATIONAL :
             formData.education === 'policealne' ? TEXTS.EDUCATION.POST_SECONDARY :
             formData.education === 'wyzsze' ? TEXTS.EDUCATION.HIGHER :
             formData.education}
          </span>
        </div>
        
        <div className="flex items-center gap-2" style={{height: '24px'}}>
          <span style={{color: 'var(--neutral-600)'}}>📋</span>
          <span style={{color: 'var(--neutral-800)', fontWeight: '600'}}>
            {formData.contract_type === 'umowa_o_prace' ? TEXTS.CONTRACT_TYPE.EMPLOYMENT :
             formData.contract_type === 'umowa_zlecenie' ? TEXTS.CONTRACT_TYPE.MANDATE :
             formData.contract_type === 'umowa_dzielo' ? TEXTS.CONTRACT_TYPE.SPECIFIC_WORK :
             formData.contract_type === 'b2b' ? TEXTS.CONTRACT_TYPE.B2B :
             formData.contract_type === 'powolanie' ? TEXTS.CONTRACT_TYPE.APPOINTMENT :
             formData.contract_type === 'wlasciciel' ? TEXTS.CONTRACT_TYPE.OWNER :
             formData.contract_type === 'inne' ? TEXTS.CONTRACT_TYPE.OTHER :
             formData.contract_type}
          </span>
        </div>
        
        <div className="flex items-center gap-2" style={{height: '24px'}}>
          <span style={{color: 'var(--neutral-600)'}}>📅</span>
          <span style={{color: 'var(--neutral-800)', fontWeight: '600'}}>
            {formData.contract_start}{formData.contract_end ? ` - ${formData.contract_end}` : ' (bezterminowa)'}
          </span>
        </div>
        
        
        <div className="flex items-center gap-2 md:col-span-2 lg:col-span-1">
          <span style={{color: 'var(--neutral-600)'}}>💼</span>
          <span style={{color: 'var(--neutral-800)', fontSize: '12px', fontWeight: '600'}}>
            ID: {formData.id || employeeNumber}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModernEmployeeCard;
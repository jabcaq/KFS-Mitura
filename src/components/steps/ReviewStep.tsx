import React from 'react';
import type { CompanyData, EmployeeCollection } from '../../types';
import { TEXTS } from '../../constants/texts';

interface ReviewStepProps {
  companyData: CompanyData;
  employees: EmployeeCollection;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ companyData, employees }) => {
  const employeeList = Object.values(employees).filter(emp => !emp.isEditing);


  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Przegląd wniosku
        </h2>
        <p className="text-white">
          Sprawdź wszystkie wprowadzone dane przed wysłaniem wniosku
        </p>
      </div>

      <div className="space-y-8">
        {/* Company Data Section */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6" style={{marginLeft: '16px', marginRight: '16px'}}>
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
              <label className="text-sm font-medium text-neutral-500">Reprezentant:</label>
              <p className="text-neutral-900 font-medium">{companyData.representative_person}</p>
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

        {/* Employees Section */}
        {employeeList.length > 0 && (
          <div className="bg-white border border-neutral-200 rounded-xl p-6" style={{marginLeft: '16px', marginRight: '16px'}}>
            <h4 style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--neutral-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--neutral-100)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--neutral-500)'}} className="shadow-sm">
              <span style={{marginRight: '8px'}}>👥</span>
              Pracownicy do szkolenia ({employeeList.length} {employeeList.length === 1 ? 'osoba' : employeeList.length >= 2 && employeeList.length <= 4 ? 'osoby' : 'osób'})
              {employeeList.length >= 10 && (
                <div style={{backgroundColor: 'var(--warning-100)', color: 'var(--warning-700)', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', marginLeft: '12px'}}>
                  Duża grupa
                </div>
              )}
            </h4>
            
            <div style={{marginLeft: '16px', marginRight: '16px'}}>

              <div className="space-y-4">
                {employeeList.map((employee, index) => (
                  <div key={employee.id || index} style={{
                    backgroundColor: 'var(--neutral-100)',
                    border: '1px solid var(--neutral-300)',
                    borderRadius: '6px',
                    padding: '16px'
                  }}>
                    {/* Header z nazwiskiem */}
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <div style={{
                          width: '26px', 
                          height: '26px', 
                          backgroundColor: 'var(--neutral-500)', 
                          color: 'white', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '12px', 
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <span style={{fontWeight: 'bold', color: 'var(--neutral-800)', fontSize: '15px'}}>
                            {employee.name}
                          </span>
                          <span style={{fontSize: '12px', color: 'var(--neutral-600)', fontWeight: '500'}}>
                            {employee.position}
                          </span>
                        </div>
                      </div>
                      <div style={{backgroundColor: 'var(--success-100)', color: 'var(--success-700)', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', flexShrink: 0}}>
                        ✓ GOTOWY
                      </div>
                    </div>
                    
                    {/* Wszystkie szczegóły pracownika */}
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', fontSize: '13px', backgroundColor: 'var(--neutral-50)', borderRadius: '6px', padding: '12px', border: '1px solid var(--neutral-200)', alignItems: 'center'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '4px', height: '24px'}}>
                        <span style={{color: 'var(--neutral-600)'}}>👤</span>
                        <span style={{color: 'var(--neutral-800)', fontWeight: '600'}}>
                          {employee.gender === 'M' ? TEXTS.GENDER.MALE : employee.gender === 'K' ? TEXTS.GENDER.FEMALE : employee.gender}, {employee.birth_date}
                        </span>
                      </div>
                      
                      <div style={{display: 'flex', alignItems: 'center', gap: '4px', height: '24px'}}>
                        <span style={{color: 'var(--neutral-600)'}}>🎓</span>
                        <span style={{color: 'var(--neutral-800)', fontWeight: '600'}}>
                          {employee.education === 'podstawowe' ? TEXTS.EDUCATION.PRIMARY :
                           employee.education === 'gimnazjalne' ? TEXTS.EDUCATION.MIDDLE :
                           employee.education === 'zawodowe' ? TEXTS.EDUCATION.VOCATIONAL :
                           employee.education === 'srednie_ogolne' ? TEXTS.EDUCATION.SECONDARY_GENERAL :
                           employee.education === 'srednie_zawodowe' ? TEXTS.EDUCATION.SECONDARY_VOCATIONAL :
                           employee.education === 'policealne' ? TEXTS.EDUCATION.POST_SECONDARY :
                           employee.education === 'wyzsze' ? TEXTS.EDUCATION.HIGHER :
                           employee.education}
                        </span>
                      </div>
                      
                      <div style={{display: 'flex', alignItems: 'center', gap: '4px', height: '24px'}}>
                        <span style={{color: 'var(--neutral-600)'}}>📋</span>
                        <span style={{color: 'var(--neutral-800)', fontWeight: '600'}}>
                          {employee.contract_type === 'umowa_o_prace' ? TEXTS.CONTRACT_TYPE.EMPLOYMENT :
                           employee.contract_type === 'umowa_zlecenie' ? TEXTS.CONTRACT_TYPE.MANDATE :
                           employee.contract_type === 'umowa_dzielo' ? TEXTS.CONTRACT_TYPE.SPECIFIC_WORK :
                           employee.contract_type === 'b2b' ? TEXTS.CONTRACT_TYPE.B2B :
                           employee.contract_type === 'powolanie' ? TEXTS.CONTRACT_TYPE.APPOINTMENT :
                           employee.contract_type === 'inne' ? TEXTS.CONTRACT_TYPE.OTHER :
                           employee.contract_type}
                        </span>
                      </div>
                      
                      <div style={{display: 'flex', alignItems: 'center', gap: '4px', height: '24px'}}>
                        <span style={{color: 'var(--neutral-600)'}}>📅</span>
                        <span style={{color: 'var(--neutral-800)', fontWeight: '600'}}>
                          {employee.contract_start}{employee.contract_end ? ` - ${employee.contract_end}` : ' (bezterminowa)'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state gdy nie ma pracowników */}
        {employeeList.length === 0 && (
          <div className="bg-white border border-neutral-200 rounded-xl p-6" style={{marginLeft: '16px', marginRight: '16px'}}>
            <h4 style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--neutral-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--neutral-100)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--neutral-500)'}} className="shadow-sm">
              <span style={{marginRight: '8px'}}>👥</span>
              Pracownicy do szkolenia
            </h4>
            
            <div style={{marginLeft: '16px', marginRight: '16px', textAlign: 'center', padding: '32px 0'}}>
              <div style={{fontSize: '48px', marginBottom: '16px'}}>👥</div>
              <h3 style={{fontSize: '18px', fontWeight: '600', color: 'var(--neutral-700)', marginBottom: '8px'}}>
                Brak dodanych pracowników
              </h3>
              <p style={{fontSize: '14px', color: 'var(--neutral-600)'}}>
                Wróć do kroku 2, aby dodać pracowników do szkolenia
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReviewStep;
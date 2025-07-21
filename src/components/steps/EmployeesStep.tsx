import React, { useState } from 'react';
import { Button } from '../ui/Button';
import ModernEmployeeCard from '../ModernEmployeeCard';
import { TEXTS } from '../../constants/texts';
import type { EmployeeCollection, Employee } from '../../types';

interface EmployeesStepProps {
  employees: EmployeeCollection;
  onChange: (employees: EmployeeCollection) => void;
}

const EmployeesStep: React.FC<EmployeesStepProps> = ({ employees, onChange }) => {
  const [nextId, setNextId] = useState(() => {
    const ids = Object.keys(employees).map(k => parseInt(k, 10)).filter(n => !isNaN(n));
    return Math.max(0, ...ids) + 1;
  });

  const addEmployee = () => {
    // Check if there's already an employee in editing mode
    const hasEditingEmployee = Object.values(employees).some(emp => emp.isEditing);
    
    if (hasEditingEmployee) {
      // Don't add new employee if one is already being edited
      return;
    }

    const newId = nextId.toString();
    const newEmployee: Employee = {
      id: newId,
      name: '',
      gender: '',
      birth_date: '',
      education: '',
      position: '',
      contract_type: '',
      contract_start: '',
      contract_end: '',
      isEditing: true,
      isNew: true
    };

    onChange({
      ...employees,
      [newId]: newEmployee
    });

    setNextId(prev => prev + 1);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    const employee = employees[id];
    
    // DEBUGGING: Alert jeśli to Airtable ID zamiast klucza dictionary
    if (id.startsWith('rec')) {
      alert(`🚨 BŁĄD: updateEmployee wywołany z Airtable ID: ${id} zamiast klucza dictionary!`);
      console.error('🚨 Błędne ID - oto stack trace:', new Error().stack);
      return;
    }
    
    console.log('🔧 EmployeesStep: updateEmployee called', { 
      id, 
      updates, 
      employee: employee ? { name: employee.name, isEditing: employee.isEditing, id: employee.id } : null,
      allEmployeeKeys: Object.keys(employees)
    });
    
    if (employee) {
      // If trying to set isEditing to true, check if another employee is already editing
      if (updates.isEditing === true) {
        console.log('🔍 Trying to start editing mode...');
        const hasOtherEditingEmployee = Object.keys(employees).some(
          key => key !== id && employees[key].isEditing
        );
        
        console.log('🔍 Has other editing employee?', hasOtherEditingEmployee);
        console.log('🔍 All employees:', Object.values(employees).map(emp => ({ id: emp.id, name: emp.name, isEditing: emp.isEditing })));
        
        if (hasOtherEditingEmployee) {
          console.log('❌ Cannot edit - another employee is already being edited');
          alert('Nie można edytować - inny pracownik jest już edytowany!');
          return;
        }
      }

      console.log('✅ Updating employee state...');
      onChange({
        ...employees,
        [id]: { ...employee, ...updates }
      });
    } else {
      console.log('❌ Employee not found with id:', id);
    }
  };

  const removeEmployee = (id: string) => {
    const newEmployees = { ...employees };
    delete newEmployees[id];
    onChange(newEmployees);
  };

  const employeeList = Object.values(employees);
  const employeeCount = employeeList.length;
  const hasEditingEmployee = employeeList.some(emp => emp.isEditing);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Pracownicy do szkolenia
        </h2>
        <p className="text-white">
          Dodaj pracowników, dla których składasz wniosek o finansowanie kształcenia
        </p>
      </div>

      <div className="space-y-6">
        {/* Sekcja zapisanych pracowników */}
        {employeeList.filter(emp => !emp.isEditing).length > 0 && (
          <div style={{
            backgroundColor: 'var(--neutral-50)',
            border: '2px solid var(--neutral-300)',
            borderRadius: '6px',
            padding: '24px'
          }} className="shadow-sm">
            <h3 style={{fontSize: '18px', fontWeight: '600', color: 'var(--neutral-800)', marginBottom: '16px'}}>
              📋 Dodani pracownicy ({employeeList.filter(emp => !emp.isEditing).length})
            </h3>
            <div className="space-y-4">
              {employeeList.filter(emp => !emp.isEditing).map((employee) => {
                // Find the dictionary key for this employee
                const employeeKey = Object.keys(employees).find(key => employees[key].id === employee.id) || '';
                console.log('🔧 EmployeesStep: Found employee key for inline view:', { employeeId: employee.id, employeeKey });
                
                return (
                  <div key={employee.id} style={{
                    backgroundColor: 'var(--neutral-100)',
                    border: '1px solid var(--neutral-300)',
                    borderRadius: '6px',
                    padding: '16px'
                  }}>
                    {/* Header z nazwiskiem i przyciskami */}
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
                          {employeeList.indexOf(employee) + 1}
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
                      <div style={{display: 'flex', gap: '8px'}}>
                        <div style={{backgroundColor: 'var(--neutral-400)', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold'}}>
                          ✓ ZAPISANO
                        </div>
                        <button
                          onClick={() => {
                            console.log('🔥 INLINE EDIT BUTTON: Using employeeKey:', employeeKey, 'for employee.id:', employee.id);
                            updateEmployee(employeeKey, { isEditing: true });
                          }}
                          disabled={hasEditingEmployee}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: hasEditingEmployee ? 'var(--neutral-300)' : 'var(--neutral-500)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: hasEditingEmployee ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: hasEditingEmployee ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!hasEditingEmployee) {
                            e.currentTarget.style.backgroundColor = 'var(--neutral-600)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!hasEditingEmployee) {
                            e.currentTarget.style.backgroundColor = 'var(--neutral-500)';
                          }
                        }}
                        title={hasEditingEmployee ? 'Zakończ edycję obecnego pracownika' : 'Edytuj pracownika'}
                      >
                        ✏️ Edytuj
                      </button>
                      <button
                        onClick={() => removeEmployee(employeeKey)}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: 'var(--error-500)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--error-600)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--error-500)'}
                      >
                        🗑️ Usuń
                      </button>
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
                         employee.education === 'srednie' ? TEXTS.EDUCATION.SECONDARY :
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
                );
              })}
            </div>
          </div>
        )}

        {employeeList.filter(emp => emp.isEditing).map((employee) => {
          // Find the dictionary key for this employee
          const employeeKey = Object.keys(employees).find(key => employees[key].id === employee.id) || '';
          console.log('🔧 EmployeesStep: Found employee key for editing:', { 
            employeeId: employee.id, 
            employeeKey,
            allKeys: Object.keys(employees),
            allEmployeeIds: Object.values(employees).map(emp => emp.id)
          });
          
          return (
            <ModernEmployeeCard
              key={employee.id}
              employee={employee}
              employeeNumber={employeeList.indexOf(employee) + 1}
              onUpdate={(updates) => {
                console.log('🔧 EmployeesStep: ModernEmployeeCard onUpdate called:', { employeeKey, updates, employeeId: employee.id });
                if (!employeeKey) {
                  console.error('❌ ERROR: employeeKey is empty! Cannot update employee.', {
                    employee: employee,
                    allEmployees: employees
                  });
                  alert(`🚨 BŁĄD: Nie można znaleźć klucza dla pracownika ${employee.name} (ID: ${employee.id})`);
                  return;
                }
                updateEmployee(employeeKey, updates);
              }}
              onRemove={() => removeEmployee(employeeKey)}
            />
          );
        })}

        <div style={{
          backgroundColor: 'var(--neutral-50)',
          border: '2px solid var(--neutral-300)',
          borderRadius: '6px',
          padding: '24px'
        }} 
        className="shadow-sm">
          <div className="text-center">
            <h3 style={{fontSize: '18px', fontWeight: '600', color: 'var(--neutral-800)', marginBottom: '8px'}}>
              {hasEditingEmployee ? 'Zapisz obecnego pracownika' : (employeeCount === 0 ? 'Dodaj pierwszego pracownika' : 'Dodaj kolejnego pracownika')}
            </h3>
            <p style={{fontSize: '14px', color: 'var(--neutral-600)', marginBottom: '16px'}}>
              {hasEditingEmployee ? 'Zakończ edycję obecnego pracownika przed dodaniem kolejnego' : 'Wprowadź dane pracownika do objęcia szkoleniem'}
            </p>
            <Button
              variant={hasEditingEmployee ? "outline" : "primary"}
              onClick={addEmployee}
              disabled={hasEditingEmployee}
              icon={
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
              }
            >
              {TEXTS.BUTTONS.ADD_EMPLOYEE}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeesStep;
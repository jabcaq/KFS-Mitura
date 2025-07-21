import React from 'react';
import { Button } from '../ui/Button';

interface SuccessStepProps {
  onNewSubmission: () => void;
}

const SuccessStep: React.FC<SuccessStepProps> = ({ onNewSubmission }) => {
  const submissionNumber = `KFS-${Date.now().toString().slice(-6)}`;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Potwierdzenie wysłania
        </h2>
        <p className="text-white">
          Twój wniosek został pomyślnie przesłany do systemu
        </p>
      </div>

      <div className="space-y-6">
        {/* Sekcja numeru zgłoszenia */}
        <div style={{
          backgroundColor: 'var(--neutral-50)',
          border: '2px solid var(--neutral-300)',
          borderRadius: '6px',
          padding: '20px'
        }} className="shadow-sm">
          <h3 style={{fontSize: '16px', fontWeight: '600', color: 'var(--neutral-800)', marginBottom: '12px'}}>
            ✅ Wniosek został wysłany pomyślnie
          </h3>
          
          <div style={{textAlign: 'center', padding: '16px', backgroundColor: 'var(--success-50)', borderRadius: '6px', border: '1px solid var(--success-200)'}}>
            <div style={{fontSize: '12px', color: 'var(--success-700)', marginBottom: '4px', fontWeight: '500'}}>
              Numer zgłoszenia
            </div>
            <div style={{fontSize: '18px', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--success-800)', marginBottom: '8px'}}>
              {submissionNumber}
            </div>
            <div style={{fontSize: '12px', color: 'var(--neutral-600)'}}>
              Zapisz ten numer do swoich dokumentów
            </div>
          </div>
        </div>

        {/* Sekcja następnych kroków */}
        <div style={{
          backgroundColor: 'var(--neutral-50)',
          border: '2px solid var(--neutral-300)',
          borderRadius: '6px',
          padding: '20px'
        }} className="shadow-sm">
          <h3 style={{fontSize: '16px', fontWeight: '600', color: 'var(--neutral-800)', marginBottom: '12px'}}>
            📋 Następne kroki
          </h3>
          
          <div className="space-y-3">
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: 'var(--neutral-100)', borderRadius: '4px', border: '1px solid var(--neutral-200)'}}>
              <div style={{width: '16px', height: '16px', backgroundColor: 'var(--primary-500)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                <span style={{color: 'white', fontSize: '10px', fontWeight: 'bold'}}>1</span>
              </div>
              <div style={{fontSize: '13px', color: 'var(--neutral-700)', fontWeight: '500'}}>
                Otrzymasz potwierdzenie na e-mail w ciągu 24 godzin
              </div>
            </div>
            
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: 'var(--neutral-100)', borderRadius: '4px', border: '1px solid var(--neutral-200)'}}>
              <div style={{width: '16px', height: '16px', backgroundColor: 'var(--primary-500)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                <span style={{color: 'white', fontSize: '10px', fontWeight: 'bold'}}>2</span>
              </div>
              <div style={{fontSize: '13px', color: 'var(--neutral-700)', fontWeight: '500'}}>
                Weryfikacja wniosku zajmie 2-3 dni robocze
              </div>
            </div>
            
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: 'var(--neutral-100)', borderRadius: '4px', border: '1px solid var(--neutral-200)'}}>
              <div style={{width: '16px', height: '16px', backgroundColor: 'var(--primary-500)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                <span style={{color: 'white', fontSize: '10px', fontWeight: 'bold'}}>3</span>
              </div>
              <div style={{fontSize: '13px', color: 'var(--neutral-700)', fontWeight: '500'}}>
                Skontaktujemy się w przypadku pytań
              </div>
            </div>
          </div>
        </div>

        {/* Sekcja akcji */}
        <div style={{
          backgroundColor: 'var(--neutral-50)',
          border: '2px solid var(--neutral-300)',
          borderRadius: '6px',
          padding: '20px'
        }} className="shadow-sm">
          <h3 style={{fontSize: '16px', fontWeight: '600', color: 'var(--neutral-800)', marginBottom: '12px'}}>
            ⚡ Dostępne akcje
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="primary"
              onClick={onNewSubmission}
              icon={
                <svg viewBox="0 0 20 20" fill="currentColor" style={{width: '14px', height: '14px'}}>
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
              }
            >
              Złóż kolejny wniosek
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.print()}
              icon={
                <svg viewBox="0 0 20 20" fill="currentColor" style={{width: '14px', height: '14px'}}>
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd"/>
                </svg>
              }
            >
              Drukuj potwierdzenie
            </Button>
          </div>
        </div>

        {/* Sekcja kontaktu */}
        <div style={{
          backgroundColor: 'var(--neutral-50)',
          border: '2px solid var(--neutral-300)',
          borderRadius: '6px',
          padding: '20px'
        }} className="shadow-sm">
          <h3 style={{fontSize: '16px', fontWeight: '600', color: 'var(--neutral-800)', marginBottom: '12px'}}>
            📞 Potrzebujesz pomocy?
          </h3>
          
          <div style={{padding: '12px', backgroundColor: 'var(--primary-50)', borderRadius: '6px', border: '1px solid var(--primary-200)', textAlign: 'center'}}>
            <div style={{fontSize: '13px', color: 'var(--neutral-700)', marginBottom: '6px'}}>
              Masz pytania? Skontaktuj się z nami:
            </div>
            <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--primary-700)'}}>
              📞 +48 123 456 789
            </div>
            <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--primary-700)'}}>
              ✉️ pomoc@kfs.gov.pl
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessStep;
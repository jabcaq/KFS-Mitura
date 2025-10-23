import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormWizard from './components/FormWizard';
import EditForm from './components/EditForm';

const App: React.FC = () => {
  const handleSubmissionSuccess = (data: any): void => {
    console.log('Submission successful:', data);
  };

  return (
    <div className="app">
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={<FormWizard onSubmissionSuccess={handleSubmissionSuccess} />} 
          />
          <Route 
            path="/:handlowiec_id" 
            element={<FormWizard onSubmissionSuccess={handleSubmissionSuccess} />} 
          />
          <Route 
            path="/wniosek/:id" 
            element={<EditForm />} 
          />
          <Route 
            path="/wniosek/:id/edit" 
            element={<EditForm />} 
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
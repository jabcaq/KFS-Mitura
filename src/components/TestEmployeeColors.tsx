import React from 'react';

const TestEmployeeColors: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">TEST KOLORÓW PRACOWNIKA</h2>
      
      {/* Test current red gradient */}
      <div className="bg-gradient-to-br from-red-100 via-pink-100 to-purple-100 border-2 border-red-300 rounded-xl p-6">
        <h3 className="text-xl font-bold text-red-900">STARY CZERWONY GRADIENT</h3>
        <p className="text-red-700">Ten powinien być czerwony</p>
      </div>
      
      {/* Test new gray background */}
      <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900">NOWY SZARY KOLOR</h3>
        <p className="text-gray-700">Ten powinien być szary</p>
      </div>
      
      {/* Test light gray */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800">JESZCZE JAŚNIEJSZY SZARY</h3>
        <p className="text-gray-600">Ten powinien być bardzo jasny szary</p>
      </div>
    </div>
  );
};

export default TestEmployeeColors;
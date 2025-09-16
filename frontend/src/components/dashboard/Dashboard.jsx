import React from 'react';
import StatsDashboard from './StatsDashboard';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ברוך הבא, מנהל המערכת!</h1>
          <p className="text-gray-600 mt-2">מערכת ניהול טפסי מופ"ת</p>
        </div>
        
        <StatsDashboard />
      </div>
    </div>
  );
};

export default Dashboard;


import React from 'react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">ברוך הבא, מנהל המערכת!</h1>
        <p className="text-gray-600 mb-6">לוח הבקרה הראשי של מערכת טפסי מופ"ת</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">סטטיסטיקות מערכת</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>טפסים פעילים:</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex justify-between">
                <span>טפסים שאושרו:</span>
                <span className="font-bold">8</span>
              </div>
              <div className="flex justify-between">
                <span>ממתינים לאישור:</span>
                <span className="font-bold">4</span>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">פעולות מהירות</h3>
            <div className="space-y-2">
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors">
                צור טופס חדש
              </button>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                נהל משתמשים
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors">
                הגדרות מערכת
              </button>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">פעילות אחרונה</h3>
            <div className="space-y-2 text-sm">
              <div>טופס SMS נוצר על ידי יוסי ישראלי</div>
              <div>טופס תוכנה אושר על ידי דוד כהן</div>
              <div>משתמש חדש נרשם למערכת</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


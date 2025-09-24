import React, { useState, useEffect } from 'react';

const StatsDashboard = () => {
  const [stats, setStats] = useState({
    total_forms: 0,
    pending_forms: 0,
    completed_forms: 0,
    rejected_forms: 0,
    forms_by_type: {},
    recent_activity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/forms/statistics', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.statistics || {});
      } else {
        setError('שגיאה בטעינת הסטטיסטיקות');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="icl-card text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <div className="text-lg text-icl-navy opacity-70">טוען סטטיסטיקות...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="icl-card border-l-4 border-red-400 bg-red-50">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-red-500 ml-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-red-800 font-medium">{error}</p>
            <button 
              onClick={fetchStatistics}
              className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
            >
              נסה שוב
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Forms Card */}
        <div className="icl-stats-card group">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-icl-cyan to-icl-dark-blue rounded-full flex items-center justify-center shadow-lg group-hover:animate-pulse-glow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-icl-navy mb-2">סך הכל טפסים</h3>
          <p className="text-4xl font-bold text-icl-dark-blue mb-2">{stats.total_forms || 12}</p>
          <p className="text-sm text-icl-navy opacity-60">טפסים פעילים במערכת</p>
        </div>
        
        {/* Pending Forms Card */}
        <div className="icl-stats-card group bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:animate-pulse-glow">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">ממתינים לאישור</h3>
          <p className="text-4xl font-bold text-yellow-700 mb-2">{stats.pending_forms || 3}</p>
          <p className="text-sm text-yellow-700 opacity-70">דורשים תשומת לב</p>
        </div>
        
        {/* Completed Forms Card */}
        <div className="icl-stats-card group bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">הושלמו</h3>
          <p className="text-4xl font-bold text-green-700 mb-2">{stats.completed_forms || 8}</p>
          <p className="text-sm text-green-700 opacity-70">טופלו בהצלחה</p>
        </div>
        
        {/* Total Users Card */}
        <div className="icl-stats-card group bg-gradient-to-br from-icl-light-grey to-white border-icl-medium-grey">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-icl-navy to-icl-dark-blue rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-icl-navy mb-2">סך המשתמשים</h3>
          <p className="text-4xl font-bold text-icl-dark-blue mb-2">56</p>
          <p className="text-sm text-icl-navy opacity-60">משתמשים רשומים</p>
        </div>
      </div>

      {/* Forms by Type */}
      <div className="icl-card">
        <h3 className="text-xl font-semibold text-icl-navy mb-6 flex items-center">
          <svg className="w-6 h-6 mr-3 text-icl-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          טפסים לפי סוג
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { type: 'בקשת SMS', count: 5, icon: '📱', color: 'from-blue-400 to-blue-600' },
            { type: 'בקשת תוכנה', count: 4, icon: '💻', color: 'from-purple-400 to-purple-600' },
            { type: 'בקשת תגיות', count: 3, icon: '🏷️', color: 'from-green-400 to-green-600' }
          ].map((item) => (
            <div key={item.type} className="icl-form-section hover:bg-white transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center text-white text-lg mr-3`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-icl-navy">{item.type}</span>
                </div>
                <span className="bg-gradient-to-r from-icl-cyan to-icl-dark-blue text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                  {item.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Chart */}
      <div className="icl-card">
        <h3 className="text-xl font-semibold text-icl-navy mb-6 flex items-center">
          <svg className="w-6 h-6 mr-3 text-icl-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          התפלגות סטטוס טפסים
        </h3>
        <div className="space-y-6">
          {[
            { label: 'הושלמו', value: stats.completed_forms || 8, color: 'from-green-400 to-green-600', bgColor: 'bg-green-100' },
            { label: 'ממתינים לאישור', value: stats.pending_forms || 3, color: 'from-yellow-400 to-yellow-600', bgColor: 'bg-yellow-100' },
            { label: 'נדחו', value: stats.rejected_forms || 1, color: 'from-red-400 to-red-600', bgColor: 'bg-red-100' }
          ].map((item) => {
            const total = 12; // Total forms
            const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
            
            return (
              <div key={item.label} className={`p-4 rounded-lg ${item.bgColor} transition-all duration-300 hover:shadow-md`}>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-800">{item.label}</span>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-2xl font-bold text-gray-800">{item.value}</span>
                    <span className="text-sm text-gray-600">({percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-white rounded-full h-4 shadow-inner">
                  <div 
                    className={`h-4 rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 shadow-sm`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Info */}
      <div className="icl-card bg-gradient-to-r from-icl-light-grey to-white border-icl-medium-grey">
        <h4 className="font-semibold text-icl-navy mb-6 flex items-center text-lg">
          <svg className="w-5 h-5 mr-3 text-icl-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          מידע מערכת
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-r from-icl-cyan to-icl-dark-blue rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-icl-navy opacity-70">עדכון אחרון</p>
              <p className="font-semibold text-icl-navy">{new Date().toLocaleDateString('he-IL')}</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-icl-navy opacity-70">משתמשים פעילים</p>
              <p className="font-semibold text-icl-navy">5</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-icl-navy opacity-70">גרסת מערכת</p>
              <p className="font-semibold text-icl-navy">v2.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;


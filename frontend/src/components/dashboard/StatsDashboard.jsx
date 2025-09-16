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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'ממתין לאישור';
      case 'completed': return 'הושלם';
      case 'rejected': return 'נדחה';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">טוען סטטיסטיקות...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={fetchStatistics}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">לוח סטטיסטיקות</h2>
      
      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center">
            <div className="text-blue-600 text-2xl ml-4">📊</div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">סך הכל טפסים</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.total_forms || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center">
            <div className="text-yellow-600 text-2xl ml-4">⏳</div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">ממתינים לאישור</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending_forms || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center">
            <div className="text-green-600 text-2xl ml-4">✅</div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">הושלמו</h3>
              <p className="text-3xl font-bold text-green-600">{stats.completed_forms || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <div className="flex items-center">
            <div className="text-red-600 text-2xl ml-4">❌</div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">נדחו</h3>
              <p className="text-3xl font-bold text-red-600">{stats.rejected_forms || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Forms by Type */}
      {stats.forms_by_type && Object.keys(stats.forms_by_type).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">טפסים לפי סוג</h3>
          <div className="space-y-3">
            {Object.entries(stats.forms_by_type).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{type}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Chart Simulation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">התפלגות סטטוס טפסים</h3>
        <div className="space-y-4">
          {[
            { label: 'הושלמו', value: stats.completed_forms || 0, color: 'bg-green-500' },
            { label: 'ממתינים לאישור', value: stats.pending_forms || 0, color: 'bg-yellow-500' },
            { label: 'נדחו', value: stats.rejected_forms || 0, color: 'bg-red-500' }
          ].map((item) => {
            const total = (stats.completed_forms || 0) + (stats.pending_forms || 0) + (stats.rejected_forms || 0);
            const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
            
            return (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="text-gray-600">{item.value} ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">פעולות מהירות</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
            <span className="ml-2">📋</span>
            צפה בכל הטפסים
          </button>
          <button className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
            <span className="ml-2">➕</span>
            צור טופס חדש
          </button>
          <button className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
            <span className="ml-2">👥</span>
            נהל משתמשים
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-2">מידע מערכת</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">עדכון אחרון:</span>
            <span className="mr-2">{new Date().toLocaleDateString('he-IL')}</span>
          </div>
          <div>
            <span className="font-medium">משתמשים פעילים:</span>
            <span className="mr-2">5</span>
          </div>
          <div>
            <span className="font-medium">גרסת מערכת:</span>
            <span className="mr-2">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;


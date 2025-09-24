import React, { useState, useEffect } from 'react';

const DashboardStats = ({ onStatClick }) => {
  const [stats, setStats] = useState({
    total_forms: 0,
    pending_forms: 0,
    completed_forms: 0,
    rejected_forms: 0,
    my_forms: 0,
    pending_for_me: 0,
    forms_by_type: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-animation">
        {[1, 2, 3].map((i) => (
          <div key={i} className="icl-stats-card icl-card-enhanced">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded mb-3"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="icl-card animate-fade-in-up">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-500 text-xl ml-3">⚠️</span>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is admin based on available stats
  const isAdmin = stats.total_forms !== undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-animation">
      {isAdmin ? (
        <>
          <div className="icl-stats-card icl-card-enhanced bounce-icon cursor-pointer" onClick={() => onStatClick("all")}>
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">סך הכל טפסים</h3>
            <p className="text-3xl font-bold gradient-text">{stats.total_forms || 0}</p>
          </div>
          
          <div className="icl-stats-card icl-card-enhanced bounce-icon cursor-pointer" onClick={() => onStatClick("pending")}>
            <div className="text-3xl mb-3">⏳</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">ממתינים לאישור</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending_forms || 0}</p>
          </div>
          
          <div className="icl-stats-card icl-card-enhanced bounce-icon cursor-pointer" onClick={() => onStatClick("completed")}>
            <div className="text-3xl mb-3">✅</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">טפסים שהושלמו</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completed_forms || 0}</p>
          </div>
        </>
      ) : (
        <>
          <div className="icl-stats-card icl-card-enhanced bounce-icon cursor-pointer" onClick={() => onStatClick("my_forms")}>
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">הטפסים שלי</h3>
            <p className="text-3xl font-bold gradient-text">{stats.my_forms || 0}</p>
          </div>
          
          <div className="icl-stats-card icl-card-enhanced bounce-icon cursor-pointer" onClick={() => onStatClick("pending_for_me")}>
            <div className="text-3xl mb-3">⏳</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">ממתינים לאישור שלי</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending_for_me || 0}</p>
          </div>
          
          <div className="icl-stats-card icl-card-enhanced bounce-icon cursor-pointer" onClick={() => onStatClick("completed")}>
            <div className="text-3xl mb-3">✅</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">טפסים שאושרו</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completed_forms || 0}</p>
          </div>
        </>
      )}
      
      {/* Forms by Type - Only for admin */}
      {isAdmin && stats.forms_by_type && Object.keys(stats.forms_by_type).length > 0 && (
        <div className="md:col-span-3 mt-6">
          <div className="icl-card icl-card-enhanced animate-fade-in-up">
            <h3 className="text-xl font-semibold gradient-text mb-4">טפסים לפי סוג</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(stats.forms_by_type).map(([type, count]) => (
                <div key={type} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-lg font-semibold text-gray-800">{type}</div>
                  <div className="text-2xl font-bold gradient-text">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;


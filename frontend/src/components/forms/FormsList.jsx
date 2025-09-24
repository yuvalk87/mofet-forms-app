import React, { useState, useEffect } from 'react';

const FormsList = ({ onFormSelect }) => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'my_forms', 'pending_for_me'

  useEffect(() => {
    fetchForms();
  }, [filter]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      let url = '/api/forms';
      const params = new URLSearchParams();
      
      if (filter === 'my_forms') {
        params.append('my_forms_only', 'true');
      } else if (filter === 'pending_for_me') {
        params.append('pending_for_me', 'true');
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setForms(data.forms || []);
      } else {
        setError('שגיאה בטעינת הטפסים');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { text: 'ממתין לאישור', class: 'bg-yellow-100 text-yellow-800' },
      'approved': { text: 'אושר', class: 'bg-green-100 text-green-800' },
      'rejected': { text: 'נדחה', class: 'bg-red-100 text-red-800' },
      'completed': { text: 'הושלם', class: 'bg-blue-100 text-blue-800' },
      'awaiting_final_approval': { text: 'ממתין לאישור סופי', class: 'bg-purple-100 text-purple-800' }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="forms-background min-h-screen">
        <div className="p-8 space-y-8 relative z-10">
          <div className="icl-card animate-fade-in-up">
            <div className="flex items-center justify-center py-16">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-600 mr-4">טוען טפסים...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forms-background min-h-screen">
      <div className="p-8 space-y-8 relative z-10">
        <div className="icl-card animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold gradient-text">כל הטפסים</h1>
              <p className="text-gray-600 mt-2">ניהול וצפייה בכל הטפסים במערכת</p>
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                filter === 'all'
                  ? 'icl-primary-button'
                  : 'icl-secondary-button'
              }`}
            >
              כל הטפסים
            </button>
            <button
              onClick={() => setFilter('my_forms')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                filter === 'my_forms'
                  ? 'icl-primary-button'
                  : 'icl-secondary-button'
              }`}
            >
              הטפסים שלי
            </button>
            <button
              onClick={() => setFilter('pending_for_me')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                filter === 'pending_for_me'
                  ? 'icl-primary-button'
                  : 'icl-secondary-button'
              }`}
            >
              ממתינים לאישור שלי
            </button>
          </div>
        </div>

        {error && (
          <div className="icl-card animate-fade-in-up">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-500 text-xl ml-3">⚠️</span>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {forms.length === 0 && !error ? (
          <div className="icl-card text-center py-16 animate-fade-in-up animate-delay-200">
            <div className="text-6xl mb-4">📋</div>
            <div className="text-gray-500 text-xl mb-6">
              {filter === 'my_forms' ? 'אין לך טפסים במערכת' :
               filter === 'pending_for_me' ? 'אין טפסים הממתינים לאישור שלך' :
               'אין טפסים במערכת'}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {forms.map((form, index) => (
              <div
                key={form.id}
                className="icl-card icl-card-enhanced animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => onFormSelect && onFormSelect(form)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {form.template_name || `טופס #${form.id}`}
                      </h3>
                      {getStatusBadge(form.status)}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>יוצר הטופס:</strong> {form.initiator_name}</p>
                      <p><strong>תאריך יצירה:</strong> {formatDate(form.created_at)}</p>
                      {form.completed_at && (
                        <p><strong>תאריך השלמה:</strong> {formatDate(form.completed_at)}</p>
                      )}
                    </div>
                    
                    {/* Form Data Preview */}
                    {form.form_data && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">פרטי הטופס:</h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          {Object.entries(form.form_data).slice(0, 3).map(([key, value]) => (
                            <p key={key}>
                              <strong>{key}:</strong> {typeof value === 'string' ? value : JSON.stringify(value)}
                            </p>
                          ))}
                          {Object.keys(form.form_data).length > 3 && (
                            <p className="text-gray-500">ועוד {Object.keys(form.form_data).length - 3} שדות...</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-left">
                    <div className="text-2xl mb-2">
                      {form.status === 'completed' ? '✅' :
                       form.status === 'rejected' ? '❌' :
                       form.status === 'pending' ? '⏳' :
                       form.status === 'awaiting_final_approval' ? '🔄' : '📋'}
                    </div>
                    <div className="text-xs text-gray-500">
                      שלב {form.current_step + 1}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsList;


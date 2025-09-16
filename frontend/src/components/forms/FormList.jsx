import React, { useState, useEffect } from 'react';

const FormList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/forms', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch forms');
      }
      
      const data = await response.json();
      setForms(data.forms || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">טוען טפסים...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">שגיאה בטעינת הטפסים</h3>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">כל הטפסים</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          צור טופס חדש
        </button>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">אין טפסים במערכת</div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            צור את הטופס הראשון
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {forms.map((form) => (
            <div key={form.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{form.title}</h3>
                  <p className="text-gray-600 mb-4">{form.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>סוג: {form.type}</span>
                    <span>סטטוס: {form.status}</span>
                    <span>נוצר: {new Date(form.created_at).toLocaleDateString('he-IL')}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded">
                    צפה
                  </button>
                  <button className="text-green-600 hover:text-green-800 px-3 py-1 rounded">
                    ערוך
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormList;


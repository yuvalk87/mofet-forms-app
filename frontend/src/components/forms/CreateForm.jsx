import React, { useState, useEffect } from 'react';

const CreateForm = ({ onFormCreated }) => {
  const [formType, setFormType] = useState('');
  const [formData, setFormData] = useState({});
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/forms/templates', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const handleFormTypeChange = (type) => {
    setFormType(type);
    setFormData({});
    setError(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          template_type: formType,
          form_data: formData
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('הטופס נוצר בהצלחה!');
        if (onFormCreated) {
          onFormCreated(result.form);
        }
        // Reset form
        setFormType('');
        setFormData({});
      } else {
        setError(result.error || 'שגיאה ביצירת הטופס');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setLoading(false);
    }
  };

  const renderSMSForm = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">טופס בקשת SMS</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תאריך</label>
          <input
            type="date"
            value={formData.date || ''}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">מתקן</label>
          <input
            type="text"
            value={formData.facility || ''}
            onChange={(e) => handleInputChange('facility', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">נושא</label>
          <input
            type="text"
            value={formData.subject || ''}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם הודעה</label>
          <input
            type="text"
            value={formData.message_name || ''}
            onChange={(e) => handleInputChange('message_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">נמענים</label>
          <textarea
            value={formData.recipients || ''}
            onChange={(e) => handleInputChange('recipients', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="הכנס רשימת נמענים..."
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">תנאים</label>
          <textarea
            value={formData.conditions || ''}
            onChange={(e) => handleInputChange('conditions', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="תנאים מיוחדים (אופציונלי)..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם תג</label>
          <input
            type="text"
            value={formData.tag_name || ''}
            onChange={(e) => handleInputChange('tag_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderDynamicForm = (templateType) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {templateType === 'software' ? 'טופס בקשת תוכנה' : 'טופס בקשת תג מערכת בקרה'}
      </h3>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          הטופס הדינמי עדיין בפיתוח. בינתיים, אנא השתמש בשדות הבסיסיים הבאים:
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">כותרת הבקשה</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תיאור הבקשה</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="תאר את הבקשה בפירוט..."
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">עדיפות</label>
          <select
            value={formData.priority || ''}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">בחר עדיפות</option>
            <option value="low">נמוכה</option>
            <option value="medium">בינונית</option>
            <option value="high">גבוהה</option>
            <option value="urgent">דחופה</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תאריך יעד</label>
          <input
            type="date"
            value={formData.target_date || ''}
            onChange={(e) => handleInputChange('target_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">יצירת טופס חדש</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">בחר סוג טופס:</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handleFormTypeChange('sms')}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${
              formType === 'sms'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-2">📱</div>
            <div className="font-medium">בקשת SMS</div>
          </button>
          
          <button
            type="button"
            onClick={() => handleFormTypeChange('software')}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${
              formType === 'software'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-2">💻</div>
            <div className="font-medium">בקשת תוכנה</div>
          </button>
          
          <button
            type="button"
            onClick={() => handleFormTypeChange('tags')}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${
              formType === 'tags'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-2">🏷️</div>
            <div className="font-medium">בקשת תגים</div>
          </button>
        </div>
      </div>
      
      {formType && (
        <form onSubmit={handleSubmit}>
          {formType === 'sms' && renderSMSForm()}
          {(formType === 'software' || formType === 'tags') && renderDynamicForm(formType)}
          
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={() => {
                setFormType('');
                setFormData({});
                setError(null);
              }}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'יוצר טופס...' : 'צור טופס'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateForm;


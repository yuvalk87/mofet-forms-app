import React, { useState, useEffect } from 'react';

const CreateFormFixed = () => {
  const [formType, setFormType] = useState('');
  const [formData, setFormData] = useState({});
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      // Use relative URL to avoid Mixed Content issues
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
    setSuccess(false);
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
      // Use relative URL to avoid Mixed Content issues
      const response = await fetch('/api/forms/', {
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

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({});
        setFormType('');
        setTimeout(() => {
          // Redirect to forms list after success
          window.location.href = '/forms';
        }, 2000);
      } else {
        setError(data.error || 'שגיאה ביצירת הטופס');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    switch (formType) {
      case 'SMS':
        return (
          <div className="space-y-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">נמענים</label>
              <textarea
                value={formData.recipients || ''}
                onChange={(e) => handleInputChange('recipients', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="רשימת נמענים..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תנאים</label>
              <textarea
                value={formData.conditions || ''}
                onChange={(e) => handleInputChange('conditions', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
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
        );
      
      case 'תוכנה':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם התוכנה</label>
              <input
                type="text"
                value={formData.software_name || ''}
                onChange={(e) => handleInputChange('software_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">גרסה</label>
              <input
                type="text"
                value={formData.version || ''}
                onChange={(e) => handleInputChange('version', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מטרת השימוש</label>
              <textarea
                value={formData.purpose || ''}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              />
            </div>
          </div>
        );
      
      case 'תגים':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סוג תג</label>
              <select
                value={formData.tag_type || ''}
                onChange={(e) => handleInputChange('tag_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">בחר סוג תג</option>
                <option value="זיהוי">תג זיהוי</option>
                <option value="גישה">תג גישה</option>
                <option value="חניה">תג חניה</option>
                <option value="אחר">אחר</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">כמות</label>
              <input
                type="number"
                min="1"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מטרת השימוש</label>
              <textarea
                value={formData.purpose || ''}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">יצירת טופס חדש</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">הטופס נוצר בהצלחה! מעביר לרשימת הטפסים...</p>
        </div>
      )}

      {/* Form Type Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label className="block text-lg font-medium text-gray-900 mb-4">בחר סוג טופס:</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handleFormTypeChange('SMS')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              formType === 'SMS'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="text-2xl mb-2">📱</div>
            <div className="font-semibold">בקשת SMS</div>
          </button>
          <button
            type="button"
            onClick={() => handleFormTypeChange('תוכנה')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              formType === 'תוכנה'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="text-2xl mb-2">💻</div>
            <div className="font-semibold">בקשת תוכנה</div>
          </button>
          <button
            type="button"
            onClick={() => handleFormTypeChange('תגים')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              formType === 'תגים'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="text-2xl mb-2">🏷️</div>
            <div className="font-semibold">בקשת תגים</div>
          </button>
        </div>
      </div>

      {/* Form Fields */}
      {formType && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            טופס {formType === 'SMS' ? 'בקשת SMS' : formType === 'תוכנה' ? 'בקשת תוכנה' : 'בקשת תגים'}
          </h3>
          
          {renderFormFields()}
          
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => {
                setFormType('');
                setFormData({});
                setError(null);
                setSuccess(false);
              }}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'יוצר טופס...' : 'צור טופס'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateFormFixed;


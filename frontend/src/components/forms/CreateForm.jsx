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
    <div className="space-y-6 animate-fade-in-up">
      <div className="icl-form-section">
        <h3 className="text-xl font-semibold gradient-text mb-4 flex items-center">
          <span className="text-2xl ml-3">📱</span>
          טופס בקשת SMS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-input-group animate-slide-in-right animate-delay-100">
            <label>תאריך</label>
            <input
              type="date"
              value={formData.date || ''}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="icl-input"
              required
            />
          </div>
          
          <div className="form-input-group animate-slide-in-left animate-delay-200">
            <label>מתקן</label>
            <input
              type="text"
              value={formData.facility || ''}
              onChange={(e) => handleInputChange('facility', e.target.value)}
              className="icl-input"
              placeholder="הכנס שם המתקן..."
              required
            />
          </div>
          
          <div className="form-input-group animate-slide-in-right animate-delay-300">
            <label>נושא</label>
            <input
              type="text"
              value={formData.subject || ''}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="icl-input"
              placeholder="נושא ההודעה..."
              required
            />
          </div>
          
          <div className="form-input-group animate-slide-in-left animate-delay-400">
            <label>שם הודעה</label>
            <input
              type="text"
              value={formData.message_name || ''}
              onChange={(e) => handleInputChange('message_name', e.target.value)}
              className="icl-input"
              placeholder="שם זיהוי להודעה..."
              required
            />
          </div>
          
          <div className="form-input-group md:col-span-2 animate-fade-in-up animate-delay-300">
            <label>נמענים</label>
            <textarea
              value={formData.recipients || ''}
              onChange={(e) => handleInputChange('recipients', e.target.value)}
              rows={4}
              className="icl-input"
              placeholder="הכנס רשימת נמענים (כל נמען בשורה נפרדת)..."
              required
            />
          </div>
          
          <div className="form-input-group md:col-span-2 animate-fade-in-up animate-delay-400">
            <label>תנאים</label>
            <textarea
              value={formData.conditions || ''}
              onChange={(e) => handleInputChange('conditions', e.target.value)}
              rows={3}
              className="icl-input"
              placeholder="תנאים מיוחדים או הערות נוספות (אופציונלי)..."
            />
          </div>
          
          <div className="form-input-group animate-slide-in-right animate-delay-300">
            <label>שם תג</label>
            <input
              type="text"
              value={formData.tag_name || ''}
              onChange={(e) => handleInputChange('tag_name', e.target.value)}
              className="icl-input"
              placeholder="תג לזיהוי (אופציונלי)..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSoftwareForm = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="icl-form-section">
        <h3 className="text-xl font-semibold gradient-text mb-4 flex items-center">
          <span className="text-2xl ml-3">💻</span>
          טופס בקשת תוכנה
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-input-group animate-slide-in-right animate-delay-100">
            <label>שם התוכנה</label>
            <input
              type="text"
              value={formData.software_name || ''}
              onChange={(e) => handleInputChange('software_name', e.target.value)}
              className="icl-input"
              placeholder="שם התוכנה המבוקשת..."
              required
            />
          </div>
          
          <div className="form-input-group animate-slide-in-left animate-delay-200">
            <label>גרסה</label>
            <input
              type="text"
              value={formData.version || ''}
              onChange={(e) => handleInputChange('version', e.target.value)}
              className="icl-input"
              placeholder="גרסת התוכנה..."
              required
            />
          </div>
          
          <div className="form-input-group md:col-span-2 animate-fade-in-up animate-delay-300">
            <label>תיאור הבקשה</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="icl-input"
              placeholder="תאר את הצורך בתוכנה ואת השימוש המתוכנן..."
              required
            />
          </div>
          
          <div className="form-input-group animate-slide-in-right animate-delay-400">
            <label>מטרת השימוש</label>
            <input
              type="text"
              value={formData.purpose || ''}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              className="icl-input"
              placeholder="למה נדרשת התוכנה..."
              required
            />
          </div>
          
          <div className="form-input-group animate-slide-in-left animate-delay-400">
            <label>עדיפות</label>
            <select
              value={formData.priority || ''}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="icl-input"
            >
              <option value="">בחר עדיפות</option>
              <option value="low">נמוכה</option>
              <option value="medium">בינונית</option>
              <option value="high">גבוהה</option>
              <option value="urgent">דחופה</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTagsForm = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="icl-form-section">
        <h3 className="text-xl font-semibold gradient-text mb-4 flex items-center">
          <span className="text-2xl ml-3">🏷️</span>
          טופס בקשת תגים
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-input-group animate-slide-in-right animate-delay-100">
            <label>סוג תג</label>
            <select
              value={formData.tag_type || ''}
              onChange={(e) => handleInputChange('tag_type', e.target.value)}
              className="icl-input"
              required
            >
              <option value="">בחר סוג תג</option>
              <option value="access">תג גישה</option>
              <option value="identification">תג זיהוי</option>
              <option value="security">תג אבטחה</option>
              <option value="temporary">תג זמני</option>
            </select>
          </div>
          
          <div className="form-input-group animate-slide-in-left animate-delay-200">
            <label>כמות</label>
            <input
              type="number"
              value={formData.quantity || ''}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              className="icl-input"
              placeholder="מספר התגים הנדרשים..."
              min="1"
              required
            />
          </div>
          
          <div className="form-input-group md:col-span-2 animate-fade-in-up animate-delay-300">
            <label>מטרת השימוש</label>
            <textarea
              value={formData.purpose || ''}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              rows={3}
              className="icl-input"
              placeholder="תאר את מטרת השימוש בתגים..."
              required
            />
          </div>
          
          <div className="form-input-group animate-slide-in-right animate-delay-400">
            <label>תאריך תחילת שימוש</label>
            <input
              type="date"
              value={formData.start_date || ''}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
              className="icl-input"
            />
          </div>
          
          <div className="form-input-group animate-slide-in-left animate-delay-400">
            <label>תאריך סיום שימוש</label>
            <input
              type="date"
              value={formData.end_date || ''}
              onChange={(e) => handleInputChange('end_date', e.target.value)}
              className="icl-input"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="create-form-background min-h-screen">
      <div className="max-w-4xl mx-auto p-6 relative z-10">
        <div className="icl-card animate-fade-in-up">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold gradient-text mb-2">יצירת טופס חדש</h2>
            <p className="text-gray-600">בחר את סוג הטופס והשלם את הפרטים הנדרשים</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 animate-fade-in-up">
              <div className="flex items-center">
                <span className="text-red-500 text-xl ml-3">⚠️</span>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}
          
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-4">בחר סוג טופס:</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                className={`form-type-card interactive-element animate-slide-in-right animate-delay-100 ${
                  formType === 'sms' ? 'selected' : ''
                }`}
                onClick={() => handleFormTypeChange('sms')}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">📱</div>
                  <div className="font-semibold text-lg text-gray-800">בקשת SMS</div>
                  <div className="text-sm text-gray-600 mt-2">שליחת הודעות SMS למערכות</div>
                </div>
              </div>
              
              <div 
                className={`form-type-card interactive-element animate-fade-in-up animate-delay-200 ${
                  formType === 'software' ? 'selected' : ''
                }`}
                onClick={() => handleFormTypeChange('software')}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">💻</div>
                  <div className="font-semibold text-lg text-gray-800">בקשת תוכנה</div>
                  <div className="text-sm text-gray-600 mt-2">רישיונות ותוכנות חדשות</div>
                </div>
              </div>
              
              <div 
                className={`form-type-card interactive-element animate-slide-in-left animate-delay-300 ${
                  formType === 'tags' ? 'selected' : ''
                }`}
                onClick={() => handleFormTypeChange('tags')}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">🏷️</div>
                  <div className="font-semibold text-lg text-gray-800">בקשת תגים</div>
                  <div className="text-sm text-gray-600 mt-2">תגי גישה וזיהוי</div>
                </div>
              </div>
            </div>
          </div>
          
          {formType && (
            <form onSubmit={handleSubmit} className="animate-fade-in-up">
              {formType === 'sms' && renderSMSForm()}
              {formType === 'software' && renderSoftwareForm()}
              {formType === 'tags' && renderTagsForm()}
              
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setFormType('');
                    setFormData({});
                    setError(null);
                  }}
                  className="icl-secondary-button interactive-element"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="icl-primary-button interactive-element disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="loading-spinner w-4 h-4 ml-2"></div>
                      יוצר טופס...
                    </span>
                  ) : (
                    'צור טופס'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateForm;


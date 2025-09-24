import React, { useState, useEffect } from 'react';
import ApprovalChain from './ApprovalChain';

const MyApprovals = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedForm, setSelectedForm] = useState(null);

  useEffect(() => {
    fetchPendingApprovals();
    fetchApprovalHistory();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await fetch('/api/approval/my-approvals', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingApprovals(data.pending_approvals || []);
      } else {
        setError('שגיאה בטעינת אישורים ממתינים');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    }
  };

  const fetchApprovalHistory = async () => {
    try {
      const response = await fetch('/api/approval/approval-history', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setApprovalHistory(data.approval_history || []);
      } else {
        console.error('שגיאה בטעינת היסטוריית אישורים');
      }
    } catch (err) {
      console.error('שגיאה בחיבור לשרת');
    } finally {
      setLoading(false);
    }
  };

  const handleFormUpdate = (updatedForm) => {
    // Refresh the lists after form update
    fetchPendingApprovals();
    fetchApprovalHistory();
    setSelectedForm(null);
  };

  const getFormTypeIcon = (formType) => {
    switch (formType) {
      case 'sms':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'software':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'tags':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'ממתין לאישור';
      case 'approved': return 'אושר';
      case 'rejected': return 'נדחה';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen tech-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="icl-card text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[var(--icl-cyan)] border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-lg text-[var(--icl-gray)]">טוען אישורים...</div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedForm) {
    return (
      <div className="min-h-screen tech-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setSelectedForm(null)}
              className="icl-secondary-button flex items-center"
            >
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              חזור לרשימת אישורים
            </button>
          </div>
          
          <div className="icl-card mb-6">
            <h2 className="text-2xl font-bold text-[var(--icl-navy)] mb-4">
              פרטי טופס - {selectedForm.template_name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-[var(--icl-gray)]">יוזם הטופס</p>
                <p className="font-medium text-[var(--icl-navy)]">{selectedForm.initiator_name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--icl-gray)]">תאריך יצירה</p>
                <p className="font-medium text-[var(--icl-navy)]">
                  {new Date(selectedForm.created_at).toLocaleDateString('he-IL')}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--icl-gray)]">סטטוס</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedForm.status)}`}>
                  {getStatusText(selectedForm.status)}
                </span>
              </div>
            </div>
            
            {/* Form Data Display */}
            <div className="icl-form-section">
              <h3 className="text-lg font-semibold text-[var(--icl-navy)] mb-3">נתוני הטופס</h3>
              <div className="space-y-3">
                {Object.entries(selectedForm.form_data || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-[var(--icl-gray)] font-medium">{key}:</span>
                    <span className="text-[var(--icl-navy)]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <ApprovalChain formId={selectedForm.id} onUpdate={handleFormUpdate} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen tech-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="icl-card mb-6">
          <h1 className="text-3xl font-bold text-[var(--icl-navy)] mb-2">האישורים שלי</h1>
          <p className="text-[var(--icl-gray)]">ניהול אישורי טפסים ממתינים והיסטוריה</p>
        </div>

        {/* Tabs */}
        <div className="icl-card mb-6">
          <div className="flex border-b border-[var(--icl-light-gray)]">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'text-[var(--icl-cyan)] border-b-2 border-[var(--icl-cyan)]'
                  : 'text-[var(--icl-gray)] hover:text-[var(--icl-navy)]'
              }`}
            >
              אישורים ממתינים ({pendingApprovals.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-[var(--icl-cyan)] border-b-2 border-[var(--icl-cyan)]'
                  : 'text-[var(--icl-gray)] hover:text-[var(--icl-navy)]'
              }`}
            >
              היסטוריית אישורים ({approvalHistory.length})
            </button>
          </div>
        </div>

        {error && (
          <div className="icl-card border-l-4 border-red-400 mb-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 ml-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <div className="icl-card text-center py-12">
                <svg className="w-16 h-16 text-[var(--icl-gray)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-[var(--icl-navy)] mb-2">אין אישורים ממתינים</h3>
                <p className="text-[var(--icl-gray)]">כרגע אין טפסים הממתינים לאישור שלך</p>
              </div>
            ) : (
              pendingApprovals.map(form => (
                <div key={form.id} className="icl-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedForm(form)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--icl-cyan)] to-[var(--icl-dark-blue)] rounded-full flex items-center justify-center text-white ml-4">
                        {getFormTypeIcon(form.template?.form_type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--icl-navy)]">{form.template_name}</h3>
                        <p className="text-[var(--icl-gray)]">יוזם: {form.initiator_name}</p>
                        <p className="text-sm text-[var(--icl-gray)]">
                          נוצר: {new Date(form.created_at).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-left">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(form.status)}`}>
                        {getStatusText(form.status)}
                      </span>
                      <p className="text-sm text-[var(--icl-gray)] mt-2">
                        שלב {form.current_step + 1}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {approvalHistory.length === 0 ? (
              <div className="icl-card text-center py-12">
                <svg className="w-16 h-16 text-[var(--icl-gray)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-[var(--icl-navy)] mb-2">אין היסטוריית אישורים</h3>
                <p className="text-[var(--icl-gray)]">עדיין לא ביצעת אישורים במערכת</p>
              </div>
            ) : (
              approvalHistory.map(form => (
                <div key={`${form.id}-${form.approval_info.id}`} className="icl-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--icl-cyan)] to-[var(--icl-dark-blue)] rounded-full flex items-center justify-center text-white ml-4">
                        {getFormTypeIcon(form.template?.form_type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--icl-navy)]">{form.template_name}</h3>
                        <p className="text-[var(--icl-gray)]">יוזם: {form.initiator_name}</p>
                        <p className="text-sm text-[var(--icl-gray)]">
                          אושר ב: {new Date(form.approval_info.action_date).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-left">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
                        form.approval_info.action === 'approved' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {form.approval_info.action === 'approved' ? 'אושר' : 'נדחה'}
                      </span>
                      {form.approval_info.comments && (
                        <p className="text-sm text-[var(--icl-gray)] mt-2 max-w-xs">
                          {form.approval_info.comments}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApprovals;


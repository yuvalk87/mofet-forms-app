import React, { useState, useEffect } from 'react';

const ApprovalChain = ({ formId, onUpdate }) => {
  const [approvals, setApprovals] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [showAddApprover, setShowAddApprover] = useState(false);
  const [newApproverEmail, setNewApproverEmail] = useState('');

  useEffect(() => {
    if (formId) {
      fetchApprovals();
    }
  }, [formId]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/approval/forms/${formId}/approvals`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setApprovals(data.approvals_by_step || {});
        setCurrentStep(data.current_step || 0);
        setForm(data.form);
      } else {
        setError('שגיאה בטעינת נתוני האישורים');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/approval/forms/${formId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ comments })
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments('');
        await fetchApprovals();
        if (onUpdate) onUpdate(data.form);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'שגיאה באישור הטופס');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/approval/forms/${formId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ comments })
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments('');
        await fetchApprovals();
        if (onUpdate) onUpdate(data.form);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'שגיאה בדחיית הטופס');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddApprover = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/approval/forms/${formId}/add-approver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ approver_email: newApproverEmail })
      });
      
      if (response.ok) {
        setNewApproverEmail('');
        setShowAddApprover(false);
        await fetchApprovals();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'שגיאה בהוספת מאשר');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setActionLoading(false);
    }
  };

  const getStepStatus = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep && form?.status === 'pending') return 'current';
    if (stepNumber === currentStep && form?.status !== 'pending') return form?.status;
    return 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'current': return 'text-[var(--icl-cyan)] bg-blue-50 border-blue-200';
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'current':
        return (
          <svg className="w-5 h-5 text-[var(--icl-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const canUserApprove = (stepApprovals) => {
    const userId = parseInt(localStorage.getItem('userId'));
    return stepApprovals.some(approval => 
      approval.approver_id === userId && approval.action === null
    );
  };

  if (loading) {
    return (
      <div className="icl-card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--icl-cyan)] border-t-transparent rounded-full"></div>
          <span className="mr-3 text-[var(--icl-gray)]">טוען נתוני אישורים...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="icl-card border-l-4 border-red-400">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-red-500 ml-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="icl-card">
        <h3 className="text-xl font-semibold text-[var(--icl-navy)] mb-4">שרשרת אישורים</h3>
        
        {/* Approval Steps */}
        <div className="space-y-4">
          {Object.keys(approvals).map(stepNumber => {
            const stepNum = parseInt(stepNumber);
            const stepApprovals = approvals[stepNumber];
            const status = getStepStatus(stepNum);
            const isCurrentUserStep = canUserApprove(stepApprovals);
            
            return (
              <div key={stepNumber} className={`icl-form-section border-r-4 ${
                status === 'current' ? 'border-[var(--icl-cyan)]' : 
                status === 'completed' || status === 'approved' ? 'border-green-400' :
                status === 'rejected' ? 'border-red-400' : 'border-gray-300'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {getStatusIcon(status)}
                    <h4 className="text-lg font-medium text-[var(--icl-navy)] mr-3">
                      שלב {stepNum + 1}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                      {status === 'completed' ? 'הושלם' :
                       status === 'current' ? 'בתהליך' :
                       status === 'approved' ? 'אושר' :
                       status === 'rejected' ? 'נדחה' : 'ממתין'}
                    </span>
                  </div>
                  
                  {status === 'current' && isCurrentUserStep && (
                    <button
                      onClick={() => setShowAddApprover(!showAddApprover)}
                      className="icl-secondary-button text-sm"
                    >
                      הוסף מאשר
                    </button>
                  )}
                </div>
                
                {/* Approvers for this step */}
                <div className="space-y-2">
                  {stepApprovals.map(approval => (
                    <div key={approval.id} className="flex items-center justify-between p-3 bg-[var(--icl-off-white)] rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ml-3 ${
                          approval.action === 'approved' ? 'bg-green-500' :
                          approval.action === 'rejected' ? 'bg-red-500' :
                          'bg-gray-300'
                        }`}></div>
                        <div>
                          <p className="font-medium text-[var(--icl-navy)]">{approval.approver_name}</p>
                          {approval.is_additional && (
                            <p className="text-sm text-[var(--icl-gray)]">מאשר נוסף</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-left">
                        {approval.action && (
                          <div>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              approval.action === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {approval.action === 'approved' ? 'אושר' : 'נדחה'}
                            </span>
                            {approval.action_date && (
                              <p className="text-xs text-[var(--icl-gray)] mt-1">
                                {new Date(approval.action_date).toLocaleDateString('he-IL')}
                              </p>
                            )}
                          </div>
                        )}
                        {approval.comments && (
                          <p className="text-sm text-[var(--icl-gray)] mt-1 max-w-xs">
                            {approval.comments}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Add Approver Form */}
                {showAddApprover && status === 'current' && isCurrentUserStep && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="font-medium text-[var(--icl-navy)] mb-3">הוסף מאשר נוסף</h5>
                    <div className="flex gap-3">
                      <input
                        type="email"
                        value={newApproverEmail}
                        onChange={(e) => setNewApproverEmail(e.target.value)}
                        placeholder="כתובת דוא״ל של המאשר"
                        className="icl-input flex-1"
                      />
                      <button
                        onClick={handleAddApprover}
                        disabled={actionLoading || !newApproverEmail}
                        className="icl-primary-button"
                      >
                        הוסף
                      </button>
                      <button
                        onClick={() => setShowAddApprover(false)}
                        className="icl-secondary-button"
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Approval Actions */}
                {status === 'current' && isCurrentUserStep && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h5 className="font-medium text-[var(--icl-navy)] mb-3">פעולות אישור</h5>
                    
                    <div className="space-y-3">
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="הערות (אופציונלי)"
                        className="icl-input w-full h-20 resize-none"
                      />
                      
                      <div className="flex gap-3">
                        <button
                          onClick={handleApprove}
                          disabled={actionLoading}
                          className="icl-primary-button flex items-center"
                        >
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          אשר טופס
                        </button>
                        
                        <button
                          onClick={handleReject}
                          disabled={actionLoading}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          דחה טופס
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApprovalChain;


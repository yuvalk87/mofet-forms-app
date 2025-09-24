import React from 'react';
import StatsDashboard from './StatsDashboard';

const Dashboard = () => {
  const userName = localStorage.getItem('userName') || 'מנהל המערכת';
  
  return (
    <div className="min-h-screen tech-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header Card */}
        <div className="icl-card mb-8 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full bg-gradient-to-r from-icl-cyan to-icl-dark-blue"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-icl-navy mb-2 gradient-text">
                ברוך הבא, {userName}!
              </h1>
              <p className="text-icl-navy opacity-70 text-lg">
                מערכת ניהול טפסי מופ"ת
              </p>
              <div className="mt-4 flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center text-sm text-icl-dark-blue">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date().toLocaleDateString('he-IL', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-gradient-to-br from-icl-cyan to-icl-dark-blue rounded-full flex items-center justify-center shadow-lg animate-pulse-glow">
                <div className="text-3xl font-bold text-white">
                  <span className="text-white">▲</span>ICL
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions Card */}
        <div className="icl-card mb-8">
          <h2 className="text-xl font-semibold text-icl-navy mb-4">פעולות מהירות</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="icl-primary-button flex items-center justify-center space-x-2 space-x-reverse p-4 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>צור טופס חדש</span>
            </button>
            
            <button className="icl-secondary-button flex items-center justify-center space-x-2 space-x-reverse p-4 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>כל הטפסים</span>
            </button>
            
            <button className="icl-secondary-button flex items-center justify-center space-x-2 space-x-reverse p-4 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>האישורים שלי</span>
            </button>
          </div>
        </div>
        
        <StatsDashboard />
        
        {/* Recent Activity Card */}
        <div className="icl-card mt-8">
          <h2 className="text-xl font-semibold text-icl-navy mb-4">פעילות אחרונה</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-icl-light-grey rounded-lg">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-icl-cyan rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-icl-navy">טופס SMS חדש נוצר</p>
                  <p className="text-xs text-icl-navy opacity-60">לפני 5 דקות</p>
                </div>
              </div>
              <span className="text-xs bg-icl-cyan text-white px-2 py-1 rounded-full">חדש</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-icl-light-grey rounded-lg">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-icl-dark-blue rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-icl-navy">טופס תוכנה אושר</p>
                  <p className="text-xs text-icl-navy opacity-60">לפני 15 דקות</p>
                </div>
              </div>
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">אושר</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-icl-light-grey rounded-lg">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-icl-navy rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-icl-navy">משתמש חדש נרשם</p>
                  <p className="text-xs text-icl-navy opacity-60">לפני 30 דקות</p>
                </div>
              </div>
              <span className="text-xs bg-icl-dark-blue text-white px-2 py-1 rounded-full">משתמש</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


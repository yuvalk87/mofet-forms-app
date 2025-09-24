import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/use-toast';
import { Toaster } from './components/ui/toaster';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const isLoginPage = location.pathname === '/login';

  return (
    <ToastProvider>
      <div className="flex min-h-screen tech-background" dir="rtl">
        {!isLoginPage && (
          <aside className="w-72 bg-gradient-to-b from-icl-navy to-icl-dark-blue flex flex-col justify-between shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full bg-gradient-to-br from-icl-cyan/20 to-transparent"></div>
            </div>
            
            <div className="relative z-10 p-6">
              {/* ICL Logo/Header Section */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-icl-cyan to-white rounded-full flex items-center justify-center shadow-lg animate-pulse-glow">
                  <div className="text-2xl font-bold text-icl-navy">
                    <span className="text-icl-dark-blue">▲</span>ICL
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">טפסי מופ"ת</h2>
                <p className="text-icl-cyan text-sm font-medium">מערכת ניהול טפסים</p>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-3">
                <button 
                  className={`w-full text-right p-4 rounded-xl transition-all duration-300 flex items-center group relative overflow-hidden ${
                    location.pathname === '/' 
                      ? 'bg-gradient-to-r from-icl-cyan to-white text-icl-navy shadow-lg transform scale-105' 
                      : 'hover:bg-icl-dark-blue text-white hover:shadow-md hover:transform hover:scale-102'
                  }`}
                  onClick={() => navigate('/')}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ml-3 transition-all duration-300 ${
                    location.pathname === '/' 
                      ? 'bg-icl-navy/20' 
                      : 'bg-white/20 group-hover:bg-white/30'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className="font-semibold">🏠 דף הבית</span>
                </button>

                <button 
                  className={`w-full text-right p-4 rounded-xl transition-all duration-300 flex items-center group relative overflow-hidden ${
                    location.pathname === '/forms' 
                      ? 'bg-gradient-to-r from-icl-cyan to-white text-icl-navy shadow-lg transform scale-105' 
                      : 'hover:bg-icl-dark-blue text-white hover:shadow-md hover:transform hover:scale-102'
                  }`}
                  onClick={() => navigate('/forms')}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ml-3 transition-all duration-300 ${
                    location.pathname === '/forms' 
                      ? 'bg-icl-navy/20' 
                      : 'bg-white/20 group-hover:bg-white/30'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-semibold">📋 כל הטפסים</span>
                </button>

                <button 
                  className="w-full text-right p-4 rounded-xl transition-all duration-300 flex items-center group hover:bg-icl-dark-blue text-white hover:shadow-md hover:transform hover:scale-102"
                  onClick={() => navigate('/forms/create')}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center ml-3 group-hover:bg-white/30 transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="font-semibold">➕ צור טופס חדש</span>
                </button>

                {userRole === 'admin' && (
                  <>
                    <div className="border-t border-icl-cyan/30 my-6 pt-4">
                      <p className="text-icl-cyan text-xs font-bold mb-4 px-4 uppercase tracking-wider">ניהול מערכת</p>
                    </div>

                    <button 
                      className={`w-full text-right p-4 rounded-xl transition-all duration-300 flex items-center group relative overflow-hidden ${
                        location.pathname === '/admin/users' 
                          ? 'bg-gradient-to-r from-icl-cyan to-white text-icl-navy shadow-lg transform scale-105' 
                          : 'hover:bg-icl-dark-blue text-white hover:shadow-md hover:transform hover:scale-102'
                      }`}
                      onClick={() => navigate('/admin/users')}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ml-3 transition-all duration-300 ${
                        location.pathname === '/admin/users' 
                          ? 'bg-icl-navy/20' 
                          : 'bg-white/20 group-hover:bg-white/30'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <span className="font-semibold">נהל משתמשים</span>
                    </button>

                    <button 
                      className="w-full text-right p-4 rounded-xl transition-all duration-300 flex items-center group hover:bg-icl-dark-blue text-white hover:shadow-md hover:transform hover:scale-102"
                      onClick={() => navigate('/admin/settings')}
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center ml-3 group-hover:bg-white/30 transition-all duration-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="font-semibold">הגדרות מערכת</span>
                    </button>
                  </>
                )}
              </nav>
            </div>

            {/* User Info & Logout */}
            <div className="relative z-10 p-6 border-t border-icl-cyan/30">
              {userName && (
                <div className="mb-4 p-4 bg-gradient-to-r from-white/10 to-icl-cyan/10 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-icl-cyan to-white rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-icl-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-icl-cyan text-xs font-medium">שלום,</p>
                      <p className="text-white font-bold text-sm">{userName}</p>
                    </div>
                  </div>
                </div>
              )}
              <button 
                className="w-full text-right p-4 rounded-xl transition-all duration-300 flex items-center group bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500 hover:to-red-600 text-red-200 hover:text-white border border-red-500/30 hover:border-red-400"
                onClick={handleLogout}
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center ml-3 group-hover:bg-white/30 transition-all duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="font-semibold">🚪 התנתק</span>
              </button>
            </div>
          </aside>
        )}
        <main className={`flex-1 overflow-auto ${!isLoginPage ? '' : ''}`}>
          <Outlet />
        </main>
        <Toaster />
      </div>
    </ToastProvider>
  );
};

export default App;


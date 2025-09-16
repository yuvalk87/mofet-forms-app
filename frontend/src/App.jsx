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
      <div className="flex min-h-screen bg-gray-50" dir="rtl">
        {!isLoginPage && (
          <aside className="w-64 bg-white shadow-md p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-center mb-8 text-blue-700">טפסי מופ"ת</h2>
              <nav className="space-y-2">
                <button 
                  className="w-full text-right p-3 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
                  onClick={() => navigate('/')}
                >
                  <span className="ml-3">🏠</span>
                  דף הבית
                </button>
                <button 
                  className="w-full text-right p-3 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
                  onClick={() => navigate('/forms')}
                >
                  <span className="ml-3">📋</span>
                  כל הטפסים
                </button>
                {userRole === 'admin' && (
                  <>
                    <button 
                      className="w-full text-right p-3 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
                      onClick={() => navigate('/admin')}
                    >
                      <span className="ml-3">⚙️</span>
                      לוח מנהל
                    </button>
                    <button 
                      className="w-full text-right p-3 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
                      onClick={() => navigate('/admin/form-builder')}
                    >
                      <span className="ml-3">🔧</span>
                      בונה טפסים
                    </button>
                    <button 
                      className="w-full text-right p-3 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
                      onClick={() => navigate('/admin/users')}
                    >
                      <span className="ml-3">👥</span>
                      ניהול משתמשים
                    </button>
                    <button 
                      className="w-full text-right p-3 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
                      onClick={() => navigate('/admin/roles')}
                    >
                      <span className="ml-3">👤</span>
                      ניהול תפקידים
                    </button>
                  </>
                )}
              </nav>
            </div>
            <div className="mt-auto">
              {userName && <p className="text-sm text-gray-600 mb-2 text-center">שלום, {userName}</p>}
              <button 
                className="w-full text-right p-3 hover:bg-red-50 rounded-lg transition-colors text-red-600 flex items-center"
                onClick={handleLogout}
              >
                <span className="ml-3">🚪</span>
                התנתק
              </button>
            </div>
          </aside>
        )}
        <main className={`flex-1 overflow-auto ${!isLoginPage ? 'p-6' : ''}`}>
          <Outlet />
        </main>
        <Toaster />
      </div>
    </ToastProvider>
  );
};

export default App;


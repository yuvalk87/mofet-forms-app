import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { Button } from './components/ui/button';
import { Home, List, Settings, LogOut, LayoutDashboard, Users, UserCog } from 'lucide-react';

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
    <div className="flex min-h-screen bg-gray-50">
      {!isLoginPage && (
        <aside className="w-64 bg-white shadow-md p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-center mb-8 text-blue-700">טפסי מופ"ת</h2>
            <nav className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-lg" onClick={() => navigate('/')}>
                <Home className="h-5 w-5 ml-2" /> דף הבית
              </Button>
              <Button variant="ghost" className="w-full justify-start text-lg" onClick={() => navigate('/forms')}>
                <List className="h-5 w-5 ml-2" /> כל הטפסים
              </Button>
              {userRole === 'admin' && (
                <>
                  <Button variant="ghost" className="w-full justify-start text-lg" onClick={() => navigate('/admin')}>
                    <LayoutDashboard className="h-5 w-5 ml-2" /> לוח מנהל
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-lg" onClick={() => navigate('/admin/form-builder')}>
                    <Settings className="h-5 w-5 ml-2" /> בונה טפסים
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-lg" onClick={() => navigate('/admin/users')}>
                    <Users className="h-5 w-5 ml-2" /> ניהול משתמשים
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-lg" onClick={() => navigate('/admin/roles')}>
                    <UserCog className="h-5 w-5 ml-2" /> ניהול תפקידים
                  </Button>
                </>
              )}
            </nav>
          </div>
          <div className="mt-auto">
            {userName && <p className="text-sm text-gray-600 mb-2 text-center">שלום, {userName}</p>}
            <Button variant="ghost" className="w-full justify-start text-lg text-red-600 hover:text-red-700" onClick={handleLogout}>
              <LogOut className="h-5 w-5 ml-2" /> התנתק
            </Button>
          </div>
        </aside>
      )}
      <main className={`flex-1 overflow-auto ${!isLoginPage ? 'p-6' : ''}`}>
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

export default App;

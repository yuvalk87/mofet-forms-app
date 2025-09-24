import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// Import components
const CreateForm = React.lazy(() => import('./components/forms/CreateForm'));
const FormsList = React.lazy(() => import('./components/forms/FormsList'));
const UserManagement = React.lazy(() => import('./components/users/UserManagement'));
const DashboardStats = React.lazy(() => import('./components/dashboard/DashboardStats'));
const SystemSettings = React.lazy(() => import('./components/settings/SystemSettings'));

// Simple App component
const App = () => {
  const [currentPage, setCurrentPage] = React.useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [selectedForm, setSelectedForm] = React.useState(null);
  const [formsFilter, setFormsFilter] = React.useState("all");

  React.useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const data = await response.json();
      if (response.ok && !data.requires_otp) {
        localStorage.setItem('userToken', 'logged-in');
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userName', data.user.full_name);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
    setShowCreateForm(false);
    setSelectedForm(null);
  };

  const handleCreateFormClick = () => {
    setShowCreateForm(true);
    setCurrentPage('create-form');
    setSelectedForm(null);
  };

  const handleFormCreated = (form) => {
    setShowCreateForm(false);
    setCurrentPage('forms');
    setSelectedForm(null);
    // Refresh dashboard stats if on dashboard
    if (currentPage === 'dashboard') {
      window.location.reload();
    }
  };

  const handleUserManagement = () => {
    setCurrentPage('users');
    setShowCreateForm(false);
    setSelectedForm(null);
  };

  const handleSystemSettings = () => {
    setCurrentPage('settings');
    setShowCreateForm(false);
    setSelectedForm(null);
  };

  const handleFormSelect = (form) => {
    setSelectedForm(form);
    // Could navigate to form details page
  };

  const handleStatClick = (filter) => {
    setFormsFilter(filter);
    setCurrentPage("forms");
    setShowCreateForm(false);
    setSelectedForm(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container login-background">
        <div className="login-card animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-icl-cyan to-white rounded-full flex items-center justify-center shadow-lg">
              <div className="text-2xl font-bold text-icl-navy">
                <span className="text-icl-dark-blue">▲</span>ICL
              </div>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-2">טפסי מופ"ת</h2>
            <p className="text-gray-600">מערכת ניהול טפסים מתקדמת</p>
          </div>
          <div className="space-y-6">
            <div className="form-input-group">
              <label>דוא"ל</label>
              <input
                type="email"
                defaultValue="admin@mofet.com"
                className="icl-input"
                id="email"
                placeholder="הכנס כתובת דוא״ל..."
              />
            </div>
            <div className="form-input-group">
              <label>סיסמה</label>
              <input
                type="password"
                defaultValue="admin123"
                className="icl-input"
                id="password"
                placeholder="הכנס סיסמה..."
              />
            </div>
            <button
              onClick={() => {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                handleLogin(email, password);
              }}
              className="icl-primary-button w-full interactive-element"
            >
              התחבר למערכת
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen dashboard-background" dir="rtl">
      <aside className="w-72 icl-navbar flex flex-col justify-between shadow-2xl relative overflow-hidden">
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
              className={`nav-item w-full text-right p-4 rounded-xl transition-all duration-300 flex items-center group relative overflow-hidden ${
                currentPage === 'dashboard' 
                  ? 'bg-gradient-to-r from-icl-cyan to-white text-icl-navy shadow-lg transform scale-105' 
                  : 'hover:bg-icl-dark-blue text-white hover:shadow-md hover:transform hover:scale-102'
              }`}
              onClick={() => {
                setCurrentPage('dashboard');
                setShowCreateForm(false);
                setSelectedForm(null);
              }}
            >
              <span className="text-xl ml-3">🏠</span>
              <span className="font-medium">דף הבית</span>
            </button>
            
            <button 
              className={`nav-item w-full text-right p-4 rounded-xl transition-all duration-300 flex items-center group relative overflow-hidden ${
                currentPage === 'forms' 
                  ? 'bg-gradient-to-r from-icl-cyan to-white text-icl-navy shadow-lg transform scale-105' 
                  : 'hover:bg-icl-dark-blue text-white hover:shadow-md hover:transform hover:scale-102'
              }`}
              onClick={() => {
                setFormsFilter("all");
                setCurrentPage("forms");
                setShowCreateForm(false);
                setSelectedForm(null);
              }}
            >
              <span className="text-xl ml-3">📋</span>
              <span className="font-medium">כל הטפסים</span>
            </button>
            
            <button 
              className={`nav-item w-full text-right p-4 rounded-xl transition-all duration-300 flex items-center group relative overflow-hidden ${
                currentPage === 'create-form' 
                  ? 'bg-gradient-to-r from-icl-cyan to-white text-icl-navy shadow-lg transform scale-105' 
                  : 'hover:bg-icl-dark-blue text-white hover:shadow-md hover:transform hover:scale-102'
              }`}
              onClick={handleCreateFormClick}
            >
              <span className="text-xl ml-3">➕</span>
              <span className="font-medium">צור טופס חדש</span>
            </button>
            
            <button 
              className={`nav-item w-full text-right p-4 rounded-xl transition-all duration-300 flex items-center group relative overflow-hidden ${
                currentPage === 'users' 
                  ? 'bg-gradient-to-r from-icl-cyan to-white text-icl-navy shadow-lg transform scale-105' 
                  : 'hover:bg-icl-dark-blue text-white hover:shadow-md hover:transform hover:scale-102'
              }`}
              onClick={handleUserManagement}
            >
              <span className="text-xl ml-3">👥</span>
              <span className="font-medium">ניהול משתמשים</span>
            </button>
            
            <button 
              className={`nav-item w-full text-right p-4 rounded-xl transition-all duration-300 flex items-center group relative overflow-hidden ${
                currentPage === 'settings' 
                  ? 'bg-gradient-to-r from-icl-cyan to-white text-icl-navy shadow-lg transform scale-105' 
                  : 'hover:bg-icl-dark-blue text-white hover:shadow-md hover:transform hover:scale-102'
              }`}
              onClick={handleSystemSettings}
            >
              <span className="text-xl ml-3">⚙️</span>
              <span className="font-medium">הגדרות מערכת</span>
            </button>
          </nav>
        </div>
        
        <div className="relative z-10 p-6 border-t border-icl-dark-blue/30">
          <button 
            className="nav-item w-full text-right p-4 hover:bg-red-600/20 rounded-xl transition-all duration-300 text-red-300 hover:text-white flex items-center group"
            onClick={handleLogout}
          >
            <span className="text-xl ml-3">🚪</span>
            <span className="font-medium">התנתק</span>
          </button>
        </div>
      </aside>
      
      <main className="flex-1 relative z-10">
        {currentPage === 'dashboard' && (
          <div className="p-8 space-y-8">
            <div className="icl-card animate-fade-in-up">
              <h1 className="text-4xl font-bold gradient-text mb-2">ברוך הבא, {localStorage.getItem('userName') || 'משתמש'}!</h1>
              <p className="text-gray-600 text-lg">מערכת ניהול טפסים מתקדמת של ICL Group</p>
            </div>
            
            <DashboardStats onStatClick={handleStatClick} />
            
            <div className="icl-card icl-card-enhanced animate-fade-in-up animate-delay-400">
              <h3 className="text-xl font-semibold gradient-text mb-6">פעולות מהירות</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-animation">
                <button 
                  onClick={handleCreateFormClick}
                  className="icl-primary-button interactive-element ripple-effect text-center py-4"
                >
                  <div className="text-2xl mb-2">➕</div>
                  צור טופס חדש
                </button>
                <button 
                  onClick={handleUserManagement}
                  className="icl-secondary-button interactive-element ripple-effect text-center py-4"
                >
                  <div className="text-2xl mb-2">👥</div>
                  נהל משתמשים
                </button>
                <button 
                  onClick={handleSystemSettings}
                  className="icl-secondary-button interactive-element ripple-effect text-center py-4"
                >
                  <div className="text-2xl mb-2">⚙️</div>
                  הגדרות מערכת
                </button>
              </div>
            </div>
          </div>
        )}
        
        {currentPage === 'forms' && (
          <React.Suspense fallback={
            <div className="p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-600">טוען רשימת טפסים...</p>
              </div>
            </div>
          }>
            <FormsList onFormSelect={handleFormSelect} initialFilter={formsFilter} />
          </React.Suspense>
        )}

        {currentPage === 'users' && (
          <React.Suspense fallback={
            <div className="p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-600">טוען ניהול משתמשים...</p>
              </div>
            </div>
          }>
            <UserManagement />
          </React.Suspense>
        )}

        {currentPage === 'settings' && (
          <React.Suspense fallback={
            <div className="p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-600">טוען הגדרות מערכת...</p>
              </div>
            </div>
          }>
            <SystemSettings />
          </React.Suspense>
        )}

        {currentPage === 'create-form' && showCreateForm && (
          <React.Suspense fallback={
            <div className="p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-600">טוען רכיב יצירת טפסים...</p>
              </div>
            </div>
          }>
            <CreateForm onFormCreated={handleFormCreated} />
          </React.Suspense>
        )}
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


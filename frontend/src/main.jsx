import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// Import CreateFormFixed component
const CreateFormFixed = React.lazy(() => import('./components/forms/CreateFormFixed'));

// Simple App component
const App = () => {
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [showCreateForm, setShowCreateForm] = React.useState(false);

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
  };

  const handleCreateFormClick = () => {
    setShowCreateForm(true);
    setCurrentPage('create-form');
  };

  const handleFormCreated = (form) => {
    setShowCreateForm(false);
    setCurrentPage('forms');
    // Refresh forms list if needed
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6">טפסי מופ"ת</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">דוא"ל</label>
              <input
                type="email"
                defaultValue="admin@mofet.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                id="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
              <input
                type="password"
                defaultValue="admin123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                id="password"
              />
            </div>
            <button
              onClick={() => {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                handleLogin(email, password);
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              התחבר
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <aside className="w-64 bg-white shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-8 text-blue-700">טפסי מופ"ת</h2>
        <nav className="space-y-2">
          <button 
            className={`w-full text-right p-3 rounded-lg transition-colors flex items-center ${
              currentPage === 'dashboard' ? 'bg-blue-100' : 'hover:bg-blue-50'
            }`}
            onClick={() => {
              setCurrentPage('dashboard');
              setShowCreateForm(false);
            }}
          >
            <span className="ml-3">🏠</span>
            דף הבית
          </button>
          <button 
            className={`w-full text-right p-3 rounded-lg transition-colors flex items-center ${
              currentPage === 'forms' ? 'bg-blue-100' : 'hover:bg-blue-50'
            }`}
            onClick={() => {
              setCurrentPage('forms');
              setShowCreateForm(false);
            }}
          >
            <span className="ml-3">📋</span>
            כל הטפסים
          </button>
          <button 
            className={`w-full text-right p-3 rounded-lg transition-colors flex items-center ${
              currentPage === 'create-form' ? 'bg-blue-100' : 'hover:bg-blue-50'
            }`}
            onClick={handleCreateFormClick}
          >
            <span className="ml-3">➕</span>
            צור טופס חדש
          </button>
          <button 
            className="w-full text-right p-3 hover:bg-red-50 rounded-lg transition-colors text-red-600 flex items-center"
            onClick={handleLogout}
          >
            <span className="ml-3">🚪</span>
            התנתק
          </button>
        </nav>
      </aside>
      
      <main className="flex-1 p-6">
        {currentPage === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">ברוך הבא, מנהל המערכת!</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">טפסים פעילים</h3>
                <p className="text-2xl font-bold text-blue-600">12</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">טפסים שאושרו</h3>
                <p className="text-2xl font-bold text-green-600">8</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">ממתינים לאישור</h3>
                <p className="text-2xl font-bold text-yellow-600">4</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">פעולות מהירות</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={handleCreateFormClick}
                  className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  צור טופס חדש
                </button>
                <button className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  נהל משתמשים
                </button>
                <button className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  הגדרות מערכת
                </button>
              </div>
            </div>
          </div>
        )}
        
        {currentPage === 'forms' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">כל הטפסים</h1>
              <button 
                onClick={handleCreateFormClick}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                צור טופס חדש
              </button>
            </div>
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">אין טפסים במערכת</div>
              <button 
                onClick={handleCreateFormClick}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                צור את הטופס הראשון
              </button>
            </div>
          </div>
        )}

        {currentPage === 'create-form' && showCreateForm && (
          <React.Suspense fallback={<div>טוען...</div>}>
            <CreateFormFixed onFormCreated={handleFormCreated} />
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


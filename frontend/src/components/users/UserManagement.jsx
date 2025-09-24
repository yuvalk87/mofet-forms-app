import React, { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    phone: '',
    role: 'user',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        setError('שגיאה בטעינת המשתמשים');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/users/roles', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        setShowAddUser(false);
        setNewUser({
          email: '',
          full_name: '',
          phone: '',
          role: 'user',
          password: ''
        });
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || 'שגיאה ביצירת המשתמש');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchUsers();
        setEditingUser(null);
      } else {
        const data = await response.json();
        setError(data.error || 'שגיאה בעדכון המשתמש');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    }
  };

  const handleToggleUserStatus = async (userId, isActive) => {
    await handleUpdateUser(userId, { is_active: !isActive });
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      'admin': { text: 'מנהל מערכת', class: 'bg-red-100 text-red-800' },
      'manager': { text: 'מנהל', class: 'bg-blue-100 text-blue-800' },
      'supervisor': { text: 'מפקח', class: 'bg-purple-100 text-purple-800' },
      'user': { text: 'משתמש רגיל', class: 'bg-green-100 text-green-800' }
    };
    
    const roleInfo = roleMap[role] || { text: role, class: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleInfo.class}`}>
        {roleInfo.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="tech-background min-h-screen">
        <div className="p-8 space-y-8 relative z-10">
          <div className="icl-card animate-fade-in-up">
            <div className="flex items-center justify-center py-16">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-600 mr-4">טוען משתמשים...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tech-background min-h-screen">
      <div className="p-8 space-y-8 relative z-10">
        <div className="icl-card animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold gradient-text">ניהול משתמשים</h1>
              <p className="text-gray-600 mt-2">ניהול משתמשים והרשאות במערכת</p>
            </div>
            <button
              onClick={() => setShowAddUser(true)}
              className="icl-primary-button interactive-element ripple-effect"
            >
              <span className="text-lg ml-2">➕</span>
              הוסף משתמש
            </button>
          </div>
        </div>

        {error && (
          <div className="icl-card animate-fade-in-up">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-500 text-xl ml-3">⚠️</span>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="icl-card max-w-md w-full mx-4">
              <h3 className="text-xl font-bold gradient-text mb-4">הוסף משתמש חדש</h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="form-input-group">
                  <label>דוא"ל</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="icl-input"
                    required
                  />
                </div>
                <div className="form-input-group">
                  <label>שם מלא</label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                    className="icl-input"
                    required
                  />
                </div>
                <div className="form-input-group">
                  <label>טלפון</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="icl-input"
                  />
                </div>
                <div className="form-input-group">
                  <label>תפקיד</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="icl-input"
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-input-group">
                  <label>סיסמה</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="icl-input"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="icl-secondary-button flex-1"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    className="icl-primary-button flex-1"
                  >
                    הוסף משתמש
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="space-y-4">
          {users.map((user, index) => (
            <div
              key={user.id}
              className="icl-card icl-card-enhanced animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {user.full_name}
                    </h3>
                    {getRoleBadge(user.role)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'פעיל' : 'לא פעיל'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>דוא"ל:</strong> {user.email}</p>
                    {user.phone && <p><strong>טלפון:</strong> {user.phone}</p>}
                    <p><strong>תאריך הצטרפות:</strong> {new Date(user.created_at).toLocaleDateString('he-IL')}</p>
                    {user.last_login && (
                      <p><strong>התחברות אחרונה:</strong> {new Date(user.last_login).toLocaleDateString('he-IL')}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="icl-secondary-button text-sm px-3 py-1"
                  >
                    ערוך
                  </button>
                  <button
                    onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                    className={`text-sm px-3 py-1 rounded ${
                      user.is_active 
                        ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {user.is_active ? 'השבת' : 'הפעל'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && !error && (
          <div className="icl-card text-center py-16 animate-fade-in-up">
            <div className="text-6xl mb-4">👥</div>
            <div className="text-gray-500 text-xl mb-6">אין משתמשים במערכת</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;


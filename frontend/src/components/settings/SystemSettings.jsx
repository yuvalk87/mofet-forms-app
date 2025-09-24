import React, { useState, useEffect } from 'react';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('dynamic_lists');
  const [dynamicLists, setDynamicLists] = useState([]);
  const [approvalChains, setApprovalChains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddList, setShowAddList] = useState(false);
  const [newList, setNewList] = useState({
    name: '',
    description: '',
    items: []
  });
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    fetchDynamicLists();
    fetchApprovalChains();
  }, []);

  const fetchDynamicLists = async () => {
    try {
      const response = await fetch('/api/admin/dynamic-lists', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDynamicLists(data.lists || []);
      } else {
        setError('שגיאה בטעינת הרשימות הדינמיות');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    }
  };

  const fetchApprovalChains = async () => {
    try {
      const response = await fetch('/api/admin/approval-chains', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setApprovalChains(data.chains || []);
      }
    } catch (err) {
      console.error('Error fetching approval chains:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/dynamic-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newList)
      });

      if (response.ok) {
        setShowAddList(false);
        setNewList({ name: '', description: '', items: [] });
        fetchDynamicLists();
      } else {
        const data = await response.json();
        setError(data.error || 'שגיאה ביצירת הרשימה');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    }
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      setNewList({
        ...newList,
        items: [...newList.items, newItem.trim()]
      });
      setNewItem('');
    }
  };

  const handleRemoveItem = (index) => {
    setNewList({
      ...newList,
      items: newList.items.filter((_, i) => i !== index)
    });
  };

  const handleDeleteList = async (listId) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק רשימה זו?')) {
      try {
        const response = await fetch(`/api/admin/dynamic-lists/${listId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          fetchDynamicLists();
        } else {
          setError('שגיאה במחיקת הרשימה');
        }
      } catch (err) {
        setError('שגיאה בחיבור לשרת');
      }
    }
  };

  if (loading) {
    return (
      <div className="tech-background min-h-screen">
        <div className="p-8 space-y-8 relative z-10">
          <div className="icl-card animate-fade-in-up">
            <div className="flex items-center justify-center py-16">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-600 mr-4">טוען הגדרות מערכת...</p>
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
              <h1 className="text-3xl font-bold gradient-text">הגדרות מערכת</h1>
              <p className="text-gray-600 mt-2">ניהול רשימות דינמיות ושרשראות אישור</p>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('dynamic_lists')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'dynamic_lists'
                  ? 'icl-primary-button'
                  : 'icl-secondary-button'
              }`}
            >
              רשימות דינמיות
            </button>
            <button
              onClick={() => setActiveTab('approval_chains')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'approval_chains'
                  ? 'icl-primary-button'
                  : 'icl-secondary-button'
              }`}
            >
              שרשראות אישור
            </button>
            <button
              onClick={() => setActiveTab('form_templates')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === 'form_templates'
                  ? 'icl-primary-button'
                  : 'icl-secondary-button'
              }`}
            >
              תבניות טפסים
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

        {/* Dynamic Lists Tab */}
        {activeTab === 'dynamic_lists' && (
          <div className="space-y-6">
            <div className="icl-card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold gradient-text">רשימות דינמיות</h2>
                <button
                  onClick={() => setShowAddList(true)}
                  className="icl-primary-button interactive-element ripple-effect"
                >
                  <span className="text-lg ml-2">➕</span>
                  הוסף רשימה
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                רשימות דינמיות מאפשרות לך ליצור אוספי נתונים שניתן להשתמש בהם בטפסים שונים.
                לדוגמה: רשימת תוכנות, מתקנים, מפעלים וכו'.
              </p>

              {/* Add List Modal */}
              {showAddList && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="icl-card max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
                    <h3 className="text-xl font-bold gradient-text mb-4">הוסף רשימה דינמית</h3>
                    <form onSubmit={handleAddList} className="space-y-4">
                      <div className="form-input-group">
                        <label>שם הרשימה</label>
                        <input
                          type="text"
                          value={newList.name}
                          onChange={(e) => setNewList({...newList, name: e.target.value})}
                          className="icl-input"
                          placeholder="לדוגמה: תוכנות, מתקנים, מפעלים"
                          required
                        />
                      </div>
                      <div className="form-input-group">
                        <label>תיאור</label>
                        <textarea
                          value={newList.description}
                          onChange={(e) => setNewList({...newList, description: e.target.value})}
                          className="icl-input"
                          rows="3"
                          placeholder="תיאור קצר של הרשימה ושימושיה"
                        />
                      </div>
                      
                      <div className="form-input-group">
                        <label>פריטים ברשימה</label>
                        <div className="flex space-x-2 mb-2">
                          <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            className="icl-input flex-1"
                            placeholder="הוסף פריט חדש"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                          />
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="icl-secondary-button px-4"
                          >
                            הוסף
                          </button>
                        </div>
                        
                        {newList.items.length > 0 && (
                          <div className="border rounded-lg p-3 bg-gray-50 max-h-40 overflow-y-auto">
                            {newList.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center py-1">
                                <span className="text-sm">{item}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={() => setShowAddList(false)}
                          className="icl-secondary-button flex-1"
                        >
                          ביטול
                        </button>
                        <button
                          type="submit"
                          className="icl-primary-button flex-1"
                        >
                          צור רשימה
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Lists Display */}
              <div className="space-y-4">
                {dynamicLists.map((list, index) => (
                  <div
                    key={list.id}
                    className="border rounded-lg p-4 bg-gray-50 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{list.name}</h3>
                        {list.description && (
                          <p className="text-sm text-gray-600 mt-1">{list.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteList(list.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        מחק
                      </button>
                    </div>
                    
                    {list.items && list.items.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">פריטים ברשימה ({list.items.length}):</p>
                        <div className="flex flex-wrap gap-1">
                          {list.items.slice(0, 10).map((item, itemIndex) => (
                            <span
                              key={itemIndex}
                              className="px-2 py-1 bg-white rounded text-xs text-gray-700 border"
                            >
                              {item}
                            </span>
                          ))}
                          {list.items.length > 10 && (
                            <span className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-500">
                              +{list.items.length - 10} נוספים
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {dynamicLists.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📋</div>
                    <div className="text-gray-500 text-xl mb-6">אין רשימות דינמיות במערכת</div>
                    <p className="text-gray-400">צור רשימה ראשונה כדי להתחיל</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Approval Chains Tab */}
        {activeTab === 'approval_chains' && (
          <div className="icl-card">
            <h2 className="text-xl font-semibold gradient-text mb-4">שרשראות אישור</h2>
            <p className="text-gray-600 mb-6">
              הגדרת תהליכי אישור עבור סוגי טפסים שונים. כל טופס יכול להיות בעל שרשרת אישור ייחודית.
            </p>
            
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔄</div>
              <div className="text-gray-500 text-xl mb-6">מודול שרשראות אישור בפיתוח</div>
              <p className="text-gray-400">תכונה זו תהיה זמינה בקרוב עם עורך תרשים זרימה אינטראקטיבי</p>
            </div>
          </div>
        )}

        {/* Form Templates Tab */}
        {activeTab === 'form_templates' && (
          <div className="icl-card">
            <h2 className="text-xl font-semibold gradient-text mb-4">תבניות טפסים</h2>
            <p className="text-gray-600 mb-6">
              ניהול תבניות טפסים וקישור רשימות דינמיות לשדות בטפסים.
            </p>
            
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <div className="text-gray-500 text-xl mb-6">מודול תבניות טפסים בפיתוח</div>
              <p className="text-gray-400">תכונה זו תאפשר עריכת טפסים קיימים ויצירת טפסים חדשים</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;


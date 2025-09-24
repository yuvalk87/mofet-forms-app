import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requires_otp) {
          setShowOtp(true);
          setUserId(data.user_id);
        } else {
          localStorage.setItem('userToken', 'authenticated');
          localStorage.setItem('userRole', data.user.role);
          localStorage.setItem('userName', data.user.full_name);
          navigate('/');
        }
      } else {
        setError(data.error || 'שגיאה בהתחברות');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, otp_code: otpCode }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userToken', 'authenticated');
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userName', data.user.full_name);
        navigate('/');
      } else {
        setError(data.error || 'קוד OTP שגוי');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Floating geometric elements */}
      <div className="floating-element absolute top-20 left-20 w-16 h-16 bg-icl-cyan opacity-10 rounded-full"></div>
      <div className="floating-element absolute top-40 right-32 w-8 h-8 bg-icl-dark-blue opacity-10 rotate-45"></div>
      <div className="floating-element absolute bottom-32 left-40 w-12 h-12 bg-icl-cyan opacity-10 rounded-lg"></div>
      <div className="floating-element absolute bottom-20 right-20 w-6 h-6 bg-icl-dark-blue opacity-10 rounded-full"></div>
      
      <div className="login-card">
        {/* ICL Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-icl-navy mb-2">
            <span className="text-icl-dark-blue">▲</span>ICL
          </div>
          <h2 className="text-xl font-semibold text-icl-navy">טפסי מופ"ת</h2>
          <p className="text-sm text-icl-navy opacity-70 mt-1">מערכת ניהול טפסים</p>
          {showOtp && (
            <p className="text-sm text-icl-dark-blue mt-2">הזן את קוד האימות שנשלח לטלפון שלך</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg text-center mb-6">
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {!showOtp ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-icl-navy mb-2">
                דוא"ל
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="icl-input w-full"
                placeholder="הכנס את כתובת הדוא״ל שלך"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-icl-navy mb-2">
                סיסמה
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="icl-input w-full"
                placeholder="הכנס את הסיסמה שלך"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="icl-primary-button w-full text-lg font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner w-5 h-5 mr-2"></div>
                  מתחבר...
                </div>
              ) : (
                'התחבר'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpVerification} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-icl-navy mb-2">
                קוד אימות (OTP)
              </label>
              <input
                id="otp"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="icl-input w-full text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength="6"
                required
                disabled={loading}
              />
            </div>

            <div className="flex space-x-4 space-x-reverse">
              <button
                type="submit"
                disabled={loading}
                className="icl-primary-button flex-1 text-lg font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner w-5 h-5 mr-2"></div>
                    מאמת...
                  </div>
                ) : (
                  'אמת קוד'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowOtp(false)}
                className="icl-secondary-button flex-1 text-lg font-semibold py-3"
              >
                חזור
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-6">
          <a 
            href="#" 
            className="text-sm text-icl-dark-blue hover:text-icl-cyan transition-colors duration-200"
          >
            שכחת סיסמה?
          </a>
        </div>

        {/* Default user info */}
        <div className="text-center mt-8 pt-6 border-t border-icl-medium-grey">
          <p className="text-xs text-icl-navy opacity-70 mb-2">משתמש ברירת מחדל:</p>
          <div className="text-xs text-icl-navy opacity-60 space-y-1">
            <p><span className="font-medium">דוא"ל:</span> admin@mofet.com</p>
            <p><span className="font-medium">סיסמה:</span> admin123</p>
          </div>
        </div>

        {/* Subtle branding footer */}
        <div className="text-center mt-6 pt-4 border-t border-icl-medium-grey">
          <p className="text-xs text-icl-navy opacity-50">
            מופעל על ידי ICL Group
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


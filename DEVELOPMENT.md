# מדריך פיתוח - Development Guide

## סביבת הפיתוח

### דרישות מערכת
- Python 3.11+
- Node.js 20+
- pnpm
- Git

### הגדרת הפרויקט

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# או
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

#### Frontend Setup
```bash
cd frontend
pnpm install
```

### הרצת הפרויקט במצב פיתוח

#### Backend
```bash
cd backend
source venv/bin/activate
python src/main.py
```
השרת יעלה על: http://localhost:5000

#### Frontend
```bash
cd frontend
pnpm run dev
```
השרת יעלה על: http://localhost:5173

## מבנה הקוד

### Backend Structure
```
backend/src/
├── models/
│   └── user.py          # Database models
├── routes/
│   ├── auth.py          # Authentication routes
│   ├── forms.py         # Forms management routes
│   └── user.py          # User management routes
└── main.py              # Application entry point
```

### Frontend Structure
```
frontend/src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── forms/           # Form-related components
│   ├── auth/            # Authentication components
│   └── dashboard/       # Dashboard components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── App.jsx              # Main application component
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/resend-otp` - Resend OTP code

### Forms Endpoints
- `GET /api/forms/templates` - Get form templates
- `POST /api/forms/templates` - Create form template (Admin)
- `PUT /api/forms/templates/:id` - Update form template (Admin)
- `DELETE /api/forms/templates/:id` - Delete form template (Admin)
- `GET /api/forms/` - Get forms
- `POST /api/forms/` - Create new form
- `GET /api/forms/:id` - Get specific form
- `POST /api/forms/:id/approve` - Approve form
- `POST /api/forms/:id/reject` - Reject form
- `POST /api/forms/:id/final-approve` - Final approval by initiator
- `POST /api/forms/:id/add-approver` - Add additional approver
- `GET /api/forms/statistics` - Get statistics

### User Management Endpoints
- `GET /api/users` - Get all users (Admin)
- `POST /api/users` - Create new user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

## Database Schema

### Main Tables
- **users** - User accounts and authentication
- **form_templates** - Form definitions and configurations
- **forms** - Form instances
- **form_approvals** - Approval workflow tracking
- **roles** - User roles and permissions
- **user_roles** - User-role assignments
- **otp_codes** - OTP codes for 2FA

## תכונות מיוחדות

### אימות דו-שלבי (2FA)
- יצירת קוד OTP בן 6 ספרות
- שליחה לנייד (סימולציה)
- תוקף של 5 דקות
- אפשרות לשליחה חוזרת

### בונה טפסים דינמי
- הגדרת שדות באופן דינמי
- תמיכה בסוגי שדות שונים:
  - טקסט
  - מספר
  - תאריך
  - בחירה מרשימה
  - טקסט חופשי (textarea)
  - קובץ

### שרשרת אישורים
- הגדרת שרשרת לפי תפקידים
- מעקב אחר שלב נוכחי
- אפשרות להוספת מאשר נוסף
- החזרה ליוזם לאישור סופי

## בדיקות

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
pnpm test
```

## פריסה (Deployment)

### Production Build
```bash
# Frontend build
cd frontend
pnpm run build

# Copy build to backend static folder
cp -r dist/* ../backend/src/static/

# Backend deployment
cd ../backend
pip freeze > requirements.txt
```

### Environment Variables
```bash
# Backend
FLASK_ENV=production
SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url

# Frontend
VITE_API_URL=your-api-url
```

## תרומה לפרויקט

### Git Workflow
1. צור branch חדש מ-main
2. בצע שינויים
3. הרץ בדיקות
4. צור Pull Request
5. בקש code review

### Coding Standards
- Python: PEP 8
- JavaScript: ESLint configuration
- Hebrew comments for business logic
- English for technical comments

## בעיות נפוצות

### Backend Issues
- **Database locked**: בדוק שאין תהליכים אחרים שמשתמשים ב-DB
- **CORS errors**: ודא שה-CORS מוגדר נכון
- **Import errors**: בדוק שה-virtual environment פעיל

### Frontend Issues
- **API connection**: בדוק שה-backend רץ על הפורט הנכון
- **Build errors**: נקה node_modules והתקן מחדש
- **Styling issues**: בדוק שה-Tailwind CSS נטען נכון

## תמיכה

לשאלות טכניות או בעיות, אנא פתח issue ב-GitHub או פנה למפתח הפרויקט.


## עדכונים טכניים בגרסה 2.0

### עיצוב ICL Group ורקעים טכנולוגיים

#### נכסי עיצוב חדשים
```
frontend/src/assets/
├── tech-bg-1.png          # רקע מתקדם לעמוד התחברות
├── tech-bg-2.png          # רקע עם זרמי נתונים דיגיטליים  
└── tech-pattern.png       # תבנית חוזרת למעגלים מודפסים
```

#### פלטת צבעים ICL Group
```css
:root {
  --icl-cyan: #00B5D3;
  --icl-dark-blue: #185898;
  --icl-navy: #002846;
  --icl-light-cyan: #33C5D9;
  --icl-gradient-primary: linear-gradient(135deg, #00B5D3 0%, #185898 100%);
  --icl-gradient-secondary: linear-gradient(135deg, #185898 0%, #002846 100%);
}
```

#### אפקטים ויזואליים מתקדמים
```css
/* Glass Morphism Effects */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Shimmer Animation */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Pulse Glow Effect */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 181, 211, 0.3); }
  50% { box-shadow: 0 0 30px rgba(0, 181, 211, 0.6); }
}
```

### מערכת אישורים רב-שלבית

#### מודל נתונים מתקדם
```python
# backend/src/models/user.py
class FormApproval(db.Model):
    __tablename__ = 'form_approvals'
    
    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.Integer, db.ForeignKey('forms.id'), nullable=False)
    approver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    step = db.Column(db.Integer, nullable=False, default=1)
    status = db.Column(db.String(20), nullable=False, default='pending')
    comments = db.Column(db.Text)
    approved_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # יחסים
    form = db.relationship('Form', backref='approvals')
    approver = db.relationship('User', backref='approvals_given')
```

#### API Endpoints לאישורים
```python
# backend/src/routes/approval_chain.py
@approval_bp.route('/api/approval/pending', methods=['GET'])
def get_pending_approvals():
    """קבלת רשימת אישורים ממתינים למשתמש הנוכחי"""
    
@approval_bp.route('/api/approval/<int:form_id>/approve', methods=['POST'])
def approve_form(form_id):
    """אישור טופס עם אפשרות להוספת הערות"""
    
@approval_bp.route('/api/approval/<int:form_id>/reject', methods=['POST'])
def reject_form(form_id):
    """דחיית טופס עם הערות חובה"""
    
@approval_bp.route('/api/approval/<int:form_id>/add-approver', methods=['POST'])
def add_approver(form_id):
    """הוספת מאשר נוסף לשלב הנוכחי"""
```

#### רכיבי React לאישורים
```jsx
// frontend/src/components/approval/ApprovalChain.jsx
const ApprovalChain = ({ formId, approvals }) => {
  return (
    <div className="approval-chain">
      {approvals.map((approval, index) => (
        <div key={approval.id} className="approval-step">
          <div className={`step-indicator ${approval.status}`}>
            {approval.status === 'approved' && <CheckIcon />}
            {approval.status === 'rejected' && <XIcon />}
            {approval.status === 'pending' && <ClockIcon />}
          </div>
          <div className="step-details">
            <h4>{approval.approver.name}</h4>
            <p className="step-status">{getStatusText(approval.status)}</p>
            {approval.comments && (
              <p className="step-comments">{approval.comments}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
```

### שיפורי ביצועים וארכיטקטורה

#### אופטימיזציה של Vite
```javascript
// frontend/vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-toast', '@radix-ui/react-dialog']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer]
    }
  }
});
```

#### ניהול מצב מתקדם
```jsx
// frontend/src/hooks/useAuth.js
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  return { user, login, logout, loading };
};
```

### בדיקות ואיכות קוד

#### בדיקות Backend
```python
# backend/tests/test_approval_chain.py
import pytest
from src.models.user import Form, FormApproval, User

def test_approval_workflow():
    """בדיקת תהליך אישור מלא"""
    # יצירת טופס חדש
    form = Form(title="Test Form", form_type="sms")
    db.session.add(form)
    db.session.commit()
    
    # הוספת מאשר ראשון
    approval = FormApproval(
        form_id=form.id,
        approver_id=1,
        step=1,
        status='pending'
    )
    db.session.add(approval)
    db.session.commit()
    
    # בדיקת מצב התחלתי
    assert approval.status == 'pending'
    assert approval.step == 1
```

#### בדיקות Frontend
```javascript
// frontend/src/components/__tests__/ApprovalChain.test.jsx
import { render, screen } from '@testing-library/react';
import ApprovalChain from '../approval/ApprovalChain';

test('renders approval chain correctly', () => {
  const mockApprovals = [
    { id: 1, status: 'approved', approver: { name: 'John Doe' } },
    { id: 2, status: 'pending', approver: { name: 'Jane Smith' } }
  ];
  
  render(<ApprovalChain formId={1} approvals={mockApprovals} />);
  
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('Jane Smith')).toBeInTheDocument();
});
```

### פריסה לייצור

#### Docker Configuration
```dockerfile
# Dockerfile.frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```dockerfile
# Dockerfile.backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "src.main:app"]
```

#### Docker Compose לפריסה
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
      
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mofet_forms
    depends_on:
      - db
      
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: mofet_forms
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### ניטור ולוגים

#### הגדרת לוגים מתקדמת
```python
# backend/src/utils/logger.py
import logging
from logging.handlers import RotatingFileHandler

def setup_logger(app):
    if not app.debug:
        file_handler = RotatingFileHandler(
            'logs/mofet_forms.log', 
            maxBytes=10240000, 
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Mofet Forms startup')
```

### אבטחה מתקדמת

#### הגנת CSRF
```python
# backend/src/utils/security.py
from flask_wtf.csrf import CSRFProtect

csrf = CSRFProtect()

def init_security(app):
    csrf.init_app(app)
    
    @app.before_request
    def security_headers():
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
```

#### הצפנת נתונים רגישים
```python
# backend/src/utils/encryption.py
from cryptography.fernet import Fernet
import os

class DataEncryption:
    def __init__(self):
        key = os.environ.get('ENCRYPTION_KEY')
        if not key:
            key = Fernet.generate_key()
        self.cipher = Fernet(key)
    
    def encrypt(self, data):
        return self.cipher.encrypt(data.encode()).decode()
    
    def decrypt(self, encrypted_data):
        return self.cipher.decrypt(encrypted_data.encode()).decode()
```

המערכת כוללת כעת תשתית מקיפה לפיתוח, בדיקות ופריסה ברמה מקצועית גבוהה.


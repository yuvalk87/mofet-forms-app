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


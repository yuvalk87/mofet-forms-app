## Task Summary: טפסי מופ"ת Application Development

### Goal:
Develop a comprehensive form management application named "טפסי מופ"ת" (Mofet Forms) to manage predefined form approval workflows and maintain historical records of requests. The application will facilitate interaction with a department handling these forms.

### Key Features:

#### 1. Form Management:
- **3 Types of Forms:**
  - SMS Request Form (with predefined fields: Date, Facility, Subject, Message Name, Recipients, Conditions, Tag Name)
  - Software Change/Addition Request Form (dynamic form builder)
  - Control System Tag Change/Addition Request Form (dynamic form builder)
- **Dynamic Form Builder:** For Software and Tag forms, allow administrators to define fields and structure.
- **Mandatory and Optional Fields:** Each form will have mandatory fields and optional fields that the initiator can fill as relevant.

#### 2. Approval Workflow:
- **Customizable Approval Chains:** Defined for each form type, with different roles and permissions.
- **Role-Based Permissions:** Different permissions for each role in the approval chain (e.g., some can edit all fields, some only specific fields, some none).
- **Approval Actions:**
  - **Approve:** Pass the form to the next approver in the chain, with an optional comment.
  - **Reject:** Return the form to the previous user in the chain.
  - **Add Approver:** Temporarily add an additional approver to the chain; the form returns to the referrer after the added approver's action.
- **Final Approval:** The form returns to the initiator for final confirmation after the entire approval chain is completed.

#### 3. User Management & Permissions:
- **2 Permission Levels:**
  - **System Administrator:** Full control over the system (add users, define permissions, create new forms, modify approval chains, define roles, delete/restore forms, replace approvers, set up substitutes).
  - **Regular User:** Can receive and initiate new forms.

#### 4. Admin Interface:
- **Form Definition:** Define forms and their required fields.
- **Approval Chain Definition:** Define approval chains for each form.
- **User Management:** Manage users.
- **Role Definition:** Define roles.
- **Dropdown List Management:** Define lists for selection fields in various forms.

#### 5. Reporting & Statistics (Dashboard):
- **System-wide Statistics:** Total forms, open forms (incomplete approval chains), open forms by role.
- **Form Tracking:** View all existing forms, track approval chain progress, and identify current approver.
- **Personalized View:** Button to display only forms awaiting the current user's action.

#### 6. Security:
- **Login Screen:** Username (email) and password.
- **Two-Factor Authentication (2FA):** OTP sent to mobile (specifically for admin: 0544984509).

#### 7. Design & Responsiveness:
- **Language:** Hebrew (RTL support, clear and legible text).
- **Inspiration:** Design similar to ICL Group website (https://www.icl-group.com/our-business/).
- **Responsiveness:** Adapted for desktop and mobile browsers.

### Initial Data (for testing):
- Basic users with different roles.
- Sample forms with approval chains.
- Data to demonstrate functionality.

### Admin Phone Number for OTP:
- 0544984509

## Todo List:

### Phase 1: קריאה וניתוח ההוראות המצורפות (Completed)
- [x] Read and understand the attached instructions.

### Phase 2: סיכום הדרישות והבנת המטלה (Current)
- [x] Summarize the requirements in a structured format.
- [x] Create a `todo.md` file based on the task plan.

### Phase 3: תכנון ופיתוח האפליקציה
- [x] Set up the project environment (backend and frontend).
- [x] Set up Git repository and push to GitHub.
- [x] Create comprehensive database models for users, forms, and approval workflows.
- [x] Implement authentication routes with 2FA support.
- [x] Implement forms management routes with approval workflow.
- [x] Complete user management routes and admin functionality.
- [x] Complete backend API with all routes and CORS support.
- [x] Add sample data initialization for testing.
- [x] Implement the dynamic form builder for Software and Tag forms.
  
- [x] Develop the frontend user interface (admin and regular user views).
  - [x] Implement Login page.
  - [x] Implement Dashboard for regular users.
  - [x] Implement FormList and FormDetails pages.
  - [x] Implement Admin Dashboard.
  - [x] Implement User Management page.
  - [x] Implement Role Management page.
  - [x] Implement Form Builder page.
  - [x] Set up main routing and navigation.
- [x] Integrate the frontend with the backend API.
- [x] Implement the statistics dashboard.
- [x] Apply the ICL Group website design principles and ensure responsiveness.
  - [x] Reviewed ICL Group website for design inspiration (colors, typography, layout).
  - [x] Applied Tailwind CSS classes to match the design.
  - [x] Ensured responsiveness across different screen sizes.
- [x] Populate initial data for testing.

### Phase 4: בדיקה ופריסה של האפליקציה
- [ ] Conduct thorough testing of all features (forms, approvals, permissions, dashboard). (In Progress)
  - [ ] Test user login and 2FA.
  - [ ] Test form creation and submission for all types.
  - [ ] Test approval workflow (approve, reject, add approver).
  - [ ] Test admin functionalities (user management, role management, form builder).
  - [ ] Test dashboard statistics.
- [x] Deploy the application to a public URL.

### Phase 5: מסירת התוצאות למשתמש
- [ ] Provide the public URL of the deployed application.
- [ ] Provide login credentials for the admin user.
- [ ] Present a summary of the implemented features and how to use the application.


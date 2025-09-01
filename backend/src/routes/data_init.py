from flask import Blueprint, jsonify, session
from src.models.user import db, User, Role, UserRole, FormTemplate, Form, FormApproval
from datetime import datetime

data_init_bp = Blueprint('data_init', __name__)

def require_admin(f):
    """Decorator to require admin role"""
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        if session.get('user_role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@data_init_bp.route('/initialize-sample-data', methods=['POST'])
@require_admin
def initialize_sample_data():
    """Initialize the system with sample data for testing"""
    try:
        # Check if data already exists
        if User.query.count() > 1:  # More than just the admin
            return jsonify({'message': 'Sample data already exists'}), 200
        
        # Create roles
        roles_data = [
            {
                'name': 'initiator',
                'name_hebrew': 'יוזם',
                'description': 'משתמש שיכול ליזום טפסים חדשים',
                'permissions': {
                    'can_initiate_forms': True,
                    'can_view_own_forms': True
                }
            },
            {
                'name': 'manager',
                'name_hebrew': 'מנהל',
                'description': 'מנהל שיכול לאשר טפסים',
                'permissions': {
                    'can_approve_forms': True,
                    'can_edit_form_fields': True,
                    'can_add_approvers': True
                }
            },
            {
                'name': 'sms_responsible',
                'name_hebrew': 'אחראי SMS',
                'description': 'אחראי על אישור טפסי SMS',
                'permissions': {
                    'can_approve_sms_forms': True,
                    'can_edit_sms_fields': True
                }
            },
            {
                'name': 'software_responsible',
                'name_hebrew': 'אחראי תוכנה',
                'description': 'אחראי על אישור טפסי תוכנה',
                'permissions': {
                    'can_approve_software_forms': True,
                    'can_edit_software_fields': True
                }
            },
            {
                'name': 'tags_responsible',
                'name_hebrew': 'אחראי תגים',
                'description': 'אחראי על אישור טפסי תגים',
                'permissions': {
                    'can_approve_tags_forms': True,
                    'can_edit_tags_fields': True
                }
            }
        ]
        
        created_roles = {}
        for role_data in roles_data:
            role = Role(**role_data)
            db.session.add(role)
            db.session.flush()
            created_roles[role_data['name']] = role.id
        
        # Create sample users
        users_data = [
            {
                'email': 'admin@mofet.com',
                'full_name': 'מנהל המערכת',
                'phone': '0544984509',
                'role': 'admin',
                'password': 'admin123',
                'roles': []
            },
            {
                'email': 'manager1@mofet.com',
                'full_name': 'דוד כהן - מנהל',
                'phone': '0501234567',
                'role': 'user',
                'password': 'user123',
                'roles': ['manager']
            },
            {
                'email': 'sms.manager@mofet.com',
                'full_name': 'רחל לוי - אחראית SMS',
                'phone': '0502345678',
                'role': 'user',
                'password': 'user123',
                'roles': ['sms_responsible']
            },
            {
                'email': 'software.manager@mofet.com',
                'full_name': 'משה אברהם - אחראי תוכנה',
                'phone': '0503456789',
                'role': 'user',
                'password': 'user123',
                'roles': ['software_responsible']
            },
            {
                'email': 'tags.manager@mofet.com',
                'full_name': 'שרה יוסף - אחראית תגים',
                'phone': '0504567890',
                'role': 'user',
                'password': 'user123',
                'roles': ['tags_responsible']
            },
            {
                'email': 'user1@mofet.com',
                'full_name': 'יוסי ישראלי - יוזם',
                'phone': '0505678901',
                'role': 'user',
                'password': 'user123',
                'roles': ['initiator']
            },
            {
                'email': 'user2@mofet.com',
                'full_name': 'מירי כהן - יוזמת',
                'phone': '0506789012',
                'role': 'user',
                'password': 'user123',
                'roles': ['initiator']
            }
        ]
        
        created_users = {}
        for user_data in users_data:
            # Check if user already exists
            existing_user = User.query.filter_by(email=user_data['email']).first()
            if existing_user:
                created_users[user_data['email']] = existing_user.id
                continue
                
            user = User(
                email=user_data['email'],
                full_name=user_data['full_name'],
                phone=user_data['phone'],
                role=user_data['role'],
                is_active=True
            )
            user.set_password(user_data['password'])
            
            # Enable OTP for admin
            if user.role == 'admin':
                user.otp_enabled = True
                user.generate_otp_secret()
            
            db.session.add(user)
            db.session.flush()
            created_users[user_data['email']] = user.id
            
            # Assign roles
            for role_name in user_data['roles']:
                if role_name in created_roles:
                    user_role = UserRole(
                        user_id=user.id,
                        role_id=created_roles[role_name],
                        assigned_by=1  # Admin user
                    )
                    db.session.add(user_role)
        
        # Create form templates
        templates_data = [
            {
                'name': 'sms_request',
                'name_hebrew': 'בקשה להוספה/שינוי הודעות SMS',
                'description': 'טופס לבקשת הוספה או שינוי של הודעות SMS במערכת',
                'form_type': 'sms',
                'fields_config': [
                    {
                        'name': 'date',
                        'label': 'תאריך',
                        'type': 'date',
                        'required': True,
                        'order': 1
                    },
                    {
                        'name': 'facility',
                        'label': 'מתקן',
                        'type': 'select',
                        'required': True,
                        'options': ['מתקן א', 'מתקן ב', 'מתקן ג', 'מתקן ד'],
                        'order': 2
                    },
                    {
                        'name': 'subject',
                        'label': 'נושא',
                        'type': 'text',
                        'required': True,
                        'order': 3
                    },
                    {
                        'name': 'message_name',
                        'label': 'שם ההודעה',
                        'type': 'text',
                        'required': True,
                        'order': 4
                    },
                    {
                        'name': 'recipients',
                        'label': 'נמענים',
                        'type': 'textarea',
                        'required': True,
                        'order': 5
                    },
                    {
                        'name': 'conditions',
                        'label': 'תנאים',
                        'type': 'textarea',
                        'required': False,
                        'order': 6
                    },
                    {
                        'name': 'tag_name',
                        'label': 'שם התג',
                        'type': 'text',
                        'required': True,
                        'order': 7
                    }
                ],
                'approval_chain': [created_roles['manager'], created_roles['sms_responsible']]
            },
            {
                'name': 'software_request',
                'name_hebrew': 'בקשה לשינוי/הוספת תוכנה',
                'description': 'טופס לבקשת שינוי או הוספת תוכנה במערכת',
                'form_type': 'software',
                'fields_config': [
                    {
                        'name': 'date',
                        'label': 'תאריך',
                        'type': 'date',
                        'required': True,
                        'order': 1
                    },
                    {
                        'name': 'software_name',
                        'label': 'שם התוכנה',
                        'type': 'text',
                        'required': True,
                        'order': 2
                    },
                    {
                        'name': 'request_type',
                        'label': 'סוג הבקשה',
                        'type': 'select',
                        'required': True,
                        'options': ['הוספה', 'שינוי', 'מחיקה', 'עדכון'],
                        'order': 3
                    },
                    {
                        'name': 'description',
                        'label': 'תיאור הבקשה',
                        'type': 'textarea',
                        'required': True,
                        'order': 4
                    },
                    {
                        'name': 'justification',
                        'label': 'הצדקה',
                        'type': 'textarea',
                        'required': False,
                        'order': 5
                    }
                ],
                'approval_chain': [created_roles['manager'], created_roles['software_responsible']]
            },
            {
                'name': 'tags_request',
                'name_hebrew': 'בקשה לשינוי/הוספה תגים במערכת הבקרה',
                'description': 'טופס לבקשת שינוי או הוספת תגים במערכת הבקרה',
                'form_type': 'tags',
                'fields_config': [
                    {
                        'name': 'date',
                        'label': 'תאריך',
                        'type': 'date',
                        'required': True,
                        'order': 1
                    },
                    {
                        'name': 'tag_name',
                        'label': 'שם התג',
                        'type': 'text',
                        'required': True,
                        'order': 2
                    },
                    {
                        'name': 'tag_type',
                        'label': 'סוג התג',
                        'type': 'select',
                        'required': True,
                        'options': ['אנלוגי', 'דיגיטלי', 'מחרוזת', 'בוליאני'],
                        'order': 3
                    },
                    {
                        'name': 'system_location',
                        'label': 'מיקום במערכת',
                        'type': 'text',
                        'required': True,
                        'order': 4
                    },
                    {
                        'name': 'description',
                        'label': 'תיאור התג',
                        'type': 'textarea',
                        'required': True,
                        'order': 5
                    },
                    {
                        'name': 'default_value',
                        'label': 'ערך ברירת מחדל',
                        'type': 'text',
                        'required': False,
                        'order': 6
                    }
                ],
                'approval_chain': [created_roles['manager'], created_roles['tags_responsible']]
            }
        ]
        
        created_templates = {}
        for template_data in templates_data:
            template = FormTemplate(
                name=template_data['name'],
                name_hebrew=template_data['name_hebrew'],
                description=template_data['description'],
                form_type=template_data['form_type'],
                fields_config=template_data['fields_config'],
                approval_chain=template_data['approval_chain'],
                created_by=1  # Admin user
            )
            db.session.add(template)
            db.session.flush()
            created_templates[template_data['name']] = template.id
        
        # Create sample forms
        sample_forms = [
            {
                'template_id': created_templates['sms_request'],
                'initiator_id': created_users['user1@mofet.com'],
                'form_data': {
                    'date': '2025-01-15',
                    'facility': 'מתקן א',
                    'subject': 'הודעת אזהרה חדשה',
                    'message_name': 'ALERT_HIGH_TEMP',
                    'recipients': 'מנהל משמרת, טכנאי בקרה',
                    'conditions': 'כאשר הטמפרטורה עולה על 80 מעלות',
                    'tag_name': 'TEMP_SENSOR_01'
                },
                'status': 'pending'
            },
            {
                'template_id': created_templates['software_request'],
                'initiator_id': created_users['user2@mofet.com'],
                'form_data': {
                    'date': '2025-01-10',
                    'software_name': 'מערכת דיווחים',
                    'request_type': 'עדכון',
                    'description': 'עדכון מערכת הדיווחים לגרסה חדשה',
                    'justification': 'תיקון באגים ושיפור ביצועים'
                },
                'status': 'completed',
                'completed_at': datetime.utcnow()
            }
        ]
        
        for form_data in sample_forms:
            form = Form(**form_data)
            db.session.add(form)
            db.session.flush()
            
            # Create approval records
            template = FormTemplate.query.get(form_data['template_id'])
            for step, role_id in enumerate(template.approval_chain):
                # Find a user with this role
                user_with_role = db.session.query(User).join(UserRole).filter(
                    UserRole.role_id == role_id,
                    User.is_active == True
                ).first()
                
                if user_with_role:
                    approval = FormApproval(
                        form_id=form.id,
                        approver_id=user_with_role.id,
                        step_number=step,
                        action='approved' if form_data['status'] == 'completed' else 'pending',
                        action_date=datetime.utcnow() if form_data['status'] == 'completed' else None
                    )
                    db.session.add(approval)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Sample data initialized successfully',
            'created': {
                'roles': len(created_roles),
                'users': len(created_users),
                'templates': len(created_templates),
                'forms': len(sample_forms)
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@data_init_bp.route('/reset-database', methods=['POST'])
@require_admin
def reset_database():
    """Reset the database (for development only)"""
    try:
        # Drop all tables and recreate
        db.drop_all()
        db.create_all()
        
        return jsonify({'message': 'Database reset successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


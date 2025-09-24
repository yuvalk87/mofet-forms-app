from flask import Blueprint, request, jsonify, session
from src.models.user import db, User, Role, UserRole, FormTemplate, Form, FormApproval
from datetime import datetime
from werkzeug.security import generate_password_hash

admin_bp = Blueprint('admin', __name__)

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

# User Management
@admin_bp.route('/users', methods=['GET'])
@require_admin
def get_users():
    try:
        users = User.query.all()
        users_data = []
        
        for user in users:
            user_data = user.to_dict()
            # Get user roles
            user_roles = db.session.query(UserRole, Role).join(Role).filter(
                UserRole.user_id == user.id
            ).all()
            user_data['roles'] = [{'id': role.id, 'name': role.name_hebrew} for _, role in user_roles]
            users_data.append(user_data)
        
        return jsonify({'users': users_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['POST'])
@require_admin
def create_user():
    try:
        data = request.get_json()
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data.get('email')).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 400
        
        user = User(
            email=data.get('email'),
            full_name=data.get('full_name'),
            phone=data.get('phone'),
            role=data.get('role', 'user'),
            is_active=data.get('is_active', True)
        )
        user.set_password(data.get('password', '123456'))  # Default password
        
        # Enable OTP for admin users
        if user.role == 'admin' and user.phone:
            user.otp_enabled = True
            user.generate_otp_secret()
        
        db.session.add(user)
        db.session.flush()  # Get user ID
        
        # Assign roles if provided
        role_ids = data.get('role_ids', [])
        for role_id in role_ids:
            user_role = UserRole(
                user_id=user.id,
                role_id=role_id,
                assigned_by=session['user_id']
            )
            db.session.add(user_role)
        
        db.session.commit()
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@require_admin
def update_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        user.email = data.get('email', user.email)
        user.full_name = data.get('full_name', user.full_name)
        user.phone = data.get('phone', user.phone)
        user.role = data.get('role', user.role)
        user.is_active = data.get('is_active', user.is_active)
        
        # Update password if provided
        if data.get('password'):
            user.set_password(data.get('password'))
        
        # Update OTP settings
        if user.role == 'admin' and user.phone and not user.otp_enabled:
            user.otp_enabled = True
            user.generate_otp_secret()
        
        # Update roles
        if 'role_ids' in data:
            # Remove existing roles
            UserRole.query.filter_by(user_id=user.id).delete()
            
            # Add new roles
            for role_id in data.get('role_ids', []):
                user_role = UserRole(
                    user_id=user.id,
                    role_id=role_id,
                    assigned_by=session['user_id']
                )
                db.session.add(user_role)
        
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        
        # Don't allow deleting the current admin
        if user.id == session['user_id']:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        # Soft delete - deactivate instead of actual deletion
        user.is_active = False
        db.session.commit()
        
        return jsonify({'message': 'User deactivated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Role Management
@admin_bp.route('/roles', methods=['GET'])
@require_admin
def get_roles():
    try:
        roles = Role.query.all()
        return jsonify({'roles': [role.to_dict() for role in roles]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/roles', methods=['POST'])
@require_admin
def create_role():
    try:
        data = request.get_json()
        
        role = Role(
            name=data.get('name'),
            name_hebrew=data.get('name_hebrew'),
            description=data.get('description'),
            permissions=data.get('permissions', {})
        )
        
        db.session.add(role)
        db.session.commit()
        
        return jsonify({
            'message': 'Role created successfully',
            'role': role.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/roles/<int:role_id>', methods=['PUT'])
@require_admin
def update_role(role_id):
    try:
        role = Role.query.get_or_404(role_id)
        data = request.get_json()
        
        role.name = data.get('name', role.name)
        role.name_hebrew = data.get('name_hebrew', role.name_hebrew)
        role.description = data.get('description', role.description)
        role.permissions = data.get('permissions', role.permissions)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Role updated successfully',
            'role': role.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/roles/<int:role_id>', methods=['DELETE'])
@require_admin
def delete_role(role_id):
    try:
        role = Role.query.get_or_404(role_id)
        
        # Check if role is in use
        users_with_role = UserRole.query.filter_by(role_id=role_id).count()
        if users_with_role > 0:
            return jsonify({'error': 'Cannot delete role that is assigned to users'}), 400
        
        db.session.delete(role)
        db.session.commit()
        
        return jsonify({'message': 'Role deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# System Statistics
@admin_bp.route('/statistics/overview', methods=['GET'])
@require_admin
def get_system_overview():
    try:
        stats = {
            'total_users': User.query.count(),
            'active_users': User.query.filter_by(is_active=True).count(),
            'total_forms': Form.query.count(),
            'pending_forms': Form.query.filter(Form.status.in_(['pending', 'awaiting_final_approval'])).count(),
            'completed_forms': Form.query.filter_by(status='completed').count(),
            'rejected_forms': Form.query.filter_by(status='rejected').count(),
            'total_templates': FormTemplate.query.filter_by(is_active=True).count(),
            'total_roles': Role.query.count()
        }
        
        # Forms by status
        stats['forms_by_status'] = {
            'pending': Form.query.filter_by(status='pending').count(),
            'awaiting_final_approval': Form.query.filter_by(status='awaiting_final_approval').count(),
            'completed': Form.query.filter_by(status='completed').count(),
            'rejected': Form.query.filter_by(status='rejected').count()
        }
        
        # Forms by template
        stats['forms_by_template'] = {}
        templates = FormTemplate.query.filter_by(is_active=True).all()
        for template in templates:
            count = Form.query.filter_by(template_id=template.id).count()
            stats['forms_by_template'][template.name_hebrew] = count
        
        # Recent activity
        recent_forms = Form.query.order_by(Form.created_at.desc()).limit(5).all()
        stats['recent_forms'] = [form.to_dict() for form in recent_forms]
        
        return jsonify({'statistics': stats}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Form Template Management (Admin specific functions)
@admin_bp.route('/form-builder/fields', methods=['GET'])
@require_admin
def get_available_field_types():
    """Get available field types for the form builder"""
    try:
        field_types = [
            {
                'type': 'text',
                'name': 'טקסט',
                'description': 'שדה טקסט חופשי',
                'properties': ['required', 'placeholder', 'maxLength']
            },
            {
                'type': 'number',
                'name': 'מספר',
                'description': 'שדה מספרי',
                'properties': ['required', 'min', 'max', 'placeholder']
            },
            {
                'type': 'date',
                'name': 'תאריך',
                'description': 'בחירת תאריך',
                'properties': ['required', 'minDate', 'maxDate']
            },
            {
                'type': 'select',
                'name': 'בחירה מרשימה',
                'description': 'רשימה נפתחת',
                'properties': ['required', 'options', 'multiple']
            },
            {
                'type': 'textarea',
                'name': 'טקסט ארוך',
                'description': 'שדה טקסט מרובה שורות',
                'properties': ['required', 'placeholder', 'rows', 'maxLength']
            },
            {
                'type': 'checkbox',
                'name': 'תיבת סימון',
                'description': 'תיבת סימון בודדת',
                'properties': ['required', 'label']
            },
            {
                'type': 'radio',
                'name': 'בחירה יחידה',
                'description': 'כפתורי בחירה',
                'properties': ['required', 'options']
            },
            {
                'type': 'file',
                'name': 'קובץ',
                'description': 'העלאת קובץ',
                'properties': ['required', 'accept', 'maxSize']
            }
        ]
        
        return jsonify({'field_types': field_types}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/backup/export', methods=['GET'])
@require_admin
def export_data():
    """Export system data for backup"""
    try:
        export_data = {
            'users': [user.to_dict() for user in User.query.all()],
            'roles': [role.to_dict() for role in Role.query.all()],
            'templates': [template.to_dict() for template in FormTemplate.query.all()],
            'forms': [form.to_dict() for form in Form.query.all()],
            'export_date': datetime.utcnow().isoformat()
        }
        
        return jsonify(export_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Mock data for dynamic lists (in production, this would be stored in database)
DYNAMIC_LISTS = [
    {
        'id': 1,
        'name': 'תוכנות',
        'description': 'רשימת תוכנות הקיימות במערכת',
        'items': ['Microsoft Office', 'AutoCAD', 'SAP', 'Oracle', 'Salesforce', 'Adobe Creative Suite']
    },
    {
        'id': 2,
        'name': 'מתקנים',
        'description': 'רשימת מתקנים במפעל',
        'items': ['מתקן A', 'מתקן B', 'מתקן C', 'מתקן ייצור 1', 'מתקן ייצור 2']
    },
    {
        'id': 3,
        'name': 'מפעלים',
        'description': 'רשימת מפעלי החברה',
        'items': ['מפעל הצפון', 'מפעל הדרום', 'מפעל המרכז', 'מפעל ים המלח']
    }
]

# Mock data for approval chains
APPROVAL_CHAINS = [
    {
        'id': 1,
        'form_type': 'SMS',
        'name': 'שרשרת אישור SMS',
        'steps': [
            {'step': 1, 'role': 'supervisor', 'name': 'מפקח ישיר'},
            {'step': 2, 'role': 'manager', 'name': 'מנהל מחלקה'},
            {'step': 3, 'role': 'admin', 'name': 'מנהל מערכת'}
        ]
    },
    {
        'id': 2,
        'form_type': 'Software',
        'name': 'שרשרת אישור תוכנה',
        'steps': [
            {'step': 1, 'role': 'supervisor', 'name': 'מפקח IT'},
            {'step': 2, 'role': 'manager', 'name': 'מנהל IT'},
            {'step': 3, 'role': 'admin', 'name': 'מנהל מערכת'}
        ]
    }
]

@admin_bp.route('/dynamic-lists', methods=['GET'])
@require_admin
def get_dynamic_lists():
    """Get all dynamic lists - admin only"""
    try:
        return jsonify({
            'lists': DYNAMIC_LISTS,
            'total': len(DYNAMIC_LISTS)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/dynamic-lists', methods=['POST'])
@require_admin
def create_dynamic_list():
    """Create a new dynamic list - admin only"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['name', 'items']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create new list
        new_list = {
            'id': max([lst['id'] for lst in DYNAMIC_LISTS], default=0) + 1,
            'name': data['name'],
            'description': data.get('description', ''),
            'items': data['items']
        }
        
        DYNAMIC_LISTS.append(new_list)
        
        return jsonify({
            'message': 'Dynamic list created successfully',
            'list': new_list
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/dynamic-lists/<int:list_id>', methods=['PUT'])
@require_admin
def update_dynamic_list(list_id):
    """Update a dynamic list - admin only"""
    try:
        # Find the list
        list_to_update = None
        for lst in DYNAMIC_LISTS:
            if lst['id'] == list_id:
                list_to_update = lst
                break
        
        if not list_to_update:
            return jsonify({'error': 'List not found'}), 404
        
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update list fields
        if 'name' in data:
            list_to_update['name'] = data['name']
        if 'description' in data:
            list_to_update['description'] = data['description']
        if 'items' in data:
            list_to_update['items'] = data['items']
        
        return jsonify({
            'message': 'Dynamic list updated successfully',
            'list': list_to_update
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/dynamic-lists/<int:list_id>', methods=['DELETE'])
@require_admin
def delete_dynamic_list(list_id):
    """Delete a dynamic list - admin only"""
    try:
        # Find and remove the list
        for i, lst in enumerate(DYNAMIC_LISTS):
            if lst['id'] == list_id:
                DYNAMIC_LISTS.pop(i)
                return jsonify({'message': 'Dynamic list deleted successfully'}), 200
        
        return jsonify({'error': 'List not found'}), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/approval-chains', methods=['GET'])
@require_admin
def get_approval_chains():
    """Get all approval chains - admin only"""
    try:
        return jsonify({
            'chains': APPROVAL_CHAINS,
            'total': len(APPROVAL_CHAINS)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/approval-chains', methods=['POST'])
@require_admin
def create_approval_chain():
    """Create a new approval chain - admin only"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['form_type', 'name', 'steps']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create new approval chain
        new_chain = {
            'id': max([chain['id'] for chain in APPROVAL_CHAINS], default=0) + 1,
            'form_type': data['form_type'],
            'name': data['name'],
            'steps': data['steps']
        }
        
        APPROVAL_CHAINS.append(new_chain)
        
        return jsonify({
            'message': 'Approval chain created successfully',
            'chain': new_chain
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/form-types', methods=['GET'])
@require_admin
def get_form_types():
    """Get available form types"""
    try:
        form_types = [
            {'value': 'SMS', 'label': 'בקשת SMS'},
            {'value': 'Software', 'label': 'בקשת תוכנה'},
            {'value': 'Hardware', 'label': 'בקשת חומרה'},
            {'value': 'Access', 'label': 'בקשת גישה'},
            {'value': 'Maintenance', 'label': 'בקשת תחזוקה'}
        ]
        
        return jsonify({'form_types': form_types}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


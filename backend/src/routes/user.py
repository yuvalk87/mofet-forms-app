from flask import Blueprint, jsonify, request, session
from src.models.user import User, db

user_bp = Blueprint('user', __name__)

@user_bp.route('/', methods=['GET'])
def get_users():
    """Get all users - admin only"""
    try:
        # Check if user is logged in and is admin
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        
        current_user = User.query.get(session['user_id'])
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        users = User.query.all()
        return jsonify({
            'users': [user.to_dict() for user in users],
            'total': len(users)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/', methods=['POST'])
def create_user():
    """Create a new user - admin only"""
    try:
        # Check if user is logged in and is admin
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        
        current_user = User.query.get(session['user_id'])
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['email', 'full_name', 'phone', 'role']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create new user
        user = User(
            email=data['email'],
            full_name=data['full_name'],
            phone=data['phone'],
            role=data['role'],
            is_active=data.get('is_active', True)
        )
        
        # Set password if provided, otherwise use default
        password = data.get('password', 'temp123')
        user.set_password(password)
        
        # Set up OTP if enabled
        if data.get('otp_enabled', False):
            user.otp_enabled = True
            user.generate_otp_secret()
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get a specific user"""
    try:
        # Check if user is logged in
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        
        user = User.query.get_or_404(user_id)
        return jsonify({'user': user.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update a user - admin only"""
    try:
        # Check if user is logged in and is admin
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        
        current_user = User.query.get(session['user_id'])
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        user = User.query.get_or_404(user_id)
        data = request.json
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update user fields
        if 'email' in data:
            # Check if email is already taken by another user
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({'error': 'Email already taken by another user'}), 409
            user.email = data['email']
        
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'role' in data:
            user.role = data['role']
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        # Update password if provided
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        
        # Update OTP settings
        if 'otp_enabled' in data:
            user.otp_enabled = data['otp_enabled']
            if user.otp_enabled and not user.otp_secret:
                user.generate_otp_secret()
        
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user - admin only"""
    try:
        # Check if user is logged in and is admin
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        
        current_user = User.query.get(session['user_id'])
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Prevent admin from deleting themselves
        if user_id == current_user.id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/roles', methods=['GET'])
def get_roles():
    """Get available user roles"""
    try:
        roles = [
            {'value': 'admin', 'label': 'מנהל מערכת'},
            {'value': 'manager', 'label': 'מנהל'},
            {'value': 'supervisor', 'label': 'מפקח'},
            {'value': 'user', 'label': 'משתמש רגיל'}
        ]
        return jsonify({'roles': roles}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

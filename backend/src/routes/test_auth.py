from flask import Blueprint, jsonify
from src.models.user import db, User

test_auth_bp = Blueprint('test_auth', __name__)

@test_auth_bp.route('/disable-otp/<email>', methods=['POST'])
def disable_otp_for_user(email):
    """Disable OTP for a specific user - FOR TESTING ONLY"""
    try:
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.otp_enabled = False
        db.session.commit()
        
        return jsonify({
            'message': f'OTP disabled for user {email}',
            'user_email': user.email,
            'otp_enabled': user.otp_enabled
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


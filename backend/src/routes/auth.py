from flask import Blueprint, request, jsonify, session
from src.models.user import db, User, OTPCode
from datetime import datetime, timedelta
import random
import string

auth_bp = Blueprint('auth', __name__)

def generate_otp():
    """Generate a 6-digit OTP code"""
    return ''.join(random.choices(string.digits, k=6))

def send_otp_sms(phone, code):
    """Simulate sending OTP via SMS - in production, integrate with SMS service"""
    print(f"SMS to {phone}: Your OTP code is {code}")
    return True

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Store user in session
        session['user_id'] = user.id
        session['user_email'] = user.email
        session['user_role'] = user.role
        
        # Check if 2FA is enabled
        if user.otp_enabled and user.phone:
            # Generate and send OTP
            otp_code = generate_otp()
            expires_at = datetime.utcnow() + timedelta(minutes=5)
            
            # Save OTP to database
            otp = OTPCode(
                user_id=user.id,
                code=otp_code,
                expires_at=expires_at
            )
            db.session.add(otp)
            db.session.commit()
            
            # Send OTP via SMS
            send_otp_sms(user.phone, otp_code)
            
            return jsonify({
                'message': 'OTP sent to your phone',
                'requires_otp': True,
                'user_id': user.id
            }), 200
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'requires_otp': False
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        otp_code = data.get('otp_code')
        
        if not user_id or not otp_code:
            return jsonify({'error': 'User ID and OTP code are required'}), 400
        
        # Find valid OTP
        otp = OTPCode.query.filter_by(
            user_id=user_id,
            code=otp_code,
            used=False
        ).filter(OTPCode.expires_at > datetime.utcnow()).first()
        
        if not otp:
            return jsonify({'error': 'Invalid or expired OTP code'}), 401
        
        # Mark OTP as used
        otp.used = True
        db.session.commit()
        
        # Get user
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Complete login
        session['user_id'] = user.id
        session['user_email'] = user.email
        session['user_role'] = user.role
        session['otp_verified'] = True
        
        return jsonify({
            'message': 'OTP verified successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    try:
        session.clear()
        return jsonify({'message': 'Logged out successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        user = User.query.get(user_id)
        if not user or not user.phone:
            return jsonify({'error': 'User not found or no phone number'}), 404
        
        # Generate new OTP
        otp_code = generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=5)
        
        # Save OTP to database
        otp = OTPCode(
            user_id=user.id,
            code=otp_code,
            expires_at=expires_at
        )
        db.session.add(otp)
        db.session.commit()
        
        # Send OTP via SMS
        send_otp_sms(user.phone, otp_code)
        
        return jsonify({'message': 'OTP sent successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


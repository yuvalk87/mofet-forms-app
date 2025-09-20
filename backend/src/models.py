from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import secrets

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    role = db.Column(db.String(20), nullable=False, default='user')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    otp_secret = db.Column(db.String(32), nullable=True)
    otp_enabled = db.Column(db.Boolean, default=False)
    
    # Relationships
    initiated_forms = db.relationship('Form', foreign_keys='Form.initiator_id', backref='initiator', lazy='dynamic')
    approvals = db.relationship(
        'FormApproval',
        foreign_keys='FormApproval.approver_id',
        backref='approver',
        lazy='dynamic'
    )
    added_approvals = db.relationship(
        'FormApproval',
        foreign_keys='FormApproval.added_by',
        backref='added_by_user',
        lazy='dynamic'
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def generate_otp_secret(self):
        self.otp_secret = secrets.token_hex(16)
        return self.otp_secret

    def __repr__(self):
        return f'<User {self.email}>'

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'otp_enabled': self.otp_enabled
        }


class FormTemplate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    name_hebrew = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    form_type = db.Column(db.String(50), nullable=False)
    fields_config = db.Column(db.JSON, nullable=False)
    approval_chain = db.Column(db.JSON, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    forms = db.relationship('Form', backref='template', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'name_hebrew': self.name_hebrew,
            'description': self.description,
            'form_type': self.form_type,
            'fields_config': self.fields_config,
            'approval_chain': self.approval_chain,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Form(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    template_id = db.Column(db.Integer, db.ForeignKey('form_template.id'), nullable=False)
    initiator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    form_data = db.Column(db.JSON, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')
    current_step = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    approvals = db.relationship('FormApproval', backref='form', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'template_id': self.template_id,
            'template_name': self.template.name_hebrew if self.template else None,
            'initiator_id': self.initiator_id,
            'initiator_name': self.initiator.full_name if self.initiator else None,
            'form_data': self.form_data,
            'status': self.status,
            'current_step': self.current_step,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class FormApproval(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.Integer, db.ForeignKey('form.id'), nullable=False)
    approver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    step_number = db.Column(db.Integer, nullable=False)
    action = db.Column(db.String(20), nullable=True)
    comments = db.Column(db.Text, nullable=True)
    action_date = db.Column(db.DateTime, nullable=True)
    is_additional = db.Column(db.Boolean, default=False)
    added_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'form_id': self.form_id,
            'approver_id': self.approver_id,
            'approver_name': self.approver.full_name if self.approver else None,
            'step_number': self.step_number,
            'action': self.action,
            'comments': self.comments,
            'action_date': self.action_date.isoformat() if self.action_date else None,
            'is_additional': self.is_additional
        }


class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    name_hebrew = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)
    permissions = db.Column(db.JSON, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'name_hebrew': self.name_hebrew,
            'description': self.description,
            'permissions': self.permissions
        }


class UserRole(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    assigned_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    
    user = db.relationship('User', foreign_keys=[user_id], backref='user_roles')
    role = db.relationship('Role', backref='user_assignments')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'role_id': self.role_id,
            'role_name': self.role.name_hebrew if self.role else None,
            'assigned_at': self.assigned_at.isoformat() if self.assigned_at else None
        }


class OTPCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    code = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    
    user = db.relationship('User', backref='otp_codes')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'code': self.code,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'used': self.used
        }

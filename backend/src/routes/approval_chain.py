from flask import Blueprint, request, jsonify, session
from src.models.user import db, User, Form, FormApproval, FormTemplate, Role, UserRole
from datetime import datetime
from sqlalchemy import and_, or_

approval_bp = Blueprint('approval', __name__)

def require_auth(f):
    """Decorator to require authentication"""
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

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

@approval_bp.route('/forms/<int:form_id>/approve', methods=['POST'])
@require_auth
def approve_form(form_id):
    """Approve a form at the current step"""
    try:
        data = request.get_json()
        user_id = session.get('user_id')
        comments = data.get('comments', '')
        
        # Get the form
        form = Form.query.get_or_404(form_id)
        
        # Check if user is authorized to approve at current step
        current_approval = FormApproval.query.filter_by(
            form_id=form_id,
            step_number=form.current_step,
            approver_id=user_id,
            action=None
        ).first()
        
        if not current_approval:
            return jsonify({'error': 'You are not authorized to approve this form at this step'}), 403
        
        # Update the approval
        current_approval.action = 'approved'
        current_approval.comments = comments
        current_approval.action_date = datetime.utcnow()
        
        # Check if all approvals for current step are complete
        pending_approvals = FormApproval.query.filter_by(
            form_id=form_id,
            step_number=form.current_step,
            action=None
        ).count()
        
        if pending_approvals == 1:  # This is the last approval for this step
            # Move to next step or complete
            template = FormTemplate.query.get(form.template_id)
            approval_chain = template.approval_chain
            
            if form.current_step + 1 < len(approval_chain):
                # Move to next step
                form.current_step += 1
                _create_approvals_for_step(form, form.current_step)
            else:
                # Form is fully approved
                form.status = 'approved'
                form.completed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Form approved successfully',
            'form': form.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@approval_bp.route('/forms/<int:form_id>/reject', methods=['POST'])
@require_auth
def reject_form(form_id):
    """Reject a form"""
    try:
        data = request.get_json()
        user_id = session.get('user_id')
        comments = data.get('comments', '')
        
        # Get the form
        form = Form.query.get_or_404(form_id)
        
        # Check if user is authorized to reject at current step
        current_approval = FormApproval.query.filter_by(
            form_id=form_id,
            step_number=form.current_step,
            approver_id=user_id,
            action=None
        ).first()
        
        if not current_approval:
            return jsonify({'error': 'You are not authorized to reject this form at this step'}), 403
        
        # Update the approval
        current_approval.action = 'rejected'
        current_approval.comments = comments
        current_approval.action_date = datetime.utcnow()
        
        # Mark form as rejected
        form.status = 'rejected'
        form.completed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Form rejected successfully',
            'form': form.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@approval_bp.route('/forms/<int:form_id>/add-approver', methods=['POST'])
@require_auth
def add_additional_approver(form_id):
    """Add an additional approver to the current step"""
    try:
        data = request.get_json()
        user_id = session.get('user_id')
        approver_email = data.get('approver_email')
        
        if not approver_email:
            return jsonify({'error': 'Approver email is required'}), 400
        
        # Get the form
        form = Form.query.get_or_404(form_id)
        
        # Check if user is authorized to add approvers (must be admin or current approver)
        is_authorized = (
            session.get('user_role') == 'admin' or
            FormApproval.query.filter_by(
                form_id=form_id,
                step_number=form.current_step,
                approver_id=user_id
            ).first() is not None
        )
        
        if not is_authorized:
            return jsonify({'error': 'You are not authorized to add approvers to this form'}), 403
        
        # Find the approver user
        approver = User.query.filter_by(email=approver_email, is_active=True).first()
        if not approver:
            return jsonify({'error': 'Approver not found or inactive'}), 404
        
        # Check if approver is already assigned to this step
        existing_approval = FormApproval.query.filter_by(
            form_id=form_id,
            step_number=form.current_step,
            approver_id=approver.id
        ).first()
        
        if existing_approval:
            return jsonify({'error': 'This approver is already assigned to this step'}), 400
        
        # Create new approval record
        new_approval = FormApproval(
            form_id=form_id,
            approver_id=approver.id,
            step_number=form.current_step,
            is_additional=True,
            added_by=user_id
        )
        
        db.session.add(new_approval)
        db.session.commit()
        
        return jsonify({
            'message': 'Additional approver added successfully',
            'approval': new_approval.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@approval_bp.route('/forms/<int:form_id>/approvals', methods=['GET'])
@require_auth
def get_form_approvals(form_id):
    """Get all approvals for a form"""
    try:
        form = Form.query.get_or_404(form_id)
        
        approvals = FormApproval.query.filter_by(form_id=form_id).order_by(
            FormApproval.step_number,
            FormApproval.id
        ).all()
        
        # Group approvals by step
        approvals_by_step = {}
        for approval in approvals:
            step = approval.step_number
            if step not in approvals_by_step:
                approvals_by_step[step] = []
            approvals_by_step[step].append(approval.to_dict())
        
        return jsonify({
            'form': form.to_dict(),
            'approvals_by_step': approvals_by_step,
            'current_step': form.current_step
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@approval_bp.route('/my-approvals', methods=['GET'])
@require_auth
def get_my_pending_approvals():
    """Get forms pending approval by the current user"""
    try:
        user_id = session.get('user_id')
        
        # Get pending approvals for this user
        pending_approvals = db.session.query(FormApproval, Form, FormTemplate).join(
            Form, FormApproval.form_id == Form.id
        ).join(
            FormTemplate, Form.template_id == FormTemplate.id
        ).filter(
            FormApproval.approver_id == user_id,
            FormApproval.action.is_(None),
            Form.status == 'pending'
        ).order_by(Form.created_at.desc()).all()
        
        result = []
        for approval, form, template in pending_approvals:
            form_dict = form.to_dict()
            form_dict['template_name'] = template.name_hebrew
            form_dict['approval_info'] = approval.to_dict()
            result.append(form_dict)
        
        return jsonify({
            'pending_approvals': result,
            'count': len(result)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@approval_bp.route('/approval-history', methods=['GET'])
@require_auth
def get_approval_history():
    """Get approval history for the current user"""
    try:
        user_id = session.get('user_id')
        
        # Get completed approvals for this user
        completed_approvals = db.session.query(FormApproval, Form, FormTemplate).join(
            Form, FormApproval.form_id == Form.id
        ).join(
            FormTemplate, Form.template_id == FormTemplate.id
        ).filter(
            FormApproval.approver_id == user_id,
            FormApproval.action.isnot(None)
        ).order_by(FormApproval.action_date.desc()).limit(50).all()
        
        result = []
        for approval, form, template in completed_approvals:
            form_dict = form.to_dict()
            form_dict['template_name'] = template.name_hebrew
            form_dict['approval_info'] = approval.to_dict()
            result.append(form_dict)
        
        return jsonify({
            'approval_history': result,
            'count': len(result)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def _create_approvals_for_step(form, step_number):
    """Create approval records for a specific step"""
    template = FormTemplate.query.get(form.template_id)
    approval_chain = template.approval_chain
    
    if step_number < len(approval_chain):
        step_config = approval_chain[step_number]
        
        # Handle different step configurations
        if isinstance(step_config, dict):
            # Step with role-based approvers
            role_id = step_config.get('role_id')
            required_approvals = step_config.get('required_approvals', 1)
            
            if role_id:
                # Get users with this role
                users_with_role = db.session.query(User).join(UserRole).filter(
                    UserRole.role_id == role_id,
                    User.is_active == True
                ).limit(required_approvals).all()
                
                for user in users_with_role:
                    approval = FormApproval(
                        form_id=form.id,
                        approver_id=user.id,
                        step_number=step_number
                    )
                    db.session.add(approval)
        else:
            # Simple user ID
            approval = FormApproval(
                form_id=form.id,
                approver_id=step_config,
                step_number=step_number
            )
            db.session.add(approval)

@approval_bp.route('/roles', methods=['GET'])
@require_admin
def get_roles():
    """Get all roles for approval chain configuration"""
    try:
        roles = Role.query.all()
        return jsonify({
            'roles': [role.to_dict() for role in roles]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@approval_bp.route('/roles', methods=['POST'])
@require_admin
def create_role():
    """Create a new role"""
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
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


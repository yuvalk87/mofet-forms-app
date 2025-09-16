from flask import Blueprint, request, jsonify, session
from src.models.user import db, User, FormTemplate, Form, FormApproval, UserRole, Role
from datetime import datetime
from sqlalchemy import or_, and_

forms_bp = Blueprint('forms', __name__)

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

@forms_bp.route('/templates', methods=['GET'])
@require_auth
def get_form_templates():
    try:
        templates = FormTemplate.query.filter_by(is_active=True).all()
        return jsonify({
            'templates': [template.to_dict() for template in templates]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@forms_bp.route('/templates', methods=['POST'])
@require_admin
def create_form_template():
    try:
        data = request.get_json()
        
        template = FormTemplate(
            name=data.get('name'),
            name_hebrew=data.get('name_hebrew'),
            description=data.get('description'),
            form_type=data.get('form_type'),
            fields_config=data.get('fields_config'),
            approval_chain=data.get('approval_chain'),
            created_by=session['user_id']
        )
        
        db.session.add(template)
        db.session.commit()
        
        return jsonify({
            'message': 'Form template created successfully',
            'template': template.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@forms_bp.route('/templates/<int:template_id>', methods=['PUT'])
@require_admin
def update_form_template(template_id):
    try:
        template = FormTemplate.query.get_or_404(template_id)
        data = request.get_json()
        
        template.name = data.get('name', template.name)
        template.name_hebrew = data.get('name_hebrew', template.name_hebrew)
        template.description = data.get('description', template.description)
        template.form_type = data.get('form_type', template.form_type)
        template.fields_config = data.get('fields_config', template.fields_config)
        template.approval_chain = data.get('approval_chain', template.approval_chain)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Form template updated successfully',
            'template': template.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@forms_bp.route('/templates/<int:template_id>', methods=['DELETE'])
@require_admin
def delete_form_template(template_id):
    try:
        template = FormTemplate.query.get_or_404(template_id)
        template.is_active = False
        db.session.commit()
        
        return jsonify({'message': 'Form template deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@forms_bp.route('/', methods=['POST'])
@require_auth
def create_form():
    try:
        data = request.get_json()
        template_id = data.get('template_id')
        template_type = data.get('template_type')
        form_data = data.get('form_data')
        
        # If template_type is provided instead of template_id, find the template
        if template_type and not template_id:
            template = FormTemplate.query.filter_by(form_type=template_type, is_active=True).first()
            if not template:
                # Create a basic template if it doesn't exist
                template = FormTemplate(
                    name=template_type,
                    name_hebrew=template_type,
                    description=f"Template for {template_type} forms",
                    form_type=template_type,
                    fields_config={},
                    approval_chain=[1],  # Default to admin role
                    created_by=session['user_id']
                )
                db.session.add(template)
                db.session.flush()
            template_id = template.id
        elif template_id:
            template = FormTemplate.query.get_or_404(template_id)
        else:
            return jsonify({'error': 'Either template_id or template_type must be provided'}), 400
        
        form = Form(
            template_id=template_id,
            initiator_id=session['user_id'],
            form_data=form_data,
            status='pending',
            current_step=0
        )
        
        db.session.add(form)
        db.session.flush()  # Get the form ID
        
        # Create approval records based on template's approval chain
        if template.approval_chain:
            for step, role_id in enumerate(template.approval_chain):
                # Find users with this role
                users_with_role = db.session.query(User).join(UserRole, User.id == UserRole.user_id).filter(
                    UserRole.role_id == role_id,
                    User.is_active == True
                ).all()
                
                # For now, assign to the first user with this role
                # In a real system, you might have more complex logic
                if users_with_role:
                    approval = FormApproval(
                        form_id=form.id,
                        approver_id=users_with_role[0].id,
                        step_number=step,
                        action='pending'
                    )
                    db.session.add(approval)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Form created successfully',
            'form': form.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@forms_bp.route('/', methods=['GET'])
@require_auth
def get_forms():
    try:
        user_id = session['user_id']
        user_role = session['user_role']
        
        # Get query parameters
        status = request.args.get('status')
        my_forms_only = request.args.get('my_forms_only', 'false').lower() == 'true'
        pending_for_me = request.args.get('pending_for_me', 'false').lower() == 'true'
        
        query = Form.query
        
        if my_forms_only:
            # Only forms initiated by current user
            query = query.filter(Form.initiator_id == user_id)
        elif pending_for_me:
            # Only forms pending approval by current user
            query = query.join(FormApproval).filter(
                FormApproval.approver_id == user_id,
                FormApproval.action == 'pending'
            )
        elif user_role != 'admin':
            # Regular users see only their forms and forms they need to approve
            query = query.filter(
                or_(
                    Form.initiator_id == user_id,
                    and_(
                        Form.id.in_(
                            db.session.query(FormApproval.form_id).filter(
                                FormApproval.approver_id == user_id
                            )
                        )
                    )
                )
            )
        
        if status:
            query = query.filter(Form.status == status)
        
        forms = query.order_by(Form.created_at.desc()).all()
        
        return jsonify({
            'forms': [form.to_dict() for form in forms]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@forms_bp.route('/<int:form_id>', methods=['GET'])
@require_auth
def get_form(form_id):
    try:
        form = Form.query.get_or_404(form_id)
        
        # Check if user has access to this form
        user_id = session['user_id']
        user_role = session['user_role']
        
        has_access = (
            user_role == 'admin' or
            form.initiator_id == user_id or
            FormApproval.query.filter_by(form_id=form_id, approver_id=user_id).first()
        )
        
        if not has_access:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get form approvals
        approvals = FormApproval.query.filter_by(form_id=form_id).order_by(FormApproval.step_number).all()
        
        return jsonify({
            'form': form.to_dict(),
            'template': form.template.to_dict(),
            'approvals': [approval.to_dict() for approval in approvals]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@forms_bp.route('/<int:form_id>/approve', methods=['POST'])
@require_auth
def approve_form(form_id):
    try:
        data = request.get_json()
        comments = data.get('comments', '')
        user_id = session['user_id']
        
        form = Form.query.get_or_404(form_id)
        
        # Find the current approval record for this user
        approval = FormApproval.query.filter_by(
            form_id=form_id,
            approver_id=user_id,
            action='pending'
        ).first()
        
        if not approval:
            return jsonify({'error': 'No pending approval found for this user'}), 404
        
        # Update approval record
        approval.action = 'approved'
        approval.comments = comments
        approval.action_date = datetime.utcnow()
        
        # Check if this is the last step in the approval chain
        total_steps = len(form.template.approval_chain)
        if approval.step_number == total_steps - 1:
            # Last approval - form goes back to initiator for final confirmation
            form.status = 'awaiting_final_approval'
        else:
            # Move to next step
            form.current_step = approval.step_number + 1
        
        db.session.commit()
        
        return jsonify({
            'message': 'Form approved successfully',
            'form': form.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@forms_bp.route('/<int:form_id>/reject', methods=['POST'])
@require_auth
def reject_form(form_id):
    try:
        data = request.get_json()
        comments = data.get('comments', '')
        user_id = session['user_id']
        
        form = Form.query.get_or_404(form_id)
        
        # Find the current approval record for this user
        approval = FormApproval.query.filter_by(
            form_id=form_id,
            approver_id=user_id,
            action='pending'
        ).first()
        
        if not approval:
            return jsonify({'error': 'No pending approval found for this user'}), 404
        
        # Update approval record
        approval.action = 'rejected'
        approval.comments = comments
        approval.action_date = datetime.utcnow()
        
        # Move form back to previous step or to initiator if first step
        if approval.step_number > 0:
            form.current_step = approval.step_number - 1
            form.status = 'pending'
        else:
            form.status = 'rejected'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Form rejected successfully',
            'form': form.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@forms_bp.route('/<int:form_id>/final-approve', methods=['POST'])
@require_auth
def final_approve_form(form_id):
    try:
        user_id = session['user_id']
        form = Form.query.get_or_404(form_id)
        
        # Only the initiator can give final approval
        if form.initiator_id != user_id:
            return jsonify({'error': 'Only the form initiator can give final approval'}), 403
        
        if form.status != 'awaiting_final_approval':
            return jsonify({'error': 'Form is not awaiting final approval'}), 400
        
        form.status = 'completed'
        form.completed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Form completed successfully',
            'form': form.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@forms_bp.route('/<int:form_id>/add-approver', methods=['POST'])
@require_auth
def add_approver(form_id):
    try:
        data = request.get_json()
        approver_id = data.get('approver_id')
        user_id = session['user_id']
        
        form = Form.query.get_or_404(form_id)
        
        # Check if current user has permission to add approvers
        current_approval = FormApproval.query.filter_by(
            form_id=form_id,
            approver_id=user_id,
            action='pending'
        ).first()
        
        if not current_approval:
            return jsonify({'error': 'You do not have permission to add approvers to this form'}), 403
        
        # Create additional approval record
        additional_approval = FormApproval(
            form_id=form_id,
            approver_id=approver_id,
            step_number=current_approval.step_number,
            action='pending',
            is_additional=True,
            added_by=user_id
        )
        
        db.session.add(additional_approval)
        db.session.commit()
        
        return jsonify({
            'message': 'Additional approver added successfully',
            'approval': additional_approval.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@forms_bp.route('/statistics', methods=['GET'])
@require_auth
def get_statistics():
    try:
        user_id = session['user_id']
        user_role = session['user_role']
        
        stats = {}
        
        if user_role == 'admin':
            # Admin sees all statistics
            stats['total_forms'] = Form.query.count()
            stats['pending_forms'] = Form.query.filter(Form.status.in_(['pending', 'awaiting_final_approval'])).count()
            stats['completed_forms'] = Form.query.filter_by(status='completed').count()
            stats['rejected_forms'] = Form.query.filter_by(status='rejected').count()
            
            # Forms by template type
            stats['forms_by_type'] = {}
            templates = FormTemplate.query.filter_by(is_active=True).all()
            for template in templates:
                count = Form.query.filter_by(template_id=template.id).count()
                stats['forms_by_type'][template.name_hebrew] = count
        else:
            # Regular user sees limited statistics
            stats['my_forms'] = Form.query.filter_by(initiator_id=user_id).count()
            stats['pending_for_me'] = FormApproval.query.filter_by(
                approver_id=user_id,
                action='pending'
            ).count()
        
        return jsonify({'statistics': stats}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


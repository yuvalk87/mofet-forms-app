import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.forms import forms_bp
from src.routes.admin import admin_bp
from src.routes.data_init import data_init_bp
from src.routes.test_auth import test_auth_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'mofet_forms_secret_key_2025_secure'

# Enable CORS for all routes
CORS(app, supports_credentials=True)

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(forms_bp, url_prefix='/api/forms')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(data_init_bp, url_prefix='/api/data')
app.register_blueprint(test_auth_bp, url_prefix='/api/test')

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Create database tables
with app.app_context():
    # Create database directory if it doesn't exist
    db_dir = os.path.join(os.path.dirname(__file__), 'database')
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)
    
    db.create_all()
    
    # Create default admin user if no users exist
    from src.models.user import User
    if User.query.count() == 0:
        admin_user = User(
            email='admin@mofet.com',
            full_name='מנהל המערכת',
            phone='0544984509',
            role='admin',
            is_active=True
        )
        admin_user.set_password('admin123')
        admin_user.otp_enabled = True
        admin_user.generate_otp_secret()
        
        db.session.add(admin_user)
        db.session.commit()
        print("Default admin user created: admin@mofet.com / admin123")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.route('/api/health', methods=['GET'])
def health_check():
    return {'status': 'healthy', 'message': 'Mofet Forms API is running'}, 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

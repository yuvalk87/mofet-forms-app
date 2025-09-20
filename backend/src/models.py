from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)

    # קשר ל־FormApproval – נשתמש ב־creator_id כקשר ראשי
    approvals = db.relationship(
        "FormApproval",
        back_populates="creator",
        foreign_keys="[FormApproval.creator_id]"
    )

    # אם רוצים גם קשר ל־approver_id (מי שאישר), אפשר להוסיף גם:
    approvals_as_approver = db.relationship(
        "FormApproval",
        back_populates="approver",
        foreign_keys="[FormApproval.approver_id]"
    )


class FormApproval(db.Model):
    __tablename__ = 'form_approval'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))

    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    approver_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    # קשרים חזרה ל־User
    creator = db.relationship(
        "User",
        back_populates="approvals",
        foreign_keys=[creator_id]
    )

    approver = db.relationship(
        "User",
        back_populates="approvals_as_approver",
        foreign_keys=[approver_id]
    )

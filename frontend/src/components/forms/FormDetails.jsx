import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useToast } from '../ui/use-toast';

const FormDetails = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [template, setTemplate] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState('');
  const [additionalApproverEmail, setAdditionalApproverEmail] = useState('');

  const userRole = localStorage.getItem('userRole');
  const currentUserId = localStorage.getItem('userToken'); // Assuming userToken stores user ID

  const fetchFormDetails = async () => {
    try {
      const response = await fetch(`/api/forms/${formId}`);
      const data = await response.json();
      if (response.ok) {
        setForm(data.form);
        setTemplate(data.template);
        setApprovals(data.approvals);
      } else {
        throw new Error(data.error || 'Failed to fetch form details');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormDetails();
  }, [formId, toast]);

  const handleAction = async (actionType) => {
    try {
      const response = await fetch(`/api/forms/${formId}/${actionType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: 'Success',
          description: `Form ${actionType}ed successfully.`, 
        });
        fetchFormDetails(); // Refresh form details
        setComments('');
      } else {
        throw new Error(data.error || `Failed to ${actionType} form`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAddApprover = async () => {
    try {
      // First, find the user ID by email
      const userResponse = await fetch(`/api/admin/users?email=${additionalApproverEmail}`);
      const userData = await userResponse.json();

      if (!userResponse.ok || userData.users.length === 0) {
        throw new Error('User not found with this email.');
      }
      const approverId = userData.users[0].id;

      const response = await fetch(`/api/forms/${formId}/add-approver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approver_id: approverId }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Additional approver added successfully.',
        });
        fetchFormDetails(); // Refresh form details
        setAdditionalApproverEmail('');
      } else {
        throw new Error(data.error || 'Failed to add additional approver');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">טוען פרטי טופס...</div>;
  }

  if (!form || !template) {
    return <div className="text-center py-8">טופס לא נמצא.</div>;
  }

  const isInitiator = form.initiator_id == currentUserId;
  const isCurrentApprover = approvals.some(app => app.approver_id == currentUserId && app.action === 'pending' && app.step_number === form.current_step);
  const isFinalApprovalStep = form.status === 'awaiting_final_approval' && isInitiator;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">פרטי טופס: {template.name_hebrew}</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>פרטי טופס</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>יוזם:</strong> {form.initiator_name}</p>
          <p><strong>סטטוס:</strong> <Badge>{form.status}</Badge></p>
          <p><strong>נוצר בתאריך:</strong> {new Date(form.created_at).toLocaleDateString('he-IL')}</p>
          {form.completed_at && <p><strong>הושלם בתאריך:</strong> {new Date(form.completed_at).toLocaleDateString('he-IL')}</p>}

          <h3 className="text-xl font-semibold mt-4 mb-2">נתוני הטופס</h3>
          {Object.entries(form.form_data).map(([key, value]) => (
            <p key={key}><strong>{template.fields_config.find(f => f.name === key)?.label || key}:</strong> {value}</p>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>היסטוריית אישורים</CardTitle>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <p>אין היסטוריית אישורים זמינה.</p>
          ) : (
            <ul className="space-y-2">
              {approvals.map((approval, index) => (
                <li key={approval.id || index} className="border-b pb-2 last:border-b-0">
                  <p><strong>שלב {approval.step_number + 1}:</strong> {approval.approver_name}</p>
                  <p><strong>פעולה:</strong> <Badge variant={approval.action === 'approved' ? 'default' : approval.action === 'rejected' ? 'destructive' : 'secondary'}>{approval.action}</Badge></p>
                  {approval.comments && <p><strong>הערות:</strong> {approval.comments}</p>}
                  {approval.action_date && <p><strong>תאריך פעולה:</strong> {new Date(approval.action_date).toLocaleDateString('he-IL')}</p>}
                  {approval.is_additional && <p className="text-xs text-muted-foreground">מאשר נוסף שנוסף על ידי {approval.added_by}</p>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {(isCurrentApprover || isFinalApprovalStep) && form.status !== 'completed' && form.status !== 'rejected' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>פעולות אישור</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="comments">הערות (אופציונלי)</Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="הוסף הערות כאן..."
                />
              </div>
              {isCurrentApprover && (
                <div className="flex gap-2">
                  <Button onClick={() => handleAction('approve')} className="bg-green-500 hover:bg-green-600 text-white">
                    אשר
                  </Button>
                  <Button onClick={() => handleAction('reject')} className="bg-red-500 hover:bg-red-600 text-white">
                    דחה
                  </Button>
                </div>
              )}
              {isFinalApprovalStep && (
                <Button onClick={() => handleAction('final-approve')} className="bg-blue-500 hover:bg-blue-600 text-white">
                  אישור סופי
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isCurrentApprover && userRole === 'user' && form.status !== 'completed' && form.status !== 'rejected' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>הוסף מאשר נוסף</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="additional-approver-email">אימייל של המאשר הנוסף</Label>
                <Input
                  id="additional-approver-email"
                  type="email"
                  value={additionalApproverEmail}
                  onChange={(e) => setAdditionalApproverEmail(e.target.value)}
                  placeholder="הכנס אימייל של המאשר הנוסף"
                />
              </div>
              <Button onClick={handleAddApprover} className="bg-purple-500 hover:bg-purple-600 text-white">
                הוסף מאשר
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={() => navigate('/forms')} variant="outline">
        חזור לרשימת טפסים
      </Button>
    </div>
  );
};

export default FormDetails;


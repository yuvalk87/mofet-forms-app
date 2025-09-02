import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { useToast } from '../../components/ui/use-toast';
import { PlusCircle, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

const FormBuilder = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [templateName, setTemplateName] = useState('');
  const [templateNameHebrew, setTemplateNameHebrew] = useState('');
  const [description, setDescription] = useState('');
  const [formType, setFormType] = useState('');
  const [fields, setFields] = useState([]);
  const [approvalChain, setApprovalChain] = useState([]);
  const [availableFieldTypes, setAvailableFieldTypes] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available field types
        const fieldTypesRes = await fetch('/api/admin/form-builder/fields');
        const fieldTypesData = await fieldTypesRes.json();
        if (fieldTypesRes.ok) {
          setAvailableFieldTypes(fieldTypesData.field_types);
        } else {
          throw new Error(fieldTypesData.error || 'Failed to fetch field types');
        }

        // Fetch available roles
        const rolesRes = await fetch('/api/admin/roles');
        const rolesData = await rolesRes.json();
        if (rolesRes.ok) {
          setAvailableRoles(rolesData.roles);
        } else {
          throw new Error(rolesData.error || 'Failed to fetch roles');
        }

        // If editing an existing template, fetch its data
        if (templateId) {
          const templateRes = await fetch(`/api/forms/templates/${templateId}`);
          const templateData = await templateRes.json();
          if (templateRes.ok) {
            setTemplateName(templateData.template.name);
            setTemplateNameHebrew(templateData.template.name_hebrew);
            setDescription(templateData.template.description);
            setFormType(templateData.template.form_type);
            setFields(templateData.template.fields_config);
            setApprovalChain(templateData.template.approval_chain);
          } else {
            throw new Error(templateData.error || 'Failed to fetch template');
          }
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

    fetchData();
  }, [templateId, toast]);

  const handleAddField = () => {
    setFields([...fields, { name: '', label: '', type: 'text', required: false, order: fields.length + 1 }]);
  };

  const handleRemoveField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields.map((field, i) => ({ ...field, order: i + 1 })));
  };

  const handleFieldChange = (index, key, value) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const handleMoveField = (index, direction) => {
    const newFields = [...fields];
    const [movedField] = newFields.splice(index, 1);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    newFields.splice(newIndex, 0, movedField);
    setFields(newFields.map((field, i) => ({ ...field, order: i + 1 })));
  };

  const handleAddApproverRole = () => {
    setApprovalChain([...approvalChain, '']);
  };

  const handleRemoveApproverRole = (index) => {
    const newApprovalChain = approvalChain.filter((_, i) => i !== index);
    setApprovalChain(newApprovalChain);
  };

  const handleApproverRoleChange = (index, roleId) => {
    const newApprovalChain = [...approvalChain];
    newApprovalChain[index] = parseInt(roleId);
    setApprovalChain(newApprovalChain);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = templateId ? 'PUT' : 'POST';
    const url = templateId ? `/api/forms/templates/${templateId}` : '/api/forms/templates';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateName,
          name_hebrew: templateNameHebrew,
          description,
          form_type: formType,
          fields_config: fields,
          approval_chain: approvalChain,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Form template ${templateId ? 'updated' : 'created'} successfully.`, 
        });
        navigate('/admin'); // Redirect to admin dashboard or template list
      } else {
        throw new Error(data.error || `Failed to ${templateId ? 'update' : 'create'} form template`);
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
    return <div className="text-center py-8">טוען נתונים...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{templateId ? 'ערוך תבנית טופס' : 'צור תבנית טופס חדשה'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>פרטי תבנית</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="templateName">שם תבנית (אנגלית)</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="templateNameHebrew">שם תבנית (עברית)</Label>
              <Input
                id="templateNameHebrew"
                value={templateNameHebrew}
                onChange={(e) => setTemplateNameHebrew(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="formType">סוג טופס</Label>
              <Select value={formType} onValueChange={setFormType} required>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג טופס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="software">תוכנה</SelectItem>
                  <SelectItem value="tags">תגים</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>שדות הטופס</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={index} className="border p-4 rounded-md space-y-2 relative">
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveField(index, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveField(index, 'down')}
                    disabled={index === fields.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveField(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <Label htmlFor={`field-name-${index}`}>שם שדה (אנגלית)</Label>
                  <Input
                    id={`field-name-${index}`}
                    value={field.name}
                    onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`field-label-${index}`}>תווית שדה (עברית)</Label>
                  <Input
                    id={`field-label-${index}`}
                    value={field.label}
                    onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`field-type-${index}`}>סוג שדה</Label>
                  <Select
                    value={field.type}
                    onValueChange={(value) => handleFieldChange(index, 'type', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סוג שדה" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFieldTypes.map((type) => (
                        <SelectItem key={type.type} value={type.type}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`field-required-${index}`}
                    checked={field.required}
                    onCheckedChange={(checked) => handleFieldChange(index, 'required', checked)}
                  />
                  <Label htmlFor={`field-required-${index}`}>שדה חובה</Label>
                </div>
                {field.type === 'select' && (
                  <div>
                    <Label htmlFor={`field-options-${index}`}>אפשרויות (מופרדות בפסיקים)</Label>
                    <Input
                      id={`field-options-${index}`}
                      value={field.options ? field.options.join(',') : ''}
                      onChange={(e) => handleFieldChange(index, 'options', e.target.value.split(',').map(opt => opt.trim()))}
                      placeholder="אפשרות 1, אפשרות 2"
                    />
                  </div>
                )}
                {/* Add more field-specific properties here based on availableFieldTypes */}
              </div>
            ))}
            <Button type="button" onClick={handleAddField} className="w-full">
              <PlusCircle className="h-4 w-4 mr-2" /> הוסף שדה
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>שרשרת אישורים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {approvalChain.map((roleId, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Select
                  value={roleId}
                  onValueChange={(value) => handleApproverRoleChange(index, value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר תפקיד מאשר" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name_hebrew}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveApproverRole(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" onClick={handleAddApproverRole} className="w-full">
              <PlusCircle className="h-4 w-4 mr-2" /> הוסף תפקיד לשרשרת
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full">
          {templateId ? 'עדכן תבנית' : 'צור תבנית'}
        </Button>
      </form>
    </div>
  );
};

export default FormBuilder;


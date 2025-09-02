import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../components/ui/use-toast';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    name_hebrew: '',
    description: '',
    permissions: {},
  });
  const { toast } = useToast();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/roles');
      const data = await response.json();
      if (response.ok) {
        setRoles(data.roles);
      } else {
        throw new Error(data.error || 'Failed to fetch roles');
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
    fetchRoles();
  }, [toast]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handlePermissionChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: value,
      },
    }));
  };

  const handleOpenDialog = (role = null) => {
    setCurrentRole(role);
    if (role) {
      setFormData({
        name: role.name,
        name_hebrew: role.name_hebrew,
        description: role.description || '',
        permissions: role.permissions || {},
      });
    } else {
      setFormData({
        name: '',
        name_hebrew: '',
        description: '',
        permissions: {},
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = currentRole ? `/api/admin/roles/${currentRole.id}` : '/api/admin/roles';
    const method = currentRole ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Role ${currentRole ? 'updated' : 'created'} successfully.`, 
        });
        setIsDialogOpen(false);
        fetchRoles();
      } else {
        throw new Error(data.error || `Failed to ${currentRole ? 'update' : 'create'} role`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Role deleted successfully.',
        });
        fetchRoles();
      } else {
        throw new Error(data.error || 'Failed to delete role');
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
    return <div className="text-center py-8">טוען תפקידים...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">ניהול תפקידים</h1>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>רשימת תפקידים</CardTitle>
          <Button onClick={() => handleOpenDialog()}>הוסף תפקיד חדש</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם (עברית)</TableHead>
                <TableHead>שם (אנגלית)</TableHead>
                <TableHead>תיאור</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.name_hebrew}</TableCell>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="mr-2" onClick={() => handleOpenDialog(role)}>ערוך</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteRole(role.id)}>מחק</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentRole ? 'ערוך תפקיד' : 'הוסף תפקיד חדש'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">שם (אנגלית)</Label>
              <Input id="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name_hebrew" className="text-right">שם (עברית)</Label>
              <Input id="name_hebrew" value={formData.name_hebrew} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">תיאור</Label>
              <Textarea id="description" value={formData.description} onChange={handleInputChange} className="col-span-3" />
            </div>
            {/* Permissions - simplified for now, can be expanded */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">הרשאות</Label>
              <div className="col-span-3 flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_initiate_forms"
                    checked={formData.permissions.can_initiate_forms || false}
                    onCheckedChange={(checked) => handlePermissionChange('can_initiate_forms', checked)}
                  />
                  <Label htmlFor="can_initiate_forms">יכול ליזום טפסים</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_approve_forms"
                    checked={formData.permissions.can_approve_forms || false}
                    onCheckedChange={(checked) => handlePermissionChange('can_approve_forms', checked)}
                  />
                  <Label htmlFor="can_approve_forms">יכול לאשר טפסים</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_edit_form_fields"
                    checked={formData.permissions.can_edit_form_fields || false}
                    onCheckedChange={(checked) => handlePermissionChange('can_edit_form_fields', checked)}
                  />
                  <Label htmlFor="can_edit_form_fields">יכול לערוך שדות טופס</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_add_approvers"
                    checked={formData.permissions.can_add_approvers || false}
                    onCheckedChange={(checked) => handlePermissionChange('can_add_approvers', checked)}
                  />
                  <Label htmlFor="can_add_approvers">יכול להוסיף מאשרים</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{currentRole ? 'שמור שינויים' : 'הוסף תפקיד'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleManagement;


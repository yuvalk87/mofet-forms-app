import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { useToast } from '../../components/ui/use-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'user',
    is_active: true,
    role_ids: [],
  });
  const { toast } = useToast();

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    try {
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      if (usersRes.ok) {
        setUsers(usersData.users);
      } else {
        throw new Error(usersData.error || 'Failed to fetch users');
      }

      const rolesRes = await fetch('/api/admin/roles');
      const rolesData = await rolesRes.json();
      if (rolesRes.ok) {
        setRoles(rolesData.roles);
      } else {
        throw new Error(rolesData.error || 'Failed to fetch roles');
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
    fetchUsersAndRoles();
  }, [toast]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRoleChange = (roleId) => {
    setFormData((prev) => {
      const newRoleIds = prev.role_ids.includes(roleId)
        ? prev.role_ids.filter((id) => id !== roleId)
        : [...prev.role_ids, roleId];
      return { ...prev, role_ids: newRoleIds };
    });
  };

  const handleOpenDialog = (user = null) => {
    setCurrentUser(user);
    if (user) {
      setFormData({
        email: user.email,
        password: '', // Never pre-fill password
        full_name: user.full_name,
        phone: user.phone || '',
        role: user.role,
        is_active: user.is_active,
        role_ids: user.roles.map(r => r.id),
      });
    } else {
      setFormData({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        role: 'user',
        is_active: true,
        role_ids: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = currentUser ? `/api/admin/users/${currentUser.id}` : '/api/admin/users';
    const method = currentUser ? 'PUT' : 'POST';

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
          description: `User ${currentUser ? 'updated' : 'created'} successfully.`, 
        });
        setIsDialogOpen(false);
        fetchUsersAndRoles();
      } else {
        throw new Error(data.error || `Failed to ${currentUser ? 'update' : 'create'} user`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'User deactivated successfully.',
        });
        fetchUsersAndRoles();
      } else {
        throw new Error(data.error || 'Failed to deactivate user');
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
    return <div className="text-center py-8">טוען משתמשים...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">ניהול משתמשים</h1>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>רשימת משתמשים</CardTitle>
          <Button onClick={() => handleOpenDialog()}>הוסף משתמש חדש</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם מלא</TableHead>
                <TableHead>אימייל</TableHead>
                <TableHead>טלפון</TableHead>
                <TableHead>תפקיד מערכת</TableHead>
                <TableHead>תפקידים מותאמים</TableHead>
                <TableHead>פעיל</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.role === 'admin' ? 'מנהל מערכת' : 'משתמש רגיל'}</TableCell>
                  <TableCell>{user.roles.map(r => r.name).join(', ')}</TableCell>
                  <TableCell>{user.is_active ? 'כן' : 'לא'}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="mr-2" onClick={() => handleOpenDialog(user)}>ערוך</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>מחק</Button>
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
            <DialogTitle>{currentUser ? 'ערוך משתמש' : 'הוסף משתמש חדש'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">שם מלא</Label>
              <Input id="full_name" value={formData.full_name} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">אימייל</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">סיסמה {currentUser ? '(השאר ריק לא לשינוי)' : ''}</Label>
              <Input id="password" type="password" value={formData.password} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">טלפון</Label>
              <Input id="phone" value={formData.phone} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">תפקיד מערכת</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="בחר תפקיד" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">מנהל מערכת</SelectItem>
                  <SelectItem value="user">משתמש רגיל</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">תפקידים מותאמים</Label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {roles.map(role => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={formData.role_ids.includes(role.id)}
                      onCheckedChange={() => handleRoleChange(role.id)}
                    />
                    <Label htmlFor={`role-${role.id}`}>{role.name_hebrew}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active" className="text-right">פעיל</Label>
              <Checkbox id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))} />
            </div>
            <DialogFooter>
              <Button type="submit">{currentUser ? 'שמור שינויים' : 'הוסף משתמש'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;


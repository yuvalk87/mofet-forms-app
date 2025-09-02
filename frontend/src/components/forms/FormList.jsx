import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';

const FormList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(location.search);
        const myFormsOnly = queryParams.get('my_forms_only');
        const pendingForMe = queryParams.get('pending_for_me');

        let url = '/api/forms';
        if (myFormsOnly) {
          url += '?my_forms_only=true';
        } else if (pendingForMe) {
          url += '?pending_for_me=true';
        }

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
          setForms(data.forms);
        } else {
          throw new Error(data.error || 'Failed to fetch forms');
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

    fetchForms();
  }, [location.search, toast]);

  const filteredForms = forms.filter(form =>
    form.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.initiator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">טוען טפסים...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">רשימת טפסים</h1>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="חפש טופס..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredForms.length === 0 ? (
        <p className="text-center text-gray-500">לא נמצאו טפסים.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <Card key={form.id}>
              <CardHeader>
                <CardTitle>{form.template_name}</CardTitle>
                <p className="text-sm text-muted-foreground">יוזם: {form.initiator_name}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">סטטוס: <Badge>{form.status}</Badge></p>
                <p className="text-sm mb-2">נוצר ב: {new Date(form.created_at).toLocaleDateString('he-IL')}</p>
                <Link to={`/forms/${form.id}`}>
                  <Button variant="outline" className="w-full">צפה בפרטים</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormList;


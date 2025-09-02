import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../ui/use-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/forms/statistics');
        const data = await response.json();
        if (response.ok) {
          setStats(data.statistics);
        } else {
          throw new Error(data.error || 'Failed to fetch statistics');
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

    fetchStats();
  }, [toast]);

  if (loading) {
    return <div className="text-center py-8">טוען נתונים...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8">לא ניתן לטעון נתונים.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">לוח מחוונים</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הטפסים שלי</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <line x1="10" x2="8" y1="9" y2="9" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.my_forms}</div>
            <p className="text-xs text-muted-foreground">
              סה"כ טפסים שיזמת
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ממתינים לאישורי</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_for_me}</div>
            <p className="text-xs text-muted-foreground">
              טפסים הממתינים לפעולתך
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={() => navigate('/forms?pending_for_me=true')} className="mr-4">
          הצג טפסים הממתינים לאישורי
        </Button>
        <Button onClick={() => navigate('/forms?my_forms_only=true')}>
          הצג את הטפסים שיזמתי
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;


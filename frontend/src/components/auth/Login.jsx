import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../ui/use-toast.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.requires_otp) {
        setOtpRequired(true);
        setUserId(data.user_id);
        toast({
          title: 'OTP Required',
          description: 'A one-time password has been sent to your phone.',
        });
      } else {
        localStorage.setItem('userToken', data.user.id); // Placeholder for actual token
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userName', data.user.full_name);
        toast({
          title: 'Login Successful',
          description: `Welcome, ${data.user.full_name}!`, 
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Login Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, otp_code: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      localStorage.setItem('userToken', data.user.id); // Placeholder for actual token
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', data.user.full_name);
      toast({
        title: 'OTP Verified',
        description: 'You have successfully logged in.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'OTP Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">טפסי מופ"ת</CardTitle>
          <CardDescription>התחבר לחשבונך</CardDescription>
        </CardHeader>
        <CardContent>
          {!otpRequired ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">סיסמה</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                התחבר
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpVerification} className="space-y-4">
              <div>
                <Label htmlFor="otp">קוד אימות (OTP)</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="הכנס קוד OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                אמת OTP
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../lib/api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [demoToken, setDemoToken] = useState(null);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your account email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      setSubmitted(true);
      if (res.reset_token) {
        setDemoToken(res.reset_token);
      }
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message || 'Failed to request reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px'
      }}
      className="bg-glow-radial"
    >
      <div style={{ width: '100%', maxWidth: '440px' }} className="animate-fade-in">
        <Card className="glass-panel-elevated" style={{ padding: '36px 32px' }}>
          <CardHeader style={{ textAlign: 'center', marginBottom: '24px' }}>
            <CardTitle style={{ fontSize: '1.5rem' }}>Reset Password</CardTitle>
            <CardDescription>
              Enter the email address registered with your Metamorph account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {submitted ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--status-success-bg)',
                    color: 'var(--status-success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}
                >
                  <CheckCircle2 size={24} />
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  If an account exists for <strong>{email}</strong>, a password reset link has been dispatched.
                </p>

                {demoToken && (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(6, 182, 212, 0.12)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                      DEMO DIRECT RESET LINK:
                    </div>
                    <Link
                      to={`/reset-password/${demoToken}`}
                      style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', wordBreak: 'break-all', textDecoration: 'underline' }}
                    >
                      Click here to reset with token: {demoToken.slice(0, 16)}...
                    </Link>
                  </div>
                )}

                <Link to="/login" style={{ textDecoration: 'none', marginTop: '12px' }}>
                  <Button variant="secondary" style={{ width: '100%' }}>
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Input
                  label="Account Email"
                  type="email"
                  placeholder="developer@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                  required
                />

                <Button
                  variant="primary"
                  type="submit"
                  size="md"
                  isLoading={isSubmitting}
                  style={{ width: '100%' }}
                  icon={Send}
                >
                  Send Reset Link
                </Button>

                <div style={{ textAlign: 'center' }}>
                  <Link
                    to="/login"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none'
                    }}
                  >
                    <ArrowLeft size={16} /> Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

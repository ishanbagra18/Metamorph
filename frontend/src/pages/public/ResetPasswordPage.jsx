import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../lib/api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function ResetPasswordPage() {
  const { token: urlToken } = useParams();
  const [token, setToken] = useState(urlToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error('Reset token is required.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.resetPassword({ token: token.trim(), newPassword });
      setSuccess(true);
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message || 'Failed to reset password.');
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
            <CardTitle style={{ fontSize: '1.5rem' }}>Create New Password</CardTitle>
            <CardDescription>
              Enter and confirm your new secure account password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
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
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Your password has been reset successfully! You can now sign in with your new credentials.
                </p>
                <Link to="/login" style={{ textDecoration: 'none', marginTop: '12px' }}>
                  <Button variant="primary" style={{ width: '100%' }}>
                    Proceed to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {!urlToken && (
                  <Input
                    label="Reset Token"
                    placeholder="rst_..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                )}

                <Input
                  label="New Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  icon={Lock}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={Lock}
                  required
                />

                <Button
                  variant="primary"
                  type="submit"
                  size="md"
                  isLoading={isSubmitting}
                  style={{ width: '100%', marginTop: '6px' }}
                  icon={ArrowRight}
                >
                  Update Password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

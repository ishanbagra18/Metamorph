import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Mail, Lock, ArrowRight, Shield, User } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      // Error handled by AuthContext toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrors({});
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
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow-cyan)',
                color: '#ffffff',
                fontSize: '1.5rem',
                margin: '0 auto 16px'
              }}
            >
              🦋
            </div>
            <CardTitle style={{ fontSize: '1.5rem' }}>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to manage and monitor your TypeScript migration pipelines.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Demo Accounts Quick-Fill helper */}
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '20px'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Quick Demo Credentials:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => fillDemo('admin@metamorph.dev', 'Admin@123456')}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    color: 'var(--accent-purple)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Shield size={12} /> Admin Demo
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('alice@example.com', 'password123')}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <User size={12} /> Developer Demo
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <Input
                label="Email Address"
                type="email"
                placeholder="developer@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                icon={Mail}
                required
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  icon={Lock}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: '0.8125rem', color: 'var(--accent-cyan)', textDecoration: 'none' }}
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                variant="primary"
                type="submit"
                size="md"
                isLoading={isSubmitting}
                style={{ width: '100%', marginTop: '6px' }}
                icon={ArrowRight}
              >
                Sign In
              </Button>
            </form>

            <div
              style={{
                marginTop: '24px',
                textAlign: 'center',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)'
              }}
            >
              Don't have an account yet?{' '}
              <Link to="/register" style={{ color: 'var(--accent-cyan)', fontWeight: 600, textDecoration: 'none' }}>
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

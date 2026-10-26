import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Mail, Lock, User, Building, ArrowRight, Sparkles, Check } from 'lucide-react';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required.';
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (!agreeTerms) errs.agreeTerms = 'You must agree to the Terms of Service.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        company: company.trim()
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Handled by toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = getPasswordStrength();

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
      <div style={{ width: '100%', maxWidth: '480px' }} className="animate-fade-in">
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
            <CardTitle style={{ fontSize: '1.5rem' }}>Create Your Account</CardTitle>
            <CardDescription>
              Start transforming Node.js JavaScript codebases to strict TypeScript.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Full Name"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                icon={User}
                required
              />

              <Input
                label="Work Email"
                type="email"
                placeholder="ada@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                icon={Mail}
                required
              />

              <Input
                label="Company / Team (Optional)"
                placeholder="Acme Engineering"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                icon={Building}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  icon={Lock}
                  required
                />
                {password && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        style={{
                          flex: 1,
                          height: '4px',
                          borderRadius: '2px',
                          backgroundColor:
                            strength >= lvl
                              ? strength >= 4
                                ? 'var(--status-success)'
                                : strength >= 3
                                ? 'var(--status-warning)'
                                : 'var(--status-danger)'
                              : 'var(--bg-surface-elevated)'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                icon={Lock}
                required
              />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ marginTop: '3px', cursor: 'pointer', accentColor: 'var(--accent-cyan)' }}
                />
                <label htmlFor="agree-terms" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.4 }}>
                  I agree to Metamorph's Terms of Service and acknowledge sandbox isolated execution policies.
                </label>
              </div>
              {errors.agreeTerms && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--status-danger)' }}>{errors.agreeTerms}</span>
              )}

              <Button
                variant="primary"
                type="submit"
                size="md"
                isLoading={isSubmitting}
                style={{ width: '100%', marginTop: '8px' }}
                icon={Sparkles}
              >
                Create Account
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
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--accent-cyan)', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

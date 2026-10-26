import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { User, Mail, Building, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [company, setCompany] = useState(user?.company || '');
  const [avatarSeed, setAvatarSeed] = useState(user?.id || 'metamorph-dev');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(randomSeed);
  };

  const currentAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        name: name.trim(),
        company: company.trim(),
        avatar: currentAvatarUrl
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          User Profile
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Manage your personal credentials, workspace preferences, and developer identity.
        </p>
      </div>

      {/* Identity Card */}
      <Card style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={user?.avatar || currentAvatarUrl}
              alt={user?.name}
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '3px solid var(--accent-cyan)',
                boxShadow: 'var(--shadow-glow-cyan)'
              }}
            />
            <button
              type="button"
              onClick={handleRandomizeAvatar}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Generate new avatar"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user?.name}
              </h3>
              <Badge variant={user?.role === 'admin' ? 'purple' : 'cyan'}>
                {user?.role}
              </Badge>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {user?.email} • {user?.company || 'Independent Developer'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Account ID: {user?.id}
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Profile Form */}
      <Card style={{ padding: '28px' }}>
        <CardHeader style={{ marginBottom: '20px' }}>
          <CardTitle style={{ fontSize: '1.15rem' }}>Update Personal Information</CardTitle>
          <CardDescription>
            Changes will be reflected across your migration records and team dashboards.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={User}
              required
            />

            <Input
              label="Email Address"
              value={user?.email || ''}
              disabled
              helperText="Email cannot be changed directly in self-hosted instances."
              icon={Mail}
            />

            <Input
              label="Company or Organization"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              icon={Building}
              placeholder="e.g. Acme Corp"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button variant="primary" type="submit" isLoading={isSubmitting} icon={Sparkles}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

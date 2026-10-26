import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { Lock, Sun, Moon, ShieldAlert, Cpu, Trash2, Key } from 'lucide-react';

export function SettingsPage() {
  const { user, changePassword, deleteAccount } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Current password is required.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await deleteAccount();
      navigate('/login');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Preferences & Security
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Configure workspace appearance, security authentication credentials, and platform options.
        </p>
      </div>

      {/* Security & Password Card */}
      <Card style={{ padding: '28px' }}>
        <CardHeader style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} style={{ color: 'var(--accent-cyan)' }} />
            <CardTitle style={{ fontSize: '1.15rem' }}>Change Account Password</CardTitle>
          </div>
          <CardDescription>
            Ensure your account is protected using a strong, unique alphanumeric passphrase.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              icon={Lock}
              required
            />

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
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={Lock}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button variant="primary" type="submit" isLoading={isChangingPassword}>
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Appearance & Interface Card */}
      <Card style={{ padding: '28px' }}>
        <CardHeader style={{ marginBottom: '20px' }}>
          <CardTitle style={{ fontSize: '1.15rem' }}>Appearance & Interface</CardTitle>
          <CardDescription>
            Customize your visual theme and contrast preferences.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Interface Theme</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Currently active: {isDark ? 'Obsidian Dark' : 'Daylight Slate'}
              </div>
            </div>

            <Button variant="secondary" icon={isDark ? Sun : Moon} onClick={toggleTheme}>
              Switch to {isDark ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card style={{ padding: '28px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
        <CardHeader style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} style={{ color: 'var(--status-danger)' }} />
            <CardTitle style={{ fontSize: '1.15rem', color: 'var(--status-danger)' }}>Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Permanently remove your account and all associated access tokens from this Metamorph cluster.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Delete My Account</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                This action is irreversible and immediate.
              </div>
            </div>

            <Button variant="danger" icon={Trash2} onClick={() => setShowDeleteModal(true)}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Your Account"
        message="Are you completely sure? Your user record and API session will be permanently destroyed."
        isLoading={isDeletingAccount}
      />
    </div>
  );
}

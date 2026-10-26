import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api/admin';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { Users, Search, Shield, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user: currentUser } = useAuth();
  const toast = useToast();

  const fetchUsers = async () => {
    try {
      const data = await adminApi.listUsers();
      setUsers(data.users || []);
    } catch (err) {
      toast.error('Failed to load user directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      await adminApi.updateUserRole(targetUser.id, newRole);
      toast.success(`Role for ${targetUser.email} changed to ${newRole}.`);
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
    } catch (err) {
      toast.error(err.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteUser(deleteTarget.id);
      toast.success(`User ${deleteTarget.email} deleted.`);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            User Governance & Roles
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Manage developer accounts, assign administrative roles, and audit access permissions.
          </p>
        </div>

        <div style={{ width: '100%', maxWidth: '340px' }}>
          <Input
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
      </div>

      <Card style={{ padding: '0', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '24px' }}>
            <SkeletonTable rows={5} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={36} style={{ marginBottom: '12px' }} />
            <div>No users found matching your search.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '14px 20px' }}>User</th>
                  <th style={{ padding: '14px 20px' }}>Email</th>
                  <th style={{ padding: '14px 20px' }}>Company</th>
                  <th style={{ padding: '14px 20px' }}>Role</th>
                  <th style={{ padding: '14px 20px' }}>Registered</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`}
                            alt={u.name}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--bg-surface-elevated)'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {u.name} {isCurrent && <span style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem' }}>(You)</span>}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              ID: {u.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                        {u.email}
                      </td>

                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                        {u.company || '—'}
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <Badge variant={u.role === 'admin' ? 'purple' : 'neutral'}>
                          {u.role}
                        </Badge>
                      </td>

                      <td style={{ padding: '14px 20px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          {!isCurrent && (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleRoleToggle(u)}
                                title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                              >
                                {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                              </Button>

                              <button
                                onClick={() => setDeleteTarget(u)}
                                style={{
                                  padding: '6px',
                                  borderRadius: 'var(--radius-sm)',
                                  color: 'var(--status-danger)',
                                  backgroundColor: 'transparent'
                                }}
                                title="Delete user"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteUser}
        title="Delete User Account"
        message={`Are you sure you want to delete ${deleteTarget?.name} (${deleteTarget?.email})? This action cannot be reversed.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

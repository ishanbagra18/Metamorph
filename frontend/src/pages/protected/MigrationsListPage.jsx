import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { migrationsApi } from '../../lib/api/migrations';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import {
  Layers,
  Search,
  Filter,
  PlusCircle,
  Download,
  Trash2,
  ExternalLink,
  FileCode,
  Calendar,
  ArrowUpDown
} from 'lucide-react';

export function MigrationsListPage() {
  const [runs, setRuns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteRunId, setDeleteRunId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { openNewRunModal } = useOutletContext();
  const toast = useToast();
  const itemsPerPage = 8;

  const fetchRuns = async () => {
    try {
      const data = await migrationsApi.listRuns();
      setRuns(data || []);
    } catch (err) {
      toast.error('Failed to load migrations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async () => {
    if (!deleteRunId) return;
    setIsDeleting(true);
    try {
      await migrationsApi.deleteRun(deleteRunId);
      toast.success('Run deleted successfully.');
      setRuns(prev => prev.filter(r => r.run_id !== deleteRunId));
      setDeleteRunId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete run.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRuns = runs.filter((run) => {
    const matchesSearch =
      run.repo_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.run_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true :
      statusFilter === 'running' ? ['running', 'initializing', 'ready'].includes(run.status) :
      run.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRuns.length / itemsPerPage) || 1;
  const paginatedRuns = filteredRuns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Migration Repositories
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Search, inspect, and manage historical and active TypeScript migration pipelines.
          </p>
        </div>

        <Button variant="primary" icon={PlusCircle} onClick={openNewRunModal}>
          New Migration
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: '1 1 300px', maxWidth: '420px' }}>
            <Input
              placeholder="Search by repository name or Run ID..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              icon={Search}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Runs' },
              { id: 'running', label: 'Active' },
              { id: 'completed', label: 'Completed' },
              { id: 'failed', label: 'Failed' },
              { id: 'ready', label: 'Ready' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => { setStatusFilter(f.id); setCurrentPage(1); }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: statusFilter === f.id ? 'var(--accent-blue)' : 'var(--bg-surface-elevated)',
                  color: statusFilter === f.id ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-default)',
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '24px' }}>
            <SkeletonTable rows={6} />
          </div>
        ) : paginatedRuns.length === 0 ? (
          <div style={{ padding: '64px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Layers size={36} style={{ marginBottom: '12px' }} />
            <div>No migration runs match your query filter.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '14px 20px' }}>Repository</th>
                  <th style={{ padding: '14px 20px' }}>Run ID</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px' }}>Conversion Progress</th>
                  <th style={{ padding: '14px 20px' }}>Quality</th>
                  <th style={{ padding: '14px 20px' }}>Timestamp</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRuns.map((run) => {
                  const summary = run.summary || {};
                  const total = summary.total_files || 0;
                  const done = summary.done_files || 0;
                  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
                  const quality = summary.report?.quality_score;

                  return (
                    <tr
                      key={run.run_id}
                      style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color var(--transition-fast)' }}
                    >
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <Link
                          to={`/migrations/${run.run_id}`}
                          style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
                        >
                          <FileCode size={18} style={{ color: 'var(--accent-cyan)' }} />
                          {run.repo_name}
                        </Link>
                      </td>

                      <td style={{ padding: '16px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {run.run_id}
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <Badge
                          variant={
                            run.status === 'completed' ? 'success' :
                            ['running', 'initializing'].includes(run.status) ? 'cyan' :
                            run.status === 'failed' ? 'danger' : 'neutral'
                          }
                          dot={['running', 'initializing'].includes(run.status)}
                        >
                          {run.status}
                        </Badge>
                      </td>

                      <td style={{ padding: '16px 20px', minWidth: '160px' }}>
                        <ProgressBar value={percent} variant="cyan" showLabel label={`${done}/${total} files`} />
                      </td>

                      <td style={{ padding: '16px 20px', fontWeight: 600, color: quality ? 'var(--status-success)' : 'var(--text-muted)' }}>
                        {quality ? `${quality}/100` : '—'}
                      </td>

                      <td style={{ padding: '16px 20px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {new Date(run.created_at).toLocaleString()}
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <Link to={`/migrations/${run.run_id}`} style={{ textDecoration: 'none' }}>
                            <Button variant="secondary" size="sm" icon={ExternalLink}>
                              Open
                            </Button>
                          </Link>

                          {run.status === 'completed' && (
                            <a href={migrationsApi.getDownloadUrl(run.run_id)} download style={{ textDecoration: 'none' }}>
                              <Button variant="outline" size="sm" icon={Download} title="Download Migrated ZIP" />
                            </a>
                          )}

                          <button
                            onClick={() => setDeleteRunId(run.run_id)}
                            style={{
                              padding: '6px',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--status-danger)',
                              backgroundColor: 'transparent'
                            }}
                            title="Delete Run"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.875rem'
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>
              Showing page {currentPage} of {totalPages} ({filteredRuns.length} total)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={!!deleteRunId}
        onClose={() => setDeleteRunId(null)}
        onConfirm={handleDelete}
        title="Delete Migration Run"
        message={`Are you sure you want to permanently delete run "${deleteRunId}"? This action cannot be reversed.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

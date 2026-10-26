import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { migrationsApi } from '../../lib/api/migrations';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  Download,
  Trash2,
  PlusCircle,
  ExternalLink,
  Cpu,
  ShieldCheck,
  FileCode,
  Terminal,
  Clock,
  Sparkles
} from 'lucide-react';

export function DashboardPage() {
  const [runs, setRuns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteRunId, setDeleteRunId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { openNewRunModal } = useOutletContext();
  const toast = useToast();

  const fetchRuns = async () => {
    try {
      const data = await migrationsApi.listRuns();
      setRuns(data || []);
    } catch (err) {
      toast.error('Failed to load migration history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteRunId) return;
    setIsDeleting(true);
    try {
      await migrationsApi.deleteRun(deleteRunId);
      toast.success(`Run ${deleteRunId} removed.`);
      setRuns(prev => prev.filter(r => r.run_id !== deleteRunId));
      setDeleteRunId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete run.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics
  const totalRuns = runs.length;
  const completedRuns = runs.filter(r => r.status === 'completed').length;
  const activeRuns = runs.filter(r => ['running', 'initializing', 'ready'].includes(r.status)).length;
  const failedRuns = runs.filter(r => r.status === 'failed').length;

  let totalFilesMigrated = 0;
  runs.forEach(r => {
    totalFilesMigrated += (r.summary?.done_files || 0);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner & Quick Action */}
      <div
        className="glass-panel-elevated"
        style={{
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
          border: '1px solid var(--border-default)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.25rem' }}>🦋</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Autonomous Migration Control Center
            </h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '640px' }}>
            Upload legacy Node.js Express codebases to let Metamorph plan topological order, query AST vector embeddings in Qdrant, and self-heal TypeScript compiler errors.
          </p>
        </div>

        <Button variant="primary" size="lg" icon={PlusCircle} onClick={openNewRunModal}>
          New Migration
        </Button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ACTIVE MIGRATIONS</span>
            <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
            {activeRuns}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Running in isolated sandbox
          </div>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>COMPLETED REPOSITORIES</span>
            <CheckCircle2 size={18} style={{ color: 'var(--status-success)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-success)', marginTop: '8px' }}>
            {completedRuns}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Successfully converted to TS
          </div>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>FILES MIGRATED</span>
            <FileCode size={18} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple)', marginTop: '8px' }}>
            {totalFilesMigrated}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            AST parsed and verified
          </div>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TOTAL REPOSITORIES</span>
            <Sparkles size={18} style={{ color: 'var(--status-warning)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
            {totalRuns}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Total pipeline history
          </div>
        </Card>
      </div>

      {/* Recent Migrations Table */}
      <Card style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Migration Pipelines
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Monitor agent execution states, live compiler feedback, and download packaged repositories.
            </p>
          </div>
          <Link to="/migrations" style={{ fontSize: '0.8125rem', color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>
            View All ({runs.length}) →
          </Link>
        </div>

        {isLoading ? (
          <SkeletonTable rows={4} />
        ) : runs.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <Layers size={40} style={{ color: 'var(--text-muted)' }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No migrations created yet</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Upload a Node.js Express repository ZIP or clone from GitHub to launch your first pipeline.
              </div>
            </div>
            <Button variant="primary" icon={PlusCircle} onClick={openNewRunModal}>
              Start First Migration
            </Button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 16px' }}>Repository</th>
                  <th style={{ padding: '12px 16px' }}>Run ID</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Progress</th>
                  <th style={{ padding: '12px 16px' }}>Created</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {runs.slice(0, 6).map((run) => {
                  const summary = run.summary || {};
                  const total = summary.total_files || 0;
                  const done = summary.done_files || 0;
                  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

                  return (
                    <tr
                      key={run.run_id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color var(--transition-fast)'
                      }}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <Link
                          to={`/migrations/${run.run_id}`}
                          style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <FileCode size={16} style={{ color: 'var(--accent-cyan)' }} />
                          {run.repo_name}
                        </Link>
                      </td>

                      <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {run.run_id}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <Badge
                          variant={
                            run.status === 'completed' ? 'success' :
                            run.status === 'running' || run.status === 'initializing' ? 'cyan' :
                            run.status === 'failed' ? 'danger' : 'neutral'
                          }
                          dot={run.status === 'running' || run.status === 'initializing'}
                        >
                          {run.status}
                        </Badge>
                      </td>

                      <td style={{ padding: '14px 16px', minWidth: '150px' }}>
                        <ProgressBar value={percent} variant="cyan" showLabel label={`${done}/${total} files`} />
                      </td>

                      <td style={{ padding: '14px 16px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {new Date(run.created_at).toLocaleDateString()}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <Link to={`/migrations/${run.run_id}`} style={{ textDecoration: 'none' }}>
                            <Button variant="secondary" size="sm" icon={ExternalLink}>
                              Workspace
                            </Button>
                          </Link>

                          {run.status === 'completed' && (
                            <a
                              href={migrationsApi.getDownloadUrl(run.run_id)}
                              download
                              style={{ textDecoration: 'none' }}
                            >
                              <Button variant="outline" size="sm" icon={Download} title="Download Migrated TypeScript ZIP" />
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
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteRunId}
        onClose={() => setDeleteRunId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Migration Run"
        message={`Are you sure you want to permanently delete run "${deleteRunId}" and all generated TypeScript artifacts?`}
        isLoading={isDeleting}
      />
    </div>
  );
}

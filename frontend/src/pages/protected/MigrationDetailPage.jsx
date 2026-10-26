import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { migrationsApi } from '../../lib/api/migrations';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { TerminalView } from '../../components/features/TerminalView';
import { DiffViewer } from '../../components/features/DiffViewer';
import { DepGraphView } from '../../components/features/DepGraphView';
import { QualityScoreMeter } from '../../components/features/QualityScoreMeter';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import {
  FileCode,
  Layers,
  Terminal,
  ShieldCheck,
  Play,
  Pause,
  Download,
  Trash2,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  GitCommit
} from 'lucide-react';

export function MigrationDetailPage() {
  const { id: runId } = useParams();
  const [run, setRun] = useState(null);
  const [activeTab, setActiveTab] = useState('plan'); // 'plan' | 'diff' | 'terminal' | 'report'
  const [selectedFile, setSelectedFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const wsRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();

  const fetchRun = async () => {
    try {
      const data = await migrationsApi.getRun(runId);
      setRun(data);
      if (data.state?.logs && logs.length === 0) {
        setLogs(data.state.logs);
      }
      if (!selectedFile && data.state?.plan && data.state.plan.length > 0) {
        setSelectedFile(data.state.plan[0]);
      }
    } catch (err) {
      toast.error('Failed to load run details.');
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchRun();
    const interval = setInterval(fetchRun, 3500);
    return () => clearInterval(interval);
  }, [runId]);

  // WebSocket live connection
  useEffect(() => {
    if (!runId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/${runId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'node_transition') {
          const { status, current_file, logs: newLogs, tasks } = payload.data;
          if (newLogs) {
            setLogs(prev => [...prev, ...newLogs]);
          }
          setRun(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              status: status || prev.status,
              state: {
                ...prev.state,
                current_file,
                tasks: tasks || prev.state?.tasks
              }
            };
          });
          if (current_file) {
            setSelectedFile(current_file);
          }
        } else if (payload.type === 'run_completed') {
          toast.success('🎉 Migration run completed with verified TypeScript!');
          fetchRun();
        } else if (payload.type === 'run_failed') {
          toast.error('Migration execution failed: ' + (payload.data?.error || 'Compiler error'));
          fetchRun();
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    ws.onclose = () => setWsConnected(false);

    return () => {
      ws.close();
    };
  }, [runId]);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await migrationsApi.startRun(runId);
      toast.success('Migration pipeline launched.');
      fetchRun();
    } catch (err) {
      toast.error(err.message || 'Failed to start run.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await migrationsApi.cancelRun(runId);
      toast.info('Migration cancelled.');
      fetchRun();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel run.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDelete = async () => {
    try {
      await migrationsApi.deleteRun(runId);
      toast.success('Run deleted.');
      navigate('/migrations');
    } catch (err) {
      toast.error(err.message || 'Failed to delete run.');
    }
  };

  if (!run) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading migration pipeline for {runId}...
      </div>
    );
  }

  const state = run.state || {};
  const summary = run.summary || {};
  const tasks = state.tasks || {};
  const plan = state.plan || [];
  const cycles = state.cycles || [];
  const depGraph = state.dep_graph || {};
  const report = state.report || {};
  const isRunning = ['running', 'initializing'].includes(run.status);

  const doneCount = Object.values(tasks).filter(t => t.status === 'done').length;
  const totalCount = plan.length || Object.keys(tasks).length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const currentTask = selectedFile ? tasks[selectedFile] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back button and navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <Link
          to="/migrations"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          <ArrowLeft size={16} /> All Migrations
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>RUN ID:</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            {run.run_id}
          </span>
        </div>
      </div>

      {/* Main Status Header Card */}
      <div
        className="glass-panel-elevated"
        style={{
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          borderLeft: `6px solid ${
            run.status === 'completed' ? 'var(--status-success)' :
            isRunning ? 'var(--accent-cyan)' :
            run.status === 'failed' ? 'var(--status-danger)' : 'var(--text-muted)'
          }`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem'
              }}
            >
              🦋
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {run.repo_name}
                </h2>
                <Badge
                  variant={
                    run.status === 'completed' ? 'success' :
                    isRunning ? 'cyan' :
                    run.status === 'failed' ? 'danger' : 'neutral'
                  }
                  dot={isRunning}
                >
                  {run.status}
                </Badge>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Created on {new Date(run.created_at).toLocaleString()} • {totalCount} files planned
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {!isRunning && run.status !== 'completed' && (
              <Button variant="primary" icon={Play} onClick={handleStart} isLoading={isStarting}>
                Start Pipeline
              </Button>
            )}

            {isRunning && (
              <Button variant="danger" icon={Pause} onClick={handleCancel} isLoading={isCancelling}>
                Cancel Migration
              </Button>
            )}

            <a href={migrationsApi.getDownloadUrl(run.run_id)} download style={{ textDecoration: 'none' }}>
              <Button variant="outline" icon={Download}>
                Download TS ZIP
              </Button>
            </a>

            <Button variant="ghost" icon={Trash2} onClick={() => setShowDeleteConfirm(true)} style={{ color: 'var(--status-danger)' }}>
              Delete
            </Button>
          </div>
        </div>

        {/* Conversion Progress Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              {isRunning && state.current_file ? `Active File: ${state.current_file}` : 'Topological Completion Rate'}
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {doneCount} of {totalCount} Files ({progressPercent}%)
            </span>
          </div>
          <ProgressBar value={progressPercent} variant="cyan" height="10px" />
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '2px',
          overflowX: 'auto'
        }}
      >
        {[
          { id: 'plan', label: 'Topological Plan & Graph', icon: GitCommit },
          { id: 'diff', label: `Code Explorer & Diff (${doneCount}/${totalCount})`, icon: FileCode },
          { id: 'terminal', label: `Live Console Logs (${logs.length})`, icon: Terminal },
          { id: 'report', label: 'Quality Audit Report', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                borderBottom: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'plan' && (
          <DepGraphView
            plan={plan}
            tasks={tasks}
            depGraph={depGraph}
            cycles={cycles}
            selectedFile={selectedFile}
            onSelectFile={(file) => {
              setSelectedFile(file);
              setActiveTab('diff');
            }}
          />
        )}

        {activeTab === 'diff' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 300px) 1fr', gap: '20px' }}>
            {/* File List Sidebar */}
            <div className="glass-panel" style={{ padding: '16px', maxHeight: '680px', overflowY: 'auto' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
                Migrated Files ({plan.length})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {plan.map((filePath) => {
                  const task = tasks[filePath] || { status: 'pending' };
                  const isSelected = selectedFile === filePath;

                  return (
                    <div
                      key={filePath}
                      onClick={() => setSelectedFile(filePath)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                        border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'transparent'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          fontFamily: 'var(--font-mono)',
                          color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {filePath}
                      </span>

                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          flexShrink: 0,
                          backgroundColor:
                            task.status === 'done' ? 'var(--status-success)' :
                            task.status === 'in_progress' ? 'var(--accent-cyan)' :
                            task.status === 'failed' ? 'var(--status-danger)' : 'var(--text-muted)'
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Code Diff Display */}
            <div>
              <DiffViewer task={currentTask} filePath={selectedFile} />
            </div>
          </div>
        )}

        {activeTab === 'terminal' && (
          <TerminalView logs={logs} isRunning={isRunning} wsConnected={wsConnected} />
        )}

        {activeTab === 'report' && (
          <QualityScoreMeter
            report={report}
            totalFiles={totalCount}
            doneFiles={doneCount}
            failedFiles={Object.values(tasks).filter(t => t.status === 'failed').length}
          />
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Migration Run"
        message={`Delete migration run "${run.run_id}" and all generated TypeScript code?`}
      />
    </div>
  );
}

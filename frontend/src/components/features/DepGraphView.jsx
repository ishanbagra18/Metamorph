import React from 'react';
import { GitCommit, ArrowRight, AlertTriangle, CheckCircle2, Clock, XCircle, Play } from 'lucide-react';
import { Badge } from '../ui/Badge';

export function DepGraphView({ plan = [], tasks = {}, depGraph = {}, cycles = [], selectedFile, onSelectFile }) {
  if (!plan || plan.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No topological plan generated yet. The Analyzer and Planner agents will compute leaf-first dependency ordering upon execution.
      </div>
    );
  }

  // Check if a file belongs to a circular dependency cycle
  const isInCycle = (file) => {
    return cycles?.some(c => c.includes(file));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Cycles Banner if circular dependencies exist */}
      {cycles && cycles.length > 0 && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--status-warning-bg)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            color: 'var(--status-warning)'
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
              Circular Dependencies Detected ({cycles.length} Cycle{cycles.length > 1 ? 's' : ''})
            </div>
            <div style={{ fontSize: '0.8125rem', marginTop: '2px', color: 'var(--text-primary)' }}>
              Resolved via Tarjan's Strongly Connected Components (SCC). Files in cycles are staged together with synthetic ambient type declarations:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {cycles.map((cycle, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  [{cycle.join(' ⇄ ')}]
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Topological Flow Stages */}
      <div
        className="glass-panel"
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Topological Migration Order (Leaf → Root)
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Independent leaf modules are migrated first. Generated TypeScript signatures propagate to downstream consumers.
            </p>
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            {plan.length} Total Files
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {plan.map((file, index) => {
            const task = tasks[file] || { status: 'pending' };
            const isSelected = selectedFile === file;
            const deps = depGraph[file] || [];
            const hasCycle = isInCycle(file);

            return (
              <div
                key={file}
                onClick={() => onSelectFile?.(file)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      flexShrink: 0
                    }}
                  >
                    {index + 1}
                  </span>

                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)'
                        }}
                      >
                        {file}
                      </span>
                      {hasCycle && (
                        <span style={{ fontSize: '0.6875rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'var(--status-warning-bg)', color: 'var(--status-warning)', fontWeight: 600 }}>
                          CYCLE
                        </span>
                      )}
                    </div>

                    {deps.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <span>Depends on:</span>
                        <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          {deps.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {task.status === 'done' && (
                    <Badge variant="success" dot>
                      Completed
                    </Badge>
                  )}
                  {task.status === 'in_progress' && (
                    <Badge variant="cyan" dot>
                      Migrating...
                    </Badge>
                  )}
                  {task.status === 'failed' && (
                    <Badge variant="danger">
                      Failed
                    </Badge>
                  )}
                  {task.status === 'pending' && (
                    <Badge variant="neutral">
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

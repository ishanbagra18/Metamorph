import React, { useState } from 'react';
import { FileCode, Copy, Check, Columns, AlignLeft, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useToast } from '../../context/ToastContext';

export function DiffViewer({ task, filePath }) {
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'unified'
  const [copiedTs, setCopiedTs] = useState(false);
  const toast = useToast();

  if (!task) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <FileCode size={36} />
        <div>Select a file from the repository plan to inspect code transformation and compiler diagnostics.</div>
      </div>
    );
  }

  const originalLines = (task.original_code || '').split('\n');
  const migratedLines = (task.migrated_code || '// Migrated code will appear here once processed by agent...').split('\n');

  const handleCopyTs = () => {
    if (!task.migrated_code) return;
    navigator.clipboard.writeText(task.migrated_code);
    setCopiedTs(true);
    toast.success('TypeScript code copied.');
    setTimeout(() => setCopiedTs(false), 2000);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-surface)',
        overflow: 'hidden'
      }}
    >
      {/* File Header */}
      <div
        style={{
          padding: '14px 20px',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileCode size={18} style={{ color: 'var(--accent-cyan)' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {task.path} <span style={{ color: 'var(--text-muted)' }}>→</span> {task.new_path}
            </div>
            {task.notes && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {task.notes}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Badge
            variant={
              task.status === 'done' ? 'success' :
              task.status === 'in_progress' ? 'cyan' :
              task.status === 'failed' ? 'danger' : 'neutral'
            }
            dot={task.status === 'in_progress'}
          >
            {task.status.replace('_', ' ')}
          </Badge>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Attempts: {task.attempts || 0}/3
          </span>

          <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('split')}
              style={{
                padding: '4px 8px',
                backgroundColor: viewMode === 'split' ? 'var(--accent-blue)' : 'transparent',
                color: viewMode === 'split' ? '#fff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Split View"
            >
              <Columns size={14} />
            </button>
            <button
              onClick={() => setViewMode('unified')}
              style={{
                padding: '4px 8px',
                backgroundColor: viewMode === 'unified' ? 'var(--accent-blue)' : 'transparent',
                color: viewMode === 'unified' ? '#fff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Unified / TS View"
            >
              <AlignLeft size={14} />
            </button>
          </div>

          <button
            onClick={handleCopyTs}
            disabled={!task.migrated_code}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {copiedTs ? <Check size={14} style={{ color: 'var(--status-success)' }} /> : <Copy size={14} />}
            <span>Copy TS</span>
          </button>
        </div>
      </div>

      {/* Compiler Diagnostic error warning banner if failed or error */}
      {task.last_error && (
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: 'var(--status-danger-bg)',
            borderBottom: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--status-danger)',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <div>
            <strong>Compiler Diagnostic:</strong> {task.last_error}
          </div>
        </div>
      )}

      {/* Code Editor / Diff View */}
      <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'split' ? '1fr 1fr' : '1fr', minHeight: '400px', maxHeight: '600px', overflowY: 'auto' }}>
        {/* Left Side: Original JavaScript */}
        {viewMode === 'split' && (
          <div style={{ borderRight: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', overflowX: 'auto' }}>
            <div style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
              ORIGINAL JAVASCRIPT
            </div>
            <pre style={{ margin: 0, padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              {originalLines.map((line, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', width: '32px', textAlign: 'right', userSelect: 'none' }}>{idx + 1}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{line}</span>
                </div>
              ))}
            </pre>
          </div>
        )}

        {/* Right Side: Migrated TypeScript */}
        <div style={{ backgroundColor: 'var(--bg-surface)', overflowX: 'auto' }}>
          <div style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', backgroundColor: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
            <span>GENERATED STRICT TYPESCRIPT</span>
            {task.migrated_code && <span style={{ color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Validated</span>}
          </div>
          <pre style={{ margin: 0, padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
            {migratedLines.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)', width: '32px', textAlign: 'right', userSelect: 'none' }}>{idx + 1}</span>
                <span style={{ color: 'var(--text-primary)' }}>{line}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}

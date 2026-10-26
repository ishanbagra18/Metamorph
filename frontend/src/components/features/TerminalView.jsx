import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Copy, Check, Trash2, ArrowDown, Pause, Play, Filter } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function TerminalView({ logs = [], isRunning = false, wsConnected = false }) {
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'error' | 'agent' | 'compiler'
  const [clearedCount, setClearedCount] = useState(0);

  const terminalEndRef = useRef(null);
  const toast = useToast();

  const displayLogs = logs.slice(clearedCount);

  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayLogs, autoScroll]);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    toast.success('Logs copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setClearedCount(logs.length);
    toast.info('Terminal output cleared.');
  };

  const filteredLogs = displayLogs.filter((log) => {
    if (filter === 'error') return log.toLowerCase().includes('error') || log.toLowerCase().includes('fail');
    if (filter === 'compiler') return log.toLowerCase().includes('tsc') || log.toLowerCase().includes('compiler');
    if (filter === 'agent') return log.toLowerCase().includes('agent') || log.toLowerCase().includes('node');
    return true;
  });

  const formatLogLine = (line) => {
    const isError = line.toLowerCase().includes('error') || line.toLowerCase().includes('fail');
    const isSuccess = line.toLowerCase().includes('success') || line.toLowerCase().includes('passed');
    const isAgent = line.toLowerCase().includes('agent') || line.includes('🦋');
    const isTsc = line.includes('TS') || line.toLowerCase().includes('tsc');

    let color = 'var(--text-secondary)';
    if (isError) color = 'var(--status-danger)';
    else if (isSuccess) color = 'var(--status-success)';
    else if (isAgent) color = 'var(--accent-cyan)';
    else if (isTsc) color = 'var(--status-warning)';

    return (
      <div
        key={line + Math.random()}
        style={{
          color,
          display: 'flex',
          gap: '8px',
          wordBreak: 'break-all',
          lineHeight: 1.6,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem'
        }}
      >
        <span style={{ color: 'var(--text-muted)', userSelect: 'none' }}>❯</span>
        <span>{line}</span>
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '380px',
        backgroundColor: '#05070b',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          padding: '10px 16px',
          backgroundColor: '#0a0e17',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
          </div>
          <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            agent-console@metamorph
          </span>

          <span
            style={{
              fontSize: '0.6875rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: wsConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              color: wsConnected ? 'var(--status-success)' : 'var(--status-danger)',
              fontWeight: 600
            }}
          >
            {wsConnected ? '● Live Stream Connected' : '○ Polling Fallback'}
          </span>
        </div>

        {/* Filter & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#121824',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Logs ({displayLogs.length})</option>
            <option value="error">Errors Only</option>
            <option value="compiler">Compiler (TSC)</option>
            <option value="agent">Agents & Nodes</option>
          </select>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: autoScroll ? 'rgba(6, 182, 212, 0.15)' : '#121824',
              color: autoScroll ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title={autoScroll ? 'Pause auto-scroll' : 'Resume auto-scroll'}
          >
            {autoScroll ? <Pause size={12} /> : <Play size={12} />}
            <span>Scroll</span>
          </button>

          <button
            onClick={handleCopy}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#121824',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Copy logs"
          >
            {copied ? <Check size={12} style={{ color: 'var(--status-success)' }} /> : <Copy size={12} />}
          </button>

          <button
            onClick={handleClear}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#121824',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Clear output"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        {filteredLogs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
            No log events recorded yet. Waiting for pipeline activity...
          </div>
        ) : (
          filteredLogs.map(formatLogLine)
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}

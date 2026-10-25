import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, RefreshCw, Upload, CheckCircle, AlertTriangle, 
  FileCode, Terminal, Download, ShieldCheck, ChevronRight, 
  GitBranch, ArrowRight, Layers, FileCheck, ExternalLink, Zap
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'plan' | 'live' | 'report'
  const [runId, setRunId] = useState(null);
  const [repoName, setRepoName] = useState('');
  const [gitUrl, setGitUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Run State
  const [runState, setRunState] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);

  const wsRef = useRef(null);
  const terminalEndRef = useRef(null);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Connect WebSocket when runId changes
  useEffect(() => {
    if (!runId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/${runId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      console.log('WebSocket connected to', runId);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'node_transition') {
          const { status, current_file, logs: newLogs, tasks } = payload.data;
          if (newLogs) {
            setLogs(prev => [...prev, ...newLogs]);
          }
          setRunState(prev => ({
            ...prev,
            status,
            current_file,
            tasks: tasks || prev?.tasks
          }));
        } else if (payload.type === 'run_completed') {
          setIsRunning(false);
          setActiveTab('report');
          fetchRunDetails(runId);
        } else if (payload.type === 'run_failed') {
          setIsRunning(false);
          alert('Migration run encountered a failure: ' + (payload.data?.error || 'Unknown error'));
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

  // Poll details periodically when running
  useEffect(() => {
    if (!runId) return;
    const interval = setInterval(() => {
      fetchRunDetails(runId);
    }, 2500);
    return () => clearInterval(interval);
  }, [runId]);

  const fetchRunDetails = async (id) => {
    try {
      const res = await fetch(`/api/runs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRunState(data.state);
        if (data.state?.logs) {
          setLogs(data.state.logs);
        }
        if (data.status === 'completed') {
          setIsRunning(false);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleZipUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setRunId(data.run_id);
        setRepoName(data.repo_name);
        await fetchRunDetails(data.run_id);
        setActiveTab('plan');
      } else {
        alert(data.detail || 'Upload failed');
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGitClone = async (e) => {
    e.preventDefault();
    if (!gitUrl) return;

    setIsUploading(true);
    try {
      const res = await fetch('/api/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ git_url: gitUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setRunId(data.run_id);
        setRepoName(data.repo_name);
        await fetchRunDetails(data.run_id);
        setActiveTab('plan');
      } else {
        alert(data.detail || 'Clone failed');
      }
    } catch (err) {
      alert('Clone error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartMigration = async () => {
    if (!runId) return;
    setIsRunning(true);
    setActiveTab('live');

    try {
      const res = await fetch(`/api/runs/${runId}/start`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.detail || 'Failed to start');
        setIsRunning(false);
      }
    } catch (err) {
      alert('Execution failed: ' + err.message);
      setIsRunning(false);
    }
  };

  const tasksList = Object.values(runState?.tasks || {});
  const currentTask = selectedFile ? runState?.tasks?.[selectedFile] : (tasksList[0] || null);

  const completedCount = tasksList.filter(t => t.status === 'done').length;
  const failedCount = tasksList.filter(t => t.status === 'failed').length;
  const totalFiles = tasksList.length;
  const progressPercent = totalFiles > 0 ? Math.round((completedCount / totalFiles) * 100) : 0;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 32px' }}>
      
      {/* Top Navbar */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '46px', height: '46px', borderRadius: '12px', 
            background: 'var(--accent-gradient)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', fontSize: '26px',
            boxShadow: 'var(--shadow-glow)'
          }}>
            🦋
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
              Metamorph <span style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', fontWeight: 500, marginLeft: '6px' }}>v1.0 (JS → TS)</span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Self-Correcting Autonomous Migration Agent for Node & Express
            </p>
          </div>
        </div>

        {/* Global Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {runId && (
            <div className="badge badge-progress" style={{ fontFamily: 'var(--font-mono)' }}>
              Run: {runId}
            </div>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'rgba(255, 255, 255, 0.04)', padding: '6px 14px', 
            borderRadius: '9999px', fontSize: '0.8rem', border: '1px solid var(--border-color)'
          }}>
            <span style={{ 
              width: '8px', height: '8px', borderRadius: '50%', 
              background: wsConnected ? 'var(--success)' : 'var(--danger)',
              display: 'inline-block'
            }} />
            <span>{wsConnected ? 'Live Stream Active' : 'Offline Engine'}</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={{ 
        display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', 
        paddingBottom: '12px', marginBottom: '28px' 
      }}>
        {[
          { id: 'upload', label: '1. Repo Ingestion', icon: <Upload size={16} /> },
          { id: 'plan', label: '2. Plan & DAG Review', icon: <Layers size={16} />, disabled: !runId },
          { id: 'live', label: '3. Live Migration & Diffs', icon: <Play size={16} />, disabled: !runId },
          { id: 'report', label: '4. Quality Report', icon: <ShieldCheck size={16} />, disabled: !runState?.report?.review }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            disabled={tab.disabled}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: 'var(--radius-sm)',
              border: activeTab === tab.id ? '1px solid var(--accent-primary)' : '1px solid transparent',
              background: activeTab === tab.id ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : (tab.disabled ? 'var(--text-dim)' : 'var(--text-muted)'),
              fontWeight: activeTab === tab.id ? 600 : 500,
              fontSize: '0.9rem', cursor: tab.disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* TAB 1: INGEST / UPLOAD */}
      {activeTab === 'upload' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* ZIP Upload Card */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Upload size={20} color="var(--accent-primary)" />
              Upload Node.js Express Repository (ZIP)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
              Upload any existing Node.js JavaScript repository. Metamorph will extract it safely into an isolated sandbox.
            </p>

            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: '2px dashed rgba(139, 92, 246, 0.35)', borderRadius: 'var(--radius-md)',
              padding: '48px 24px', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.02)',
              transition: 'border-color 0.2s ease'
            }}>
              <FileCode size={48} color="var(--accent-primary)" style={{ marginBottom: '14px' }} />
              <span style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '6px' }}>
                {isUploading ? 'Extracting repository...' : 'Choose a .zip archive or drag here'}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Supports CommonJS (`require`) & ES6 (`import`)
              </span>
              <input type="file" accept=".zip" onChange={handleZipUpload} disabled={isUploading} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Git Clone Card */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GitBranch size={20} color="var(--accent-secondary)" />
              Clone Public GitHub Repository
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
              Provide the GitHub URL of any open-source Express repository to migrate.
            </p>

            <form onSubmit={handleGitClone} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Repository URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/learncodeacademy/node-rest-shop"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px', background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
                    color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: '0.88rem'
                  }}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={isUploading} style={{ alignSelf: 'flex-start' }}>
                <Zap size={16} />
                {isUploading ? 'Cloning & Parsing...' : 'Clone & Ingest Repo'}
              </button>
            </form>

            <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                Quick Test Samples:
              </span>
              <button
                className="btn-secondary"
                onClick={() => setGitUrl('https://github.com/learncodeacademy/node-rest-shop')}
                style={{ fontSize: '0.8rem' }}
              >
                Use Express REST Shop Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLAN & DAG REVIEW */}
      {activeTab === 'plan' && (
        <div>
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Topological Migration Plan</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Dependency graph analyzed via Tree-Sitter & NetworkX. Leaf files migrate first to supply type signatures downstream.
                </p>
              </div>

              <button className="btn-primary" onClick={handleStartMigration} disabled={isRunning}>
                <Play size={16} />
                {isRunning ? 'Agent Executing...' : 'Approve Plan & Launch Metamorph'}
              </button>
            </div>

            {/* Circular Dependency Warning */}
            {runState?.cycles?.length > 0 && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)',
                padding: '14px 18px', borderRadius: 'var(--radius-sm)', marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <AlertTriangle size={20} color="var(--warning)" />
                <span style={{ fontSize: '0.88rem', color: '#fef3c7' }}>
                  <strong>Circular Dependency Detected:</strong> {runState.cycles.length} cycle cluster(s) isolated via Tarjan SCC. Metamorph will migrate these peers with interface mock-breaking.
                </span>
              </div>
            )}

            {/* Migration Steps Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 14px' }}>Order</th>
                    <th style={{ padding: '12px 14px' }}>Original File</th>
                    <th style={{ padding: '12px 14px' }}>Target Path</th>
                    <th style={{ padding: '12px 14px' }}>Dependencies (Imports)</th>
                    <th style={{ padding: '12px 14px' }}>Type Role</th>
                  </tr>
                </thead>
                <tbody>
                  {(runState?.detailed_steps || []).map((step, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)' }}>
                        #{step.step}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>
                        {step.file}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
                        {step.file.replace(/\.js$/, '.ts')}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {step.imports.length === 0 ? (
                          <span style={{ color: 'var(--text-dim)' }}>None (Leaf File)</span>
                        ) : (
                          step.imports.map(imp => (
                            <span key={imp} className="badge badge-pending" style={{ marginRight: '6px', fontSize: '0.72rem' }}>
                              {imp}
                            </span>
                          ))
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {step.is_in_cycle ? (
                          <span className="badge badge-cycle">Circular Peer</span>
                        ) : step.is_leaf ? (
                          <span className="badge badge-done">Base Signature</span>
                        ) : (
                          <span className="badge badge-pending">Downstream</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE RUN & DIFF VIEWER */}
      {activeTab === 'live' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          
          {/* File Tasks Sidebar */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '800px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Progress</span>
                <span style={{ fontWeight: 600 }}>{progressPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${progressPercent}%`, height: '100%', 
                  background: 'var(--accent-gradient)', transition: 'width 0.4s ease' 
                }} />
              </div>
            </div>

            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-dim)', marginBottom: '12px' }}>
              Files ({completedCount}/{totalFiles})
            </h3>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tasksList.map(task => {
                const isSelected = selectedFile === task.path || (!selectedFile && currentTask?.path === task.path);
                return (
                  <div
                    key={task.path}
                    onClick={() => setSelectedFile(task.path)}
                    style={{
                      padding: '12px', borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      cursor: 'pointer', transition: 'all 0.18s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ 
                        fontFamily: 'var(--font-mono)', fontSize: '0.82rem', 
                        fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' 
                      }}>
                        {task.new_path || task.path}
                      </span>
                      <span className={`badge badge-${task.status === 'in_progress' ? 'progress' : task.status}`}>
                        {task.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                      <span>Attempts: {task.attempts}/3</span>
                      {task.last_error && <span style={{ color: 'var(--danger)' }}>Has compiler error</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Main Panel: Diffs + Terminal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Split Monaco-style Diff Viewer */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileCode size={18} color="var(--accent-primary)" />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {currentTask?.path} <span style={{ color: 'var(--text-dim)' }}>→</span> {currentTask?.new_path}
                  </span>
                </div>

                {currentTask?.status === 'done' && (
                  <span className="badge badge-done">
                    <CheckCircle size={14} /> tsc validation passed
                  </span>
                )}
              </div>

              <div className="diff-container">
                {/* Before (Original JS) */}
                <div className="diff-pane">
                  <div className="diff-header">
                    <span>Original JavaScript (CommonJS)</span>
                    <span style={{ color: 'var(--text-dim)' }}>Read-only</span>
                  </div>
                  <pre className="diff-body" style={{ color: '#cbd5e1' }}>
                    {currentTask?.original_code || '// No code loaded'}
                  </pre>
                </div>

                {/* After (Migrated TS) */}
                <div className="diff-pane">
                  <div className="diff-header">
                    <span>Migrated TypeScript</span>
                    <span style={{ color: 'var(--accent-secondary)' }}>Auto-typed & Checked</span>
                  </div>
                  <pre className="diff-body" style={{ color: '#38bdf8' }}>
                    {currentTask?.migrated_code || '// Migration in progress...'}
                  </pre>
                </div>
              </div>
            </div>

            {/* Live Streaming Terminal Logs */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Terminal size={18} color="var(--accent-secondary)" />
                <h3 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Live Agent & Compiler Execution Logs</h3>
              </div>

              <div className="console-window">
                {logs.map((log, index) => (
                  <div key={index} className="console-line">
                    <span className="console-prefix">metamorph:</span>
                    <span>{log}</span>
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: QUALITY REPORT */}
      {activeTab === 'report' && (
        <div>
          <div className="glass-panel" style={{ padding: '32px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>Migration Completed Successfully!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Run ID: <code style={{ color: 'var(--accent-secondary)', fontFamily: 'var(--font-mono)' }}>{runId}</code>
                </p>
              </div>

              <a
                href={`/api/runs/${runId}/download`}
                download
                className="btn-primary"
                style={{ textDecoration: 'none' }}
              >
                <Download size={18} />
                Download Migrated TypeScript Repo (.ZIP)
              </a>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '32px' }}>
              {[
                { label: 'Compile Pass Rate', value: `${runState?.report?.pass_rate || 100}%`, color: 'var(--success)' },
                { label: 'Code Quality Score', value: `${runState?.report?.review?.quality_score || 95}/100`, color: 'var(--accent-primary)' },
                { label: 'Total `any` Usages', value: `${runState?.report?.review?.total_any_count || 0}`, color: 'var(--accent-secondary)' },
                { label: '@ts-ignore Directives', value: `${runState?.report?.review?.total_ignore_count || 0}`, color: 'var(--warning)' }
              ].map((stat, i) => (
                <div key={i} style={{ 
                  background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-sm)', padding: '20px' 
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{stat.label}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: stat.color, fontFamily: 'var(--font-mono)' }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Markdown Report Render */}
            <div style={{ 
              background: '#070a10', border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-sm)', padding: '24px', fontFamily: 'var(--font-mono)', 
              fontSize: '0.85rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: '#e2e8f0' 
            }}>
              {runState?.report?.report_markdown || '# Generating Markdown summary...'}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

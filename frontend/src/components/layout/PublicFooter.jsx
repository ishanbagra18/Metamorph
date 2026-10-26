import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Terminal, Zap, Shield, Heart } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '64px',
        paddingBottom: '32px'
      }}
    >
      <div className="container-custom">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '48px'
          }}
        >
          {/* Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>🦋</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Metamorph
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Autonomous, AST-directed multi-agent system powered by LangGraph, Qdrant RAG, and isolated sandbox compiler loops for effortless JavaScript to TypeScript migrations.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--status-success)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }} />
              Migration Engine Online (v1.0.0)
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              Product
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li><a href="/#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Multi-Agent Pipeline</a></li>
              <li><a href="/#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Topological Execution</a></li>
              <li><a href="/#architecture" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Qdrant Vector RAG</a></li>
              <li><a href="/#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Pricing & Plans</a></li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              Developers
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li><a href="/docs" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>REST API Docs</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>GitHub Repository</a></li>
              <li><a href="/#faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Compiler Feedback Loop</a></li>
              <li><Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Developer Portal</Link></li>
            </ul>
          </div>

          {/* Security & Sandbox */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              Integrity & Safety
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
              Code is verified inside network-disabled Docker containers with zero network egress during static analysis and compilation.
            </p>
            <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)' }}>
              <Shield size={18} />
              <Terminal size={18} />
              <Zap size={18} />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            © {new Date().getFullYear()} Metamorph. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Register</Link>
            <a href="/docs" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>API</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

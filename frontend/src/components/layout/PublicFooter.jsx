import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';

export function PublicFooter() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '48px',
        paddingBottom: '32px'
      }}
    >
      <div className="container-custom">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            marginBottom: '40px'
          }}
        >
          {/* Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BrandLogo size={18} color="var(--text-primary)" />
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Metamorph
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '280px' }}>
              Compiler-guided TypeScript migration engine for Node.js and Express codebases.
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Core Pipeline v1.0.0 (Production)
            </div>
          </div>

          {/* Architecture */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
              Architecture
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
              <li><a href="/#architecture" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Tree-sitter AST Chunker</a></li>
              <li><a href="/#architecture" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Tarjan SCC Cycle Resolution</a></li>
              <li><a href="/#architecture" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Qdrant Vector Retrieval</a></li>
              <li><a href="/#workflow" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Sandbox Compiler Loop</a></li>
            </ul>
          </div>

          {/* Specifications */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
              Documentation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
              <li><a href="/llms.txt" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>llms.txt Specification</a></li>
              <li><a href="/sitemap.xml" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Sitemap Index</a></li>
              <li><a href="/robots.txt" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Robots Directives</a></li>
              <li><Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Developer Sign In</Link></li>
            </ul>
          </div>

          {/* Runtime Verification */}
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
              Verification
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Executes isolated npm install, npx tsc, and test ladder validation inside network-disabled containers.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            © {new Date().getFullYear()} Metamorph Technologies Inc. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '16px', fontFamily: 'var(--font-mono)' }}>
            <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>login</Link>
            <Link to="/register" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>register</Link>
            <a href="/sitemap.xml" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>sitemap</a>
            <a href="/robots.txt" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>robots</a>
            <a href="/llms.txt" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>llms.txt</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

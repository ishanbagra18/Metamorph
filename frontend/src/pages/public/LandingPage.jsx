import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Cpu,
  RefreshCw,
  GitBranch,
  Layers,
  FileCode,
  CheckCircle2,
  Zap,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'How does Metamorph handle circular dependencies in Express apps?',
      a: "Metamorph uses NetworkX and Tarjan's Strongly Connected Components (SCC) algorithm to detect cycles during the topological planning phase. Files in cycles are staged together with synthetic ambient type declarations to ensure zero compiler deadlock."
    },
    {
      q: 'Why does single-shot LLM migration fail on real-world repositories?',
      a: 'Single-shot prompts lack whole-repo dependency ordering, produce untyped "any" leaks, hallucinate non-existent imports, and lose interface signatures from sibling modules. Metamorph migrates leaf modules first and feeds upstream signatures downstream via an AST-aware Qdrant RAG pipeline.'
    },
    {
      q: 'How does the self-healing compiler feedback loop work?',
      a: 'Whenever an agent proposes TypeScript code, tsc --noEmit executes inside an isolated Docker sandbox. If diagnostic errors occur, the exact line, column, error code, and compiler message are fed back to the LLM for targeted repair (up to 3 attempts).'
    },
    {
      q: 'Can I run Metamorph without a Docker daemon running?',
      a: 'Yes! Metamorph has dual-mode execution with automatic fallback to isolated Python subprocess execution if Docker is not available on the host machine.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '96px', paddingBottom: '96px' }}>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '80px 0 60px',
          overflow: 'hidden'
        }}
        className="bg-glow-radial"
      >
        <div className="container-custom" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: 'var(--accent-cyan)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '24px'
            }}
          >
            <Sparkles size={14} />
            <span>Autonomous Multi-Agent JS → TS Migration</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              maxWidth: '960px',
              margin: '0 auto 24px',
              color: 'var(--text-primary)'
            }}
          >
            Migrate Legacy JavaScript Repos to <span className="gradient-text-cyan">Strict TypeScript</span> with Zero Guesswork.
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              maxWidth: '740px',
              margin: '0 auto 36px',
              lineHeight: 1.6
            }}
          >
            Self-correcting, AST-directed multi-agent system powered by <strong>LangGraph</strong>, <strong>Qdrant RAG</strong>, and live <strong>TypeScript compiler feedback loops</strong>. No blind prompts. No untyped any leaks.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to={isAuthenticated ? '/dashboard' : '/register'} style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="lg" icon={ArrowRight}>
                {isAuthenticated ? 'Open Workspace' : 'Start Free Migration'}
              </Button>
            </Link>
            <a href="#how-it-works" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="lg">
                Explore Architecture
              </Button>
            </a>
          </div>

          {/* Interactive Feature Pills */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '48px',
              flexWrap: 'wrap',
              fontSize: '0.875rem',
              color: 'var(--text-muted)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--status-success)' }} />
              <span>Topological Leaf-First Ordering</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--status-success)' }} />
              <span>Qdrant AST Vector RAG</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--status-success)' }} />
              <span>Self-Healing tsc Compiler Ladder</span>
            </div>
          </div>
        </div>
      </section>

      {/* Code Transformation Demo Preview */}
      <section className="container-custom">
        <div
          className="glass-panel-elevated"
          style={{
            padding: '24px',
            backgroundColor: '#0a0e17',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-glow-cyan)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              </div>
              <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                routes/users.js → routes/users.ts
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--status-success)', fontWeight: 600 }}>
              ✓ 0 TS Errors • 0 any Leaks • Pure ESM
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', marginBottom: '8px' }}>
                BEFORE: LEGACY JAVASCRIPT
              </div>
              <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
{`const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

router.get('/:id', async (req, res) => {
  const user = await userService.find(req.params.id);
  res.json(user);
});`}
              </pre>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                AFTER: METAMORPH STRICT TYPESCRIPT
              </div>
              <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
{`import { Router, Request, Response } from 'express';
import { userService } from '../services/userService.js';
import type { UserProfile } from '../types/user.js';

const router: Router = Router();

router.get('/:id', async (req: Request<{ id: string }>, res: Response<UserProfile>): Promise<void> => {
  const user = await userService.find(req.params.id);
  res.json(user);
});`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works: 4 Pipeline Stages */}
      <section id="how-it-works" className="container-custom">
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Multi-Agent Orchestration Architecture
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '8px auto 0' }}>
            Each file undergoes specialized agent phases coordinated through a cyclical LangGraph state machine.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {/* Phase 1 */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={22} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>STAGE 1</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>AST Ingestion & RAG Indexing</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Tree-sitter extracts function signatures, Express route handlers, and module requirements. Chunks are embedded into Qdrant for semantic similarity retrieval.
            </p>
          </div>

          {/* Phase 2 */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GitBranch size={22} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple)' }}>STAGE 2</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Topological Planning & SCC</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              NetworkX computes a leaf-first migration sequence so dependencies migrate before consumers. Circular dependencies are resolved via Tarjan's SCC clusters.
            </p>
          </div>

          {/* Phase 3 */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={22} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-success)' }}>STAGE 3</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Self-Healing Compiler Loop</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The Validation Agent runs `tsc --noEmit` in an isolated sandbox. Exact diagnostic errors (line, code, message) trigger the Repair Agent ladder for up to 3 automated fix attempts.
            </p>
          </div>

          {/* Phase 4 */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--status-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-warning)' }}>STAGE 4</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Review & Quality Scoring</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The Review Agent audits the codebase for any leaks or @ts-ignore suppression, scores the repository from 0–100, and packages a ready-to-deploy TypeScript repository ZIP.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing / Plan Tiers */}
      <section id="pricing" className="container-custom">
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Transparent Plans for Every Repository
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '8px auto 0' }}>
            Scale autonomous migrations across microservices or enterprise monoliths.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Free Tier */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Community Developer</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '12px 0' }}>$0 <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ month</span></div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>For individual developers migrating personal tools & libraries.</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--status-success)' }} /> Unlimited ZIP uploads (up to 50 files)</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--status-success)' }} /> Topological execution planner</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--status-success)' }} /> Isolated subprocess sandbox</li>
              </ul>
            </div>
            <Link to="/register" style={{ textDecoration: 'none', marginTop: '32px' }}>
              <Button variant="outline" style={{ width: '100%' }}>Start Free</Button>
            </Link>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="glass-panel-elevated" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '2px solid var(--accent-cyan)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', right: '24px', backgroundColor: 'var(--accent-cyan)', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, padding: '2px 10px', borderRadius: 'var(--radius-full)' }}>
              POPULAR
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Engineering Team</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '12px 0' }}>$49 <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ seat / mo</span></div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>For engineering teams modernizing production Express services.</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> Full Qdrant Vector RAG retrieval</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> Docker sandbox container verification</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> Up to 3 self-healing repair attempts</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--accent-cyan)' }} /> Quality audit and downloadable ZIPs</li>
              </ul>
            </div>
            <Link to="/register" style={{ textDecoration: 'none', marginTop: '32px' }}>
              <Button variant="primary" style={{ width: '100%' }}>Get Team Access</Button>
            </Link>
          </div>

          {/* Enterprise Tier */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Enterprise Custom</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '12px 0' }}>Custom</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Dedicated self-hosted deployments for regulated architectures.</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--status-success)' }} /> On-premise air-gapped LLM models</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--status-success)' }} /> Custom lint & architectural rules</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} style={{ color: 'var(--status-success)' }} /> Dedicated support & migration SLA</li>
              </ul>
            </div>
            <Link to="/register" style={{ textDecoration: 'none', marginTop: '32px' }}>
              <Button variant="outline" style={{ width: '100%' }}>Contact Sales</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="container-custom" style={{ maxWidth: '800px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: '18px 24px',
                  cursor: 'pointer'
                }}
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {isOpen && (
                  <p style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="container-custom">
        <div
          className="glass-panel-elevated"
          style={{
            padding: '64px 32px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-glow-purple)'
          }}
        >
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Ready to Transform Your Codebase Today?
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 32px' }}>
            Stop spending months manually rewriting models and routes. Let Metamorph's multi-agent system deliver strictly-typed TypeScript repositories in minutes.
          </p>
          <Link to={isAuthenticated ? '/dashboard' : '/register'} style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg" icon={Sparkles}>
              {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

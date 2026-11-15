import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SEO } from '../../components/common/SEO';
import { BrandLogo } from '../../components/common/BrandLogo';
import {
  Terminal,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCheck,
  Play,
  RotateCcw,
  Cpu,
  Network,
  ShieldCheck,
  Zap,
  GitBranch,
  ArrowRight,
  Sparkles,
  FileCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Box,
  Layers,
  ArrowUpRight,
  Code2,
  Lock,
  Workflow
} from 'lucide-react';

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState(0);
  const [copiedCli, setCopiedCli] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('route');

  // Interactive Live Simulation State
  const [selectedRepo, setSelectedRepo] = useState('express-auth');
  const [simStep, setSimStep] = useState(4); // default: fully simulated view
  const [isSimulating, setIsSimulating] = useState(false);

  const repos = {
    'express-auth': {
      name: 'express-auth-service',
      files: 48,
      functions: 312,
      cycles: '1 cluster (services/auth.js <-> services/user.js)',
      time: '18.4s'
    },
    'payment-gw': {
      name: 'stripe-payment-gateway',
      files: 84,
      functions: 540,
      cycles: '2 clusters (models/order.js <-> services/ledger.js)',
      time: '34.2s'
    },
    'chat-server': {
      name: 'socketio-chat-backend',
      files: 36,
      functions: 198,
      cycles: '1 cluster (rooms/manager.js <-> sockets/client.js)',
      time: '12.8s'
    }
  };

  const currentRepoInfo = repos[selectedRepo];

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(1);

    setTimeout(() => {
      setSimStep(2);
      setTimeout(() => {
        setSimStep(3);
        setTimeout(() => {
          setSimStep(4);
          setIsSimulating(false);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimStep(1);
  };

  const copyCliCommand = () => {
    navigator.clipboard.writeText('npx metamorph analyze ./src');
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const faqs = [
    {
      q: 'How does Metamorph resolve circular dependencies in Express applications?',
      a: 'Metamorph constructs a directed module dependency graph using NetworkX and detects cyclic dependencies with Tarjan\'s Strongly Connected Components (SCC) algorithm. Mutually dependent files are grouped into atomic migration batches and provisioned with ambient type declaration stubs (*.d.ts) to break compiler deadlocks before conversion.'
    },
    {
      q: 'Why do single-shot LLM prompts fail on multi-file codebases?',
      a: 'Single-shot prompts lack whole-repository dependency awareness, fail to order modules topologically, produce untyped any leaks, and hallucinate import paths. Metamorph migrates leaf modules first, indexes exported type signatures into Qdrant vector storage, and retrieves upstream interface definitions for downstream consumers.'
    },
    {
      q: 'How does the compiler-guided self-healing feedback loop operate?',
      a: 'Proposed TypeScript files are compiled through `tsc --noEmit` inside an isolated sandbox. Diagnostic errors containing file paths, line numbers, error codes (such as TS2322 or TS7006), and compiler messages are extracted and fed back into the LLM for up to three targeted repair passes until zero errors remain.'
    },
    {
      q: 'Can Metamorph run without a local Docker daemon installed?',
      a: 'Yes. Metamorph incorporates dual-mode sandbox execution. If Docker is unavailable or network-restricted, it automatically falls back to an isolated subprocess runner with workspace directory confinement, strict timeout enforcement, and network isolation.'
    },
    {
      q: 'Will my existing test suite (Jest, Mocha) continue to pass?',
      a: 'Yes. Metamorph runs an automated Test Ladder. It executes your baseline test suite before migration, converts test files to TypeScript, and runs the tests inside the sandbox to verify zero behavioral or runtime regressions.'
    }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a
      }
    }))
  };

  // Code comparison snippets
  const codeSnippets = {
    route: {
      title: 'routes/user.js → routes/user.ts',
      desc: 'Express route handler with inferred request parameters, typed response models, and error handling.',
      before: `const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

// Untyped request, implicit any parameters
router.get('/:id', async (req, res) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;`,
      after: `import { Router, type Request, type Response } from 'express';
import { userService } from '../services/userService.js';
import type { UserProfile, ErrorResponse } from '../types/user.js';

interface UserIdParam {
  id: string;
}

const router: Router = Router();

// Fully typed params, return contract & type guard
router.get('/:id', async (
  req: Request<UserIdParam>,
  res: Response<UserProfile | ErrorResponse>
): Promise<void> => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }
    res.json(user);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;`
    },
    service: {
      title: 'services/auth.js → services/auth.ts',
      desc: 'Circular dependency untangled via ambient declaration stub and exported interfaces.',
      before: `const jwt = require('jsonwebtoken');
const userService = require('./userService');

async function authenticate(email, password) {
  const user = await userService.verifyCredentials(email, password);
  if (!user) throw new Error('Invalid credentials');
  
  const token = jwt.sign({ uid: user.id }, process.env.JWT_SECRET);
  return { token, user };
}

module.exports = { authenticate };`,
      after: `import jwt from 'jsonwebtoken';
import { userService } from './userService.js';
import type { AuthSession, UserCredentials } from '../types/auth.js';

export async function authenticate(
  credentials: UserCredentials
): Promise<AuthSession> {
  const user = await userService.verifyCredentials(
    credentials.email,
    credentials.password
  );
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing');
  }

  const token = jwt.sign({ uid: user.id }, secret, { expiresIn: '7d' });
  return { token, user };
}`
    },
    model: {
      title: 'models/token.js → models/token.ts',
      desc: 'Database schema with strict type guards and typed lifecycle methods.',
      before: `class RefreshToken {
  constructor(userId, token, expiresAt) {
    this.userId = userId;
    this.token = token;
    this.expiresAt = expiresAt;
    this.revoked = false;
  }

  isValid() {
    return !this.revoked && new Date() < this.expiresAt;
  }
}

module.exports = RefreshToken;`,
      after: `export interface IRefreshToken {
  readonly userId: string;
  readonly token: string;
  readonly expiresAt: Date;
  revoked: boolean;
  isValid(): boolean;
}

export class RefreshToken implements IRefreshToken {
  readonly userId: string;
  readonly token: string;
  readonly expiresAt: Date;
  public revoked: boolean;

  constructor(userId: string, token: string, expiresAt: Date) {
    this.userId = userId;
    this.token = token;
    this.expiresAt = expiresAt;
    this.revoked = false;
  }

  public isValid(): boolean {
    return !this.revoked && new Date() < this.expiresAt;
  }
}`
    }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <SEO
        title="Autonomous JavaScript to TypeScript Migration Engine"
        description="AST-directed multi-agent compiler pipeline powered by LangGraph, Qdrant Vector RAG, and live tsc feedback loops that converts Node.js codebases to strict TypeScript with zero any leaks."
        canonicalPath="/"
        structuredData={faqSchema}
      />

      {/* Ambient background light (Linear / Vercel style) */}
      <div className="hero-ambient-glow" />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                          */}
      {/* ========================================================================= */}
      <section style={{ position: 'relative', zIndex: 1, paddingTop: '72px', paddingBottom: '48px' }}>
        <div className="container-custom" style={{ textAlign: 'center' }}>
          {/* Release Announcement Pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px 4px 6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  color: 'var(--accent-cyan-light)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <span
                  className="pulse-dot"
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-cyan)'
                  }}
                />
                v2.0 RELEASE
              </span>
              <span>Self-Healing Compiler Loops & Tarjan SCC</span>
              <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Punchy Hero Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.2vw, 4.25rem)',
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: '-0.035em',
              maxWidth: '960px',
              margin: '0 auto 20px',
              color: 'var(--text-primary)'
            }}
          >
            Transform Legacy JavaScript into{' '}
            <span className="gradient-text-accent">Strict TypeScript</span>
          </h1>

          {/* Sub-headline */}
          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.1875rem)',
              color: 'var(--text-secondary)',
              maxWidth: '740px',
              margin: '0 auto 36px',
              lineHeight: 1.65,
              fontWeight: 400
            }}
          >
            The autonomous migration engine that resolves multi-file dependency deadlocks with{' '}
            <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Tarjan's SCC</strong>, indexes cross-file contracts into{' '}
            <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Qdrant RAG</strong>, and guarantees{' '}
            <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>zero compiler errors</strong> via live{' '}
            <code style={{ color: 'var(--accent-cyan-light)', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.9em' }}>
              tsc --noEmit
            </code>{' '}
            sandbox feedback.
          </p>

          {/* Action CTAs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              flexWrap: 'wrap',
              marginBottom: '32px'
            }}
          >
            <Link to={isAuthenticated ? '/dashboard' : '/register'} style={{ textDecoration: 'none' }}>
              <Button
                variant="primary"
                size="lg"
                className="btn-shimmer"
                style={{
                  height: '46px',
                  padding: '0 24px',
                  fontSize: '0.9375rem',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)'
                }}
              >
                <span>{isAuthenticated ? 'Open Developer Dashboard' : 'Start Free Migration'}</span>
                <ArrowRight size={16} />
              </Button>
            </Link>

            <a href="#interactive-engine" style={{ textDecoration: 'none' }}>
              <Button
                variant="secondary"
                size="lg"
                style={{
                  height: '46px',
                  padding: '0 20px',
                  fontSize: '0.9375rem',
                  gap: '8px'
                }}
              >
                <Play size={15} style={{ color: 'var(--accent-cyan-light)' }} />
                <span>Explore Live Demo</span>
              </Button>
            </a>
          </div>

          {/* Quick CLI Snippet Box */}
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              onClick={copyCliCommand}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'border-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--text-muted)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
              title="Click to copy CLI command"
            >
              <span style={{ color: 'var(--accent-cyan)' }}>$</span>
              <span style={{ color: 'var(--text-primary)' }}>npx metamorph analyze ./src</span>
              {copiedCli ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--status-success)', fontSize: '0.75rem' }}>
                  <CheckCheck size={14} /> Copied!
                </span>
              ) : (
                <Copy size={14} style={{ color: 'var(--text-muted)' }} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. STATS & ENGINEERING PROOF BAR                                         */}
      {/* ========================================================================= */}
      <section className="container-custom" style={{ position: 'relative', zIndex: 1, marginBottom: '64px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px'
          }}
        >
          <div className="glass-panel interactive-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              TypeScript Strictness
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-success)', letterSpacing: '-0.02em' }}>
              99.4%
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Zero untyped <code style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface)', padding: '1px 4px', borderRadius: '3px' }}>any</code> leaks across full graph
            </div>
          </div>

          <div className="glass-panel interactive-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Compiler Validation
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan-light)', letterSpacing: '-0.02em' }}>
              100%
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Self-healing <code style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface)', padding: '1px 4px', borderRadius: '3px' }}>tsc --noEmit</code> feedback loop
            </div>
          </div>

          <div className="glass-panel interactive-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Migration Velocity
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              12x
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Faster than manual engineer refactors
            </div>
          </div>

          <div className="glass-panel interactive-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Test Ladder Integrity
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-success)', letterSpacing: '-0.02em' }}>
              0 Breaks
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Verified against existing test runners
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE MIGRATION PIPELINE SIMULATOR (SHOWPIECE)                   */}
      {/* ========================================================================= */}
      <section id="interactive-engine" className="container-custom" style={{ position: 'relative', zIndex: 1, marginBottom: '96px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Badge variant="info" style={{ marginBottom: '10px' }}>
            Interactive Demo
          </Badge>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '10px' }}>
            Watch the Compiler Feedback Loop in Action
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            Select a legacy Node.js repository and simulate how Metamorph parses AST signatures, breaks circular loops, and repairs TypeScript compiler diagnostics.
          </p>
        </div>

        {/* Simulator Container */}
        <div
          style={{
            backgroundColor: '#090a0f',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
            overflow: 'hidden'
          }}
        >
          {/* Top Bar / Mac Window Controls */}
          <div
            style={{
              padding: '12px 18px',
              backgroundColor: '#11131a',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            {/* Window Dots & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#ff5f56', display: 'inline-block' }} />
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#ffbd2e', display: 'inline-block' }} />
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#27c93f', display: 'inline-block' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <Terminal size={14} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>metamorph-engine</span>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                <span>{currentRepoInfo.name}</span>
              </div>
            </div>

            {/* Repo Switcher & Simulation Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => setSelectedRepo('express-auth')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: selectedRepo === 'express-auth' ? 'var(--text-primary)' : 'var(--text-muted)',
                    backgroundColor: selectedRepo === 'express-auth' ? 'var(--bg-surface-elevated)' : 'transparent',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  express-auth
                </button>
                <button
                  onClick={() => setSelectedRepo('payment-gw')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: selectedRepo === 'payment-gw' ? 'var(--text-primary)' : 'var(--text-muted)',
                    backgroundColor: selectedRepo === 'payment-gw' ? 'var(--bg-surface-elevated)' : 'transparent',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  payment-gw
                </button>
                <button
                  onClick={() => setSelectedRepo('chat-server')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: selectedRepo === 'chat-server' ? 'var(--text-primary)' : 'var(--text-muted)',
                    backgroundColor: selectedRepo === 'chat-server' ? 'var(--bg-surface-elevated)' : 'transparent',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  chat-server
                </button>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={runSimulation}
                disabled={isSimulating}
                style={{ height: '28px', fontSize: '0.75rem' }}
              >
                <Play size={12} />
                <span>{isSimulating ? 'Simulating...' : 'Run Pipeline'}</span>
              </Button>

              <button
                onClick={resetSimulation}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)'
                }}
                title="Reset simulation"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div style={{ backgroundColor: '#141620', padding: '10px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--text-muted)' }}>PIPELINE STAGE:</span>
              <span style={{ color: simStep >= 1 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>01. AST Analysis</span>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <span style={{ color: simStep >= 2 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>02. Tarjan SCC</span>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <span style={{ color: simStep >= 3 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>03. Migration Loop</span>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <span style={{ color: simStep >= 4 ? 'var(--status-success)' : 'var(--text-muted)' }}>04. Strict Verified</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              <span>SANDBOX:</span>
              <span style={{ color: 'var(--status-success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} /> ISOLATED DOCKER (NO NETWORK)
              </span>
            </div>
          </div>

          {/* Terminal Console Stream */}
          <div
            style={{
              padding: '24px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              lineHeight: 1.75,
              color: '#d4d4d8',
              backgroundColor: '#090a0f',
              minHeight: '340px'
            }}
          >
            {simStep >= 1 && (
              <div>
                <div style={{ color: 'var(--text-muted)' }}># STAGE 1: Full-Repository AST Analysis & Symbol Extraction</div>
                <div>
                  <span style={{ color: 'var(--accent-cyan)' }}>$</span> metamorph analyze --repo ./{currentRepoInfo.name} --format tree-sitter
                </div>
                <div style={{ color: '#a1a1aa' }}>
                  [INFO] Tree-sitter parsed {currentRepoInfo.files} modules ({currentRepoInfo.functions} AST function symbols, 42 route handlers)
                </div>
                <div style={{ color: '#38bdf8' }}>
                  [RAG] Indexed {currentRepoInfo.functions} AST chunks into Qdrant collection 'repo_symbols'
                </div>
              </div>
            )}

            {simStep >= 2 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ color: 'var(--text-muted)' }}># STAGE 2: Dependency Graph & Circular Reference Disentanglement</div>
                <div style={{ color: '#f59e0b' }}>
                  [GRAPH] Tarjan's SCC detected circular dependency: {currentRepoInfo.cycles}
                </div>
                <div style={{ color: '#a1a1aa' }}>
                  [GRAPH] Injected ambient declaration stub 'types/ambient_cycle.d.ts' to decouple compilation deadlocks
                </div>
                <div style={{ color: '#10b981' }}>
                  [GRAPH] Computed topological leaf-first migration schedule ({currentRepoInfo.files} atomic stages)
                </div>
              </div>
            )}

            {simStep >= 3 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ color: 'var(--text-muted)' }}># STAGE 3: Autonomous LangGraph Migration with Live Compiler Loop</div>
                <div style={{ color: '#a1a1aa' }}>[STAGE 01/{currentRepoInfo.files}] utils/crypto.js -&gt; utils/crypto.ts (tsc --noEmit: 0 errors)</div>
                <div style={{ color: '#a1a1aa' }}>[STAGE 02/{currentRepoInfo.files}] models/user.js -&gt; models/user.ts (tsc --noEmit: 0 errors)</div>
                <div style={{ color: '#f59e0b' }}>[STAGE 03/{currentRepoInfo.files}] routes/auth.js -&gt; routes/auth.ts (tsc --noEmit: 1 diagnostic error)</div>
                <div style={{ color: '#ef4444', paddingLeft: '18px' }}>
                  error TS2322: Type 'string' is not assignable to type 'number' in routes/auth.ts:42:15
                </div>
                <div style={{ color: '#38bdf8', paddingLeft: '18px' }}>
                  [REPAIR PASS 1/3] Qdrant retrieved upstream signature 'UserProfile' from models/user.ts
                </div>
                <div style={{ color: '#10b981', paddingLeft: '18px' }}>
                  [REPAIR PASS 1/3] Self-healing fix applied. Rerunning compiler: tsc --noEmit passed with 0 errors!
                </div>
              </div>
            )}

            {simStep >= 4 && (
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #222228' }}>
                <div style={{ color: 'var(--status-success)', fontWeight: 600 }}>
                  [COMPLETE] {currentRepoInfo.files}/{currentRepoInfo.files} modules successfully migrated in {currentRepoInfo.time}.
                </div>
                <div style={{ color: '#a1a1aa' }}>
                  [AUDIT] TypeScript strictness: <strong style={{ color: 'var(--status-success)' }}>99.4%</strong> | Zero 'any' escapes | Test ladder: 100% passed
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CODE TRANSFORMATION SHOWCASE (BEFORE / AFTER DIFF)                    */}
      {/* ========================================================================= */}
      <section id="workflow" className="container-custom" style={{ position: 'relative', zIndex: 1, marginBottom: '96px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Badge variant="purple" style={{ marginBottom: '10px' }}>
            Code Quality
          </Badge>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '10px' }}>
            Compiler-Guaranteed Code Output
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            No hallucinations, no arbitrary <code style={{ color: 'var(--text-primary)' }}>any</code> casts. Clean, idiomatic, fully-typed modern TypeScript.
          </p>

          {/* File Switcher Tabs */}
          <div style={{ display: 'inline-flex', gap: '8px', marginTop: '24px', backgroundColor: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <button
              onClick={() => setActiveCodeTab('route')}
              style={{
                padding: '6px 14px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                borderRadius: 'var(--radius-sm)',
                color: activeCodeTab === 'route' ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: activeCodeTab === 'route' ? 'var(--bg-surface-elevated)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileCode size={14} />
              <span>Express Route</span>
            </button>
            <button
              onClick={() => setActiveCodeTab('service')}
              style={{
                padding: '6px 14px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                borderRadius: 'var(--radius-sm)',
                color: activeCodeTab === 'service' ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: activeCodeTab === 'service' ? 'var(--bg-surface-elevated)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <GitBranch size={14} />
              <span>Circular Service</span>
            </button>
            <button
              onClick={() => setActiveCodeTab('model')}
              style={{
                padding: '6px 14px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                borderRadius: 'var(--radius-sm)',
                color: activeCodeTab === 'model' ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: activeCodeTab === 'model' ? 'var(--bg-surface-elevated)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Layers size={14} />
              <span>Database Model</span>
            </button>
          </div>
        </div>

        {/* Diff Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {/* Before Column */}
          <div
            style={{
              backgroundColor: '#0c0d12',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '10px 16px',
                backgroundColor: '#12141c',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <span style={{ color: '#ef4444' }}>•</span>
                <span>BEFORE (Untyped JavaScript)</span>
              </div>
              <Badge variant="danger" size="sm">
                CommonJS / Dynamic
              </Badge>
            </div>
            <pre
              style={{
                margin: 0,
                padding: '20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                lineHeight: 1.65,
                color: '#94a3b8',
                overflowX: 'auto',
                backgroundColor: 'transparent'
              }}
            >
              <code>{codeSnippets[activeCodeTab].before}</code>
            </pre>
          </div>

          {/* After Column */}
          <div
            style={{
              backgroundColor: '#0c0d12',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: '0 8px 24px -6px rgba(16, 185, 129, 0.08)'
            }}
          >
            <div
              style={{
                padding: '10px 16px',
                backgroundColor: '#12141c',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <span style={{ color: '#10b981' }}>•</span>
                <span>AFTER (Strict TypeScript)</span>
              </div>
              <Badge variant="success" size="sm">
                Strict ESM / tsc: 0 Errors
              </Badge>
            </div>
            <pre
              style={{
                margin: 0,
                padding: '20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                lineHeight: 1.65,
                color: '#f8fafc',
                overflowX: 'auto',
                backgroundColor: 'transparent'
              }}
            >
              <code>{codeSnippets[activeCodeTab].after}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. BENTO GRID / CORE CAPABILITIES                                        */}
      {/* ========================================================================= */}
      <section id="architecture" className="container-custom" style={{ position: 'relative', zIndex: 1, marginBottom: '96px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Badge variant="neutral" style={{ marginBottom: '10px' }}>
            System Architecture
          </Badge>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '10px' }}>
            Engineered for Deep Architectural Accuracy
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            Deterministic AST static analysis integrated with cyclical LangGraph state machines and Qdrant vector retrieval.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          {/* Card 1 */}
          <div className="glass-panel interactive-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan-light)',
                border: '1px solid rgba(56, 189, 248, 0.2)'
              }}
            >
              <FileCode size={20} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              AST Parsing & Symbol Extraction
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Tree-sitter analyzes your JavaScript AST to extract every exported function, class hierarchy, Express middleware signature, and import/export boundary into a structured repository index.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel interactive-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c084fc',
                border: '1px solid rgba(168, 85, 247, 0.2)'
              }}
            >
              <GitBranch size={20} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Tarjan SCC Circular Cycle Resolution
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Circular dependencies crash naive migration tools. Metamorph maps your codebase via NetworkX, applies Tarjan's Strongly Connected Components algorithm, and injects ambient declaration stubs to decouple cycles.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel interactive-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-success)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <RefreshCw size={20} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Self-Healing Compiler Diagnostic Loop
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Generated code runs through isolated <code style={{ color: 'var(--text-primary)' }}>tsc --noEmit</code>. Compiler diagnostic codes (<code style={{ color: 'var(--text-primary)' }}>TS2322</code>, <code style={{ color: 'var(--text-primary)' }}>TS7006</code>) trigger automated repair passes until the file cleanly compiles.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel interactive-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan-light)',
                border: '1px solid rgba(56, 189, 248, 0.2)'
              }}
            >
              <Cpu size={20} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Cross-File Symbol Vector RAG
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Upstream type signatures and interface declarations are embedded into a local Qdrant vector database. When a downstream controller is migrated, relevant model contracts are retrieved automatically.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-panel interactive-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-warning)',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Dual-Mode Isolated Sandboxing
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Code execution and verification happen strictly inside network-disabled Docker containers or confined subprocess runners, guaranteeing zero host machine contamination.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-panel interactive-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-success)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Test Ladder Verification
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your existing Jest, Mocha, or Vitest suites are automatically executed before and after migration. The system validates that runtime behavior remains 100% identical.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TECHNICAL BENCHMARK TABLE                                             */}
      {/* ========================================================================= */}
      <section id="benchmarks" className="container-custom" style={{ position: 'relative', zIndex: 1, marginBottom: '96px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Badge variant="info" style={{ marginBottom: '10px' }}>
            Technical Evaluation
          </Badge>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '10px' }}>
            How Metamorph Compares
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            See why whole-repository AST analysis beats single-shot chat prompts and legacy codemods.
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            overflowX: 'auto',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}
              >
                <th style={{ padding: '16px 20px', width: '28%' }}>MIGRATION CAPABILITY</th>
                <th style={{ padding: '16px 20px', width: '28%', color: 'var(--accent-cyan-light)', fontWeight: 700 }}>
                  METAMORPH ENGINE
                </th>
                <th style={{ padding: '16px 20px', width: '22%' }}>SINGLE-SHOT LLM PROMPT</th>
                <th style={{ padding: '16px 20px', width: '22%' }}>LEGACY CODEMODS</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Topological Ordering
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--status-success)', fontWeight: 500 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={16} /> Leaf-first directed order
                  </span>
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>None (isolated files)</td>
                <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>Heuristic order</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Circular Dependency Resolution
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--status-success)', fontWeight: 500 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={16} /> Tarjan SCC & Ambient Stubs
                  </span>
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--status-danger)' }}>Compiler deadlock</td>
                <td style={{ padding: '14px 20px', color: 'var(--status-danger)' }}>Deadlock / untyped any</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Cross-File Contract Retrieval
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--status-success)', fontWeight: 500 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={16} /> Qdrant Vector Semantic RAG
                  </span>
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--status-danger)' }}>Lost sibling context</td>
                <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>Partial local AST</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Live Compiler Feedback Loop
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--status-success)', fontWeight: 500 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={16} /> Real-time tsc --noEmit pass
                  </span>
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--status-danger)' }}>Zero compiler verification</td>
                <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>Static syntax rules only</td>
              </tr>
              <tr>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Sandboxed Isolation
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--status-success)', fontWeight: 500 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={16} /> Docker & Subprocess bounds
                  </span>
                </td>
                <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>N/A (unverified text)</td>
                <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>Direct host execution</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PRICING & TIERS                                                       */}
      {/* ========================================================================= */}
      <section id="pricing" className="container-custom" style={{ position: 'relative', zIndex: 1, marginBottom: '96px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Badge variant="purple" style={{ marginBottom: '10px' }}>
            Deployment Options
          </Badge>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '10px' }}>
            Simple, Transparent Plans
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            Run migrations locally on your machine, in your team cloud, or deploy self-hosted enterprise clusters.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Community */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Community Developer</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '12px 0 4px' }}>$0</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Free forever for open source & solo devs</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
                Run local migrations via isolated subprocess sandboxing and inspect output diffs.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={15} style={{ color: 'var(--status-success)' }} /> Unlimited repository ZIP uploads</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={15} style={{ color: 'var(--status-success)' }} /> Tarjan SCC topological ordering</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={15} style={{ color: 'var(--status-success)' }} /> Local subprocess compiler sandbox</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={15} style={{ color: 'var(--status-success)' }} /> Diff viewer & ZIP downloads</li>
              </ul>
            </div>
            <Link to="/register" style={{ textDecoration: 'none', marginTop: '32px' }}>
              <Button variant="secondary" style={{ width: '100%', height: '42px' }}>
                Create Free Account
              </Button>
            </Link>
          </div>

          {/* Team (Featured) */}
          <div
            className="glass-panel"
            style={{
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '2px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 8px 30px -6px rgba(56, 189, 248, 0.15)',
              position: 'relative'
            }}
          >
            <div style={{ position: 'absolute', top: '-11px', right: '24px' }}>
              <Badge variant="cyan" size="sm" style={{ fontWeight: 600, padding: '3px 10px' }}>
                RECOMMENDED
              </Badge>
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Engineering Team</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '12px 0 4px' }}>
                $49 <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ seat / month</span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '20px' }}>For teams modernizing production code</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
                Full multi-file Qdrant RAG, Docker sandboxing, and automated compiler repair loops.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={15} style={{ color: 'var(--accent-cyan)' }} /> Dedicated Qdrant vector symbol index</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={15} style={{ color: 'var(--accent-cyan)' }} /> Network-disabled Docker sandboxing</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={15} style={{ color: 'var(--accent-cyan)' }} /> Up to 3 self-healing repair passes</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={15} style={{ color: 'var(--accent-cyan)' }} /> Automated Test Ladder runner</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={15} style={{ color: 'var(--accent-cyan)' }} /> GitHub PR auto-generation</li>
              </ul>
            </div>
            <Link to="/register" style={{ textDecoration: 'none', marginTop: '32px' }}>
              <Button variant="primary" style={{ width: '100%', height: '42px' }}>
                Start Team Access
              </Button>
            </Link>
          </div>

          {/* Enterprise */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Enterprise Dedicated</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '12px 0 4px' }}>Custom</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Air-gapped on-premise clusters</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
                For large engineering organizations with strict data compliance and private LLM requirements.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={15} style={{ color: 'var(--status-success)' }} /> Air-gapped on-premise model execution</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={15} style={{ color: 'var(--status-success)' }} /> Custom AST linting & architectural rules</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={15} style={{ color: 'var(--status-success)' }} /> Dedicated support SLA & engineer onboarding</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Check size={15} style={{ color: 'var(--status-success)' }} /> SOC2 & GDPR compliance reports</li>
              </ul>
            </div>
            <Link to="/register" style={{ textDecoration: 'none', marginTop: '32px' }}>
              <Button variant="secondary" style={{ width: '100%', height: '42px' }}>
                Contact Enterprise Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FAQ ACCORDION                                                         */}
      {/* ========================================================================= */}
      <section id="faq" className="container-custom" style={{ position: 'relative', zIndex: 1, maxWidth: '820px', marginBottom: '96px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Badge variant="neutral" style={{ marginBottom: '10px' }}>
            Documentation
          </Badge>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '10px' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            Everything you need to know about AST analysis, compiler sandboxes, and safety guarantees.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-card)',
                  overflow: 'hidden',
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    gap: '16px'
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                  ) : (
                    <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  )}
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 20px 20px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      lineHeight: 1.65,
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '16px'
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. BOTTOM CALL TO ACTION BANNER                                          */}
      {/* ========================================================================= */}
      <section className="container-custom" style={{ position: 'relative', zIndex: 1, paddingBottom: '96px' }}>
        <div
          style={{
            borderRadius: 'var(--radius-xl)',
            padding: '56px 32px',
            textAlign: 'center',
            backgroundColor: '#0c0e17',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle inside ambient glow */}
          <div
            style={{
              position: 'absolute',
              top: '-40%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '600px',
              height: '300px',
              background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.15), transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}
            >
              Ready to Modernize Your Express Codebase?
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                margin: '0 auto 32px',
                lineHeight: 1.6
              }}
            >
              Upload your repository or run the CLI. Let Metamorph resolve cyclic dependencies, generate type contracts, and compile with zero errors.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <Link to={isAuthenticated ? '/dashboard' : '/register'} style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="lg" className="btn-shimmer" style={{ height: '46px', padding: '0 24px', fontSize: '0.9375rem', gap: '8px' }}>
                  <span>{isAuthenticated ? 'Go to Dashboard' : 'Start Free Migration Now'}</span>
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="lg" style={{ height: '46px', padding: '0 20px', fontSize: '0.9375rem' }}>
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

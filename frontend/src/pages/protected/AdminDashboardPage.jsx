import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api/admin';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';
import { Shield, Users, Layers, CheckCircle2, AlertTriangle, Cpu, Terminal, Award } from 'lucide-react';

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const fetchStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      toast.error('Failed to load administrator metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>
          <Shield size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            System Administrator Overview
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Cluster health, multi-agent throughput metrics, and global repository conversion performance.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <Card style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TOTAL REGISTERED USERS</span>
                <Users size={18} style={{ color: 'var(--accent-purple)' }} />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
                {stats?.total_users ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Active accounts across workspace
              </div>
            </Card>

            <Card style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TOTAL REPOSITORY RUNS</span>
                <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
                {stats?.total_runs ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {stats?.completed_runs ?? 0} succeeded • {stats?.failed_runs ?? 0} failed
              </div>
            </Card>

            <Card style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>FILES MIGRATED</span>
                <CheckCircle2 size={18} style={{ color: 'var(--status-success)' }} />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--status-success)', marginTop: '8px' }}>
                {stats?.total_files_migrated ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Strict TypeScript files compiled
              </div>
            </Card>

            <Card style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>AVG QUALITY SCORE</span>
                <Award size={18} style={{ color: 'var(--status-warning)' }} />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
                {stats?.avg_quality_score ?? 90}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Strict types & zero any suppression
              </div>
            </Card>
          </div>

          {/* Engine & Cluster Details */}
          <Card style={{ padding: '28px' }}>
            <CardHeader style={{ marginBottom: '16px' }}>
              <CardTitle style={{ fontSize: '1.15rem' }}>Engine Runtime Configuration</CardTitle>
              <CardDescription>
                Hardware and backend microservices connected to this Metamorph node.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-elevated)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>LLM PROVIDER</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '4px', textTransform: 'capitalize' }}>
                    {stats?.llm_provider || 'Groq / Gemini'}
                  </div>
                </div>

                <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-elevated)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>SANDBOX ISOLATION</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--status-success)', marginTop: '4px', textTransform: 'capitalize' }}>
                    {stats?.sandbox_mode || 'Auto (Docker/Subprocess)'}
                  </div>
                </div>

                <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-elevated)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ENVIRONMENT</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', textTransform: 'capitalize' }}>
                    {stats?.environment || 'development'}
                  </div>
                </div>

                <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-elevated)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>AST ENGINE</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-purple)', marginTop: '4px' }}>
                    Tree-sitter v0.23 + NetworkX
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

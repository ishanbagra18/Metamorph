import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MailCheck, ArrowRight } from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export function VerifyEmailPage() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px'
      }}
    >
      <SEO
        title="Verify Email"
        description="Confirm your email address to activate your Metamorph code migration workspace."
        canonicalPath="/verify-email"
      />
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <Breadcrumbs items={[{ label: 'Email Verification' }]} />
        </div>
        <Card style={{ padding: '32px 28px', textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}
          >
            <MailCheck size={28} />
          </div>

          <CardTitle as="h1" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
            Account Verified
          </CardTitle>
          <CardDescription style={{ lineHeight: 1.6, marginBottom: '24px' }}>
            Your email is active on Metamorph. All developer privileges, AST parsing pipelines, and sandbox compiler runners are ready for immediate use.
          </CardDescription>

          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <Button variant="primary" style={{ width: '100%' }} icon={ArrowRight}>
              Go to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}

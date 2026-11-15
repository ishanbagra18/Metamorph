import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Modern breadcrumbs navigation with automatic Schema.org BreadcrumbList structured data.
 * @param {Array<{ label: string, href?: string }>} items
 */
export function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;

  // Build BreadcrumbList Schema
  const schemaList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://metamorph.dev/'
      },
      ...items.map((item, idx) => ({
        '@type': 'ListItem',
        'position': idx + 2,
        'name': item.label,
        ...(item.href ? { 'item': `https://metamorph.dev${item.href}` } : {})
      }))
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaList) }}
      />
      <nav aria-label="Breadcrumb" style={{ marginBottom: '16px' }}>
        <ol
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '0.8125rem'
          }}
        >
          <li style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Link
              to="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                transition: 'color 0.15s ease'
              }}
              className="hover-text-cyan"
            >
              <Home size={14} />
              <span>Home</span>
            </Link>
          </li>

          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li
                key={index}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <ChevronRight size={13} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
                {isLast || !item.href ? (
                  <span
                    aria-current="page"
                    style={{
                      color: 'var(--text-primary)',
                      fontWeight: 600
                    }}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    style={{
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease'
                    }}
                    className="hover-text-cyan"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}


import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://metamorph.dev';
const DEFAULT_TITLE = 'Metamorph: Autonomous JavaScript to TypeScript Migration Engine';
const DEFAULT_DESCRIPTION = 'Self-correcting, AST-directed multi-agent system powered by LangGraph, Qdrant RAG, and live TypeScript compiler feedback loops that transforms legacy Express JS codebases into strictly-typed TypeScript.';

/**
 * Reusable SEO manager that sets title, meta descriptions, canonical URLs,
 * OpenGraph, Twitter, and optional Schema.org JSON-LD structured data.
 */
export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  noIndex = false,
  structuredData = null
}) {
  const location = useLocation();

  useEffect(() => {
    // 1. Update Document Title (Guarantees clean branding, no "Vite" or "React")
    const pageTitle = title ? `${title} | Metamorph` : DEFAULT_TITLE;
    document.title = pageTitle;

    // 2. Helper to set or create meta tags
    const setMetaTag = (attrName, attrValue, content) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Update Meta Description
    setMetaTag('name', 'description', description);

    // 4. Update Canonical Tag
    const currentPath = canonicalPath || location.pathname;
    const cleanCanonicalUrl = `${BASE_URL}${currentPath === '/' ? '' : currentPath}`;
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', cleanCanonicalUrl);

    // 5. Update OpenGraph Tags
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', cleanCanonicalUrl);

    // 6. Update Twitter Tags
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', description);

    // 7. Handle Robots noIndex (e.g. for 404 or staging)
    let robotsTag = document.querySelector('meta[name="robots"]');
    if (noIndex) {
      if (!robotsTag) {
        robotsTag = document.createElement('meta');
        robotsTag.setAttribute('name', 'robots');
        document.head.appendChild(robotsTag);
      }
      robotsTag.setAttribute('content', 'noindex, nofollow');
    } else if (robotsTag) {
      robotsTag.setAttribute('content', 'index, follow');
    }

    // 8. Inject Page-Specific JSON-LD Structured Data
    let schemaScript = document.getElementById('page-structured-data');
    if (structuredData) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'page-structured-data';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(structuredData);
    } else if (schemaScript) {
      schemaScript.remove();
    }

    return () => {
      // Clean up dynamic structured data when navigating away
      const script = document.getElementById('page-structured-data');
      if (script) script.remove();
    };
  }, [title, description, canonicalPath, noIndex, structuredData, location.pathname]);

  return null;
}


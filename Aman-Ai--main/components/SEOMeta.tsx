
import React, { useEffect } from 'react';

interface SEOMetaProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  schema?: object;
  noIndex?: boolean;
}

const SEOMeta: React.FC<SEOMetaProps> = ({ title, description, keywords, canonicalUrl, schema, noIndex }) => {
  useEffect(() => {
    // Set Title
    document.title = title;

    // Helper to create or update meta tags
    const setMetaTag = (attr: 'name' | 'property', value: string, content: string) => {
        let element = document.querySelector(`meta[${attr}="${value}"]`) as HTMLMetaElement;
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(attr, value);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    // Set Meta Description
    setMetaTag('name', 'description', description);
    
    // Set Open Graph / Twitter descriptions
    setMetaTag('property', 'og:description', description);
    setMetaTag('name', 'twitter:description', description);
    
    // Set Open Graph / Twitter titles
    setMetaTag('property', 'og:title', title);
    setMetaTag('name', 'twitter:title', title);

    // Set Meta Keywords
    if (keywords) {
        setMetaTag('name', 'keywords', keywords);
    }
    
    // Set Canonical URL
    if (canonicalUrl) {
        let linkCanonical = document.querySelector('link[rel="canonical"]');
        if(!linkCanonical) {
            linkCanonical = document.createElement('link');
            linkCanonical.setAttribute('rel', 'canonical');
            document.head.appendChild(linkCanonical);
        }
        linkCanonical.setAttribute('href', canonicalUrl);
        setMetaTag('property', 'og:url', canonicalUrl);
    }

    // Set Meta Robots for no-indexing
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (noIndex) {
        if (!metaRobots) {
            metaRobots = document.createElement('meta');
            metaRobots.setAttribute('name', 'robots');
            document.head.appendChild(metaRobots);
        }
        metaRobots.setAttribute('content', 'noindex, nofollow');
    } else if (metaRobots) {
        metaRobots.remove();
    }

    // Set JSON-LD Schema
    const scriptId = 'json-ld-schema';
    let scriptTag = document.getElementById(scriptId);
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
      }
      scriptTag.innerHTML = JSON.stringify(schema, null, 2);
    } else if (scriptTag) {
      scriptTag.remove();
    }

  }, [title, description, keywords, canonicalUrl, schema, noIndex]);

  return null;
};

export default SEOMeta;

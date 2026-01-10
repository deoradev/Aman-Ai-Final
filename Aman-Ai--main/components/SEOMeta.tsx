
import React, { useEffect } from 'react';

interface SEOMetaProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  schema?: object;
  noIndex?: boolean;
  type?: 'website' | 'article' | 'profile';
  image?: string;
}

const SEOMeta: React.FC<SEOMetaProps> = ({ 
  title, 
  description, 
  keywords, 
  canonicalUrl, 
  schema, 
  noIndex,
  type = 'website',
  image = 'https://amandigitalcare.com/assets/icons/icon-512x512.png'
}) => {
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

    // Standard Meta Tags
    setMetaTag('name', 'description', description);
    if (keywords) setMetaTag('name', 'keywords', keywords);
    
    // Open Graph / Facebook (Crucial for Viral Sharing)
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:site_name', 'Aman Digital Care');
    
    // Twitter
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);

    // Canonical URL (Prevents Duplicate Content Issues)
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

    // Search Engine Indexing Control
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (noIndex) {
        if (!metaRobots) {
            metaRobots = document.createElement('meta');
            metaRobots.setAttribute('name', 'robots');
            document.head.appendChild(metaRobots);
        }
        metaRobots.setAttribute('content', 'noindex, nofollow');
    } else if (metaRobots) {
        metaRobots.setAttribute('content', 'index, follow');
    }

    // JSON-LD Schema (Structured Data for Rich Snippets / Google Knowledge Graph)
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

  }, [title, description, keywords, canonicalUrl, schema, noIndex, type, image]);

  return null;
};

export default SEOMeta;
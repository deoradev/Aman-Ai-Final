
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
  image = 'https://amandigitalcare.com/assets/icons/og-image.png'
}) => {
  useEffect(() => {
    // Set Page Title
    document.title = title;

    // Helper to update head meta tags
    const setMetaTag = (attr: 'name' | 'property', value: string, content: string) => {
        let element = document.querySelector(`meta[${attr}="${value}"]`) as HTMLMetaElement;
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(attr, value);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    setMetaTag('name', 'description', description);
    if (keywords) setMetaTag('name', 'keywords', keywords);
    
    // Open Graph (Social Loops)
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:url', canonicalUrl || window.location.href);
    setMetaTag('property', 'og:site_name', 'Aman Digital Care');
    
    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);

    // Canonical link management
    if (canonicalUrl) {
        let linkCanonical = document.querySelector('link[rel="canonical"]');
        if(!linkCanonical) {
            linkCanonical = document.createElement('link');
            linkCanonical.setAttribute('rel', 'canonical');
            document.head.appendChild(linkCanonical);
        }
        linkCanonical.setAttribute('href', canonicalUrl);
    }

    // High-Authority JSON-LD Injection (Knowledge Graph building)
    const scriptId = 'json-ld-schema';
    let scriptTag = document.getElementById(scriptId);
    
    const defaultSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Aman Digital Care",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Web, Android, iOS",
      "author": {
        "@type": "MedicalOrganization",
        "name": "AMAN AI Foundation",
        "url": "https://amandigitalcare.com",
        "founder": {
          "@type": "Person",
          "name": "Devanshu Deora",
          "jobTitle": "Visionary Founder",
          "description": "A leader dedicated to leveraging AI for global kindness and mental health restoration."
        }
      }
    };

    const finalSchema = schema || defaultSchema;

    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.innerHTML = JSON.stringify(finalSchema, null, 2);

  }, [title, description, keywords, canonicalUrl, schema, noIndex, type, image]);

  return null;
};

export default SEOMeta;

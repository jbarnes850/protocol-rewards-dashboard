import React from 'react';
import { Helmet } from 'react-helmet-async';
import { siteMetadata } from '../lib/metadata';

interface SEOProps {
  title?: string;
  description?: string;
  pathname?: string;
  children?: React.ReactNode;
}

export function SEO({ 
  title, 
  description, 
  pathname,
  children 
}: SEOProps) {
  const seo = {
    title: title 
      ? `${title} | ${siteMetadata.title}` 
      : siteMetadata.title,
    description: description || siteMetadata.description,
    url: pathname 
      ? `${siteMetadata.openGraph.url}${pathname}`
      : siteMetadata.openGraph.url,
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seo.title}</title>
      <meta name="title" content={seo.title} />
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={siteMetadata.keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={siteMetadata.openGraph.type} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={`${siteMetadata.openGraph.url}${siteMetadata.openGraph.images[0].url}`} />
      <meta property="og:site_name" content={siteMetadata.openGraph.siteName} />
      <meta property="og:locale" content={siteMetadata.openGraph.locale} />

      {/* Twitter */}
      <meta name="twitter:card" content={siteMetadata.twitter.cardType} />
      <meta name="twitter:site" content={siteMetadata.twitter.site} />
      <meta name="twitter:creator" content={siteMetadata.twitter.handle} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={`${siteMetadata.openGraph.url}${siteMetadata.openGraph.images[0].url}`} />

      {/* Additional Meta Tags */}
      {siteMetadata.additionalMetaTags.map((tag, index) => (
        <meta key={index} name={tag.name} content={tag.content} />
      ))}

      {children}
    </Helmet>
  );
} 
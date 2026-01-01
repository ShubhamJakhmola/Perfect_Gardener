import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  category?: string;
}

/**
 * SEO Component - Dynamically updates meta tags for better search engine indexing
 * Use this component in pages to set custom SEO meta tags
 */
export function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  author,
  publishedTime,
  modifiedTime,
  category,
}: SEOProps) {
  const siteName = "Perfect Gardener";
  const siteUrl = "https://perfectgardener.netlify.app";
  const defaultImage = `${siteUrl}/assets/images/og-image.jpg`;
  const defaultDescription = "Perfect Gardener - Practical gardening tips and plant care guides. Learn how to grow healthy plants at home with easy-to-follow advice from an experienced gardener.";
  
  const fullTitle = title ? `${title} — ${siteName}` : `${siteName} - Gardening Tips & Plant Care`;
  const metaDescription = description || defaultDescription;
  const metaImage = image || defaultImage;
  const metaUrl = url || siteUrl;
  const metaKeywords = keywords || "gardening tips, plant care, home gardening, organic gardening, garden tools, vegetable gardening, flower planting, plant care guide, gardening for beginners, Indian gardening";

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = "name") => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Basic meta tags
    updateMetaTag("description", metaDescription);
    updateMetaTag("keywords", metaKeywords);
    updateMetaTag("author", author || "Perfect Gardener");
    
    // Canonical URL
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", metaUrl);

    // Open Graph tags
    updateMetaTag("og:title", fullTitle, "property");
    updateMetaTag("og:description", metaDescription, "property");
    updateMetaTag("og:type", type, "property");
    updateMetaTag("og:url", metaUrl, "property");
    updateMetaTag("og:image", metaImage, "property");
    updateMetaTag("og:site_name", siteName, "property");

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", fullTitle);
    updateMetaTag("twitter:description", metaDescription);
    updateMetaTag("twitter:image", metaImage);
    updateMetaTag("twitter:creator", "@perfect_gardener");

    // Article-specific meta tags
    if (type === "article") {
      if (author) updateMetaTag("article:author", author, "property");
      if (publishedTime) updateMetaTag("article:published_time", publishedTime, "property");
      if (modifiedTime) updateMetaTag("article:modified_time", modifiedTime, "property");
      if (category) updateMetaTag("article:section", category, "property");
    }

    // Structured data for articles
    if (type === "article" && title && description) {
      let structuredData = document.querySelector('script[type="application/ld+json"][data-seo="article"]');
      if (!structuredData) {
        structuredData = document.createElement("script");
        structuredData.setAttribute("type", "application/ld+json");
        structuredData.setAttribute("data-seo", "article");
        document.head.appendChild(structuredData);
      }
      
      const articleSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": metaDescription,
        "image": metaImage,
        "author": {
          "@type": "Person",
          "name": author || "Shubham Jakhmola"
        },
        "publisher": {
          "@type": "Organization",
          "name": siteName,
          "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}/assets/images/Avtar.png`
          }
        },
        "datePublished": publishedTime || new Date().toISOString(),
        "dateModified": modifiedTime || new Date().toISOString(),
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": metaUrl
        }
      };
      
      structuredData.textContent = JSON.stringify(articleSchema);
    }

    // Cleanup function
    return () => {
      // Reset to default on unmount (optional)
      // document.title = `${siteName} - Gardening Tips & Plant Care`;
    };
  }, [fullTitle, metaDescription, metaKeywords, metaImage, metaUrl, type, author, publishedTime, modifiedTime, category]);

  return null; // This component doesn't render anything
}


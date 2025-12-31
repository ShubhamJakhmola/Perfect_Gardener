/**
 * Product Utilities
 * Helper functions for product-related operations
 */

/**
 * Detect source/platform from URL
 */
export function detectSourceFromUrl(url: string): string {
  if (!url) return "unknown";
  
  const normalizedUrl = url.toLowerCase();
  
  // Amazon
  if (normalizedUrl.includes("amazon.in") || normalizedUrl.includes("amazon.com")) {
    return "amazon";
  }
  
  // Meesho
  if (normalizedUrl.includes("meesho.com")) {
    return "meesho";
  }
  
  // Flipkart
  if (normalizedUrl.includes("flipkart.com")) {
    return "flipkart";
  }
  
  // Myntra
  if (normalizedUrl.includes("myntra.com")) {
    return "myntra";
  }
  
  // Ajio
  if (normalizedUrl.includes("ajio.com")) {
    return "ajio";
  }
  
  // Nykaa
  if (normalizedUrl.includes("nykaa.com")) {
    return "nykaa";
  }
  
  // Snapdeal
  if (normalizedUrl.includes("snapdeal.com")) {
    return "snapdeal";
  }
  
  // Paytm Mall
  if (normalizedUrl.includes("paytmmall.com")) {
    return "paytm";
  }
  
  // Shopclues
  if (normalizedUrl.includes("shopclues.com")) {
    return "shopclues";
  }
  
  return "other";
}

/**
 * Format source name for display
 */
export function formatSourceName(source: string): string {
  if (!source || source === "unknown" || source === "other") {
    return "Store";
  }
  
  // Capitalize first letter
  return source.charAt(0).toUpperCase() + source.slice(1);
}

/**
 * Get source display text for buttons
 */
export function getSourceDisplayText(source?: string): string {
  if (!source || source === "unknown" || source === "other") {
    return "View Product";
  }
  
  return `View on ${formatSourceName(source)}`;
}


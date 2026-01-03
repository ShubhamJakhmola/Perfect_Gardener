/**
 * Security Utilities
 * Input sanitization, XSS protection, and validation
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify to allow safe HTML while removing dangerous scripts
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  
  // Configure DOMPurify to allow safe HTML elements and attributes
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'table', 'thead',
      'tbody', 'tr', 'td', 'th', 'hr', 'div', 'span', 'iframe'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'style', 'width', 'height',
      'frameborder', 'allowfullscreen', 'allow', 'target', 'rel'
    ],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  };
  
  return DOMPurify.sanitize(html, config);
}

/**
 * Sanitize plain text input
 */
export function sanitizeText(text: string): string {
  if (!text) return "";
  
  return text
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
}

/**
 * Validate URL to prevent malicious links
 */
export function validateUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "";
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https
    if (urlObj.protocol === "http:" || urlObj.protocol === "https:") {
      return urlObj.toString();
    }
    return "";
  } catch {
    return "";
  }
}

/**
 * Validate image URL or Base64 data URL
 */
export function validateImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if it's a valid URL
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return validateUrl(url);
  }
  
  // Check if it's a valid Base64 data URL
  if (url.startsWith("data:image/")) {
    const base64Pattern = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/;
    return base64Pattern.test(url);
  }
  
  return false;
}

/**
 * Sanitize product name
 */
export function sanitizeProductName(name: string): string {
  return sanitizeText(name).slice(0, 200); // Max 200 characters
}

/**
 * Sanitize price
 */
export function sanitizePrice(price: string): string {
  if (!price) return "";
  
  // Allow currency symbols, numbers, commas, dots, spaces
  return price.replace(/[^₹$€£¥0-9,.\s]/g, "").slice(0, 50);
}

/**
 * Sanitize description
 */
export function sanitizeDescription(desc: string): string {
  return sanitizeText(desc).slice(0, 1000); // Max 1000 characters
}

/**
 * Escape special characters for safe display
 */
export function escapeHtml(text: string): string {
  if (!text) return "";
  
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Validate and sanitize slug
 */
export function sanitizeSlug(slug: string): string {
  if (!slug) return "";
  
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-") // Replace non-alphanumeric with dash
    .replace(/-+/g, "-") // Replace multiple dashes with single
    .replace(/^-|-$/g, "") // Remove leading/trailing dashes
    .slice(0, 100); // Max 100 characters
}

/**
 * Rate limiting helper (client-side)
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}


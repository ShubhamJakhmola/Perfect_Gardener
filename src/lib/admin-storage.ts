/**
 * Admin Storage Utility
 * Handles localStorage persistence for admin data (products, posts, pages)
 * This provides a simple data layer that can later be replaced with a real backend
 */

export interface AdminProduct {
  id: string;
  name: string;
  price: string;
  image?: string; // Legacy single image (for backward compatibility)
  images?: string[]; // Multiple images array
  link?: string;
  category?: string;
  description?: string;
  source?: string; // e.g., "amazon", "meesho", "flipkart"
  subCategory?: string; // e.g., "amazon", "meesho", "flipkart" - same as source but kept for clarity
}

export interface AdminPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date?: string;
  readTime?: string;
  category?: string;
  author?: string;
  image?: string;
  featured?: boolean;
}

export interface AdminPage {
  id: string;
  title: string;
  slug: string;
  content: string;
}

const STORAGE_KEYS = {
  PRODUCTS: "admin_products",
  POSTS: "admin_posts",
  PAGES: "admin_pages",
} as const;

/**
 * Products Storage
 */
export const productStorage = {
  getAll: (): AdminProduct[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  save: (products: AdminProduct[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (error) {
      console.error("Failed to save products:", error);
    }
  },

  add: (product: AdminProduct): void => {
    const products = productStorage.getAll();
    products.push(product);
    productStorage.save(products);
  },

  update: (id: string, updates: Partial<AdminProduct>): void => {
    const products = productStorage.getAll();
    const index = products.findIndex((p) => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updates };
      productStorage.save(products);
    }
  },

  delete: (id: string): void => {
    const products = productStorage.getAll();
    const filtered = products.filter((p) => p.id !== id);
    productStorage.save(filtered);
  },
};

/**
 * Posts Storage
 */
export const postStorage = {
  getAll: (): AdminPost[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.POSTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  save: (posts: AdminPost[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    } catch (error) {
      console.error("Failed to save posts:", error);
    }
  },

  add: (post: AdminPost): void => {
    const posts = postStorage.getAll();
    posts.push(post);
    postStorage.save(posts);
  },

  update: (id: string, updates: Partial<AdminPost>): void => {
    const posts = postStorage.getAll();
    const index = posts.findIndex((p) => p.id === id);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...updates };
      postStorage.save(posts);
    }
  },

  delete: (id: string): void => {
    const posts = postStorage.getAll();
    const filtered = posts.filter((p) => p.id !== id);
    postStorage.save(filtered);
  },

  getBySlug: (slug: string): AdminPost | undefined => {
    const posts = postStorage.getAll();
    return posts.find((p) => p.slug === slug);
  },
};

/**
 * Pages Storage
 */
export const pageStorage = {
  getAll: (): AdminPage[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PAGES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  save: (pages: AdminPage[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(pages));
    } catch (error) {
      console.error("Failed to save pages:", error);
    }
  },

  add: (page: AdminPage): void => {
    const pages = pageStorage.getAll();
    pages.push(page);
    pageStorage.save(pages);
  },

  update: (id: string, updates: Partial<AdminPage>): void => {
    const pages = pageStorage.getAll();
    const index = pages.findIndex((p) => p.id === id);
    if (index !== -1) {
      pages[index] = { ...pages[index], ...updates };
      pageStorage.save(pages);
    }
  },

  delete: (id: string): void => {
    const pages = pageStorage.getAll();
    const filtered = pages.filter((p) => p.id !== id);
    pageStorage.save(filtered);
  },

  getBySlug: (slug: string): AdminPage | undefined => {
    const pages = pageStorage.getAll();
    return pages.find((p) => p.slug === slug);
  },
};


/**
 * Admin Storage Utility
 * Handles API persistence for admin data (products, posts)
 * Uses Netlify Functions backend with Neon database
 */

import { productsAPI, postsAPI } from './api-client';

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

// Cache for optimistic updates
let productsCache: AdminProduct[] | null = null;
let postsCache: AdminPost[] | null = null;

/**
 * Products Storage - API-based
 */
export const productStorage = {
  getAll: async (): Promise<AdminProduct[]> => {
    try {
      const response = await productsAPI.getAll(1, 1000); // Get all for admin use
      // Normalize products to match AdminProduct interface
      const normalized = response.products.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image || (p.images && p.images.length > 0 ? p.images[0] : undefined),
        images: p.images || (p.image ? [p.image] : []),
        link: p.link,
        category: p.category,
        description: p.description,
        source: p.source,
        subCategory: p.subCategory || p.sub_category,
      }));
      productsCache = normalized;
      return normalized;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Return cache if available, otherwise empty array
      return productsCache || [];
    }
  },

  getAllSync: (): AdminProduct[] => {
    // Synchronous version for backward compatibility
    // Returns cache or empty array
    return productsCache || [];
  },

  save: async (products: AdminProduct[]): Promise<void> => {
    // This method is kept for backward compatibility but does nothing
    // Individual add/update/delete methods should be used instead
    console.warn('productStorage.save() is deprecated. Use add/update/delete methods instead.');
  },

  add: async (product: AdminProduct): Promise<AdminProduct> => {
    try {
      // Prepare product data for API (remove id if it's a new product)
      const { id, ...productData } = product;
      const created = await productsAPI.create(productData);
      
      // Normalize the created product
      const normalizedProduct: AdminProduct = {
        id: created.id,
        name: created.name,
        price: created.price,
        image: created.image || (created.images && created.images.length > 0 ? created.images[0] : undefined),
        images: created.images || (created.image ? [created.image] : []),
        link: created.link,
        category: created.category,
        description: created.description,
        source: created.source,
        subCategory: created.subCategory || created.sub_category,
      };
      
      // Update cache
      if (productsCache) {
        productsCache.push(normalizedProduct);
      }
      
      return normalizedProduct;
    } catch (error) {
      console.error('Failed to add product:', error);
      throw error;
    }
  },

  update: async (id: string, updates: Partial<AdminProduct>): Promise<void> => {
    try {
      await productsAPI.update(id, updates);
      
      // Update cache
      if (productsCache) {
        const index = productsCache.findIndex((p) => p.id === id);
        if (index !== -1) {
          productsCache[index] = { ...productsCache[index], ...updates };
        }
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await productsAPI.delete(id);
      
      // Update cache
      if (productsCache) {
        productsCache = productsCache.filter((p) => p.id !== id);
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  },
};

/**
 * Posts Storage - API-based
 */
export const postStorage = {
  getAll: async (): Promise<AdminPost[]> => {
    try {
      const response = await postsAPI.getAll(1, 1000); // Get all for admin use
      // Normalize posts to match AdminPost interface
      const normalized = response.posts.map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        date: p.date,
        readTime: p.read_time,
        category: p.category,
        author: p.author,
        image: p.image,
        featured: p.featured,
      }));
      postsCache = normalized;
      return normalized;
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      // Return cache if available, otherwise empty array
      return postsCache || [];
    }
  },

  getAllSync: (): AdminPost[] => {
    // Synchronous version for backward compatibility
    // Returns cache or empty array
    return postsCache || [];
  },

  save: async (posts: AdminPost[]): Promise<void> => {
    // This method is kept for backward compatibility but does nothing
    // Individual add/update/delete methods should be used instead
    console.warn('postStorage.save() is deprecated. Use add/update/delete methods instead.');
  },

  add: async (post: AdminPost): Promise<AdminPost> => {
    try {
      const { id, ...postData } = post;
      const created = await postsAPI.create(postData);
      
      // Update cache
      const normalizedPost: AdminPost = {
        id: created.id,
        title: created.title,
        slug: created.slug,
        excerpt: created.excerpt,
        content: created.content,
        date: created.date,
        readTime: created.read_time,
        category: created.category,
        author: created.author,
        image: created.image,
        featured: created.featured,
      };
      
      if (postsCache) {
        postsCache.push(normalizedPost);
      }
      
      return normalizedPost;
    } catch (error) {
      console.error('Failed to add post:', error);
      throw error;
    }
  },

  update: async (id: string, updates: Partial<AdminPost>): Promise<AdminPost> => {
    try {
      const updated = await postsAPI.update(id, updates);
      
      // Update cache with full post data
      if (postsCache) {
        const index = postsCache.findIndex((p) => p.id === id);
        if (index !== -1) {
          // Fetch full post data if backend only returned minimal response
          if (!updated.content) {
            const fullPost = await postsAPI.getBySlug(updated.slug);
            if (fullPost) {
              postsCache[index] = {
                id: fullPost.id,
                title: fullPost.title,
                slug: fullPost.slug,
                excerpt: fullPost.excerpt,
                content: fullPost.content,
                date: fullPost.date,
                readTime: fullPost.read_time,
                category: fullPost.category,
                author: fullPost.author,
                image: fullPost.image,
                featured: fullPost.featured,
              };
              return postsCache[index];
            }
          }
          postsCache[index] = { ...postsCache[index], ...updates };
        }
      }
      
      // Return normalized post
      return {
        id: updated.id,
        title: updated.title || updates.title || '',
        slug: updated.slug || updates.slug || '',
        excerpt: updates.excerpt !== undefined ? updates.excerpt : postsCache?.find(p => p.id === id)?.excerpt || '',
        content: updates.content !== undefined ? updates.content : postsCache?.find(p => p.id === id)?.content || '',
        date: updates.date || postsCache?.find(p => p.id === id)?.date,
        readTime: updates.readTime || postsCache?.find(p => p.id === id)?.readTime,
        category: updates.category !== undefined ? updates.category : postsCache?.find(p => p.id === id)?.category,
        author: updates.author || postsCache?.find(p => p.id === id)?.author,
        image: updates.image !== undefined ? updates.image : postsCache?.find(p => p.id === id)?.image,
        featured: updates.featured !== undefined ? updates.featured : postsCache?.find(p => p.id === id)?.featured,
      };
    } catch (error) {
      console.error('Failed to update post:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await postsAPI.delete(id);
      
      // Update cache
      if (postsCache) {
        postsCache = postsCache.filter((p) => p.id !== id);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      throw error;
    }
  },

  getBySlug: async (slug: string): Promise<AdminPost | undefined> => {
    try {
      const post = await postsAPI.getBySlug(slug);
      return post;
    } catch (error) {
      console.error('Failed to fetch post by slug:', error);
      // Try cache as fallback
      return postsCache?.find((p) => p.slug === slug);
    }
  },
};

/**
 * Pages Storage - Keep localStorage for now (can be migrated later)
 */
const STORAGE_KEYS = {
  PAGES: "admin_pages",
} as const;

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

/**
 * API Client Utility
 * Handles API calls to Netlify Functions backend
 */

const API_BASE = '/.netlify/functions';

/**
 * Generic API request helper with improved error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Handle network errors
    if (!response.ok) {
      let errorMessage = `API request failed: ${response.statusText}`;
      let errorDetails: any = null;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        errorDetails = errorData;
      } catch {
        // If response is not JSON, use status text
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).details = errorDetails;
      throw error;
    }

    return response.json();
  } catch (error: any) {
    // Handle network errors (Failed to fetch, CORS, etc.)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server. Please check your connection and try again.');
    }
    // Re-throw if it's already our formatted error
    if (error.status) {
      throw error;
    }
    // Otherwise, wrap in a generic error
    throw new Error(error.message || 'An unexpected error occurred. Please try again.');
  }
}

/**
 * Users API
 */
export const usersAPI = {
  login: async (username: string, password: string) => {
    return apiRequest<{ success: boolean; user: { id: string; username: string; email?: string } }>(
      '/users/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    );
  },

  create: async (username: string, password: string, email?: string) => {
    return apiRequest<{ success: boolean; user: any }>(
      '/users',
      {
        method: 'POST',
        body: JSON.stringify({ username, password, email }),
      }
    );
  },

  resetPassword: async (email: string, newPassword: string) => {
    return apiRequest<{ success: boolean; message: string }>(
      '/users/reset-password',
      {
        method: 'POST',
        body: JSON.stringify({ email, newPassword }),
      }
    );
  },
};

/**
 * Products API
 */
export const productsAPI = {
  getAll: async (page = 1, limit = 12) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const response = await apiRequest<{
      products: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      }
    }>(`/products?${params}`);
    return response;
  },

  getAllSimple: async () => {
    const response = await productsAPI.getAll(1, 1000); // Get up to 1000 for admin use
    return response.products || [];
  },

  create: async (product: any) => {
    const response = await apiRequest<{ success: boolean; product: any }>(
      '/products',
      {
        method: 'POST',
        body: JSON.stringify(product),
      }
    );
    return response.product;
  },

  update: async (id: string, updates: any) => {
    const response = await apiRequest<{ success: boolean; product: any }>(
      `/products/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
    return response.product;
  },

  delete: async (id: string) => {
    await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Posts API
 */
export const postsAPI = {
  getAll: async (page = 1, limit = 6) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const response = await apiRequest<{
      posts: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      }
    }>(`/posts?${params}`);
    return response;
  },

  getAllSimple: async () => {
    const response = await postsAPI.getAll(1, 1000); // Get up to 1000 for admin use
    return response.posts || [];
  },

  getBySlug: async (slug: string) => {
    const response = await apiRequest<{ post: any }>(`/posts/${slug}`);
    return response.post;
  },

  create: async (post: any) => {
    // Normalize field names to match backend expectations
    const normalizedPost: any = {
      ...post,
      readTime: post.readTime || post.read_time,
    };
    // Remove read_time if readTime is present to avoid confusion
    if (normalizedPost.readTime) {
      delete normalizedPost.read_time;
    }
    
    const response = await apiRequest<{ success: boolean; post: any }>(
      '/posts',
      {
        method: 'POST',
        body: JSON.stringify(normalizedPost),
      }
    );
    return response.post;
  },

  update: async (id: string, updates: any) => {
    // Normalize field names to match backend expectations
    const normalizedUpdates: any = {
      ...updates,
      readTime: updates.readTime || updates.read_time,
    };
    // Remove read_time if readTime is present to avoid confusion
    if (normalizedUpdates.readTime) {
      delete normalizedUpdates.read_time;
    }
    
    const response = await apiRequest<{ success: boolean; post: any }>(
      `/posts/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(normalizedUpdates),
      }
    );
    return response.post;
  },

  delete: async (id: string) => {
    await apiRequest(`/posts/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Plants API
 */
export const plantsAPI = {
  getAll: async () => {
    const response = await apiRequest<{ plants: any[] }>('/plants');
    return response.plants || [];
  },

  getById: async (id: string) => {
    const response = await apiRequest<{ plant: any }>(`/plants/${id}`);
    return response.plant;
  },

  create: async (plant: any) => {
    const response = await apiRequest<{ success: boolean; plant: any }>(
      '/plants',
      {
        method: 'POST',
        body: JSON.stringify(plant),
      }
    );
    return response.plant;
  },

  update: async (id: string, updates: any) => {
    const response = await apiRequest<{ success: boolean; plant: any }>(
      `/plants/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
    return response.plant;
  },

  delete: async (id: string) => {
    await apiRequest(`/plants/${id}`, {
      method: 'DELETE',
    });
  },
};


/**
 * API Client Utility
 * Handles API calls to Netlify Functions backend
 */

const API_BASE = '/.netlify/functions';

/**
 * Generic API request helper
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API request failed: ${response.statusText}`);
  }

  return response.json();
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
  getAll: async () => {
    const response = await apiRequest<{ products: any[] }>('/products');
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
  getAll: async () => {
    const response = await apiRequest<{ posts: any[] }>('/posts');
    return response.posts || [];
  },

  getBySlug: async (slug: string) => {
    const response = await apiRequest<{ post: any }>(`/posts/${slug}`);
    return response.post;
  },

  create: async (post: any) => {
    const response = await apiRequest<{ success: boolean; post: any }>(
      '/posts',
      {
        method: 'POST',
        body: JSON.stringify(post),
      }
    );
    return response.post;
  },

  update: async (id: string, updates: any) => {
    const response = await apiRequest<{ success: boolean; post: any }>(
      `/posts/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
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


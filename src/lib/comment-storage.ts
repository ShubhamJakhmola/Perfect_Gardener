/**
 * Comment Storage Utility
 * Handles localStorage persistence for post comments
 */

export interface Comment {
  id: string;
  postSlug: string;
  author: string;
  content: string;
  date: string;
  replies?: Comment[];
  parentId?: string; // For replies
}

const STORAGE_KEY = "post_comments";

export const commentStorage = {
  getAll: (): Comment[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  save: (comments: Comment[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    } catch (error) {
      console.error("Failed to save comments:", error);
    }
  },

  getByPostSlug: (slug: string): Comment[] => {
    const allComments = commentStorage.getAll();
    return allComments.filter((c) => c.postSlug === slug && !c.parentId);
  },

  add: (comment: Comment): void => {
    const comments = commentStorage.getAll();
    comments.push(comment);
    commentStorage.save(comments);
  },

  addReply: (parentId: string, reply: Comment): void => {
    const comments = commentStorage.getAll();
    const parent = comments.find((c) => c.id === parentId);
    if (parent) {
      if (!parent.replies) {
        parent.replies = [];
      }
      parent.replies.push(reply);
      comments.push(reply);
      commentStorage.save(comments);
    }
  },

  delete: (id: string): void => {
    const comments = commentStorage.getAll();
    const filtered = comments.filter((c) => c.id !== id);
    commentStorage.save(filtered);
  },
};


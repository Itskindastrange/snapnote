"use client";

import { api } from './api';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  preferences?: {
    theme: 'light' | 'dark';
  };
}

export interface Note {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  tags: string[]; // Backend stores these as tag NAMES (strings), not IDs
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

// Helpers to map backend responses to frontend interfaces
const mapUser = (data: any): User => ({
  id: data._id || data.id,
  email: data.email,
  name: data.name,
  createdAt: data.created_at,
  preferences: { theme: 'dark' } // Default since backend doesn't store yet
});

const mapNote = (data: any): Note => ({
  id: data._id || data.id,
  title: data.title,
  content: data.content,
  ownerId: data.user_id,
  tags: data.tags || [],
  isArchived: data.is_archived,
  createdAt: data.created_at,
  updatedAt: data.updated_at
});

const mapTag = (data: any): Tag => ({
  id: data._id || data.id,
  name: data.name,
  ownerId: data.user_id,
  createdAt: data.created_at
});

// DB Operations
export const db = {
  // User Operations
  users: {
    create: async (userData: { name: string; email: string; passwordHash: string }) => {
      // Register
      const res = await api.post('/auth/signup', {
        name: userData.name,
        email: userData.email,
        password: userData.passwordHash
      });
      return mapUser(res.data);
    },
    
    login: async (email: string, password: string) => {
      const res = await api.post('/auth/login', { email, password });
      return mapUser(res.data);
    },

    update: async (id: string, updates: Partial<User>) => {
      // Backend expects { name: "..." }
      const res = await api.put('/users/profile', updates);
      return mapUser(res.data);
    }
  },

  // Note Operations
  notes: {
    list: async (userId: string) => {
      const res = await api.get('/notes/');
      return res.data.map(mapNote);
    },

    listArchived: async (userId: string) => {
      const res = await api.get('/notes/?archived=true');
      return res.data.map(mapNote);
    },

    create: async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
      const res = await api.post('/notes/', {
        title: noteData.title,
        content: noteData.content,
        tags: noteData.tags // Should be names array
      });
      return mapNote(res.data);
    },

    update: async (id: string, updates: Partial<Note>) => {
      const res = await api.put(`/notes/${id}`, {
        title: updates.title,
        content: updates.content,
        tags: updates.tags,
        is_archived: updates.isArchived
      });
      return mapNote(res.data);
    },

    delete: async (id: string) => { // Soft delete
      await api.delete(`/notes/${id}`);
      // Return a mock object to satisfy potential return type expectations, though mostly unused
      return { id } as any; 
    },

    permanentDelete: async (id: string) => {
      await api.delete(`/notes/${id}/permanent`);
    },

    restore: async (id: string) => {
      const res = await api.post(`/notes/${id}/restore`);
      return mapNote(res.data);
    }
  },

  // Tag Operations
  tags: {
    list: async (userId: string) => {
      const res = await api.get('/tags/');
      return res.data.map(mapTag);
    },

    create: async (tagData: { name: string; ownerId: string }) => {
      const res = await api.post('/tags/', { name: tagData.name });
      return mapTag(res.data);
    },

    update: async (id: string, name: string) => {
      // Backend does not support tag renaming currently
      console.warn("Tag renaming not supported by backend");
      return { id, name } as Tag;
    },

    delete: async (id: string) => {
      await api.delete(`/tags/${id}`);
    }
  }
};

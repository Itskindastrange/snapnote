"use client";

import { generateId } from './utils';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // In a real app, this would be hashed. Here we just store it.
  createdAt: string;
  preferences: {
    theme: 'light' | 'dark';
  };
}

export interface Note {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  tags: string[]; // Array of tag IDs
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

// Storage Keys
const USERS_KEY = 'snapnote_users';
const NOTES_KEY = 'snapnote_notes';
const TAGS_KEY = 'snapnote_tags';
const CURRENT_USER_KEY = 'snapnote_current_user';

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// DB Operations
export const db = {
  // User Operations
  users: {
    create: async (userData: Omit<User, 'id' | 'createdAt' | 'preferences'>) => {
      await delay(300);
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      
      if (users.find((u: User) => u.email === userData.email)) {
        throw new Error('Email already exists');
      }

      const newUser: User = {
        ...userData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        preferences: { theme: 'dark' }
      };

      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return newUser;
    },
    
    login: async (email: string, password: string) => {
      await delay(300);
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const user = users.find((u: User) => u.email === email && u.passwordHash === password);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      return user;
    },

    update: async (id: string, updates: Partial<User>) => {
      await delay(200);
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const index = users.findIndex((u: User) => u.id === id);
      
      if (index === -1) throw new Error('User not found');
      
      const updatedUser = { ...users[index], ...updates };
      users[index] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return updatedUser;
    }
  },

  // Note Operations
  notes: {
    list: async (userId: string) => {
      await delay(200);
      const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
      return notes.filter((n: Note) => n.ownerId === userId && !n.isArchived);
    },

    listArchived: async (userId: string) => {
      await delay(200);
      const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
      return notes.filter((n: Note) => n.ownerId === userId && n.isArchived);
    },

    create: async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
      await delay(200);
      const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
      
      const newNote: Note = {
        ...noteData,
        id: generateId(),
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      notes.unshift(newNote); // Add to beginning
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
      return newNote;
    },

    update: async (id: string, updates: Partial<Note>) => {
      // Don't delay too much for auto-save feel
      const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
      const index = notes.findIndex((n: Note) => n.id === id);
      
      if (index === -1) throw new Error('Note not found');
      
      const updatedNote = { 
        ...notes[index], 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      notes[index] = updatedNote;
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
      return updatedNote;
    },

    delete: async (id: string) => { // Soft delete
      await delay(200);
      const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
      const index = notes.findIndex((n: Note) => n.id === id);
      
      if (index === -1) throw new Error('Note not found');
      
      notes[index].isArchived = true;
      notes[index].updatedAt = new Date().toISOString();
      
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
      return notes[index];
    },

    permanentDelete: async (id: string) => {
      await delay(200);
      const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
      const filteredNotes = notes.filter((n: Note) => n.id !== id);
      localStorage.setItem(NOTES_KEY, JSON.stringify(filteredNotes));
    },

    restore: async (id: string) => {
      await delay(200);
      const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
      const index = notes.findIndex((n: Note) => n.id === id);
      
      if (index === -1) throw new Error('Note not found');
      
      notes[index].isArchived = false;
      notes[index].updatedAt = new Date().toISOString();
      
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
      return notes[index];
    }
  },

  // Tag Operations
  tags: {
    list: async (userId: string) => {
      await delay(200);
      const tags = JSON.parse(localStorage.getItem(TAGS_KEY) || '[]');
      return tags.filter((t: Tag) => t.ownerId === userId);
    },

    create: async (tagData: Omit<Tag, 'id' | 'createdAt'>) => {
      await delay(200);
      const tags = JSON.parse(localStorage.getItem(TAGS_KEY) || '[]');
      
      // Check if exists
      const existing = tags.find((t: Tag) => t.name === tagData.name && t.ownerId === tagData.ownerId);
      if (existing) return existing;

      const newTag: Tag = {
        ...tagData,
        id: generateId(),
        createdAt: new Date().toISOString()
      };

      tags.push(newTag);
      localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
      return newTag;
    },

    update: async (id: string, name: string) => {
      await delay(200);
      const tags = JSON.parse(localStorage.getItem(TAGS_KEY) || '[]');
      const index = tags.findIndex((t: Tag) => t.id === id);
      
      if (index === -1) throw new Error('Tag not found');
      
      tags[index].name = name;
      localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
      return tags[index];
    },

    delete: async (id: string) => {
      await delay(200);
      const tags = JSON.parse(localStorage.getItem(TAGS_KEY) || '[]');
      const filteredTags = tags.filter((t: Tag) => t.id !== id);
      localStorage.setItem(TAGS_KEY, JSON.stringify(filteredTags));
      
      // Also remove this tag from all notes
      const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
      const updatedNotes = notes.map((n: Note) => ({
        ...n,
        tags: n.tags.filter(tId => tId !== id)
      }));
      localStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
    }
  }
};

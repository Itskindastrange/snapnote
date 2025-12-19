"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, Tag, Note } from '../lib/storage';
import { Tag as TagIcon, Edit2, Trash2, Save, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TagManager() {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [userTags, userNotes] = await Promise.all([
        db.tags.list(user.id),
        db.notes.list(user.id)
      ]);
      setTags(userTags);
      setNotes(userNotes);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTagName.trim() || !user) return;
    try {
      await db.tags.create({
        name: newTagName.trim().toLowerCase(),
        ownerId: user.id
      });
      setNewTagName('');
      loadData();
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await db.tags.update(id, editName.trim().toLowerCase());
      setEditingId(null);
      loadData();
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will remove the tag from all notes.')) return;
    try {
      await db.tags.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
  };

  const getUsageCount = (tagName: string) => {
    return notes.filter(n => n.tags.includes(tagName)).length;
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading tags...</div>;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Tags</h1>
      <p className="text-slate-400 mb-8">Manage your tags and organize your thoughts.</p>

      {/* Create New Tag */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Create New Tag</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Tag name..."
            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            onClick={handleCreate}
            disabled={!newTagName.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={18} />
            Add Tag
          </button>
        </div>
      </div>

      {/* Tags List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.div
              key={tag.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:border-white/20 transition-colors"
            >
              {editingId === tag.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-black/20 border border-blue-500/50 rounded px-2 py-1 text-white text-sm focus:outline-none"
                    autoFocus
                  />
                  <button onClick={() => handleUpdate(tag.id)} className="text-green-400 hover:text-green-300 p-1">
                    <Save size={16} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300 p-1">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <TagIcon size={16} />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-200">#{tag.name}</h3>
                      <p className="text-xs text-slate-500">{getUsageCount(tag.name)} notes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEdit(tag)}
                      className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(tag.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {tags.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No tags yet. Create one to get started!
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, Note, Tag } from '../lib/storage';
import { Search, Filter, Tag as TagIcon, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../lib/utils';

interface NotesListProps {
  onNavigate: (page: string, noteId?: string) => void;
  initialTagFilter?: string;
}

export default function NotesList({ onNavigate, initialTagFilter }: NotesListProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTagFilter ? [initialTagFilter] : []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [userNotes, userTags] = await Promise.all([
        db.notes.list(user.id),
        db.tags.list(user.id)
      ]);
      setNotes(userNotes);
      setTags(userTags);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const filteredNotes = notes.filter(note => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());

    // Tag filter (AND logic)
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tagId => note.tags.includes(tagId));

    return matchesSearch && matchesTags;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading notes...</div>;
  }

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar Filters (Desktop) */}
      <div className="hidden md:block w-64 border-r border-white/10 p-6 overflow-y-auto bg-slate-900/50">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Filters</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
            <span>Tags</span>
            {selectedTags.length > 0 && (
              <button 
                onClick={() => setSelectedTags([])}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Clear
              </button>
            )}
          </div>
          
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedTags.includes(tag.id)
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <TagIcon size={14} />
                <span>{tag.name}</span>
              </div>
              <span className="text-xs opacity-50">
                {notes.filter(n => n.tags.includes(tag.id)).length}
              </span>
            </button>
          ))}
          
          {tags.length === 0 && (
            <p className="text-xs text-slate-600 italic">No tags created yet</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl z-10">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Mobile Tag Filter (Horizontal Scroll) */}
          <div className="md:hidden mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedTags.includes(tag.id)
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                <Search className="text-slate-600" size={32} />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No notes found</h3>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => onNavigate('edit-note', note.id)}
                    className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {note.title || 'Untitled'}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-4 mb-4 h-[80px]">
                      {note.content || 'No content'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{formatDate(note.updatedAt)}</span>
                      </div>
                      <div className="flex gap-1">
                        {note.tags.slice(0, 2).map(tagId => {
                          const tag = tags.find(t => t.id === tagId);
                          if (!tag) return null;
                          return (
                            <span key={tagId} className="px-2 py-0.5 bg-slate-800 rounded-full text-[10px]">
                              #{tag.name}
                            </span>
                          );
                        })}
                        {note.tags.length > 2 && (
                          <span className="px-2 py-0.5 bg-slate-800 rounded-full text-[10px]">
                            +{note.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

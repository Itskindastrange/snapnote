"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, Note, Tag } from '../lib/storage';
import { Plus, Search, Clock, Tag as TagIcon, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../lib/utils';

interface DashboardProps {
  onNavigate: (page: string, noteId?: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickNote, setQuickNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      const [notes, userTags] = await Promise.all([
        db.notes.list(user.id),
        db.tags.list(user.id)
      ]);
      
      // Sort by updated at desc and take top 6
      const sorted = notes.sort((a: Note, b: Note) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ).slice(0, 6);
      
      setRecentNotes(sorted);
      setTags(userTags);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdd = async () => {
    if (!quickNote.trim() || !user) return;
    
    setIsSaving(true);
    try {
      // Extract title from first line
      const lines = quickNote.split('\n');
      const title = lines[0].substring(0, 50) || 'Untitled Note';
      
      const newNote = await db.notes.create({
        title,
        content: quickNote,
        ownerId: user.id,
        tags: []
      });
      
      setQuickNote('');
      loadDashboardData(); // Refresh list
      // Optional: Navigate to edit mode
      // onNavigate('edit-note', newNote.id);
    } catch (error) {
      console.error('Failed to create note', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleQuickAdd();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-400">Capture your thoughts before they fly away.</p>
        </div>
        <button 
          onClick={() => onNavigate('new-note')}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          <span>New Note</span>
        </button>
      </div>

      {/* Quick Add Widget */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Quick Capture
          </h2>
          <span className="text-xs text-slate-500 hidden md:block">Press Ctrl+Enter to save</span>
        </div>
        <div className="relative">
          <textarea
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind? Type here..."
            className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[120px] resize-none transition-all"
          />
          <div className="absolute bottom-4 right-4">
            <button
              onClick={handleQuickAdd}
              disabled={!quickNote.trim() || isSaving}
              className="bg-white/10 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Recent Notes Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Notes</h2>
          <button 
            onClick={() => onNavigate('notes')}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>

        {recentNotes.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 border-dashed">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-slate-500" size={32} />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No notes yet</h3>
            <p className="text-slate-400 mb-6">Create your first note to get started</p>
            <button 
              onClick={() => onNavigate('new-note')}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Create a note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onNavigate('edit-note', note.id)}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer hover:-translate-y-1"
              >
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {note.title || 'Untitled'}
                </h3>
                <p className="text-slate-400 text-sm line-clamp-3 mb-4 h-[60px]">
                  {note.content || 'No content'}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>
                  {note.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <TagIcon size={14} />
                      <span>{note.tags.length}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Tag Cloud */}
      {tags.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">Your Tags</h2>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => onNavigate('notes-tag', tag.id)}
                className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-full text-slate-300 hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500/30 transition-all"
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for empty state icon
function FileText({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

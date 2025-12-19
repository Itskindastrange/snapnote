"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, Note, Tag } from '../lib/storage';
import { ArrowLeft, Save, Trash2, Tag as TagIcon, X, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface NoteEditorProps {
  noteId?: string; // If null, creating new note
  onBack: () => void;
}

export default function NoteEditor({ noteId, onBack }: NoteEditorProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<Tag[]>([]); // All available tags
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentNoteId, setCurrentNoteId] = useState<string | undefined>(noteId);
  const [isLoading, setIsLoading] = useState(!!noteId);

  // Load note data if editing
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        // Load all tags first
        const allTags = await db.tags.list(user.id);
        setTags(allTags);

        if (noteId) {
          const notes = await db.notes.list(user.id);
          const note = notes.find((n: Note) => n.id === noteId);
          if (note) {
            setTitle(note.title);
            setContent(note.content);
            setSelectedTagNames(note.tags);
            setLastSaved(new Date(note.updatedAt));
          }
        }
      } catch (error) {
        console.error('Error loading note:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [noteId, user]);

  // Auto-save logic
  useEffect(() => {
    if (!user || isLoading) return;

    const saveTimeout = setTimeout(async () => {
      if (content || title) {
        await saveNote();
      }
    }, 3000);

    return () => clearTimeout(saveTimeout);
  }, [title, content, selectedTagNames]);

  const saveNote = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const noteData = {
        title: title || (content.split('\n')[0]?.substring(0, 50) || 'Untitled'),
        content,
        ownerId: user.id,
        tags: selectedTagNames
      };

      if (currentNoteId) {
        await db.notes.update(currentNoteId, noteData);
      } else {
        const newNote = await db.notes.create(noteData);
        setCurrentNoteId(newNote.id);
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTagInput.trim() || !user) return;
    
    const tagName = newTagInput.trim().toLowerCase();
    
    // Check if tag exists
    let tag = tags.find(t => t.name === tagName);
    
    if (!tag) {
      // Create new tag
      try {
        tag = await db.tags.create({
          name: tagName,
          ownerId: user.id
        });
        setTags([...tags, tag]);
      } catch (error) {
        console.error('Error creating tag:', error);
        return;
      }
    }

    if (!selectedTagNames.includes(tag.name)) {
      setSelectedTagNames([...selectedTagNames, tag.name]);
    }
    
    setNewTagInput('');
  };

  const handleRemoveTag = (tagName: string) => {
    setSelectedTagNames(selectedTagNames.filter(name => name !== tagName));
  };

  const handleDelete = async () => {
    if (!currentNoteId || !confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await db.notes.delete(currentNoteId);
      onBack();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-white">Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-sm text-slate-500">
            {isSaving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Unsaved'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
            title={isPreview ? "Edit" : "Preview"}
          >
            {isPreview ? <Edit3 size={20} /> : <Eye size={20} />}
          </button>
          {currentNoteId && (
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-6">
          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="w-full bg-transparent text-4xl font-bold text-white placeholder:text-slate-700 focus:outline-none"
          />

          {/* Tags Input */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedTagNames.map(tagName => {
              return (
                <span key={tagName} className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                  #{tagName}
                  <button onClick={() => handleRemoveTag(tagName)} className="hover:text-white">
                    <X size={14} />
                  </button>
                </span>
              );
            })}
            <div className="relative flex items-center">
              <TagIcon size={16} className="absolute left-2 text-slate-500" />
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag..."
                className="bg-white/5 border border-white/10 rounded-full py-1 pl-8 pr-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all w-32 focus:w-48"
              />
            </div>
          </div>

          {/* Content Editor/Preview */}
          <div className="min-h-[500px]">
            {isPreview ? (
              <div className="prose prose-invert prose-lg max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing..."
                className="w-full h-full min-h-[500px] bg-transparent text-lg text-slate-300 placeholder:text-slate-700 focus:outline-none resize-none leading-relaxed font-mono"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

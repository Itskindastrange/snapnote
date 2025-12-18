"use client";

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, Note } from '../lib/storage';
import { Archive, RefreshCw, Trash2, Clock } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function ArchivePage() {
  const { user } = useAuth();
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    loadArchived();
  }, [user]);

  const loadArchived = async () => {
    if (!user) return;
    const notes = await db.notes.listArchived(user.id);
    setArchivedNotes(notes);
    setIsLoading(false);
  };

  const handleRestore = async (id: string) => {
    await db.notes.restore(id);
    loadArchived();
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('This cannot be undone. Delete permanently?')) return;
    await db.notes.permanentDelete(id);
    loadArchived();
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading archive...</div>;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Archive</h1>
      <p className="text-slate-400 mb-8">Notes in the archive are deleted after 30 days.</p>

      {archivedNotes.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 border-dashed">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Archive className="text-slate-500" size={32} />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Archive is empty</h3>
          <p className="text-slate-400">Deleted notes will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {archivedNotes.map((note) => (
            <div 
              key={note.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:bg-white/10 transition-colors"
            >
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="text-lg font-semibold text-white mb-1 truncate">{note.title}</h3>
                <p className="text-sm text-slate-400 truncate">{note.content}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <Clock size={12} />
                  <span>Deleted {formatDate(note.updatedAt)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleRestore(note.id)}
                  className="p-2 hover:bg-blue-500/20 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                  title="Restore"
                >
                  <RefreshCw size={18} />
                </button>
                <button 
                  onClick={() => handlePermanentDelete(note.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                  title="Delete Permanently"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


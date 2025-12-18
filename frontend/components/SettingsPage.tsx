"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, Note } from '../lib/storage';
import { User, Moon, Sun, Download, Trash2, LogOut, RefreshCw, Archive } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout, updateProfile } = useAuth();
  const [notesCount, setNotesCount] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);
  const [name, setName] = useState(user?.name || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      loadStats();
      setName(user.name);
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    const notes = await db.notes.list(user.id);
    const archived = await db.notes.listArchived(user.id);
    setNotesCount(notes.length);
    setArchivedCount(archived.length);
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) return;
    await updateProfile({ name });
    setIsEditing(false);
  };

  const handleExport = async () => {
    if (!user) return;
    const notes = await db.notes.list(user.id);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "snapnote_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleClearArchive = async () => {
    if (!user || !confirm('Permanently delete all archived notes?')) return;
    const archived = await db.notes.listArchived(user.id);
    for (const note of archived) {
      await db.notes.permanentDelete(note.id);
    }
    loadStats();
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      {/* Profile Section */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <User className="text-blue-400" />
          Profile
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <div className="text-slate-200 font-mono bg-black/20 px-4 py-2 rounded-lg border border-white/5">
              {user?.email}
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Display Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-slate-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              {isEditing ? (
                <button 
                  onClick={handleUpdateProfile}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Save
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <RefreshCw className="text-violet-400" />
          Data Management
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <div className="text-3xl font-bold text-white mb-1">{notesCount}</div>
            <div className="text-sm text-slate-400">Active Notes</div>
          </div>
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <div className="text-3xl font-bold text-white mb-1">{archivedCount}</div>
            <div className="text-sm text-slate-400">Archived Notes</div>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleExport}
            className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-200 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Download size={20} className="text-blue-400" />
              <span>Export All Data (JSON)</span>
            </div>
            <span className="text-xs text-slate-500 group-hover:text-slate-300">Download</span>
          </button>

          <button 
            onClick={handleClearArchive}
            disabled={archivedCount === 0}
            className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-red-500/10 rounded-xl text-slate-200 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <Trash2 size={20} className="text-red-400" />
              <span>Clear Archive</span>
            </div>
            <span className="text-xs text-slate-500 group-hover:text-red-300">Permanent</span>
          </button>
        </div>
      </section>

      {/* Account Actions */}
      <section className="pt-4">
        <button 
          onClick={logout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors px-4 py-2 rounded-lg hover:bg-red-500/10"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </section>
    </div>
  );
}

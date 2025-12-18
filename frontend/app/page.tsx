"use client";

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Sidebar } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import NoteEditor from './components/NoteEditor';
import NotesList from './components/NotesList';
import TagManager from './components/TagManager';
import SettingsPage from './components/SettingsPage';
import ArchivePage from './components/ArchivePage';
import AuthPage from './components/AuthPage';
import { Menu } from 'lucide-react';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeNoteId, setActiveNoteId] = useState<string | undefined>(undefined);
  const [activeTagFilter, setActiveTagFilter] = useState<string | undefined>(undefined);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleNavigate = (page: string, noteId?: string) => {
    if (page === 'edit-note') {
      setActiveNoteId(noteId);
      setActiveTab('edit-note');
    } else if (page === 'new-note') {
      setActiveNoteId(undefined);
      setActiveTab('edit-note');
    } else if (page === 'notes-tag') {
      setActiveTagFilter(noteId); // noteId is tagId here
      setActiveTab('notes');
    } else {
      setActiveTab(page);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'notes':
        return <NotesList onNavigate={handleNavigate} initialTagFilter={activeTagFilter} />;
      case 'edit-note':
        return <NoteEditor noteId={activeNoteId} onBack={() => setActiveTab('notes')} />;
      case 'tags':
        return <TagManager />;
      case 'settings':
        return <SettingsPage />;
      case 'archive':
        return <ArchivePage />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl z-20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-violet-600 rounded flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
                <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
              </svg>
            </div>
            <span className="font-bold text-white">SnapNote</span>
          </div>
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-slate-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {/* Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[100px]" />
          </div>
          
          <div className="relative z-10 h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

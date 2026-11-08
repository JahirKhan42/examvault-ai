import React from 'react';
import { Sparkles, Moon, Sun, BookOpen, Layers, Grid3X3, PlusCircle, Printer, FolderArchive, HelpCircle } from 'lucide-react';
import { Deck } from '../types';

interface HeaderProps {
  currentView: 'study' | 'grid' | 'create';
  onViewChange: (view: 'study' | 'grid' | 'create') => void;
  activeDeck: Deck | null;
  allDecks: Deck[];
  onSelectDeck: (deckId: string) => void;
  onOpenDeckLibrary: () => void;
  onPrint: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  activeDeck,
  allDecks,
  onSelectDeck,
  onOpenDeckLibrary,
  onPrint,
  darkMode,
  onToggleDarkMode,
  onOpenGuide,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-sm shadow-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <button
            onClick={() => onViewChange('study')}
            className="text-left group cursor-pointer"
          >
            <span className="text-lg font-bold font-display tracking-tight text-slate-900 dark:text-white whitespace-nowrap block">
              ExamVault <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">AI</span>
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links & Active Deck Selector */}
        <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto py-1">
          {/* Deck Quick Dropdown */}
          {allDecks.length > 0 && (
            <div className="relative hidden lg:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
              <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <select
                value={activeDeck?.id || ''}
                onChange={(e) => onSelectDeck(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-medium text-xs focus:outline-none max-w-[180px] truncate cursor-pointer"
                title="Select active study deck"
              >
                {allDecks.map((d) => (
                  <option key={d.id} value={d.id} className="dark:bg-slate-900">
                    {d.topic} ({d.cards.length} cards)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mode Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium">
            <button
              onClick={() => onViewChange('study')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentView === 'study'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Flip Study</span>
            </button>
            <button
              onClick={() => onViewChange('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentView === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Cheat Sheet</span>
            </button>
            <button
              onClick={() => onViewChange('create')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentView === 'create'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Create Deck</span>
            </button>
          </nav>

          <button
            onClick={onOpenDeckLibrary}
            className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
            title="Open saved decks library"
          >
            <FolderArchive className="w-4 h-4 text-slate-500" />
            <span>Deck Library</span>
            <span className="text-[10px] tabular-nums font-mono px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {allDecks.length}
            </span>
          </button>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
            title="How ExamVault works"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guide</span>
          </button>
        </div>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Print Cheat Sheet */}
          {activeDeck && activeDeck.cards.length > 0 && (
            <button
              onClick={onPrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Print 2-column cheat sheet or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
          )}

          {/* New Deck CTA */}
          <button
            onClick={() => onViewChange('create')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Deck</span>
            <span className="sm:hidden">New</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};

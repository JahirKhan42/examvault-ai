import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { StudyFlipMode } from './components/StudyFlipMode';
import { CheatSheetGrid } from './components/CheatSheetGrid';
import { NoteInputSection } from './components/NoteInputSection';
import { DeckLibraryModal } from './components/DeckLibraryModal';
import { PrintSheet } from './components/PrintSheet';
import { WelcomeGuide } from './components/WelcomeGuide';
import { Deck, Flashcard, DeckScope, UploadedFile } from './types';
import { INITIAL_DECKS } from './data/defaultDecks';
import { printCheatSheet } from './utils/export';
import { sounds } from './utils/audio';

const STORAGE_KEY_DECKS = 'examvault_decks_v2';
const STORAGE_KEY_ACTIVE = 'examvault_active_deck_v2';
const STORAGE_KEY_THEME = 'examvault_theme_v2';
const STORAGE_KEY_SEEN_WELCOME = 'examvault_welcome_seen_v2';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Decks state initialized from localStorage
  const [decks, setDecks] = useState<Deck[]>(() => {
    if (typeof window === 'undefined') return INITIAL_DECKS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DECKS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_DECKS;
  });

  // Active Deck ID
  const [activeDeckId, setActiveDeckId] = useState<string>(() => {
    if (typeof window === 'undefined') return INITIAL_DECKS[0].id;
    const stored = localStorage.getItem(STORAGE_KEY_ACTIVE);
    if (stored && decks.some((d) => d.id === stored)) {
      return stored;
    }
    return decks[0]?.id || INITIAL_DECKS[0].id;
  });

  // View Mode: 'study' (3D flip card) | 'grid' (cheat sheet) | 'create' (generate notes)
  const [currentView, setCurrentView] = useState<'study' | 'grid' | 'create'>('study');
  const [isDeckLibraryOpen, setIsDeckLibraryOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY_SEEN_WELCOME) !== 'true';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Sync dark mode class on document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [darkMode]);

  // Sync decks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
    } catch (e) {
      console.warn('Failed to persist decks to localStorage:', e);
    }
  }, [decks]);

  // Sync active deck ID to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, activeDeckId);
    } catch {
      // Ignore
    }
  }, [activeDeckId]);

  // Current active deck
  const activeDeck = useMemo(() => {
    return decks.find((d) => d.id === activeDeckId) || decks[0] || null;
  }, [decks, activeDeckId]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleSelectDeck = (deckId: string) => {
    setActiveDeckId(deckId);
    if (currentView === 'create') {
      setCurrentView('study');
    }
  };

  const handleUpdateDeckCards = (deckId: string, updatedCards: Flashcard[]) => {
    setDecks((prev) =>
      prev.map((d) => (d.id === deckId ? { ...d, cards: updatedCards } : d))
    );
  };

  const handleRenameDeck = (deckId: string, newTitle: string) => {
    setDecks((prev) =>
      prev.map((d) =>
        d.id === deckId ? { ...d, title: newTitle, topic: newTitle } : d
      )
    );
  };

  const handleDeleteDeck = (deckId: string) => {
    setDecks((prev) => {
      const remaining = prev.filter((d) => d.id !== deckId);
      if (activeDeckId === deckId && remaining.length > 0) {
        setActiveDeckId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Generate Flashcards handler
  const handleGenerate = async (data: {
    topic: string;
    notesText: string;
    scope: DeckScope;
    files: UploadedFile[];
  }) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: data.topic,
          notesText: data.notesText,
          scope: data.scope,
          files: data.files.map((f) => ({
            mimeType: f.mimeType,
            data: f.data,
            name: f.name,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to generate flashcards from notes.');
      }

      // Create new Deck
      const newDeck: Deck = {
        id: `deck-${Date.now()}`,
        title: data.topic,
        topic: data.topic,
        createdAt: new Date().toISOString(),
        scope: data.scope,
        notesExcerpt: data.notesText ? data.notesText.slice(0, 200) : 'Uploaded note materials',
        cards: result.cards.map((c: any, idx: number) => ({
          id: c.id || idx + 1,
          type: c.type === 'concept' ? 'concept' : 'definition',
          front: c.front,
          back: c.back,
          extraContext: c.extraContext || null,
          status: 'unstudied' as const,
        })),
      };

      setDecks((prev) => [newDeck, ...prev]);
      setActiveDeckId(newDeck.id);
      setCurrentView('study');
      sounds.playMastered();
    } catch (err: any) {
      console.error('Generation error:', err);
      setApiError(err.message || 'An error occurred while generating flashcards. Please check inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseWelcome = () => {
    setIsWelcomeOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY_SEEN_WELCOME, 'true');
    } catch {
      // ignore
    }
  };

  const handleStartWithSample = () => {
    handleCloseWelcome();
    if (decks.length > 0) {
      setActiveDeckId(decks[0].id);
    }
    setCurrentView('study');
  };

  const handleCreateNewFromWelcome = () => {
    handleCloseWelcome();
    setCurrentView('create');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        activeDeck={activeDeck}
        allDecks={decks}
        onSelectDeck={handleSelectDeck}
        onOpenDeckLibrary={() => setIsDeckLibraryOpen(true)}
        onPrint={printCheatSheet}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenGuide={() => setIsWelcomeOpen(true)}
      />

      {/* Main Content Workspace */}
      <main className="no-print flex-1">
        {currentView === 'create' && (
          <NoteInputSection
            onGenerate={handleGenerate}
            isLoading={isLoading}
            error={apiError}
            onClearError={() => setApiError(null)}
          />
        )}

        {currentView === 'study' && activeDeck && (
          <StudyFlipMode
            deck={activeDeck}
            onUpdateDeckCards={handleUpdateDeckCards}
            onSwitchToGrid={() => setCurrentView('grid')}
          />
        )}

        {currentView === 'grid' && activeDeck && (
          <CheatSheetGrid
            deck={activeDeck}
            onUpdateDeckCards={handleUpdateDeckCards}
            onSwitchToStudy={() => setCurrentView('study')}
          />
        )}

        {/* If no deck selected or empty */}
        {(!activeDeck && currentView !== 'create') && (
          <div className="max-w-xl mx-auto py-20 px-4 text-center">
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              No Deck Selected
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Create your first deck by converting your class notes into interactive flashcards.
            </p>
            <button
              onClick={() => setCurrentView('create')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-xs hover:bg-indigo-700 cursor-pointer"
            >
              Convert Notes Now
            </button>
          </div>
        )}
      </main>

      {/* Dedicated Printable Cheat Sheet for @media print */}
      {activeDeck && <PrintSheet deck={activeDeck} />}

      {/* Deck Library Modal */}
      <DeckLibraryModal
        isOpen={isDeckLibraryOpen}
        onClose={() => setIsDeckLibraryOpen(false)}
        decks={decks}
        activeDeckId={activeDeckId}
        onSelectDeck={handleSelectDeck}
        onDeleteDeck={handleDeleteDeck}
        onRenameDeck={handleRenameDeck}
        onNewDeck={() => {
          setIsDeckLibraryOpen(false);
          setCurrentView('create');
        }}
      />

      {/* First-time User Welcome & Help Guide Modal */}
      <WelcomeGuide
        isOpen={isWelcomeOpen}
        onClose={handleCloseWelcome}
        onStartWithSample={handleStartWithSample}
        onCreateNew={handleCreateNewFromWelcome}
      />
    </div>
  );
}

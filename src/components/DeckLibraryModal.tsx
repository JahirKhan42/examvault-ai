import React, { useState } from 'react';
import {
  FolderArchive,
  Layers,
  Calendar,
  Trash2,
  Edit3,
  Check,
  X,
  Download,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Deck } from '../types';
import { exportToAnkiCsv, exportDeckToJson } from '../utils/export';

interface DeckLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  decks: Deck[];
  activeDeckId: string;
  onSelectDeck: (deckId: string) => void;
  onDeleteDeck: (deckId: string) => void;
  onRenameDeck: (deckId: string, newTitle: string) => void;
  onNewDeck: () => void;
}

export const DeckLibraryModal: React.FC<DeckLibraryModalProps> = ({
  isOpen,
  onClose,
  decks,
  activeDeckId,
  onSelectDeck,
  onDeleteDeck,
  onRenameDeck,
  onNewDeck,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen) return null;

  const startRename = (deck: Deck) => {
    setEditingId(deck.id);
    setEditTitle(deck.title);
  };

  const saveRename = (deckId: string) => {
    if (editTitle.trim()) {
      onRenameDeck(deckId, editTitle.trim());
    }
    setEditingId(null);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                Saved Deck Library
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                All generated flashcard decks stored locally in your browser
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Deck List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {decks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">No decks saved yet.</p>
            </div>
          ) : (
            decks.map((deck) => {
              const isActive = deck.id === activeDeckId;
              const isRenaming = editingId === deck.id;
              const masteredCount = deck.cards.filter((c) => c.status === 'mastered').length;
              const masteryPercent = deck.cards.length > 0 ? Math.round((masteredCount / deck.cards.length) * 100) : 0;

              return (
                <div
                  key={deck.id}
                  onClick={() => {
                    if (!isRenaming) {
                      onSelectDeck(deck.id);
                      onClose();
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 ring-1 ring-indigo-500/50'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    {isRenaming ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="text-sm font-semibold p-1.5 rounded-lg border border-indigo-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => saveRename(deck.id)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-md cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {deck.title}
                          </h3>
                          {isActive && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                              Active
                            </span>
                          )}
                        </div>

                        {/* Unboxed Metadata with Typographic Separators */}
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <span>{deck.cards.length} cards</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums font-mono">{masteryPercent}% mastered</span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{formatDate(deck.createdAt)}</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions for this deck */}
                  <div
                    className="flex items-center gap-1.5 shrink-0 self-end sm:self-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => exportToAnkiCsv(deck)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Export Anki CSV"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => exportDeckToJson(deck)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Download JSON backup"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startRename(deck)}
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Rename deck"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {decks.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete deck "${deck.title}"?`)) {
                            onDeleteDeck(deck.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                        title="Delete deck"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-3xl flex items-center justify-between">
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {decks.length} total saved decks
          </span>

          <button
            onClick={() => {
              onClose();
              onNewDeck();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Deck</span>
          </button>
        </div>
      </div>
    </div>
  );
};

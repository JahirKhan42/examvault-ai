import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Printer,
  Plus,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Edit2,
  Trash2,
  Save,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Deck, Flashcard, CardType, CardStatus } from '../types';
import { exportToAnkiCsv, exportDeckToJson, printCheatSheet } from '../utils/export';

interface CheatSheetGridProps {
  deck: Deck;
  onUpdateDeckCards: (deckId: string, updatedCards: Flashcard[]) => void;
  onSwitchToStudy: () => void;
}

export const CheatSheetGrid: React.FC<CheatSheetGridProps> = ({
  deck,
  onUpdateDeckCards,
  onSwitchToStudy,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'definition' | 'concept' | 'review' | 'mastered'>('all');
  const [editingCardId, setEditingCardId] = useState<number | null>(null);

  // Edit Card Form State
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [editContext, setEditContext] = useState('');
  const [editType, setEditType] = useState<CardType>('definition');

  // Add Card Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newContext, setNewContext] = useState('');
  const [newType, setNewType] = useState<CardType>('definition');

  const filteredCards = useMemo(() => {
    return deck.cards.filter((card) => {
      // Type or status filter
      if (filterType === 'definition' && card.type !== 'definition') return false;
      if (filterType === 'concept' && card.type !== 'concept') return false;
      if (filterType === 'review' && card.status !== 'review') return false;
      if (filterType === 'mastered' && card.status !== 'mastered') return false;

      // Text search
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase();
      const matchFront = card.front.toLowerCase().includes(query);
      const matchBack = card.back.toLowerCase().includes(query);
      const matchContext = card.extraContext?.toLowerCase().includes(query);
      return matchFront || matchBack || Boolean(matchContext);
    });
  }, [deck.cards, filterType, searchTerm]);

  const startEdit = (card: Flashcard) => {
    setEditingCardId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
    setEditContext(card.extraContext || '');
    setEditType(card.type);
  };

  const saveEdit = (cardId: number) => {
    const updated = deck.cards.map((c) => {
      if (c.id === cardId) {
        return {
          ...c,
          front: editFront.trim(),
          back: editBack.trim(),
          extraContext: editContext.trim() ? editContext.trim() : null,
          type: editType,
        };
      }
      return c;
    });
    onUpdateDeckCards(deck.id, updated);
    setEditingCardId(null);
  };

  const deleteCard = (cardId: number) => {
    if (confirm('Are you sure you want to remove this card from the deck?')) {
      const updated = deck.cards.filter((c) => c.id !== cardId);
      onUpdateDeckCards(deck.id, updated);
    }
  };

  const toggleStatus = (cardId: number) => {
    const updated = deck.cards.map((c) => {
      if (c.id === cardId) {
        const nextStatus: CardStatus =
          c.status === 'mastered' ? 'review' : c.status === 'review' ? 'unstudied' : 'mastered';
        return { ...c, status: nextStatus };
      }
      return c;
    });
    onUpdateDeckCards(deck.id, updated);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: Date.now(),
      front: newFront.trim(),
      back: newBack.trim(),
      extraContext: newContext.trim() ? newContext.trim() : null,
      type: newType,
      status: 'unstudied',
    };

    onUpdateDeckCards(deck.id, [...deck.cards, newCard]);
    setNewFront('');
    setNewBack('');
    setNewContext('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header and Toolbar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>{deck.topic}</span>
            <span aria-hidden="true">·</span>
            <span>Cheat Sheet & Grid View</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-mono">{deck.cards.length} Cards Total</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white mt-0.5">
            Overview Cheat Sheet
          </h1>
        </div>

        {/* Export & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportToAnkiCsv(deck)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
            title="Export directly formatted for Anki and Quizlet CSV import"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export Anki/Quizlet CSV</span>
          </button>

          <button
            onClick={printCheatSheet}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
            title="Print or Save PDF 2-column cheat sheet"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-500" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={() => exportDeckToJson(deck)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Download JSON deck file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup JSON</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search terms, answers, or context..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-medium">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({deck.cards.length})
          </button>
          <button
            onClick={() => setFilterType('definition')}
            className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'definition'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Definitions
          </button>
          <button
            onClick={() => setFilterType('concept')}
            className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'concept'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Exam Questions
          </button>
          <button
            onClick={() => setFilterType('review')}
            className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'review'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Needs Review
          </button>
          <button
            onClick={() => setFilterType('mastered')}
            className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'mastered'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mastered
          </button>
        </div>
      </div>

      {/* Grid of Flashcards */}
      {filteredCards.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No cards match your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card, idx) => {
            const isEditing = editingCardId === card.id;

            return (
              <div
                key={card.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all relative group"
              >
                {isEditing ? (
                  // Edit Form
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 uppercase">
                        Card Type
                      </label>
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value as CardType)}
                        className="mt-1 w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="definition">Definition / Term</option>
                        <option value="concept">Exam Concept Question</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 uppercase">
                        Front (Prompt)
                      </label>
                      <input
                        type="text"
                        value={editFront}
                        onChange={(e) => setEditFront(e.target.value)}
                        className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 uppercase">
                        Back (Answer)
                      </label>
                      <textarea
                        rows={3}
                        value={editBack}
                        onChange={(e) => setEditBack(e.target.value)}
                        className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 uppercase">
                        Extra Context (Optional)
                      </label>
                      <input
                        type="text"
                        value={editContext}
                        onChange={(e) => setEditContext(e.target.value)}
                        placeholder="Leave blank if direct from notes"
                        className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingCardId(null)}
                        className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(card.id)}
                        className="px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  // Card Display
                  <>
                    <div>
                      {/* Card Top Metadata & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-semibold tracking-wide uppercase text-indigo-600 dark:text-indigo-400">
                          {card.type === 'concept' ? 'Exam Question' : 'Definition'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Toggle Status Button */}
                          <button
                            onClick={() => toggleStatus(card.id)}
                            className="text-xs transition-colors cursor-pointer"
                            title="Click to toggle status (Mastered / Needs Review / Unstudied)"
                          >
                            {card.status === 'mastered' && (
                              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Mastered</span>
                              </span>
                            )}
                            {card.status === 'review' && (
                              <span className="text-[10px] font-medium text-rose-500 flex items-center gap-0.5">
                                <XCircle className="w-3 h-3" />
                                <span>Review</span>
                              </span>
                            )}
                            {card.status === 'unstudied' && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-600">
                                Unstudied
                              </span>
                            )}
                          </button>

                          {/* Action Buttons */}
                          <button
                            onClick={() => startEdit(card)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            title="Edit Card"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteCard(card.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Card"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Front: Prompt */}
                      <div className="mb-3">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {card.front}
                        </h3>
                      </div>

                      {/* Back: Answer */}
                      <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800/80 whitespace-pre-line">
                        {card.back}
                      </div>

                      {/* Extra Context */}
                      {card.extraContext && (
                        <div className="mt-3 p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-start gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                              Extra Context:{' '}
                            </span>
                            <span>{card.extraContext}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono">#{idx + 1}</span>
                      <button
                        onClick={onSwitchToStudy}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Study in 3D Card →
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Add Custom Flashcard
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as CardType)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="definition">Definition / Key Term</option>
                  <option value="concept">Exam Concept Question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Card Front (Term or Question)
                </label>
                <input
                  type="text"
                  required
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. Proton Motive Force or What is the role of..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Card Back (Grounded Answer / Definition)
                </label>
                <textarea
                  rows={3}
                  required
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="Accurate definition or exam answer..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Extra Context / Clarification (Optional)
                </label>
                <input
                  type="text"
                  value={newContext}
                  onChange={(e) => setNewContext(e.target.value)}
                  placeholder="Explanation if abbreviations were expanded..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Shuffle,
  Volume2,
  VolumeX,
  Volume1,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Award,
  Keyboard,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Deck, Flashcard } from '../types';
import { sounds } from '../utils/audio';

interface StudyFlipModeProps {
  deck: Deck;
  onUpdateDeckCards: (deckId: string, updatedCards: Flashcard[]) => void;
  onSwitchToGrid: () => void;
}

export const StudyFlipMode: React.FC<StudyFlipModeProps> = ({
  deck,
  onUpdateDeckCards,
  onSwitchToGrid,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'unmastered'>('all');

  const cards = useMemo(() => {
    if (filterMode === 'unmastered') {
      const filtered = deck.cards.filter((c) => c.status !== 'mastered');
      return filtered.length > 0 ? filtered : deck.cards;
    }
    return deck.cards;
  }, [deck.cards, filterMode]);

  const currentCard: Flashcard | undefined = cards[currentIndex];

  // Stats calculation
  const totalCards = deck.cards.length;
  const masteredCount = deck.cards.filter((c) => c.status === 'mastered').length;
  const reviewCount = deck.cards.filter((c) => c.status === 'review').length;
  const unstudiedCount = deck.cards.filter((c) => c.status === 'unstudied').length;
  const masteryPercentage = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;
  const allMastered = totalCards > 0 && masteredCount === totalCards;

  // Fire confetti on 100% mastery
  useEffect(() => {
    if (allMastered) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [allMastered]);

  // Stop any speech when changing card
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setIsFlipped(false);
  }, [currentIndex]);

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => {
      const next = !prev;
      sounds.playFlip();
      return next;
    });
  }, []);

  const goToNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, cards.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const markCard = useCallback(
    (status: 'mastered' | 'review') => {
      if (!currentCard) return;

      if (status === 'mastered') {
        sounds.playMastered();
      } else {
        sounds.playReview();
      }

      const updated = deck.cards.map((c) =>
        c.id === currentCard.id ? { ...c, status } : c
      );
      onUpdateDeckCards(deck.id, updated);

      // Automatically advance to next card after brief delay
      if (currentIndex < cards.length - 1) {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, 160);
      }
    },
    [currentCard, deck.cards, deck.id, onUpdateDeckCards, currentIndex, cards.length]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.code === 'Space') {
        e.preventDefault();
        flipCard();
      } else if (e.code === 'ArrowLeft' || e.key === '1') {
        e.preventDefault();
        markCard('review');
      } else if (e.code === 'ArrowRight' || e.key === '2') {
        e.preventDefault();
        markCard('mastered');
      } else if (e.code === 'KeyJ' || (e.shiftKey && e.code === 'ArrowLeft')) {
        goToPrev();
      } else if (e.code === 'KeyK' || (e.shiftKey && e.code === 'ArrowRight')) {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipCard, markCard, goToPrev, goToNext]);

  // Read card aloud via Web Speech API
  const speakCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!currentCard) return;
    const textToSpeak = isFlipped
      ? `${currentCard.back}. ${currentCard.extraContext ? `Context: ${currentCard.extraContext}` : ''}`
      : currentCard.front;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleShuffle = () => {
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    onUpdateDeckCards(deck.id, shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleResetSession = () => {
    const reset = deck.cards.map((c) => ({ ...c, status: 'unstudied' as const }));
    onUpdateDeckCards(deck.id, reset);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (deck.cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          This deck has no flashcards yet.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Deck Header & Mode Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>{deck.topic}</span>
            <span aria-hidden="true">·</span>
            <span>{deck.cards.length} Cards Total</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{deck.scope} Scope</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white mt-0.5">
            Active Recall Study Session
          </h1>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Shuffle card order"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>

          <button
            onClick={handleResetSession}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Reset all card statuses to unstudied"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Session</span>
          </button>

          <button
            onClick={() => {
              const next = !audioEnabled;
              setAudioEnabled(next);
              sounds.setEnabled(next);
            }}
            className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
              audioEnabled
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'text-slate-400 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
            }`}
            title={audioEnabled ? 'Sound effects enabled' : 'Sound effects muted'}
            aria-label="Toggle sound effects"
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Live Mastery Progress Bar */}
      <div className="mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-900 dark:text-white font-medium">Mastery Progress</span>
            <span className="text-slate-600 dark:text-slate-400 font-normal">
              · <span className="tabular-nums font-mono text-slate-900 dark:text-white font-semibold">{masteredCount}</span> / {totalCards} Mastered
            </span>
          </div>
          <span className="tabular-nums font-mono text-indigo-600 dark:text-indigo-400 font-bold">
            {masteryPercentage}%
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(masteredCount / totalCards) * 100}%` }}
            title={`Mastered: ${masteredCount}`}
          />
          <div
            className="h-full bg-rose-400 transition-all duration-300"
            style={{ width: `${(reviewCount / totalCards) * 100}%` }}
            title={`Needs Review: ${reviewCount}`}
          />
        </div>

        {/* Legend */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{masteredCount} Mastered</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>{reviewCount} Needs Review</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span>{unstudiedCount} Unstudied</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setFilterMode((m) => (m === 'all' ? 'unmastered' : 'all'));
                setCurrentIndex(0);
              }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 underline cursor-pointer"
            >
              {filterMode === 'all' ? 'Focus on Unmastered' : 'Show All Cards'}
            </button>
          </div>
        </div>
      </div>

      {/* All Mastered Celebration Banner */}
      {allMastered && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                100% Deck Mastery Achieved!
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                You have successfully mastered every definition and exam concept in this deck.
              </p>
            </div>
          </div>
          <button
            onClick={onSwitchToGrid}
            className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Review Cheat Sheet
          </button>
        </div>
      )}

      {/* 3D Flip Card Container */}
      {currentCard && (
        <div className="perspective-1000 my-4 select-none">
          <div
            onClick={flipCard}
            className={`relative w-full min-h-[340px] sm:min-h-[380px] rounded-3xl transition-transform duration-500 transform-style-preserve-3d cursor-pointer shadow-lg hover:shadow-xl ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* FRONT OF CARD */}
            <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 flex flex-col justify-between">
              <div>
                {/* Card Header & Status */}
                <div className="flex items-center justify-between gap-2 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {currentCard.type === 'concept' ? 'Exam Concept Question' : 'Core Definition'}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      Card {currentIndex + 1} of {cards.length}
                    </span>
                  </div>

                  {/* Current Card Status Badge */}
                  {currentCard.status === 'mastered' && (
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mastered</span>
                    </span>
                  )}
                  {currentCard.status === 'review' && (
                    <span className="text-[11px] font-medium text-rose-500 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </span>
                  )}
                </div>

                {/* Prompt Text */}
                <div className="mt-4 sm:mt-8">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-slate-900 dark:text-white leading-snug">
                    {currentCard.front}
                  </h2>
                </div>
              </div>

              {/* Front Footer */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                    Space
                  </span>
                  <span>Click or press Space to reveal answer</span>
                </span>

                <button
                  type="button"
                  onClick={speakCard}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                  title="Read question aloud"
                >
                  <Volume1 className={`w-4 h-4 ${isSpeaking ? 'text-indigo-600 animate-pulse' : ''}`} />
                </button>
              </div>
            </div>

            {/* BACK OF CARD */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 dark:bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-10 flex flex-col justify-between overflow-y-auto">
              <div>
                {/* Back Header */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Grounded Answer / Definition
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Card {currentIndex + 1} of {cards.length}
                  </span>
                </div>

                {/* Answer Content */}
                <div className="mt-2 text-base sm:text-lg text-slate-100 font-normal leading-relaxed whitespace-pre-line">
                  {currentCard.back}
                </div>

                {/* Extra Context Callout (Shorthand Expansion) */}
                {currentCard.extraContext && (
                  <div className="mt-6 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-semibold text-amber-300">💡 Extra Context (Shorthand Expanded): </span>
                      <span className="text-slate-300">{currentCard.extraContext}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Back Footer */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Click or press Space to flip back</span>
                <button
                  type="button"
                  onClick={speakCard}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  title="Read answer aloud"
                >
                  <Volume1 className={`w-4 h-4 ${isSpeaking ? 'text-emerald-400 animate-pulse' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons & Key Hints */}
      <div className="mt-6 flex flex-col items-center gap-4">
        {/* Mastery Judgment Controls */}
        <div className="w-full flex items-center justify-center gap-4">
          <button
            onClick={() => markCard('review')}
            className="flex-1 sm:flex-initial sm:w-48 py-3.5 px-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <XCircle className="w-5 h-5 text-rose-500" />
            <span>Needs Review</span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
              ← / 1
            </span>
          </button>

          <button
            onClick={flipCard}
            className="px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Flip Card"
          >
            {isFlipped ? 'Show Front' : 'Flip (Space)'}
          </button>

          <button
            onClick={() => markCard('mastered')}
            className="flex-1 sm:flex-initial sm:w-48 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>Mastered</span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-700 text-emerald-100">
              → / 2
            </span>
          </button>
        </div>

        {/* Step Navigation & Card Index */}
        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous card"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono tabular-nums">
            {currentIndex + 1} of {cards.length}
          </span>

          <button
            onClick={goToNext}
            disabled={currentIndex === cards.length - 1}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next card"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Keyboard Legend */}
        <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-600 dark:text-slate-400 mt-2">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">
              Space
            </kbd>
            <span>Flip</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">
              ← / 1
            </kbd>
            <span>Needs Review</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">
              → / 2
            </kbd>
            <span>Mastered</span>
          </span>
        </div>
      </div>
    </div>
  );
};

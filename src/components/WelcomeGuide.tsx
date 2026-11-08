import React from 'react';
import {
  Sparkles,
  BookOpen,
  Layers,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  X,
  Keyboard,
  Printer
} from 'lucide-react';

interface WelcomeGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWithSample: () => void;
  onCreateNew: () => void;
}

export const WelcomeGuide: React.FC<WelcomeGuideProps> = ({
  isOpen,
  onClose,
  onStartWithSample,
  onCreateNew,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-50 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close welcome guide"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Welcome to ExamVault AI
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
                Your Note-to-Flashcard Exam Prep Engine
              </h1>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
            ExamVault AI transforms raw, messy class notes, syllabus bullet points, and notebook photos into high-yield, interactive flashcard decks designed for rapid active recall.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                Strict Note Grounding
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Cards are strictly anchored in your notes. Fragmented shorthand is expanded with the clarification recorded in Extra Context.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                Active Recall Suite
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Study with 3D flip cards, keyboard shortcuts (Space to flip, 1/2 to rate), live % mastery tracking, and cheat-sheet view.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                Export & Print Anywhere
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Export decks formatted for Anki and Quizlet (CSV), download JSON backups, or print clean 2-column PDF study handouts.
              </p>
            </div>
          </div>

          {/* Quick-Start Steps */}
          <div className="mt-6 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-2">
              Where to Start
            </h4>
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside">
              <li>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Explore the Starter Deck:</span> Flip cards and test the active recall mastery meter right now.
              </li>
              <li>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Convert Your Notes:</span> Click <span className="font-semibold text-indigo-600 dark:text-indigo-400">Create Deck</span>, paste rough notes or upload a PDF/photo, and select Quick Review or Deep Dive.
              </li>
              <li>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Export:</span> Download an Anki-compatible CSV or click Print Sheet for physical exam prep.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onStartWithSample}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Study Starter Deck First
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              onClick={onCreateNew}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <span>Create My First Deck</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

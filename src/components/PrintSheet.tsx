import React from 'react';
import { Deck } from '../types';

interface PrintSheetProps {
  deck: Deck;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({ deck }) => {
  return (
    <div className="hidden print:block print-cheat-sheet text-black bg-white p-6">
      {/* Header */}
      <div className="border-b-2 border-slate-900 pb-3 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900">
              ExamVault Study Sheet: {deck.topic}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              High-Yield Active Recall Cheat Sheet · {deck.cards.length} Total Cards
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            {new Date().toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>

      {/* 2-Column Grid for Study Sheet */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
        {deck.cards.map((card, idx) => (
          <div
            key={card.id}
            className="border border-slate-300 rounded-lg p-3.5 print-break-inside-avoid flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                <span>
                  {card.type === 'concept' ? 'Exam Question' : 'Definition'} #{idx + 1}
                </span>
                {card.status === 'mastered' && <span>✓ Mastered</span>}
              </div>

              {/* Term / Prompt */}
              <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">
                {card.front}
              </h3>

              {/* Definition / Answer */}
              <p className="text-slate-800 leading-relaxed whitespace-pre-line text-[11px]">
                {card.back}
              </p>

              {/* Extra Context */}
              {card.extraContext && (
                <div className="mt-2 pt-1.5 border-t border-dashed border-slate-200 text-[10px] text-slate-600">
                  <span className="font-semibold text-slate-800">💡 Context: </span>
                  <span>{card.extraContext}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-3 border-t border-slate-300 text-center text-[10px] text-slate-500">
        Generated with ExamVault AI · Strict Note-Grounded Active Recall
      </div>
    </div>
  );
};

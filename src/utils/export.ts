import { Deck, Flashcard } from '../types';

/**
 * Escapes a string field for standard RFC-4180 CSV
 */
function escapeCsvCell(text: string): string {
  if (text.includes('"') || text.includes(',') || text.includes('\n') || text.includes('\r')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Exports cards to Anki & Quizlet compatible CSV file
 */
export function exportToAnkiCsv(deck: Deck) {
  const rows: string[] = [];

  // Header comment for Anki tag/deck hints
  rows.push(`#separator:Comma`);
  rows.push(`#html:true`);
  rows.push(`#deck:${deck.topic.replace(/[,;]/g, ' - ')}`);
  rows.push(`"Front","Back"`);

  for (const card of deck.cards) {
    const front = card.front.trim();
    let back = card.back.trim().replace(/\n/g, '<br>');

    if (card.extraContext) {
      back += `<br><br><span style="color:#0284c7;font-size:0.9em;">💡 <b>Extra Context:</b> ${card.extraContext.replace(/\n/g, '<br>')}</span>`;
    }

    rows.push(`${escapeCsvCell(front)},${escapeCsvCell(back)}`);
  }

  const csvContent = rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedTitle = (deck.topic || 'flashcards')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `${sanitizedTitle}_anki_export.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports the complete deck metadata and cards as JSON
 */
export function exportDeckToJson(deck: Deck) {
  const jsonContent = JSON.stringify(deck, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedTitle = (deck.topic || 'flashcards')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `${sanitizedTitle}_examvault.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers browser print dialog for cheat-sheet export
 */
export function printCheatSheet() {
  window.print();
}

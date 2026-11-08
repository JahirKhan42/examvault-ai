export type CardType = 'definition' | 'concept';
export type CardStatus = 'unstudied' | 'review' | 'mastered';
export type DeckScope = 'quick' | 'deep';

export interface Flashcard {
  id: number;
  type: CardType;
  front: string;
  back: string;
  extraContext: string | null;
  status: CardStatus;
}

export interface Deck {
  id: string;
  title: string;
  topic: string;
  createdAt: string;
  scope: DeckScope;
  cards: Flashcard[];
  notesExcerpt?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  data: string; // base64 string
  previewUrl?: string;
}

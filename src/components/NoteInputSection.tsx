import React, { useState, useRef, DragEvent } from 'react';
import {
  Sparkles,
  UploadCloud,
  FileText,
  FileImage,
  X,
  FileCheck,
  Zap,
  BookOpenCheck,
  AlertCircle,
  HelpCircle,
  CornerDownRight
} from 'lucide-react';
import { DeckScope, UploadedFile } from '../types';
import { SAMPLE_NOTES_PRESETS } from '../data/defaultDecks';

interface NoteInputSectionProps {
  onGenerate: (data: {
    topic: string;
    notesText: string;
    scope: DeckScope;
    files: UploadedFile[];
  }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

export const NoteInputSection: React.FC<NoteInputSectionProps> = ({
  onGenerate,
  isLoading,
  error,
  onClearError,
}) => {
  const [topic, setTopic] = useState('');
  const [notesText, setNotesText] = useState('');
  const [scope, setScope] = useState<DeckScope>('quick');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = notesText.trim() ? notesText.trim().split(/\s+/).length : 0;
  const charCount = notesText.length;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File): Promise<UploadedFile> => {
    return new Promise((resolve, reject) => {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        reject(new Error(`"${file.name}" is not supported. Please upload PDF, PNG, JPG, or WebP files.`));
        return;
      }

      // Max size: 20MB
      if (file.size > 20 * 1024 * 1024) {
        reject(new Error(`"${file.name}" is too large. Max file size is 20MB.`));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        resolve({
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          mimeType: file.type,
          data: base64Data,
          previewUrl: file.type.startsWith('image/') ? base64Data : undefined,
        });
      };
      reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);

    const newFiles: UploadedFile[] = [];
    const errors: string[] = [];

    for (let i = 0; i < fileList.length; i++) {
      try {
        const processed = await processFile(fileList[i]);
        newFiles.push(processed);
      } catch (err: any) {
        errors.push(err.message);
      }
    }

    if (errors.length > 0) {
      setUploadError(errors.join('. '));
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const loadPreset = (preset: typeof SAMPLE_NOTES_PRESETS[0]) => {
    setTopic(preset.topic);
    setNotesText(preset.notes);
    setScope(preset.scope);
    onClearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setUploadError('Please provide a subject or exam topic name.');
      return;
    }
    if (!notesText.trim() && files.length === 0) {
      setUploadError('Please provide notes either by pasting text or uploading a file/photo.');
      return;
    }

    setUploadError(null);
    onClearError();

    await onGenerate({
      topic: topic.trim(),
      notesText: notesText.trim(),
      scope,
      files,
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
          Convert Class Notes to Exam Flashcards
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Paste rough lecture notes, syllabus bullet points, or upload photos of handwritten pages.
          ExamVault AI extracts strictly grounded terms and high-yield exam questions.
        </p>

        {/* Quick Presets */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Try a sample note:</span>
          {SAMPLE_NOTES_PRESETS.map((preset) => (
            <button
              key={preset.topic}
              type="button"
              onClick={() => loadPreset(preset)}
              className="text-xs text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-indigo-200/50 dark:border-indigo-800/40 flex items-center gap-1"
            >
              <CornerDownRight className="w-3 h-3 text-indigo-500" />
              <span>{preset.topic.split(' - ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Global Error Banner */}
      {(error || uploadError) && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice</p>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                {uploadError || error}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setUploadError(null);
              onClearError();
            }}
            className="text-rose-500 hover:text-rose-800 dark:hover:text-rose-100 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic Input */}
        <div>
          <label
            htmlFor="exam-topic"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Exam Subject / Topic Name
          </label>
          <input
            id="exam-topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Biology - Cellular Respiration & ATP, CS 301 - Deadlocks"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors"
            required
            disabled={isLoading}
          />
        </div>

        {/* Dual Input: Text Area */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="notes-textarea"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>Paste Notes, Transcripts, or Syllabus Content</span>
            </label>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
              <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">{wordCount}</span> words
              <span className="mx-1">·</span>
              <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">{charCount}</span> chars
            </div>
          </div>
          <textarea
            id="notes-textarea"
            rows={7}
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Paste rough notes with abbreviations, arrows, bullet points, or lecture transcript..."
            className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors font-mono leading-relaxed"
            disabled={isLoading}
          />
        </div>

        {/* Dual Input: File Upload Zone */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-indigo-500" />
              <span>Upload Documents or Handwritten Notebook Photos</span>
            </label>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">
              PDF, PNG, JPG, WebP up to 20MB
            </span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              multiple
              accept="application/pdf,image/png,image/jpeg,image/webp"
              className="hidden"
              disabled={isLoading}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Click to browse or drag and drop files here
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                AI reads lecture slides, syllabus PDFs, and smartphone photos of handwritten notebooks directly
              </p>
            </div>
          </div>

          {/* Uploaded Files Chips */}
          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 shadow-xs"
                >
                  {file.mimeType.startsWith('image/') ? (
                    <FileImage className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <FileCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                  )}
                  <span className="max-w-[160px] truncate font-medium">{file.name}</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 tabular-nums">
                    ({formatFileSize(file.size)})
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deck Scope Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Deck Scope & Breadth
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setScope('quick')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                scope === 'quick'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className={`w-4 h-4 ${scope === 'quick' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Quick Review (~10 Cards)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Pulls out core high-yield definitions and most critical exam questions for rapid retention.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setScope('deep')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                scope === 'deep'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <BookOpenCheck className={`w-4 h-4 ${scope === 'deep' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Deep Dive (16–24 Cards)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Exhaustively extracts every technical term, mechanism step, contrasting pair, and exam scenario.
              </p>
            </button>
          </div>
        </div>

        {/* Grounding & Anti-Hallucination Quality Seal */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Strict Grounding Contract: </span>
            <span>
              All flashcards are directly anchored in your provided material. When note abbreviations are expanded into complete sentences, the additions are clearly documented in the Extra Context badge.
            </span>
          </div>
        </div>

        {/* Generate Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading || (!notesText.trim() && files.length === 0) || !topic.trim()}
            className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analyzing Notes & Synthesizing Deck...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Flashcards</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

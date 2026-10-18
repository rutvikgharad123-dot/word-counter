import React, { useRef, useState, useEffect } from 'react';
import { DocumentItem, UserSettings } from '../types';
import { analyzeText, AnalysisResult } from '../utils/analysis';
import { extractTextFromFile } from '../utils/fileExtractor';

interface EditorScreenProps {
  activeDoc: DocumentItem;
  onUpdateContent: (newContent: string) => void;
  onDetachDoc: () => void;
  onImportNewText: (title: string, text: string, category?: DocumentItem['category']) => void;
  settings: UserSettings;
  onShowToast: (message: string) => void;
  onOpenSummary: () => void;
}

export const EditorScreen: React.FC<EditorScreenProps> = ({
  activeDoc,
  onUpdateContent,
  onDetachDoc,
  onImportNewText,
  settings,
  onShowToast,
  onOpenSummary,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [readingPace, setReadingPace] = useState<number>(settings.readingWpm || 200);

  // Realtime analysis computed directly
  const analysis: AnalysisResult = analyzeText(activeDoc.content, {
    readingWpm: readingPace,
    speakingWpm: settings.speakingWpm,
    filterStopWords: settings.excludeStopWords,
  });

  const updateCaret = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart || 0;
    const textUpToCaret = textareaRef.current.value.substring(0, pos);
    const lines = textUpToCaret.split('\n');
    const curLine = lines.length;
    const curCol = lines[lines.length - 1].length + 1;
    setCursorPos({ line: curLine, col: curCol });
  };

  useEffect(() => {
    updateCaret();
  }, [activeDoc.content]);

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const newContent = activeDoc.content
            ? `${activeDoc.content}\n\n${text}`
            : text;
          onUpdateContent(newContent);
          onShowToast('Pasted from clipboard!');
          return;
        }
      }
      onShowToast('Tip: Use tap & paste inside the canvas');
    } catch {
      onShowToast('Tip: Use tap & paste inside the canvas');
    }
  };

  const handleClear = () => {
    if (!activeDoc.content.trim()) return;
    if (window.confirm('Clear all content from the editor canvas?')) {
      onUpdateContent('');
      onShowToast('Canvas cleared');
    }
  };

  const handleCopyAll = () => {
    if (!activeDoc.content) {
      onShowToast('Canvas is empty');
      return;
    }
    navigator.clipboard.writeText(activeDoc.content);
    onShowToast('All text copied to clipboard!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      onShowToast(`Loading ${file.name}...`);
      const { text, fileName } = await extractTextFromFile(file);
      onImportNewText(fileName, text, fileName.endsWith('.docx') ? 'docx' : fileName.endsWith('.pdf') ? 'pdf' : 'txt');
      onShowToast(`Loaded: ${fileName}`);
    } catch (err) {
      onShowToast('Failed to load file');
    }
  };

  // Daily goal calculation
  const goalTarget = settings.dailyGoalWords || 2000;
  const goalPercent = Math.min(100, Math.round((analysis.words / goalTarget) * 100));

  // Top 4 keywords for editor display
  const top4Keywords = analysis.topKeywords.slice(0, 4);

  return (
    <div className="flex flex-col w-full gap-space-md">
      {/* Active File Badge Pill */}
      {activeDoc.title && (
        <div className="flex items-center justify-between gap-2 px-space-md py-2 bg-surface-container-low rounded-xl text-on-surface border border-outline-variant/10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-primary-container/10 flex items-center justify-center shrink-0 text-primary">
              <span className="material-symbols-outlined text-[16px]">description</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface truncate font-medium">
              {activeDoc.title}
            </p>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-tertiary-container/15 text-tertiary shrink-0">
              Active
            </span>
          </div>
          <button
            aria-label="Unload current file"
            onClick={onDetachDoc}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-outline hover:text-error hover:bg-surface-container transition-all active:scale-90 shrink-0 cursor-pointer"
            title="Detach active document"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Metric Badges Strip (Horizontal Scrollable Carousel) */}
      <div className="flex items-center gap-space-xs overflow-x-auto pb-1 no-scrollbar -mx-margin px-margin">
        {/* Words Pill */}
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/10 shrink-0 min-w-[108px]">
          <div className="w-7 h-7 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">format_shapes</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-stat text-label-stat uppercase text-outline">Words</span>
            <span className="font-headline-sm text-headline-sm text-on-surface tabular-nums">
              {analysis.words.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Characters Pill */}
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/10 shrink-0 min-w-[115px]">
          <div className="w-7 h-7 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">pin</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-stat text-label-stat uppercase text-outline">Chars</span>
            <span className="font-headline-sm text-headline-sm text-on-surface tabular-nums">
              {analysis.chars.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Characters No Spaces */}
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/10 shrink-0 min-w-[118px]">
          <div className="w-7 h-7 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">space_bar</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-stat text-label-stat uppercase text-outline">No Space</span>
            <span className="font-headline-sm text-headline-sm text-on-surface tabular-nums">
              {analysis.charsNoSpaces.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Paragraphs */}
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/10 shrink-0 min-w-[104px]">
          <div className="w-7 h-7 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">segment</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-stat text-label-stat uppercase text-outline">Paras</span>
            <span className="font-headline-sm text-headline-sm text-on-surface tabular-nums">
              {analysis.paragraphs}
            </span>
          </div>
        </div>

        {/* Reading Time */}
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/10 shrink-0 min-w-[112px]">
          <div className="w-7 h-7 rounded-lg bg-surface-container-high text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-stat text-label-stat uppercase text-outline">Read</span>
            <span className="font-headline-sm text-headline-sm text-on-surface tabular-nums">
              ~{analysis.readingMinutes} min
            </span>
          </div>
        </div>
      </div>

      {/* Writing Canvas Card */}
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/15 p-space-md flex flex-col">
        {/* Header inside editor card */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-outline-variant/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary" />
            <span className="font-body-sm text-body-sm text-outline font-medium">
              Realtime Analysis
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1 text-on-surface-variant hover:text-primary active:scale-95 transition-all text-body-sm font-medium px-2 py-1 rounded-lg hover:bg-surface-container-low cursor-pointer"
              title="Copy raw text"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              <span>Copy</span>
            </button>
            <span className="text-outline-variant font-code-mono text-body-sm">|</span>
            <button
              onClick={() => setReadingPace(readingPace === 200 ? 130 : 200)}
              className="font-label-stat text-label-stat text-primary font-semibold hover:underline cursor-pointer"
              title="Toggle WPM rate"
            >
              {readingPace} WPM
            </button>
          </div>
        </div>

        {/* Input text area */}
        <textarea
          ref={textareaRef}
          value={activeDoc.content}
          onChange={(e) => onUpdateContent(e.target.value)}
          onKeyUp={updateCaret}
          onClick={updateCaret}
          rows={11}
          placeholder="Start typing, dictate your ideas, or paste a document here to see live linguistic metrics..."
          className="w-full bg-transparent font-body-lg text-body-lg text-on-surface placeholder:text-outline/60 focus:outline-none resize-none leading-relaxed tracking-normal selection:bg-primary/20 min-h-[220px]"
        />

        {/* Canvas Footer / Typing indicators */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-outline-variant/10 text-outline">
          <div className="flex items-center gap-3 font-code-mono text-body-sm">
            <span>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant" />
            <span>{analysis.sentences} sentences</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-body-sm text-body-sm text-tertiary flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[15px]">check_circle</span>
              Ready
            </span>
          </div>
        </div>
      </div>

      {/* Keyword Density & Vocabulary Breakdown Card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/15 p-space-md flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">key</span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Top Keywords &amp; Density
            </h2>
          </div>
          <span className="font-label-stat text-label-stat text-outline bg-surface-container-low px-2 py-0.5 rounded-full">
            Top 4
          </span>
        </div>

        {/* Keyword Chips Grid */}
        <div className="grid grid-cols-2 gap-space-xs">
          {top4Keywords.length === 0 ? (
            <div className="col-span-2 py-4 text-center text-body-sm text-outline">
              Start typing words to calculate density...
            </div>
          ) : (
            top4Keywords.map((kw, idx) => (
              <div
                key={kw.word}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low"
              >
                <div className="flex flex-col min-w-0 pr-1">
                  <span className="font-body-md text-body-md font-semibold text-on-surface truncate">
                    {kw.word}
                  </span>
                  <span className="font-body-sm text-body-sm text-outline">
                    {kw.density}% density
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded-lg font-code-mono text-body-sm font-semibold shrink-0 shadow-xs ${
                    idx === 0
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-highest text-primary'
                  }`}
                >
                  {kw.count}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Writing Target Progress Module */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/15 p-space-md flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-label-stat text-label-stat uppercase text-outline">
            Daily Goal Progress
          </span>
          <span className="font-code-mono text-body-sm font-semibold text-primary">
            {analysis.words.toLocaleString()} / {goalTarget.toLocaleString()} words ({goalPercent}%)
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
      </div>

      {/* Bottom Floating Accessory Toolbar */}
      <div className="sticky bottom-0 z-30 -mx-margin px-margin pt-2 pb-1 bg-surface/90 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 p-2 bg-surface-container-lowest rounded-2xl shadow-md border border-outline-variant/15">
          {/* Quick Paste Action */}
          <button
            onClick={handlePaste}
            className="flex-1 h-11 px-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container hover:text-primary active:scale-95 transition-all font-label-button text-label-button cursor-pointer"
            title="Paste text from clipboard"
          >
            <span className="material-symbols-outlined text-[19px] text-primary">content_paste</span>
            <span className="truncate">Paste</span>
          </button>

          {/* Clear All Action */}
          <button
            aria-label="Clear all content"
            onClick={handleClear}
            className="h-11 w-11 flex items-center justify-center rounded-xl bg-surface-container-low text-outline hover:text-error hover:bg-error-container/20 active:scale-95 transition-all shrink-0 cursor-pointer"
            title="Clear text canvas"
          >
            <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
          </button>

          {/* Quick Upload Shortcut */}
          <label
            className="h-11 w-11 flex items-center justify-center rounded-xl bg-surface-container-low text-outline hover:text-primary hover:bg-surface-container active:scale-95 transition-all cursor-pointer shrink-0"
            title="Upload .txt, .docx, or .pdf"
          >
            <input
              ref={fileInputRef}
              accept=".txt,.docx,.pdf,.md"
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
          </label>

          {/* Copy Summary Report Button (Primary Accent) */}
          <button
            onClick={onOpenSummary}
            className="flex-1 h-11 px-3 flex items-center justify-center gap-1.5 rounded-xl bg-primary text-on-primary hover:opacity-95 active:scale-95 transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.3)] font-label-button text-label-button cursor-pointer"
            title="Copy statistical report to clipboard"
          >
            <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
            <span className="truncate">Summary</span>
          </button>
        </div>
      </div>
    </div>
  );
};

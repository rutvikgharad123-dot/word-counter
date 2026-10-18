import React, { useState } from 'react';
import { DocumentItem, UserSettings } from '../types';
import { analyzeText, generateMarkdownReport } from '../utils/analysis';

interface AnalyticsScreenProps {
  activeDoc: DocumentItem;
  settings: UserSettings;
  onOpenExportModal: () => void;
  onShowToast: (message: string) => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  activeDoc,
  settings,
  onOpenExportModal,
  onShowToast,
}) => {
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Compute live analysis
  const analysis = analyzeText(activeDoc.content, {
    readingWpm: settings.readingWpm,
    speakingWpm: settings.speakingWpm,
    filterStopWords: settings.excludeStopWords,
  });

  const handleCopyMarkdown = () => {
    const report = generateMarkdownReport(activeDoc.title || 'CountLab_Document', analysis);
    navigator.clipboard.writeText(report);
    onShowToast('Markdown summary copied to clipboard!');
  };

  const handleExportClick = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      onOpenExportModal();
    }, 400);
  };

  const topKeywordsList = analysis.topKeywords.slice(0, 5);

  return (
    <div className="flex flex-col w-full gap-space-lg pb-10">
      {/* Document Header Context & Scope Pill */}
      <div className="flex items-center justify-between gap-space-sm pt-space-xs">
        <div className="flex items-center gap-space-xs min-w-0">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary-fixed text-primary shrink-0">
            <span className="material-symbols-outlined text-[18px]">insights</span>
          </span>
          <div className="flex flex-col min-w-0">
            <span className="font-headline-sm text-headline-sm text-on-surface truncate">
              {activeDoc.title || 'Untitled_Document.md'}
            </span>
            <span className="font-body-sm text-body-sm text-outline">
              {activeDoc.updatedAtLabel || 'Updated recently'}
            </span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-low text-primary">
          <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse" />
          <span className="font-label-stat text-label-stat tracking-wider uppercase font-semibold">
            Live Audit
          </span>
        </div>
      </div>

      {/* Hero Highlight Bento Cards (Overview Metrics Grid) */}
      <div className="grid grid-cols-2 gap-gutter">
        {/* Primary Stat: Total Words */}
        <div className="flex flex-col p-space-md rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/15">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-stat text-label-stat uppercase text-outline">
              Total Words
            </span>
            <span className="material-symbols-outlined text-primary text-[18px]">
              short_text
            </span>
          </div>
          <div className="font-display-stat text-display-stat text-on-surface tracking-tight">
            {analysis.words.toLocaleString()}
          </div>
          <div className="mt-space-xs flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-tertiary-container" />
            <span className="font-body-sm text-body-sm text-tertiary-container font-medium">
              +184 vs draft
            </span>
          </div>
        </div>

        {/* Stat: Total Characters */}
        <div className="flex flex-col p-space-md rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/15">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-stat text-label-stat uppercase text-outline">
              Characters
            </span>
            <span className="material-symbols-outlined text-secondary text-[18px]">
              match_case
            </span>
          </div>
          <div className="font-display-stat text-display-stat text-on-surface tracking-tight">
            {analysis.chars.toLocaleString()}
          </div>
          <div className="mt-space-xs font-body-sm text-body-sm text-outline">
            {analysis.charsNoSpaces.toLocaleString()} without spaces
          </div>
        </div>

        {/* Micro Quad Details */}
        <div className="flex flex-col p-space-md rounded-2xl bg-surface-container-low border border-outline-variant/10">
          <span className="font-label-stat text-label-stat uppercase text-outline">
            Sentences
          </span>
          <div className="flex items-baseline justify-between mt-space-xs">
            <span className="font-headline-lg text-headline-lg text-on-surface">
              {analysis.sentences}
            </span>
            <span className="font-body-sm text-body-sm text-outline">
              ~{analysis.wordsPerSentence} wps
            </span>
          </div>
        </div>

        <div className="flex flex-col p-space-md rounded-2xl bg-surface-container-low border border-outline-variant/10">
          <span className="font-label-stat text-label-stat uppercase text-outline">
            Paragraphs
          </span>
          <div className="flex items-baseline justify-between mt-space-xs">
            <span className="font-headline-lg text-headline-lg text-on-surface">
              {analysis.paragraphs}
            </span>
            <span className="font-body-sm text-body-sm text-outline">
              ~{analysis.sentencesPerParagraph} sent/p
            </span>
          </div>
        </div>

        <div className="flex flex-col p-space-md rounded-2xl bg-surface-container-low border border-outline-variant/10">
          <span className="font-label-stat text-label-stat uppercase text-outline">
            Avg. Word Length
          </span>
          <div className="flex items-baseline justify-between mt-space-xs">
            <span className="font-headline-lg text-headline-lg text-on-surface">
              {analysis.avgWordLength}
            </span>
            <span className="font-body-sm text-body-sm text-outline">characters</span>
          </div>
        </div>

        <div className="flex flex-col p-space-md rounded-2xl bg-surface-container-low border border-outline-variant/10">
          <span className="font-label-stat text-label-stat uppercase text-outline">
            Readability Level
          </span>
          <div className="flex items-baseline justify-between mt-space-xs">
            <span className="font-headline-lg text-headline-lg text-primary">
              {analysis.gradeLevel}
            </span>
            <span className="font-body-sm text-body-sm text-outline">
              Flesch {analysis.fleschScore}
            </span>
          </div>
        </div>
      </div>

      {/* Speaking & Reading Time Section */}
      <div className="flex flex-col p-space-lg rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/15 gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">timer</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Pacing &amp; Duration
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-stat text-label-stat uppercase">
            Standard
          </span>
        </div>

        <div className="grid grid-cols-2 gap-space-sm">
          {/* Silent Reading Card */}
          <div className="flex flex-col p-space-md rounded-xl bg-surface-container-low">
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Silent Reading
              </span>
              <span className="material-symbols-outlined text-outline text-[18px]">
                menu_book
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline-lg text-headline-lg text-on-surface">
                {analysis.readingMinutes}
              </span>
              <span className="font-body-md text-body-md text-outline">min</span>
            </div>
            <div className="mt-space-xs flex items-center justify-between font-label-stat text-label-stat text-outline">
              <span>@ {settings.readingWpm} WPM</span>
              <span className="text-tertiary-container font-semibold">Fast</span>
            </div>
            {/* Mini Progress Track */}
            <div className="w-full h-1.5 rounded-full bg-surface-container-highest mt-space-sm overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.min(100, Math.max(15, analysis.readingMinutes * 10))}%` }}
              />
            </div>
          </div>

          {/* Speaking Time Card */}
          <div className="flex flex-col p-space-md rounded-xl bg-surface-container-low">
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Speaking Time
              </span>
              <span className="material-symbols-outlined text-outline text-[18px]">
                record_voice_over
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline-lg text-headline-lg text-on-surface">
                {analysis.speakingMinutes}
              </span>
              <span className="font-body-md text-body-md text-outline">min</span>
            </div>
            <div className="mt-space-xs flex items-center justify-between font-label-stat text-label-stat text-outline">
              <span>@ {settings.speakingWpm} WPM</span>
              <span className="text-secondary font-semibold">Speech</span>
            </div>
            {/* Mini Progress Track */}
            <div className="w-full h-1.5 rounded-full bg-surface-container-highest mt-space-sm overflow-hidden">
              <div
                className="h-full bg-secondary rounded-full"
                style={{ width: `${Math.min(100, Math.max(20, analysis.speakingMinutes * 5))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Readability & Sentiment Breakdown Card */}
      <div className="flex flex-col p-space-lg rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/15 gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">
              psychology
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Style &amp; Readability
            </h2>
          </div>
          <span className="font-label-stat text-label-stat uppercase text-tertiary-container font-bold">
            Plain English
          </span>
        </div>

        {/* Metric Breakdown Rows */}
        <div className="space-y-space-md">
          {/* Reading Ease */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-body-md text-body-md text-on-surface">
                Reading Ease
              </span>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-body-sm text-body-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container" />
                {analysis.fleschScore >= 60 ? 'High' : analysis.fleschScore >= 40 ? 'Moderate' : 'Dense'} ({analysis.fleschScore}/100)
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full bg-primary-container rounded-full"
                style={{ width: `${analysis.fleschScore}%` }}
              />
            </div>
          </div>

          {/* Tone */}
          <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-outline text-[20px]">
                school
              </span>
              <div className="flex flex-col">
                <span className="font-label-stat text-label-stat uppercase text-outline">
                  Detected Tone
                </span>
                <span className="font-body-md text-body-md text-on-surface font-medium">
                  {analysis.tone}
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-tertiary-container text-[20px]">
              check_circle
            </span>
          </div>

          {/* Vocabulary Richness / Lexical Diversity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-body-md text-body-md text-on-surface">
                Lexical Diversity (Richness)
              </span>
              <span className="font-headline-sm text-headline-sm text-primary">
                {analysis.lexicalDiversity}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full bg-secondary-container rounded-full"
                style={{ width: `${analysis.lexicalDiversity}%` }}
              />
            </div>
            <p className="font-body-sm text-body-sm text-outline">
              Healthy variety of unique words without redundant repetition.
            </p>
          </div>
        </div>
      </div>

      {/* Keyword & Density Frequency Section */}
      <div className="flex flex-col p-space-lg rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/15 gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">
              format_list_numbered
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Top Keywords &amp; Density
            </h2>
          </div>
          <span className="font-label-stat text-label-stat text-outline uppercase">
            Top {topKeywordsList.length} Words
          </span>
        </div>

        {/* Word Tag Cloud Chips */}
        <div className="flex flex-wrap gap-1.5 pb-space-xs">
          {topKeywordsList.map((kw, i) => {
            const isSelected = selectedKeyword === kw.word || (selectedKeyword === null && i === 0);
            return (
              <button
                key={kw.word}
                onClick={() => setSelectedKeyword(kw.word)}
                className={`px-space-sm py-1 rounded-full font-body-sm text-body-sm shadow-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span>{kw.word}</span>
                <span
                  className={`font-label-stat text-[10px] ${
                    isSelected ? 'text-on-primary-container' : 'text-outline'
                  }`}
                >
                  {kw.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Frequency Chart & Density Rows */}
        <div className="space-y-space-sm pt-space-xs">
          {topKeywordsList.map((kw, idx) => {
            const maxCount = topKeywordsList[0]?.count || 1;
            const barWidth = Math.max(15, Math.round((kw.count / maxCount) * 100));
            const barColors = [
              'bg-primary',
              'bg-primary-container',
              'bg-secondary-container',
              'bg-secondary-container',
              'bg-secondary-fixed-dim',
            ];

            return (
              <div key={kw.word} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-body-md font-body-md">
                  <div className="flex items-center gap-2">
                    <span className="font-code-mono text-code-mono text-outline font-medium">
                      0{idx + 1}
                    </span>
                    <span className="text-on-surface font-semibold">{kw.word}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-body-sm text-body-sm text-outline">
                      {kw.count}x
                    </span>
                    <span className="font-code-mono text-code-mono text-primary font-medium w-12 text-right">
                      {kw.density}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className={`h-full ${barColors[idx % barColors.length]} rounded-full transition-all duration-300`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Bottom Actions & Reporting Drawer */}
      <div className="flex flex-col gap-space-sm pt-space-xs">
        {/* Primary CTA: Export Full PDF / CSV Report */}
        <button
          onClick={handleExportClick}
          disabled={isExporting}
          className="w-full h-12 px-space-md rounded-xl bg-primary text-on-primary font-label-button text-label-button shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:opacity-95 cursor-pointer disabled:opacity-80"
        >
          {isExporting ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
              <span>Preparing Package...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">download</span>
              <span>Export Full PDF / CSV Report</span>
            </>
          )}
        </button>

        {/* Secondary CTA: Copy Markdown Summary */}
        <button
          onClick={handleCopyMarkdown}
          className="w-full h-12 px-space-md rounded-xl bg-surface-container-low text-on-surface font-label-button text-label-button flex items-center justify-center gap-2 hover:bg-surface-container active:scale-[0.98] transition-all cursor-pointer border border-outline-variant/10"
        >
          <span className="material-symbols-outlined text-outline text-[20px]">
            content_copy
          </span>
          <span>Copy Markdown Summary</span>
        </button>
      </div>
    </div>
  );
};

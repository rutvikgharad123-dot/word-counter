import React, { useState, useMemo } from 'react';
import { DocumentItem } from '../types';

interface HistoryScreenProps {
  documents: DocumentItem[];
  onOpenDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (id: string) => void;
  onNewBlankDoc: () => void;
  onPasteNewDoc: () => void;
  onTriggerUpload: () => void;
  onShowToast: (message: string) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  documents,
  onOpenDocument,
  onDeleteDocument,
  onNewBlankDoc,
  onPasteNewDoc,
  onTriggerUpload,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'drafts' | 'word' | 'pdf' | 'pasted'>('all');
  const [expandedDocIds, setExpandedDocIds] = useState<Set<string>>(new Set());
  const [openMenuDocId, setOpenMenuDocId] = useState<string | null>(null);
  const [isFabModalOpen, setIsFabModalOpen] = useState(false);

  // Filter and search
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // Category filter
      let matchesCategory = true;
      if (selectedFilter === 'drafts') matchesCategory = doc.category === 'draft';
      else if (selectedFilter === 'word') matchesCategory = doc.category === 'docx';
      else if (selectedFilter === 'pdf') matchesCategory = doc.category === 'pdf';
      else if (selectedFilter === 'pasted') matchesCategory = doc.category === 'txt' || doc.category === 'pasted';

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q) ||
        doc.tone.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [documents, selectedFilter, searchQuery]);

  // Aggregate word count
  const totalCatalogedWords = useMemo(() => {
    return documents.reduce((sum, d) => sum + d.words, 0);
  }, [documents]);

  const toggleGlance = (docId: string) => {
    setExpandedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const handleShareDoc = (doc: DocumentItem) => {
    if (navigator.share) {
      navigator.share({
        title: doc.title,
        text: `CountLab stats for ${doc.title}: ${doc.words} words, ${doc.chars} chars, reading time ${doc.readingMinutes} min.`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `CountLab Audit for ${doc.title}:\nWords: ${doc.words}\nChars: ${doc.chars}\nGrade: ${doc.gradeLevel}`
      );
      onShowToast('Document summary copied to clipboard!');
    }
    setOpenMenuDocId(null);
  };

  const formatCharsK = (chars: number) => {
    if (chars >= 1000) {
      return (chars / 1000).toFixed(1) + 'k';
    }
    return chars.toString();
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-space-md">
      {/* Search & Filter Area */}
      <div className="flex flex-col space-y-space-sm pt-space-xs">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input
            id="docSearchInput"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, keywords..."
            className="w-full h-11 pl-10 pr-10 bg-surface-container-low text-on-surface rounded-xl placeholder:text-outline text-body-md font-body-md focus:outline-none focus:bg-surface-container-lowest focus:shadow-xs transition-all border border-outline-variant/15"
          />
          {searchQuery && (
            <button
              id="clearSearchBtn"
              type="button"
              aria-label="Clear Search"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
        </div>

        {/* Filter Chips Scrollable Track */}
        <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-1 -mx-margin px-margin">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`filter-chip shrink-0 px-3.5 py-1.5 rounded-full font-label-button text-label-button transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-primary text-on-primary shadow-xs active'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            All ({documents.length})
          </button>
          <button
            onClick={() => setSelectedFilter('drafts')}
            className={`filter-chip shrink-0 px-3.5 py-1.5 rounded-full font-label-button text-label-button transition-all cursor-pointer ${
              selectedFilter === 'drafts'
                ? 'bg-primary text-on-primary shadow-xs active'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Drafts ({documents.filter((d) => d.category === 'draft').length})
          </button>
          <button
            onClick={() => setSelectedFilter('word')}
            className={`filter-chip shrink-0 px-3.5 py-1.5 rounded-full font-label-button text-label-button transition-all cursor-pointer ${
              selectedFilter === 'word'
                ? 'bg-primary text-on-primary shadow-xs active'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Word Docs ({documents.filter((d) => d.category === 'docx').length})
          </button>
          <button
            onClick={() => setSelectedFilter('pdf')}
            className={`filter-chip shrink-0 px-3.5 py-1.5 rounded-full font-label-button text-label-button transition-all cursor-pointer ${
              selectedFilter === 'pdf'
                ? 'bg-primary text-on-primary shadow-xs active'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            PDFs ({documents.filter((d) => d.category === 'pdf').length})
          </button>
          <button
            onClick={() => setSelectedFilter('pasted')}
            className={`filter-chip shrink-0 px-3.5 py-1.5 rounded-full font-label-button text-label-button transition-all cursor-pointer ${
              selectedFilter === 'pasted'
                ? 'bg-primary text-on-primary shadow-xs active'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Pasted ({documents.filter((d) => d.category === 'txt' || d.category === 'pasted').length})
          </button>
        </div>
      </div>

      {/* Summary Mini Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low text-on-surface-variant border border-outline-variant/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            auto_stories
          </span>
          <span className="font-body-sm text-body-sm font-medium text-on-surface">
            {totalCatalogedWords.toLocaleString()} words cataloged
          </span>
        </div>
        <span className="font-label-stat text-label-stat uppercase text-outline tracking-wider">
          Synced
        </span>
      </div>

      {/* Document Cards List */}
      <div className="flex flex-col space-y-space-sm" id="documentsList">
        {filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-3">
              <span className="material-symbols-outlined text-[32px]">manage_search</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
              No matching documents
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
              Try refining your keywords or switch filter categories to find what you need.
            </p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isGlanceOpen = expandedDocIds.has(doc.id);
            const isMenuOpen = openMenuDocId === doc.id;

            return (
              <div
                key={doc.id}
                className="doc-card group relative bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-outline-variant/15 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {doc.category === 'docx' && (
                        <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-stat font-label-stat uppercase font-semibold">
                          .docx
                        </span>
                      )}
                      {doc.category === 'pdf' && (
                        <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-label-stat font-label-stat uppercase font-semibold">
                          .pdf
                        </span>
                      )}
                      {(doc.category === 'txt' || doc.category === 'pasted') && (
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-label-stat font-label-stat uppercase font-semibold">
                          .txt
                        </span>
                      )}
                      {doc.category === 'draft' && (
                        <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-stat font-label-stat uppercase font-semibold">
                          Draft
                        </span>
                      )}

                      <span className="font-body-sm text-body-sm text-outline flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container inline-block" />
                        {doc.updatedAtLabel}
                      </span>
                    </div>

                    <h2
                      onClick={() => onOpenDocument(doc)}
                      className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate group-hover:text-primary transition-colors cursor-pointer"
                    >
                      {doc.title}
                    </h2>
                  </div>

                  {/* 3-Dot Dropdown */}
                  <div className="relative">
                    <button
                      aria-label="More options"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuDocId(isMenuOpen ? null : doc.id);
                      }}
                      className="more-btn w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        more_vert
                      </span>
                    </button>

                    {isMenuOpen && (
                      <div className="dropdown-menu absolute right-0 mt-1 w-36 py-1 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/15 z-20 animate-in fade-in zoom-in-95">
                        <button
                          onClick={() => handleShareDoc(doc)}
                          className="w-full px-3 py-2 text-left font-body-sm text-body-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            share
                          </span>
                          Share
                        </button>
                        <button
                          onClick={() => {
                            onDeleteDocument(doc.id);
                            setOpenMenuDocId(null);
                            onShowToast(`Deleted ${doc.title}`);
                          }}
                          className="w-full px-3 py-2 text-left font-body-sm text-body-sm text-error hover:bg-error-container/40 flex items-center gap-2 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete
                          </span>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2 py-2.5 my-2.5 bg-surface-container-low rounded-lg px-3">
                  <div className="flex flex-col">
                    <span className="font-label-stat text-label-stat uppercase text-outline">
                      Words
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {doc.words.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-stat text-label-stat uppercase text-outline">
                      Chars
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {formatCharsK(doc.chars)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-stat text-label-stat uppercase text-outline">
                      Reading
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {doc.readingMinutes} min
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-outline font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-[16px]">
                      analytics
                    </span>
                    <span>
                      {doc.gradeLevel} • {doc.tone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleGlance(doc.id)}
                      className="stats-toggle-btn h-8 px-2.5 rounded-lg text-primary bg-surface-container-low hover:bg-surface-container text-body-sm font-label-button flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        insights
                      </span>
                      <span>{isGlanceOpen ? 'Hide' : 'Glance'}</span>
                    </button>
                    <button
                      onClick={() => onOpenDocument(doc)}
                      className="h-8 px-3.5 rounded-lg text-on-primary bg-primary hover:bg-primary-container text-body-sm font-label-button flex items-center gap-1 active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      <span>Open</span>
                      <span className="material-symbols-outlined text-[16px]">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>

                {/* Expandable Stats Glance Drawer */}
                {isGlanceOpen && (
                  <div className="stats-glance mt-3 pt-3 bg-surface-container-low rounded-lg p-3 space-y-2 border-t border-outline-variant/10 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center text-body-sm">
                      <span className="text-on-surface-variant font-body-sm">
                        Sentences
                      </span>
                      <span className="font-code-mono font-medium text-on-surface">
                        {doc.sentences}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-body-sm">
                      <span className="text-on-surface-variant font-body-sm">
                        Paragraphs
                      </span>
                      <span className="font-code-mono font-medium text-on-surface">
                        {doc.paragraphs}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-body-sm">
                      <span className="text-on-surface-variant font-body-sm">
                        Speaking Time
                      </span>
                      <span className="font-code-mono font-medium text-on-surface">
                        {doc.speakingMinutes} min
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (New Draft or Paste) */}
      <div className="fixed bottom-20 right-4 z-30">
        <button
          aria-label="Create new document or paste"
          onClick={() => setIsFabModalOpen(true)}
          className="h-14 w-14 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center hover:bg-primary-container active:scale-90 transition-all focus:outline-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[28px]">add</span>
        </button>
      </div>

      {/* FAB Quick Action Sheet Modal */}
      {isFabModalOpen && (
        <div
          onClick={() => setIsFabModalOpen(false)}
          className="fixed inset-0 z-50 flex items-end justify-center bg-inverse-surface/40 backdrop-blur-sm p-margin"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-surface-container-lowest rounded-2xl p-space-md shadow-2xl flex flex-col space-y-space-sm border border-outline-variant/15 animate-in fade-in slide-in-from-bottom-4"
          >
            <div className="flex items-center justify-between pb-1">
              <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Start Document
              </h4>
              <button
                onClick={() => setIsFabModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <button
              onClick={() => {
                setIsFabModalOpen(false);
                onNewBlankDoc();
              }}
              className="w-full p-3 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center gap-3 text-left transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">
                  edit_document
                </span>
              </div>
              <div>
                <p className="font-label-button text-label-button text-on-surface">
                  Blank Count
                </p>
                <p className="font-body-sm text-body-sm text-outline">
                  Start fresh in distraction-free mode
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsFabModalOpen(false);
                onPasteNewDoc();
              }}
              className="w-full p-3 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center gap-3 text-left transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary text-on-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">
                  content_paste
                </span>
              </div>
              <div>
                <p className="font-label-button text-label-button text-on-surface">
                  Paste from Clipboard
                </p>
                <p className="font-body-sm text-body-sm text-outline">
                  Instantly inspect copied text
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsFabModalOpen(false);
                onTriggerUpload();
              }}
              className="w-full p-3 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center gap-3 text-left transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-tertiary text-on-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">
                  cloud_upload
                </span>
              </div>
              <div>
                <p className="font-label-button text-label-button text-on-surface">
                  Upload Document
                </p>
                <p className="font-body-sm text-body-sm text-outline">
                  Import .txt, .docx, or .pdf
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

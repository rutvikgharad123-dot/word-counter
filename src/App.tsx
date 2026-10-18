import React, { useState, useEffect, useMemo } from 'react';
import { ActiveTab, DocumentItem, UserSettings } from './types';
import { INITIAL_DOCUMENTS } from './data/sampleDocs';
import { analyzeText } from './utils/analysis';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { EditorScreen } from './components/EditorScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { DocumentImportScreen } from './components/DocumentImportScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { UrlFetchModal } from './components/UrlFetchModal';
import { CameraOcrModal } from './components/CameraOcrModal';
import { ExportReportModal } from './components/ExportReportModal';
import { Toast } from './components/Toast';

const SETTINGS_STORAGE_KEY = 'countlab_user_settings';
const DOCS_STORAGE_KEY = 'countlab_saved_docs';

export default function App() {
  // Theme & Settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      dailyGoalWords: 2000,
      readingWpm: 200,
      speakingWpm: 130,
      excludeStopWords: true,
      theme: 'light',
    };
  });

  // Apply dark theme class
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Documents State
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    try {
      const saved = localStorage.getItem(DOCS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_DOCUMENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(documents));
    } catch {}
  }, [documents]);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');

  // Currently active document ID
  const [activeDocId, setActiveDocId] = useState<string>(() => {
    return documents[0]?.id || 'doc-1';
  });

  // Active document object
  const activeDoc = useMemo(() => {
    const found = documents.find((d) => d.id === activeDocId);
    if (found) return found;
    return documents[0] || INITIAL_DOCUMENTS[0];
  }, [documents, activeDocId]);

  // Active document analysis for export
  const activeAnalysis = useMemo(() => {
    return analyzeText(activeDoc.content, {
      readingWpm: settings.readingWpm,
      speakingWpm: settings.speakingWpm,
      filterStopWords: settings.excludeStopWords,
    });
  }, [activeDoc.content, settings]);

  // Modals and Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Content updater
  const handleUpdateContent = (newContent: string) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === activeDoc.id) {
          const analysis = analyzeText(newContent, {
            readingWpm: settings.readingWpm,
            speakingWpm: settings.speakingWpm,
            filterStopWords: settings.excludeStopWords,
          });
          return {
            ...d,
            content: newContent,
            words: analysis.words,
            chars: analysis.chars,
            charsNoSpaces: analysis.charsNoSpaces,
            sentences: analysis.sentences,
            paragraphs: analysis.paragraphs,
            avgWordLength: analysis.avgWordLength,
            readingMinutes: analysis.readingMinutes,
            speakingMinutes: analysis.speakingMinutes,
            gradeLevel: analysis.gradeLevel,
            fleschScore: analysis.fleschScore,
            tone: analysis.tone,
            lexicalDiversity: analysis.lexicalDiversity,
            topKeywords: analysis.topKeywords,
            updatedAtLabel: 'Just now',
            timestamp: Date.now(),
          };
        }
        return d;
      })
    );
  };

  // Detach active doc (turns into empty/scratch draft)
  const handleDetachDoc = () => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === activeDoc.id) {
          return {
            ...d,
            title: '',
            updatedAtLabel: 'Detached',
          };
        }
        return d;
      })
    );
    showToast('Document detached');
  };

  // Import new text into document list
  const handleImportNewText = (
    title: string,
    text: string,
    category: DocumentItem['category'] = 'txt'
  ) => {
    const analysis = analyzeText(text, {
      readingWpm: settings.readingWpm,
      speakingWpm: settings.speakingWpm,
      filterStopWords: settings.excludeStopWords,
    });

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title,
      category,
      content: text,
      words: analysis.words,
      chars: analysis.chars,
      charsNoSpaces: analysis.charsNoSpaces,
      sentences: analysis.sentences,
      paragraphs: analysis.paragraphs,
      avgWordLength: analysis.avgWordLength,
      readingMinutes: analysis.readingMinutes,
      speakingMinutes: analysis.speakingMinutes,
      gradeLevel: analysis.gradeLevel,
      fleschScore: analysis.fleschScore,
      tone: analysis.tone,
      lexicalDiversity: analysis.lexicalDiversity,
      fileSizeStr: `${Math.max(1, Math.round(text.length / 1024))} KB`,
      updatedAtLabel: 'Just now',
      timestamp: Date.now(),
      topKeywords: analysis.topKeywords,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
    setActiveTab('editor');
  };

  // Open existing document
  const handleOpenDocument = (doc: DocumentItem) => {
    setActiveDocId(doc.id);
    setActiveTab('editor');
    showToast(`Loaded ${doc.title}`);
  };

  // Delete document
  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => {
      const remaining = prev.filter((d) => d.id !== id);
      if (remaining.length === 0) {
        return INITIAL_DOCUMENTS;
      }
      return remaining;
    });
    if (activeDocId === id) {
      setActiveDocId(documents.find((d) => d.id !== id)?.id || INITIAL_DOCUMENTS[0].id);
    }
  };

  // New Blank Count action
  const handleNewBlankDoc = () => {
    const blankDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: `Draft_${new Date().toLocaleDateString().replace(/\//g, '-')}.md`,
      category: 'draft',
      content: '',
      words: 0,
      chars: 0,
      charsNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      avgWordLength: 0,
      readingMinutes: 0,
      speakingMinutes: 0,
      gradeLevel: 'Gr. 1',
      fleschScore: 100,
      tone: 'Personal / Casual',
      lexicalDiversity: 0,
      fileSizeStr: '0 KB',
      updatedAtLabel: 'Just now',
      timestamp: Date.now(),
      topKeywords: [],
    };
    setDocuments((prev) => [blankDoc, ...prev]);
    setActiveDocId(blankDoc.id);
    setActiveTab('editor');
    showToast('New blank canvas started');
  };

  // Paste new doc
  const handlePasteNewDoc = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().length > 0) {
          handleImportNewText('Pasted_Draft.txt', text, 'pasted');
          showToast('Imported from clipboard!');
          return;
        }
      }
      handleNewBlankDoc();
      showToast('Canvas created; paste inside text area');
    } catch {
      handleNewBlankDoc();
    }
  };

  // Reset sample documents
  const handleResetSampleDocs = () => {
    setDocuments(INITIAL_DOCUMENTS);
    setActiveDocId(INITIAL_DOCUMENTS[0].id);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased flex flex-col transition-colors selection:bg-primary/20">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onOpenImport={() => setActiveTab('import')}
        onOpenSettings={() => setActiveTab('settings')}
        isDark={settings.theme === 'dark'}
        onToggleTheme={() => {
          setSettings((prev) => ({
            ...prev,
            theme: prev.theme === 'dark' ? 'light' : 'dark',
          }));
        }}
      />

      {/* Main Container Viewport */}
      <main className="flex-1 flex flex-col w-full max-w-lg mx-auto pt-16 pb-24 px-margin">
        {activeTab === 'editor' && (
          <EditorScreen
            activeDoc={activeDoc}
            onUpdateContent={handleUpdateContent}
            onDetachDoc={handleDetachDoc}
            onImportNewText={handleImportNewText}
            settings={settings}
            onShowToast={showToast}
            onOpenSummary={() => setIsExportModalOpen(true)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsScreen
            activeDoc={activeDoc}
            settings={settings}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'history' && (
          <HistoryScreen
            documents={documents}
            onOpenDocument={handleOpenDocument}
            onDeleteDocument={handleDeleteDocument}
            onNewBlankDoc={handleNewBlankDoc}
            onPasteNewDoc={handlePasteNewDoc}
            onTriggerUpload={() => setActiveTab('import')}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'import' && (
          <DocumentImportScreen
            onLoadDocument={handleOpenDocument}
            onImportNewText={handleImportNewText}
            recentDocs={documents}
            onClearRecent={() => {
              setDocuments([activeDoc]);
              showToast('Cleared recent list');
            }}
            onOpenUrlModal={() => setIsUrlModalOpen(true)}
            onOpenOcrModal={() => setIsOcrModalOpen(true)}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={(newVals) => {
              setSettings((prev) => ({ ...prev, ...newVals }));
            }}
            onResetSampleDocs={handleResetSampleDocs}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation (hidden on Import screen for focused workflow, matching screenshot) */}
      {activeTab !== 'import' && (
        <BottomNav activeTab={activeTab} onNavigate={setActiveTab} />
      )}

      {/* Interactive URL Modal */}
      <UrlFetchModal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        onFetchSuccess={(title, text) => {
          handleImportNewText(title, text, 'url');
        }}
        onShowToast={showToast}
      />

      {/* Camera OCR Modal with Gemini AI */}
      <CameraOcrModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        onOcrSuccess={(title, text) => {
          handleImportNewText(title, text, 'txt');
        }}
        onShowToast={showToast}
      />

      {/* Full Export PDF/CSV Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        docTitle={activeDoc.title || 'CountLab_Report'}
        analysis={activeAnalysis}
        onShowToast={showToast}
      />

      {/* Micro Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

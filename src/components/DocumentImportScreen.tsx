import React, { useRef, useState } from 'react';
import { DocumentItem } from '../types';
import { extractTextFromFile } from '../utils/fileExtractor';

interface DocumentImportScreenProps {
  onLoadDocument: (doc: DocumentItem) => void;
  onImportNewText: (title: string, text: string, category?: DocumentItem['category']) => void;
  recentDocs: DocumentItem[];
  onClearRecent: () => void;
  onOpenUrlModal: () => void;
  onOpenOcrModal: () => void;
  onShowToast: (message: string) => void;
}

export const DocumentImportScreen: React.FC<DocumentImportScreenProps> = ({
  onLoadDocument,
  onImportNewText,
  recentDocs,
  onClearRecent,
  onOpenUrlModal,
  onOpenOcrModal,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelected = async (file: File) => {
    onShowToast(`Importing "${file.name}"...`);
    try {
      const { text, fileName } = await extractTextFromFile(file);
      const ext = fileName.split('.').pop()?.toLowerCase();
      let category: DocumentItem['category'] = 'txt';
      if (ext === 'docx') category = 'docx';
      else if (ext === 'pdf') category = 'pdf';

      onImportNewText(fileName, text, category);
      onShowToast(`Imported "${fileName}"`);
    } catch (err: any) {
      console.error(err);
      onShowToast(`Failed to parse ${file.name}`);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().length > 0) {
          onImportNewText('Clipboard_Import.txt', text, 'pasted');
          onShowToast('Imported text from clipboard!');
          return;
        }
      }
      onShowToast('Clipboard is empty or permissions restricted');
    } catch (err) {
      onShowToast('Could not access clipboard automatically');
    }
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Subtle Ambient Glow */}
      <div className="relative w-full">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Format Badges Carousel/Row */}
      <div className="flex items-center gap-space-xs overflow-x-auto py-space-xs no-scrollbar mb-space-md">
        <div className="flex items-center gap-space-xs px-3 py-1.5 rounded-full bg-surface-container text-on-surface shrink-0 shadow-xs transition-transform active:scale-95">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-label-stat text-label-stat uppercase text-primary tracking-wider">
            .TXT
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Plain Text</span>
        </div>
        <div className="flex items-center gap-space-xs px-3 py-1.5 rounded-full bg-surface-container text-on-surface shrink-0 shadow-xs transition-transform active:scale-95">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span className="font-label-stat text-label-stat uppercase text-secondary tracking-wider">
            .DOCX
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Word Doc</span>
        </div>
        <div className="flex items-center gap-space-xs px-3 py-1.5 rounded-full bg-surface-container text-on-surface shrink-0 shadow-xs transition-transform active:scale-95">
          <span className="w-2 h-2 rounded-full bg-tertiary" />
          <span className="font-label-stat text-label-stat uppercase text-tertiary tracking-wider">
            .PDF
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Portable Doc</span>
        </div>
      </div>

      {/* Primary Upload Dropzone Card */}
      <div
        id="dropzone"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="relative group cursor-pointer overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/20 transition-all duration-300 hover:shadow-md active:scale-[0.99] mb-space-lg"
      >
        {/* Visual dashed frame using radial pseudo pattern */}
        <div className="absolute inset-2 rounded-xl pointer-events-none opacity-40 bg-[radial-gradient(#4f46e5_1.5px,transparent_1.5px)] [background-size:12px_12px]" />

        <div className="relative z-10 flex flex-col items-center text-center py-4">
          {/* Animated Upload Icon Pod */}
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary mb-space-md shadow-inner group-hover:scale-110 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
            <span className="material-symbols-outlined text-[32px] group-hover:-translate-y-1 transition-transform">
              cloud_upload
            </span>
          </div>

          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            Tap to browse or drop file here
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md max-w-xs">
            Fast local text extraction and instant readability analysis.
          </p>

          {/* Pill Badge for Max Size */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-stat text-label-stat">
            <span className="material-symbols-outlined text-[14px] text-outline">info</span>
            <span>MAX FILE SIZE 25MB</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.docx,.pdf,.md,.csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelected(e.target.files[0]);
              }
            }}
          />
        </div>

        {/* Active drag overlay state */}
        <div
          className={`absolute inset-0 bg-primary/90 backdrop-blur-sm flex flex-col items-center justify-center text-on-primary transition-opacity duration-200 ${
            isDragging ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <span className="material-symbols-outlined text-[48px] animate-bounce">
            download
          </span>
          <p className="font-headline-sm text-headline-sm mt-2">Release to import document</p>
        </div>
      </div>

      {/* Direct Integrations Section */}
      <div className="flex flex-col mb-space-lg">
        <div className="flex items-center justify-between mb-space-sm px-1">
          <span className="font-label-stat text-label-stat uppercase text-on-surface-variant tracking-wider">
            Fast Capture Methods
          </span>
          <span className="font-body-sm text-body-sm text-primary font-medium">Instant</span>
        </div>

        <div className="flex flex-col gap-space-xs">
          {/* Option 1: Scan / OCR */}
          <button
            onClick={onOpenOcrModal}
            className="flex items-center gap-space-md p-space-md rounded-2xl bg-surface-container-lowest text-left shadow-xs border border-outline-variant/10 hover:bg-surface-container-low active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">document_scanner</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-headline-sm text-headline-sm text-on-surface truncate">
                  Scan / OCR via Camera
                </p>
                <span className="px-1.5 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container font-label-stat text-[10px] leading-tight font-semibold">
                  AI
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                Physical printed document or book page
              </p>
            </div>
            <span className="material-symbols-outlined text-outline shrink-0 text-[20px]">
              chevron_right
            </span>
          </button>

          {/* Option 2: Cloud / Storage */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-space-md p-space-md rounded-2xl bg-surface-container-lowest text-left shadow-xs border border-outline-variant/10 hover:bg-surface-container-low active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-secondary shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">folder_open</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-headline-sm text-headline-sm text-on-surface truncate">
                Files / iCloud / Google Drive
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                Sync directly from your cloud vaults
              </p>
            </div>
            <span className="material-symbols-outlined text-outline shrink-0 text-[20px]">
              chevron_right
            </span>
          </button>

          {/* Option 3: Paste from Clipboard */}
          <button
            onClick={handlePasteClipboard}
            className="flex items-center gap-space-md p-space-md rounded-2xl bg-surface-container-lowest text-left shadow-xs border border-outline-variant/10 hover:bg-surface-container-low active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-tertiary shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">content_paste</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-headline-sm text-headline-sm text-on-surface truncate">
                Paste from Clipboard
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                One-tap import from copied text
              </p>
            </div>
            <span className="material-symbols-outlined text-outline shrink-0 text-[20px]">
              chevron_right
            </span>
          </button>

          {/* Option 4: URL Fetch */}
          <button
            onClick={onOpenUrlModal}
            className="flex items-center gap-space-md p-space-md rounded-2xl bg-surface-container-lowest text-left shadow-xs border border-outline-variant/10 hover:bg-surface-container-low active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">link</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-headline-sm text-headline-sm text-on-surface truncate">
                Fetch from Web URL
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                Extract clear article body from any link
              </p>
            </div>
            <span className="material-symbols-outlined text-outline shrink-0 text-[20px]">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      {/* Recent Uploads Section */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-space-sm px-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">history</span>
            <span className="font-label-stat text-label-stat uppercase text-on-surface-variant tracking-wider">
              Recent Uploaded Files
            </span>
          </div>
          <button
            onClick={onClearRecent}
            className="font-label-button text-body-sm text-primary hover:underline cursor-pointer"
          >
            Clear
          </button>
        </div>

        <div className="flex flex-col gap-space-xs">
          {recentDocs.length === 0 ? (
            <div className="p-space-md text-center bg-surface-container-lowest rounded-2xl text-on-surface-variant font-body-sm">
              No recent documents yet. Upload or paste text above.
            </div>
          ) : (
            recentDocs.slice(0, 5).map((doc) => {
              const iconName =
                doc.category === 'docx'
                  ? 'description'
                  : doc.category === 'pdf'
                  ? 'picture_as_pdf'
                  : 'article';

              const iconColor =
                doc.category === 'docx'
                  ? 'text-secondary'
                  : doc.category === 'pdf'
                  ? 'text-tertiary'
                  : 'text-outline';

              return (
                <div
                  key={doc.id}
                  className="group flex items-center justify-between p-space-md rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/10 hover:bg-surface-container-low transition-all"
                >
                  <div className="flex items-center gap-space-md min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center ${iconColor} shrink-0`}
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {iconName}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-headline-sm text-body-lg text-on-surface truncate font-semibold">
                        {doc.title}
                      </p>
                      <div className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant truncate">
                        <span className="font-medium text-primary">
                          {doc.words.toLocaleString()} words
                        </span>
                        <span>•</span>
                        <span>{doc.fileSizeStr || '18 KB'}</span>
                        <span>•</span>
                        <span>{doc.updatedAtLabel}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    aria-label={`Load ${doc.title}`}
                    onClick={() => onLoadDocument(doc)}
                    className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors shrink-0 shadow-xs ml-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      arrow_forward
                    </span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

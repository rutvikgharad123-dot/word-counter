import React from 'react';
import { AnalysisResult, generateCSVReport, generateMarkdownReport } from '../utils/analysis';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  docTitle: string;
  analysis: AnalysisResult;
  onShowToast: (message: string) => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  docTitle,
  analysis,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    const csv = generateCSVReport(docTitle, analysis);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docTitle.replace(/\.[^/.]+$/, '')}_CountLab_Audit.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('CSV Report downloaded!');
    onClose();
  };

  const handlePrintPDF = () => {
    window.print();
    onShowToast('Opened Print dialog for PDF export');
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownReport(docTitle, analysis);
    navigator.clipboard.writeText(md);
    onShowToast('Markdown summary copied to clipboard!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-4 transition-opacity duration-200">
      <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-2xl flex flex-col max-w-lg mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between mb-space-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">download</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Export Linguistic Audit
              </h3>
              <p className="font-body-sm text-body-sm text-outline truncate max-w-xs">
                {docTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
          Export your complete word count, readability levels, pacing durations, and keyword densities into standard formats.
        </p>

        <div className="flex flex-col gap-space-xs mb-space-md">
          {/* Option 1: CSV Export */}
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container active:scale-[0.98] transition-all text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-container/15 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">table_chart</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-button text-label-button text-on-surface">
                Spreadsheet Data (.CSV)
              </p>
              <p className="font-body-sm text-body-sm text-outline">
                Raw metrics & keyword frequency table
              </p>
            </div>
            <span className="material-symbols-outlined text-outline text-[18px]">download</span>
          </button>

          {/* Option 2: Print / PDF */}
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container active:scale-[0.98] transition-all text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary-container/15 text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">print</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-button text-label-button text-on-surface">
                Print / Save as PDF
              </p>
              <p className="font-body-sm text-body-sm text-outline">
                Formatted presentation-ready visual audit
              </p>
            </div>
            <span className="material-symbols-outlined text-outline text-[18px]">picture_as_pdf</span>
          </button>

          {/* Option 3: Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container active:scale-[0.98] transition-all text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-tertiary-container/15 text-tertiary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">markdown</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-button text-label-button text-on-surface">
                Copy Markdown Report
              </p>
              <p className="font-body-sm text-body-sm text-outline">
                Formatted text for GitHub, Notion, or Obsidian
              </p>
            </div>
            <span className="material-symbols-outlined text-outline text-[18px]">content_copy</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-surface-container text-on-surface font-label-button text-label-button text-center hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  onOpenImport: () => void;
  onOpenSettings: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigate,
  onOpenImport,
  onOpenSettings,
  isDark,
  onToggleTheme,
}) => {
  const isImportView = activeTab === 'import';

  const getTitle = () => {
    switch (activeTab) {
      case 'editor':
        return 'Editor';
      case 'analytics':
        return 'Analytics';
      case 'history':
        return 'History';
      case 'settings':
        return 'Settings';
      case 'import':
        return 'Document Import';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe border-b border-outline-variant/15 transition-colors">
      <div className="h-16 max-w-lg mx-auto px-margin flex items-center justify-between gap-space-sm">
        {/* Left Side: Back button or App Logo + Title */}
        <div className="flex items-center gap-space-xs min-w-0 flex-1">
          {isImportView ? (
            <>
              <button
                aria-label="Go back"
                onClick={() => onNavigate('editor')}
                className="w-10 h-10 -ml-1.5 flex items-center justify-center rounded-xl text-on-surface hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">arrow_back</span>
              </button>
              <img
                alt="CountLab App Icon"
                className="h-7 w-auto object-contain shrink-0 ml-1"
                src="https://lh3.googleusercontent.com/aida/AEtjO1VbW4nHUXDwdbM2byDK7RaDcTVujB135wdK-hG7YfY7M3zMN7mWJadRYKAEpIlakvsYVssRkJX2I1jyc7v26Mqv5A6x4WiRJxivoXJtVbQLhpPiq9tYAzoGNCysA1CsPIZ8jtcc1NKPXNNp0FSs0L_6pV3L-3yOAJYb8RqDrOmnJmr0rLGqG3125IW5scNLj7okrJEJSQP8WERkQeewEjFIz0X_oHOuxrn-4s2W-MET8wFK4y7FTbi-J1tS"
              />
              <h1 className="font-headline-md text-headline-md text-on-surface truncate ml-2">
                Document Import
              </h1>
            </>
          ) : (
            <>
              <img
                alt="CountLab App Icon"
                className="h-8 w-auto object-contain shrink-0"
                src="https://lh3.googleusercontent.com/aida/AEtjO1VbW4nHUXDwdbM2byDK7RaDcTVujB135wdK-hG7YfY7M3zMN7mWJadRYKAEpIlakvsYVssRkJX2I1jyc7v26Mqv5A6x4WiRJxivoXJtVbQLhpPiq9tYAzoGNCysA1CsPIZ8jtcc1NKPXNNp0FSs0L_6pV3L-3yOAJYb8RqDrOmnJmr0rLGqG3125IW5scNLj7okrJEJSQP8WERkQeewEjFIz0X_oHOuxrn-4s2W-MET8wFK4y7FTbi-J1tS"
              />
              <div className="flex flex-col min-w-0 ml-1.5">
                <span className="font-label-stat text-label-stat uppercase text-outline tracking-wider leading-none">
                  CountLab
                </span>
                <h1 className="font-headline-md text-headline-md text-on-surface truncate leading-tight">
                  {getTitle()}
                </h1>
              </div>
            </>
          )}
        </div>

        {/* Right Side: Quick Action & Profile / Theme */}
        <div className="flex items-center gap-space-xs shrink-0">
          {!isImportView && (
            <button
              aria-label="Import Document"
              onClick={onOpenImport}
              className="h-10 px-3 flex items-center gap-1.5 rounded-xl bg-surface-container-low text-primary hover:bg-surface-container active:scale-95 transition-all text-label-button font-label-button cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">upload_file</span>
              <span className="hidden sm:inline">Import</span>
            </button>
          )}

          {/* Theme Quick Toggle */}
          <button
            aria-label="Toggle Theme"
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Profile / Settings avatar */}
          <button
            aria-label="User settings"
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
            title="Account & Settings"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};

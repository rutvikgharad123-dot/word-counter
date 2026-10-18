import React from 'react';
import { UserSettings } from '../types';

interface SettingsScreenProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetSampleDocs: () => void;
  onShowToast: (message: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onResetSampleDocs,
  onShowToast,
}) => {
  return (
    <div className="flex flex-col w-full pb-16 space-y-space-md">
      {/* Target Word Goal Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-xs border border-outline-variant/15 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">flag</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Daily Word Count Goal
            </h2>
            <p className="font-body-sm text-body-sm text-outline">
              Track writing endurance and completion targets
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="font-body-md text-body-md text-on-surface">Target Words</span>
          <span className="font-code-mono text-headline-sm text-primary font-bold">
            {settings.dailyGoalWords.toLocaleString()} words
          </span>
        </div>

        <input
          type="range"
          min={250}
          max={5000}
          step={250}
          value={settings.dailyGoalWords}
          onChange={(e) => {
            onUpdateSettings({ dailyGoalWords: parseInt(e.target.value, 10) });
          }}
          className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
        />

        <div className="flex justify-between text-body-sm text-outline font-code-mono">
          <span>250w</span>
          <span>1,000w</span>
          <span>2,000w</span>
          <span>5,000w</span>
        </div>
      </div>

      {/* Pacing Preferences Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-xs border border-outline-variant/15 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">speed</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Reading &amp; Speaking Speeds
            </h2>
            <p className="font-body-sm text-body-sm text-outline">
              Calibrate estimated duration calculations
            </p>
          </div>
        </div>

        {/* Silent Reading WPM */}
        <div className="flex flex-col gap-2 pt-1 border-t border-outline-variant/10">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-body-md text-body-md font-medium text-on-surface">
                Silent Reading Pace
              </span>
              <span className="font-body-sm text-body-sm text-outline">
                Standard adult reading rate
              </span>
            </div>
            <span className="font-code-mono text-body-lg text-primary font-bold">
              {settings.readingWpm} WPM
            </span>
          </div>
          <input
            type="range"
            min={120}
            max={350}
            step={10}
            value={settings.readingWpm}
            onChange={(e) => {
              onUpdateSettings({ readingWpm: parseInt(e.target.value, 10) });
            }}
            className="w-full accent-primary h-2 bg-surface-container rounded-lg cursor-pointer"
          />
        </div>

        {/* Speech WPM */}
        <div className="flex flex-col gap-2 pt-1 border-t border-outline-variant/10">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-body-md text-body-md font-medium text-on-surface">
                Oral Speech Pace
              </span>
              <span className="font-body-sm text-body-sm text-outline">
                Presentation or speech tempo
              </span>
            </div>
            <span className="font-code-mono text-body-lg text-secondary font-bold">
              {settings.speakingWpm} WPM
            </span>
          </div>
          <input
            type="range"
            min={90}
            max={220}
            step={5}
            value={settings.speakingWpm}
            onChange={(e) => {
              onUpdateSettings({ speakingWpm: parseInt(e.target.value, 10) });
            }}
            className="w-full accent-secondary h-2 bg-surface-container rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Analytics Configuration Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-xs border border-outline-variant/15 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Linguistic Analysis Filter
            </h2>
            <p className="font-body-sm text-body-sm text-outline">
              Filter stop-words for accurate thematic keywords
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
          <div className="flex flex-col pr-4">
            <span className="font-body-md text-body-md font-medium text-on-surface">
              Exclude Common Stop Words
            </span>
            <span className="font-body-sm text-body-sm text-outline">
              Omit words like 'the', 'is', 'at', and 'which' from density rankings
            </span>
          </div>
          <button
            onClick={() => {
              onUpdateSettings({ excludeStopWords: !settings.excludeStopWords });
              onShowToast(
                settings.excludeStopWords
                  ? 'Showing all words in density'
                  : 'Excluding stop words in density'
              );
            }}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.excludeStopWords ? 'bg-primary' : 'bg-surface-container-high'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                settings.excludeStopWords ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Theme & Appearance */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-xs border border-outline-variant/15 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">palette</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Appearance
              </h2>
              <p className="font-body-sm text-body-sm text-outline">
                Precision Metric Studio theme
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl">
            <button
              onClick={() => onUpdateSettings({ theme: 'light' })}
              className={`px-3 py-1.5 rounded-lg text-body-sm font-medium transition-all cursor-pointer ${
                settings.theme === 'light'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => onUpdateSettings({ theme: 'dark' })}
              className={`px-3 py-1.5 rounded-lg text-body-sm font-medium transition-all cursor-pointer ${
                settings.theme === 'dark'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      {/* Danger & Reset Zone */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-xs border border-outline-variant/15 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-body-md font-semibold text-on-surface">
              Reset Sample Documents
            </h3>
            <p className="font-body-sm text-body-sm text-outline">
              Restore default reports and mock data
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Reset all cataloged documents back to default samples?')) {
                onResetSampleDocs();
                onShowToast('Restored default documents');
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-outline hover:text-error text-body-sm font-label-button transition-colors cursor-pointer"
          >
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};

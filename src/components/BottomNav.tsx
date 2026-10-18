import React from 'react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigate }) => {
  const tabs = [
    { id: 'editor' as ActiveTab, label: 'Editor', icon: 'edit_note' },
    { id: 'analytics' as ActiveTab, label: 'Analytics', icon: 'analytics' },
    { id: 'history' as ActiveTab, label: 'History', icon: 'history' },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: 'tune' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-surface/85 backdrop-blur-xl shadow-[0_-1px_12px_rgba(15,23,42,0.05)] border-t border-outline-variant/15 transition-colors">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-space-xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 rounded-xl transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {tab.icon}
              </span>
              <span className="font-body-sm text-[11px] leading-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

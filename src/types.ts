export type DocCategory = 'docx' | 'pdf' | 'txt' | 'draft' | 'pasted' | 'url';

export interface KeywordDensity {
  word: string;
  count: number;
  density: number; // e.g. 2.8%
}

export interface DocumentItem {
  id: string;
  title: string;
  category: DocCategory;
  content: string;
  words: number;
  chars: number;
  charsNoSpaces: number;
  sentences: number;
  paragraphs: number;
  avgWordLength: number;
  readingMinutes: number;
  speakingMinutes: number;
  gradeLevel: string;
  fleschScore: number;
  tone: string;
  lexicalDiversity: number;
  fileSizeStr: string;
  updatedAtLabel: string;
  timestamp: number;
  topKeywords: KeywordDensity[];
}

export interface UserSettings {
  dailyGoalWords: number;
  readingWpm: number;
  speakingWpm: number;
  excludeStopWords: boolean;
  theme: 'light' | 'dark';
}

export type ActiveTab = 'editor' | 'analytics' | 'history' | 'settings' | 'import';

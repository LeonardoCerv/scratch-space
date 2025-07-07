import * as vscode from 'vscode';

export interface Scratchpad {
  id: string;
  name: string;
  content: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateSnippet {
  id: string;
  name: string;
  language: string;
  description: string;
  content: string;
  category: string;
}

export interface ScratchpadConfig {
  autoSave: boolean;
  autoSaveDelay: number;
  defaultLanguage: string;
  showTemplatePreview: boolean;
  favoriteTemplates: string[];
  showLanguageInTreeView: boolean;
}

export interface TemplateQuickPickItem extends vscode.QuickPickItem {
  template: TemplateSnippet;
}

export interface LanguageQuickPickItem extends vscode.QuickPickItem {
  language: string;
}

// Common language definitions for consistency
export const SUPPORTED_LANGUAGES = [
  'plaintext', 'javascript', 'typescript', 'python', 'html', 'css', 'scss', 'sass',
  'json', 'markdown', 'xml', 'yaml', 'sql', 'shell', 'powershell', 'bat',
  'java', 'csharp', 'cpp', 'c', 'php', 'ruby', 'go', 'rust', 'swift',
  'kotlin', 'dart', 'perl', 'lua', 'r', 'matlab', 'julia', 'scala'
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Template categories
export const TEMPLATE_CATEGORIES = [
  'Basic', 'OOP', 'Async', 'React', 'Types', 'Data Science', 
  'Web', 'Layout', 'API', 'Documentation', 'Database'
] as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number];

export interface HistoryEntry {
  id: string;
  scratchpadId: string;
  content: string;
  timestamp: Date;
  changeType: 'create' | 'update' | 'delete' | 'rename' | 'language-change';
  metadata?: {
    oldValue?: string;
    newValue?: string;
    description?: string;
  };
}

export interface HistorySearchResult {
  entry: HistoryEntry;
  relevanceScore: number;
  matchingContext: string;
}

export interface SessionState {
  activeScratchpadId?: string;
  openScratchpadIds: string[];
  viewState: {
    [scratchpadId: string]: {
      selection?: vscode.Selection;
      visibleRanges?: vscode.Range[];
      scrollTop?: number;
    };
  };
  timestamp: Date;
}

export interface BackupEntry {
  scratchpadId: string;
  content: string;
  timestamp: Date;
  autoBackup: boolean;
}

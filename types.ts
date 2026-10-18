
export type PlanTier = 'FREE' | 'PRO' | 'MAX' | 'PRO_MAX';

export interface PlanThemeConfig {
  id: PlanTier;
  name: string;
  tagline: string;
  price: string;
  accentColor: string;
  glowColor: string;
  borderColor: string;
  bgGradient: string;
  badgeBg: string;
  speedMultiplier: string;
  highlightText: string;
}

export interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'code-change' | 'error';
}

export interface ProjectState {
  files: CodeFile[];
  activeFileId: string | null;
}

export enum ToolAction {
  GENERATE = 'GENERATE',
  EXPLAIN = 'EXPLAIN',
  FIX = 'FIX',
  CHANGE = 'CHANGE',
  REFACTOR = 'REFACTOR',
  DUBBLE_CHECK = 'DUBBLE_CHECK',
  TRIPPLE_CHECK = 'TRIPPLE_CHECK',
  MISTAKE_FINDER = 'MISTAKE_FINDER'
}

export interface AppRuntimeError {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  timestamp: number;
}


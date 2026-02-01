
export enum Gender {
  M = 'M',
  F = 'F',
  G = 'G' // Group/Dupla
}

export enum Genre {
  SERTANEJO = 'sertanejo',
  PAGODE = 'pagode',
  POP_BR = 'pop_br',
  GOSPEL = 'gospel',
  POP_INTL = 'pop_intl',
  ROCK_MPB = 'rock_mpb',
  FLASHBACK = 'flashback',
  TIKTOK = 'tiktok',
  ALL = 'all'
}

export enum Difficulty {
  NORMAL = 'normal',
  HARD = 'hard'
}

export interface Artist {
  name: string;
  cat: Genre;
  gender: Gender;
}

export interface Song {
  title: string;
  artist: string;
  preview: string;
  albumCover: string;
  category: Genre;
  gender: Gender;
}

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  rewardXp: number;
  rewardCoins: number;
  type: 'play' | 'win' | 'score';
}

export interface UserStats {
  totalMatches: number;
  totalWins: number;
  genreCounts: Record<string, number>; // { 'sertanejo': 5, 'pop': 2 }
  highestRoundSurvival: number;
  totalCoinsEarned: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  avatar: string;
  xp: number;
  level: number;
  matches: number; // Mantido para compatibilidade
  wins: number;    // Mantido para compatibilidade
  currentThemeId?: string;
  
  // Novos Campos
  coins: number;
  inventory: {
    hints: number;
    skips: number;
    lives: number; // Vidas extras para survival
  };
  badges: string[]; // IDs das conquistas desbloqueadas
  dailyChallenge: DailyChallenge;
  stats: UserStats;
}

export interface Player {
  name: string;
  avatar: string;
  score: number;
  skips: number;
  hints: number;
  passes: number;
  streak: number;
  isBot?: boolean;
  lives: number;
  isGuest?: boolean;
}

export interface HistoryRecord {
  winnerName: string;
  winnerAvatar: string;
  score1: number;
  score2: number;
  date: string;
}

export interface Theme {
  id: string;
  name: string;
  minLevel: number;
  background: string;
  buttonGradient: string;
  accentColor: string;
  emoji: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (user: User) => boolean;
}

export type GameScreen = 'welcome' | 'auth' | 'themes' | 'lobby' | 'category' | 'difficulty' | 'config' | 'loading' | 'game' | 'end' | 'leaderboard' | 'shop' | 'badges';

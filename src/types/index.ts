export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Profile {
  userId: string;
  avatarState: 'happy' | 'neutral' | 'sad';
  totalCheckIns: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
}

export interface MoodLog {
  id: string;
  userId: string;
  moodLevel: 1 | 2 | 3 | 4 | 5;
  description: string;
  heartRate?: number;
  sleepQuality?: number;
  stressLevel?: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  moodLogId?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface QuestionnaireResponse {
  id: string;
  userId: string;
  questionnaireType: string;
  responses: Record<string, any>;
  score?: number;
  createdAt: string;
}

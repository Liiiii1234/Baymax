import { User, Profile, MoodLog, ChatMessage, QuestionnaireResponse } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'mindbloom_current_user',
  USERS: 'mindbloom_users',
  PROFILES: 'mindbloom_profiles',
  MOOD_LOGS: 'mindbloom_mood_logs',
  CHAT_MESSAGES: 'mindbloom_chat_messages',
  QUESTIONNAIRES: 'mindbloom_questionnaires',
};

export const storage = {
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  addUser: (user: User): void => {
    const users = storage.getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getProfile: (userId: string): Profile | null => {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
    const profiles: Profile[] = data ? JSON.parse(data) : [];
    return profiles.find(p => p.userId === userId) || null;
  },

  updateProfile: (profile: Profile): void => {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
    let profiles: Profile[] = data ? JSON.parse(data) : [];
    const index = profiles.findIndex(p => p.userId === profile.userId);

    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }

    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  },

  getMoodLogs: (userId: string): MoodLog[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MOOD_LOGS);
    const logs: MoodLog[] = data ? JSON.parse(data) : [];
    return logs.filter(log => log.userId === userId).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  addMoodLog: (log: MoodLog): void => {
    const data = localStorage.getItem(STORAGE_KEYS.MOOD_LOGS);
    const logs: MoodLog[] = data ? JSON.parse(data) : [];
    logs.push(log);
    localStorage.setItem(STORAGE_KEYS.MOOD_LOGS, JSON.stringify(logs));
  },

  getChatMessages: (userId: string): ChatMessage[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    const messages: ChatMessage[] = data ? JSON.parse(data) : [];
    return messages.filter(msg => msg.userId === userId).sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  },

  addChatMessage: (message: ChatMessage): void => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    const messages: ChatMessage[] = data ? JSON.parse(data) : [];
    messages.push(message);
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
  },

  getQuestionnaires: (userId: string): QuestionnaireResponse[] => {
    const data = localStorage.getItem(STORAGE_KEYS.QUESTIONNAIRES);
    const questionnaires: QuestionnaireResponse[] = data ? JSON.parse(data) : [];
    return questionnaires.filter(q => q.userId === userId).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  addQuestionnaire: (questionnaire: QuestionnaireResponse): void => {
    const data = localStorage.getItem(STORAGE_KEYS.QUESTIONNAIRES);
    const questionnaires: QuestionnaireResponse[] = data ? JSON.parse(data) : [];
    questionnaires.push(questionnaire);
    localStorage.setItem(STORAGE_KEYS.QUESTIONNAIRES, JSON.stringify(questionnaires));
  },
};

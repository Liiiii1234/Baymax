import { User, Profile } from '../types';
import { storage } from './storage';

export const auth = {
  register: (email: string, password: string, username: string): { success: boolean; error?: string; user?: User } => {
    const users = storage.getUsers();

    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already exists' };
    }

    const user: User = {
      id: crypto.randomUUID(),
      username,
      email,
    };

    const profile: Profile = {
      userId: user.id,
      avatarState: 'neutral',
      totalCheckIns: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: null,
    };

    storage.addUser(user);
    storage.updateProfile(profile);

    localStorage.setItem(`mindbloom_password_${user.id}`, password);

    return { success: true, user };
  },

  login: (email: string, password: string): { success: boolean; error?: string; user?: User } => {
    const users = storage.getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const storedPassword = localStorage.getItem(`mindbloom_password_${user.id}`);
    if (storedPassword !== password) {
      return { success: false, error: 'Invalid email or password' };
    }

    storage.setCurrentUser(user);
    return { success: true, user };
  },

  logout: (): void => {
    storage.setCurrentUser(null);
  },

  getCurrentUser: (): User | null => {
    return storage.getCurrentUser();
  },
};

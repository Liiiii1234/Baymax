import { useState, useEffect } from 'react';
import { LogOut, Trophy, Flame, Calendar, TrendingUp, Award } from 'lucide-react';
import { User, Profile as ProfileType, MoodLog } from '../types';
import { storage } from '../utils/storage';
import { auth } from '../utils/auth';
import Avatar from '../components/Avatar';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

const MOTIVATIONAL_QUOTES = [
  "Every day is a new opportunity to nurture your mind and spirit.",
  "You're making progress, even on the days when it doesn't feel like it.",
  "Small steps every day lead to remarkable growth over time.",
  "Your commitment to self-care is inspiring and powerful.",
  "The journey to wellness is not linear, and that's perfectly okay.",
  "You're building resilience one check-in at a time.",
];

const BADGES = [
  { id: 'first_step', name: 'First Step', icon: '🌱', requirement: 1, description: 'Complete your first check-in' },
  { id: 'week_warrior', name: 'Week Warrior', icon: '🔥', requirement: 7, description: '7-day streak' },
  { id: 'month_master', name: 'Month Master', icon: '🏆', requirement: 30, description: '30-day streak' },
  { id: 'centurion', name: 'Centurion', icon: '💯', requirement: 100, description: '100 total check-ins' },
  { id: 'consistent', name: 'Consistent', icon: '⭐', requirement: 14, description: '14-day streak' },
];

export default function Profile({ user, onLogout }: ProfileProps) {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    loadProfile();
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, [user.id]);

  const loadProfile = () => {
    const userProfile = storage.getProfile(user.id);
    const logs = storage.getMoodLogs(user.id);
    setProfile(userProfile);
    setMoodLogs(logs);
  };

  const getEarnedBadges = () => {
    if (!profile) return [];
    return BADGES.filter((badge) => {
      if (badge.id === 'first_step' || badge.id === 'centurion') {
        return profile.totalCheckIns >= badge.requirement;
      }
      return profile.longestStreak >= badge.requirement;
    });
  };

  const getAverageMood = () => {
    if (moodLogs.length === 0) return 0;
    const sum = moodLogs.reduce((acc, log) => acc + log.moodLevel, 0);
    return (sum / moodLogs.length).toFixed(1);
  };

  const getDaysActive = () => {
    if (!profile?.lastCheckInDate) return 0;
    const firstLog = moodLogs[moodLogs.length - 1];
    if (!firstLog) return 0;
    const start = new Date(firstLog.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const earnedBadges = getEarnedBadges();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-pink-50 pb-24 px-4 pt-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex flex-col items-center text-center">
            <Avatar mood={profile?.avatarState || 'neutral'} size="large" />

            <h1 className="text-3xl font-bold text-gray-800 mt-6 mb-2">{user.username}</h1>
            <p className="text-gray-600 mb-4">{user.email}</p>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 mb-6 max-w-md">
              <p className="text-sm text-gray-700 italic leading-relaxed">"{quote}"</p>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {profile && (
          <>
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-semibold text-gray-800">Your Journey</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 text-center">
                  <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-gray-800">{profile.totalCheckIns}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Check-ins</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 text-center">
                  <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-gray-800">{profile.currentStreak}</div>
                  <div className="text-sm text-gray-600 mt-1">Current Streak</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 text-center">
                  <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-gray-800">{profile.longestStreak}</div>
                  <div className="text-sm text-gray-600 mt-1">Best Streak</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 text-center">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-gray-800">{getAverageMood()}</div>
                  <div className="text-sm text-gray-600 mt-1">Avg Mood</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <p className="text-sm text-gray-600">
                  Active for <span className="font-bold text-gray-800">{getDaysActive()}</span> days
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center gap-2 mb-6">
                <Award className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-semibold text-gray-800">Achievements</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {BADGES.map((badge) => {
                  const earned = earnedBadges.find((b) => b.id === badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`rounded-2xl p-5 text-center transition-all ${
                        earned
                          ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300'
                          : 'bg-gray-100 opacity-50'
                      }`}
                    >
                      <div className={`text-4xl mb-2 ${earned ? '' : 'grayscale'}`}>
                        {badge.icon}
                      </div>
                      <div className="text-sm font-semibold text-gray-800">{badge.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{badge.description}</div>
                    </div>
                  );
                })}
              </div>

              {earnedBadges.length < BADGES.length && (
                <div className="mt-6 bg-blue-50 rounded-2xl p-4">
                  <p className="text-sm text-gray-700 text-center">
                    Keep going! You have {BADGES.length - earnedBadges.length} more achievements to unlock
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

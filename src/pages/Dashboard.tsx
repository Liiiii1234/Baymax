import { useState, useEffect } from 'react';
import { Heart, Moon, Brain, TrendingUp, MessageCircle } from 'lucide-react';
import { MoodLog, Profile, User } from '../types';
import { storage } from '../utils/storage';

interface DashboardProps {
  user: User;
  onNavigateToChat: () => void;
}

const MOOD_EMOJIS = ['😐', '🙂', '😊', '😄', '🤩'];
const MOOD_LABELS = ['Not Great', 'Okay', 'Good', 'Great', 'Amazing'];

export default function Dashboard({ user, onNavigateToChat }: DashboardProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [todayLog, setTodayLog] = useState<MoodLog | null>(null);
  const [recentLogs, setRecentLogs] = useState<MoodLog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [encouragement, setEncouragement] = useState('');

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = () => {
    const logs = storage.getMoodLogs(user.id);
    const userProfile = storage.getProfile(user.id);
    setProfile(userProfile);

    const today = new Date().toDateString();
    const todayEntry = logs.find(log => new Date(log.createdAt).toDateString() === today);

    if (todayEntry) {
      setHasLoggedToday(true);
      setTodayLog(todayEntry);
    }

    setRecentLogs(logs.slice(0, 7));

    if (todayEntry && todayEntry.moodLevel <= 2) {
      const messages = [
        "Take a deep breath, today might be heavy, but you're stronger than you think.",
        "Even the sun rests behind the clouds before shining again.",
        "You're doing your best, and that's all that matters today.",
        "Every emotion is valid. Let yourself feel, and know that tomorrow is a new beginning.",
      ];
      setEncouragement(messages[Math.floor(Math.random() * messages.length)]);
    }
  };

  const generateMockHealthData = () => ({
    heartRate: 60 + Math.floor(Math.random() * 40),
    sleepQuality: 4 + Math.floor(Math.random() * 6),
    stressLevel: 2 + Math.floor(Math.random() * 7),
  });

  const handleSubmit = () => {
    if (selectedMood === null || !description.trim()) return;

    const healthData = generateMockHealthData();
    const log: MoodLog = {
      id: crypto.randomUUID(),
      userId: user.id,
      moodLevel: (selectedMood + 1) as 1 | 2 | 3 | 4 | 5,
      description: description.trim(),
      ...healthData,
      createdAt: new Date().toISOString(),
    };

    storage.addMoodLog(log);

    const currentProfile = storage.getProfile(user.id) || {
      userId: user.id,
      avatarState: 'neutral' as const,
      totalCheckIns: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: null,
    };

    const today = new Date().toDateString();
    const lastCheckIn = currentProfile.lastCheckInDate
      ? new Date(currentProfile.lastCheckInDate).toDateString()
      : null;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let newStreak = currentProfile.currentStreak;
    if (lastCheckIn === yesterdayStr) {
      newStreak += 1;
    } else if (lastCheckIn !== today) {
      newStreak = 1;
    }

    const updatedProfile: Profile = {
      ...currentProfile,
      totalCheckIns: currentProfile.totalCheckIns + 1,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, currentProfile.longestStreak),
      lastCheckInDate: new Date().toISOString(),
      avatarState: log.moodLevel >= 4 ? 'happy' : log.moodLevel <= 2 ? 'sad' : 'neutral',
    };

    storage.updateProfile(updatedProfile);
    loadData();
  };

  const getAverageMood = () => {
    if (recentLogs.length === 0) return 0;
    const sum = recentLogs.reduce((acc, log) => acc + log.moodLevel, 0);
    return sum / recentLogs.length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-pink-50 pb-24 px-4 pt-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Hello, {user.username}
          </h1>
          <p className="text-gray-600">How are you feeling today?</p>
        </div>

        {!hasLoggedToday ? (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Daily Mood Check-in
            </h2>

            <div className="flex justify-around mb-6">
              {MOOD_EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMood(index)}
                  className={`flex flex-col items-center transition-all ${
                    selectedMood === index
                      ? 'scale-110'
                      : 'opacity-60 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  <span className="text-4xl mb-2">{emoji}</span>
                  <span className="text-xs text-gray-600">{MOOD_LABELS[index]}</span>
                </button>
              ))}
            </div>

            {selectedMood !== null && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your current thoughts or situation in one sentence
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="I'm feeling this way because..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                    rows={3}
                    maxLength={200}
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {description.length}/200
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!description.trim()}
                  className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-xl font-medium hover:from-green-500 hover:to-green-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Check-in
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Today's Check-in</h2>
                <span className="text-4xl">{MOOD_EMOJIS[todayLog!.moodLevel - 1]}</span>
              </div>
              <p className="text-gray-600 italic mb-6">"{todayLog?.description}"</p>

              {encouragement && (
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 mb-6 border border-pink-200">
                  <p className="text-sm text-gray-700 leading-relaxed">{encouragement}</p>
                </div>
              )}

              <button
                onClick={onNavigateToChat}
                className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white py-3 rounded-xl font-medium hover:from-blue-500 hover:to-blue-600 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Chat with Bloom
              </button>
            </div>

            {todayLog && (
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Health Metrics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-2xl">
                    <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">
                      {todayLog.heartRate}
                    </div>
                    <div className="text-xs text-gray-600">BPM</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-2xl">
                    <Moon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">
                      {todayLog.sleepQuality}/10
                    </div>
                    <div className="text-xs text-gray-600">Sleep</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-2xl">
                    <Brain className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">
                      {todayLog.stressLevel}/10
                    </div>
                    <div className="text-xs text-gray-600">Stress</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {recentLogs.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-800">7-Day Emotion Curve</h3>
            </div>
            <div className="flex items-end justify-around h-32 gap-2">
              {recentLogs.slice(0, 7).reverse().map((log, index) => {
                const height = (log.moodLevel / 5) * 100;
                return (
                  <div key={log.id} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-green-400 to-green-300 rounded-t-lg transition-all"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xl">{MOOD_EMOJIS[log.moodLevel - 1]}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Average mood: <span className="font-semibold">{getAverageMood().toFixed(1)}/5</span>
              </p>
            </div>
          </div>
        )}

        {profile && profile.totalCheckIns > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Progress</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600">{profile.totalCheckIns}</div>
                <div className="text-xs text-gray-600 mt-1">Total Check-ins</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">{profile.currentStreak}</div>
                <div className="text-xs text-gray-600 mt-1">Current Streak</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{profile.longestStreak}</div>
                <div className="text-xs text-gray-600 mt-1">Best Streak</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { User } from './types';
import { auth } from './utils/auth';
import AuthScreen from './components/AuthScreen';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Questionnaires from './pages/Questionnaires';
import Profile from './pages/Profile';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = () => {
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleNavigateToChat = () => {
    setActiveTab('chat');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading MindBloom...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="relative">
      {activeTab === 'dashboard' && <Dashboard user={user} onNavigateToChat={handleNavigateToChat} />}
      {activeTab === 'chat' && <Chat user={user} />}
      {activeTab === 'questionnaires' && <Questionnaires user={user} />}
      {activeTab === 'profile' && <Profile user={user} onLogout={handleLogout} />}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;

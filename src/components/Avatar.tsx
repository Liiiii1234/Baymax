import { useEffect, useState } from 'react';
import { Sprout, CloudRain, Sun } from 'lucide-react';

interface AvatarProps {
  mood: 'happy' | 'neutral' | 'sad';
  size?: 'small' | 'medium' | 'large';
}

export default function Avatar({ mood, size = 'medium' }: AvatarProps) {
  const [animationState, setAnimationState] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationState((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48',
  };

  const iconSizes = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
  };

  const getAvatarConfig = () => {
    switch (mood) {
      case 'happy':
        return {
          icon: Sun,
          bgGradient: 'from-yellow-200 via-orange-200 to-pink-200',
          iconColor: 'text-yellow-600',
          animation: 'animate-pulse',
          glow: 'shadow-lg shadow-yellow-300/50',
        };
      case 'sad':
        return {
          icon: CloudRain,
          bgGradient: 'from-blue-200 via-gray-200 to-blue-300',
          iconColor: 'text-blue-600',
          animation: '',
          glow: 'shadow-md shadow-blue-300/30',
        };
      case 'neutral':
      default:
        return {
          icon: Sprout,
          bgGradient: 'from-green-200 via-teal-200 to-green-300',
          iconColor: 'text-green-600',
          animation: '',
          glow: 'shadow-md shadow-green-300/40',
        };
    }
  };

  const config = getAvatarConfig();
  const Icon = config.icon;

  return (
    <div
      className={`relative ${sizeClasses[size]} bg-gradient-to-br ${config.bgGradient} rounded-full flex items-center justify-center ${config.glow} transition-all duration-500`}
      style={{
        transform: `translateY(${mood === 'happy' && animationState === 1 ? '-8px' : mood === 'sad' ? '4px' : '0'})`,
      }}
    >
      <Icon
        className={`${iconSizes[size]} ${config.iconColor} ${config.animation} transition-transform duration-500`}
        style={{
          transform: `scale(${animationState === 2 ? 1.1 : 1})`,
        }}
      />

      {mood === 'happy' && (
        <div className="absolute -top-2 -right-2 animate-bounce">
          <span className="text-2xl">✨</span>
        </div>
      )}

      {mood === 'sad' && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <span className="text-xl opacity-70">💧</span>
        </div>
      )}

      {mood === 'neutral' && (
        <div className="absolute -top-1 -right-1">
          <span className="text-lg">🌱</span>
        </div>
      )}
    </div>
  );
}

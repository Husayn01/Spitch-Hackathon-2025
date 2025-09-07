import { useGameStore } from '../../stores/gameStore';
import { ProgressBar } from './ProgressBar';

export const UserStats = () => {
  const { xp, level, cowrieShells, streakDays } = useGameStore();
  
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const xpProgress = xp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
      
      <div className="space-y-4">
        {/* Level Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl font-bold text-gray-900">Level {level}</span>
            <span className="text-sm text-gray-600">{xp} XP</span>
          </div>
          <ProgressBar 
            current={xpProgress} 
            max={xpNeeded} 
            label={`${xpProgress} / ${xpNeeded} XP to next level`}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="cultural-card p-4 text-center">
            <div className="text-3xl mb-1">🐚</div>
            <div className="text-2xl font-bold text-gray-900">{cowrieShells}</div>
            <div className="text-sm text-gray-600">Cowrie Shells</div>
          </div>
          
          <div className="cultural-card p-4 text-center">
            <div className="text-3xl mb-1">🔥</div>
            <div className="text-2xl font-bold text-gray-900">{streakDays}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
};
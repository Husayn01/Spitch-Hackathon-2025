import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { showToast } from '../utils/toast';

interface GameState {
  xp: number;
  cowrieShells: number;
  streakDays: number;
  lastActivityDate: string | null;
  level: number;
  achievements: string[];
  
  // Actions
  addXP: (amount: number) => Promise<void>;
  addCowries: (amount: number) => Promise<void>;
  updateStreak: () => Promise<void>;
  checkAchievements: () => Promise<void>;
  syncWithDatabase: () => Promise<void>;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      cowrieShells: 0,
      streakDays: 0,
      lastActivityDate: null,
      level: 1,
      achievements: [],

      addXP: async (amount) => {
        const newXP = get().xp + amount;
        const newLevel = Math.floor(newXP / 100) + 1; // 100 XP per level
        
        set({ 
          xp: newXP,
          level: newLevel 
        });

        // Check for level up
        if (newLevel > get().level) {
          showToast.levelUp(`Level Up! You're now level ${newLevel}!`);
          await get().addCowries(10); // Bonus cowries for leveling up
        }

        await get().syncWithDatabase();
        await get().checkAchievements();
      },

      addCowries: async (amount) => {
        set((state) => ({ 
          cowrieShells: state.cowrieShells + amount 
        }));
        
        if (amount > 0) {
          showToast.success(`+${amount} Cowrie Shells earned!`);
        }
        
        await get().syncWithDatabase();
      },

      updateStreak: async () => {
        const today = new Date().toISOString().split('T')[0];
        const lastActivity = get().lastActivityDate;
        
        if (!lastActivity || lastActivity !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (lastActivity === yesterdayStr) {
            // Continue streak
            set((state) => ({ 
              streakDays: state.streakDays + 1,
              lastActivityDate: today 
            }));
            
            // Streak bonuses
            const streak = get().streakDays;
            if (streak % 7 === 0) {
              await get().addCowries(5);
              showToast.streak(`${streak} day streak! Bonus cowries earned!`);
            }
          } else {
            // Reset streak
            set({ 
              streakDays: 1,
              lastActivityDate: today 
            });
          }
        }
        
        await get().syncWithDatabase();
      },

      checkAchievements: async () => {
        const state = get();
        const newAchievements: string[] = [];

        // Check various achievements
        if (state.xp >= 100 && !state.achievements.includes('first_100_xp')) {
          newAchievements.push('first_100_xp');
          showToast.achievement('Achievement Unlocked: First 100 XP!');
          await get().addCowries(20);
        }

        if (state.streakDays >= 7 && !state.achievements.includes('week_streak')) {
          newAchievements.push('week_streak');
          showToast.achievement('Achievement Unlocked: 7 Day Streak!');
          await get().addCowries(30);
        }

        if (state.level >= 5 && !state.achievements.includes('level_5')) {
          newAchievements.push('level_5');
          showToast.achievement('Achievement Unlocked: Reached Level 5!');
          await get().addCowries(50);
        }

        if (newAchievements.length > 0) {
          set((state) => ({
            achievements: [...state.achievements, ...newAchievements]
          }));
          await get().syncWithDatabase();
        }
      },

      syncWithDatabase: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const state = get();
        const { error } = await supabase
          .from('profiles')
          .update({
            total_xp: state.xp,
            cowrie_shells: state.cowrieShells,
            streak_days: state.streakDays,
            last_activity: state.lastActivityDate
          })
          .eq('id', user.id);

        if (error) {
          console.error('Failed to sync game state:', error);
        }
      }
    }),
    {
      name: 'afrilingo-game-state',
    }
  )
);
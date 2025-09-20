import { supabase } from '../lib/supabase';

export interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
}

export interface Lesson {
  id: string;
  language_id: string;
  title: string;
  description: string;
  lesson_order: number;
  xp_reward: number;
  cowrie_reward: number;
  lesson_type: 'vocabulary' | 'grammar' | 'conversation' | 'culture' | 'pronunciation';
  difficulty: number;
  estimated_time: number;
  is_premium: boolean;
  cultural_context?: any;
  created_at: string;
}

export interface Exercise {
  id: string;
  lesson_id: string;
  question: string;
  correct_answer: string;
  options?: string[];
  exercise_type: 'multiple_choice' | 'translation' | 'pronunciation' | 'fill_blank' | 'conversation';
  explanation?: string;
  audio_url?: string;
  exercise_order: number;
  points: number;
}

// Updated to match actual database schema
export interface UserProgress {
  id?: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score: number;
  xp_earned: number;
  cowries_earned: number;
  completed_at?: string;
  started_at?: string;
}

export interface ExerciseAttempt {
  id?: string;
  user_id: string;
  exercise_id: string;
  response: any;
  is_correct: boolean;
  pronunciation_score?: number;
  created_at?: string;
}

export interface Vocabulary {
  id: string;
  lesson_id: string;
  word: string;
  translation: string;
  pronunciation?: string;
  audio_url?: string;
  display_order: number;
  created_at: string;
}

class LessonService {
  /**
   * Get all available languages
   */
  async getLanguages(): Promise<Language[]> {
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching languages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get languages error:', error);
      return [];
    }
  }

  /**
   * Get lessons for a specific language
   */
  async getLessonsByLanguage(languageCode: string): Promise<Lesson[]> {
    try {
      // First get the language ID
      const { data: langData } = await supabase
        .from('languages')
        .select('id')
        .eq('code', languageCode)
        .single();

      if (!langData) return [];

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('language_id', langData.id)
        .order('lesson_order');

      if (error) {
        console.error('Error fetching lessons:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get lessons error:', error);
      return [];
    }
  }

  /**
   * Get a specific lesson with its exercises
   */
  async getLessonWithExercises(lessonId: string): Promise<{
    lesson: Lesson | null;
    exercises: Exercise[];
  }> {
    try {
      // Fetch lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (lessonError || !lessonData) {
        console.error('Lesson fetch error:', lessonError);
        return { lesson: null, exercises: [] };
      }

      // Fetch exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('exercise_order');

      if (exercisesError) {
        console.error('Exercises fetch error:', exercisesError);
      }

      return {
        lesson: lessonData,
        exercises: exercisesData || []
      };
    } catch (error) {
      console.error('Get lesson with exercises error:', error);
      return { lesson: null, exercises: [] };
    }
  }

  /**
   * Get user progress for a specific language
   */
  async getUserProgress(userId: string, languageCode: string): Promise<{
    completedLessons: number;
    totalLessons: number;
    averageScore: number;
    nextLesson?: Lesson;
  }> {
    try {
      // Get language ID
      const { data: langData } = await supabase
        .from('languages')
        .select('id')
        .eq('code', languageCode)
        .single();

      if (!langData) {
        return {
          completedLessons: 0,
          totalLessons: 0,
          averageScore: 0
        };
      }

      // Get all lessons for this language
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('language_id', langData.id);

      const lessonIds = lessons?.map(l => l.id) || [];

      if (lessonIds.length === 0) {
        return {
          completedLessons: 0,
          totalLessons: 0,
          averageScore: 0
        };
      }

      // Get user's completed lessons from user_progress table (NOT user_lessons)
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')  // FIXED: Changed from user_lessons
        .select('*')
        .eq('user_id', userId)
        .in('lesson_id', lessonIds)
        .eq('completed', true);

      if (progressError) {
        console.error('Progress fetch error:', progressError);
      }

      const completedLessons = progress?.length || 0;
      const totalLessons = lessons?.length || 0;
      const averageScore = completedLessons > 0 
        ? progress!.reduce((acc: number, p: any) => acc + (p.score || 0), 0) / completedLessons 
        : 0;

      // Find next lesson
      const completedIds = progress?.map(p => p.lesson_id) || [];
      
      // Get all lessons ordered by lesson_order
      const { data: allLessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('language_id', langData.id)
        .order('lesson_order');

      // Find the first lesson that hasn't been completed
      const nextLesson = allLessons?.find(lesson => !completedIds.includes(lesson.id));

      return {
        completedLessons,
        totalLessons,
        averageScore: Math.round(averageScore),
        nextLesson: nextLesson || undefined
      };
    } catch (error) {
      console.error('Get user progress error:', error);
      return {
        completedLessons: 0,
        totalLessons: 0,
        averageScore: 0
      };
    }
  }

  /**
   * Submit exercise attempt
   */
  async submitExercise(
    userId: string,
    exerciseId: string,
    response: any,
    isCorrect: boolean,
    pronunciationScore?: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('exercise_attempts')
        .insert({
          user_id: userId,
          exercise_id: exerciseId,
          response,
          is_correct: isCorrect,
          pronunciation_score: pronunciationScore
        });

      if (error) {
        console.error('Error submitting exercise:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Submit exercise error:', error);
      return false;
    }
  }

  /**
   * Start a lesson (record start time)
   */
  async startLesson(userId: string, lessonId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          completed: false,
          score: 0,
          xp_earned: 0,
          cowries_earned: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        // If error is duplicate key, update the started_at time
        if (error.code === '23505') {
          const { error: updateError } = await supabase
            .from('user_progress')
            .update({ started_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('lesson_id', lessonId);
          
          return !updateError;
        }
        console.error('Error starting lesson:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Start lesson error:', error);
      return false;
    }
  }

  /**
   * Complete a lesson
   */
  async completeLesson(
    userId: string,
    lessonId: string,
    score: number,
    timeSpent?: number  // Optional, as we're tracking started_at instead
  ): Promise<boolean> {
    try {
      // Get lesson details for rewards
      const { data: lesson } = await supabase
        .from('lessons')
        .select('xp_reward, cowrie_reward')
        .eq('id', lessonId)
        .single();

      if (!lesson) {
        console.error('Lesson not found');
        return false;
      }

      // Calculate actual rewards based on score
      const scorePercentage = score / 100;
      const earnedXP = Math.round(lesson.xp_reward * scorePercentage);
      const earnedCowries = Math.round(lesson.cowrie_reward * scorePercentage);

      // Update user_progress table (NOT user_lessons)
      const { error } = await supabase
        .from('user_progress')  // FIXED: Changed from user_lessons
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          score,
          xp_earned: earnedXP,
          cowries_earned: earnedCowries,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) {
        console.error('Error completing lesson:', error);
        return false;
      }

      // Update user profile stats
      await this.updateUserStats(userId, earnedXP, earnedCowries);

      return true;
    } catch (error) {
      console.error('Complete lesson error:', error);
      return false;
    }
  }

  /**
   * Update user statistics after lesson completion
   */
  private async updateUserStats(userId: string, xpEarned: number, cowriesEarned: number): Promise<void> {
    try {
      // Get current user stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp, cowrie_shells')
        .eq('id', userId)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            total_xp: (profile.total_xp || 0) + xpEarned,
            cowrie_shells: (profile.cowrie_shells || 0) + cowriesEarned
          })
          .eq('id', userId);
      }
    } catch (error) {
      console.error('Update user stats error:', error);
    }
  }

  /**
   * Get vocabulary for a lesson
   */
  async getLessonVocabulary(lessonId: string): Promise<Vocabulary[]> {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('display_order');

      if (error) {
        console.error('Error fetching vocabulary:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get vocabulary error:', error);
      return [];
    }
  }

  /**
   * Get user's overall statistics
   */
  async getUserStats(userId: string): Promise<{
    totalXP: number;
    totalCowries: number;
    lessonsCompleted: number;
    currentStreak: number;
    languages: Array<{
      language: string;
      progress: number;
      lessonsCompleted: number;
    }>;
  }> {
    try {
      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp, cowrie_shells, current_streak')
        .eq('id', userId)
        .single();

      // Get all user progress
      const { data: userProgress } = await supabase
        .from('user_progress')
        .select(`
          *,
          lessons!inner(
            language_id,
            languages!inner(
              code,
              name
            )
          )
        `)
        .eq('user_id', userId)
        .eq('completed', true);

      const languageStats = new Map<string, { completed: number; total: number }>();

      // Get total lessons per language for progress calculation
      const { data: allLanguages } = await supabase
        .from('languages')
        .select(`
          code,
          name,
          lessons(id)
        `);

      // Initialize language stats
      allLanguages?.forEach(lang => {
        languageStats.set(lang.code, {
          completed: 0,
          total: lang.lessons?.length || 0
        });
      });

      // Count completed lessons per language
      userProgress?.forEach(progress => {
        const langCode = progress.lessons.languages.code;
        const stats = languageStats.get(langCode);
        if (stats) {
          stats.completed++;
        }
      });

      // Convert to array format
      const languages = Array.from(languageStats.entries()).map(([code, stats]) => ({
        language: code,
        progress: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
        lessonsCompleted: stats.completed
      }));

      return {
        totalXP: profile?.total_xp || 0,
        totalCowries: profile?.cowrie_shells || 0,
        lessonsCompleted: userProgress?.length || 0,
        currentStreak: profile?.current_streak || 0,
        languages
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      return {
        totalXP: 0,
        totalCowries: 0,
        lessonsCompleted: 0,
        currentStreak: 0,
        languages: []
      };
    }
  }
}

export const lessonService = new LessonService();
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

export interface UserProgress {
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score: number;
  completed_at?: string;
  time_spent?: number;
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
        return { lesson: null, exercises: [] };
      }

      // Fetch exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('exercise_order');

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

      // Get user's completed lessons
      const { data: progress } = await supabase
        .from('user_lessons')
        .select('*')
        .eq('user_id', userId)
        .in('lesson_id', lessonIds)
        .eq('completed', true);

      const completedLessons = progress?.length || 0;
      const totalLessons = lessons?.length || 0;
      const averageScore = progress?.reduce((acc: number, p: any) => acc + p.score, 0) / (completedLessons || 1);

      // Find next lesson
      const completedIds = progress?.map(p => p.lesson_id) || [];
      let nextLessonQuery = supabase
        .from('lessons')
        .select('*')
        .eq('language_id', langData.id)
        .order('lesson_order')
        .limit(1);

      // Only add the NOT IN filter if there are completed IDs
      if (completedIds.length > 0) {
        nextLessonQuery = nextLessonQuery.not('id', 'in', `(${completedIds.join(',')})`);
      }

      const { data: nextLessonData } = await nextLessonQuery.single();

      return {
        completedLessons,
        totalLessons,
        averageScore: Math.round(averageScore),
        nextLesson: nextLessonData || undefined
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
    score?: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('exercise_attempts')
        .insert({
          user_id: userId,
          exercise_id: exerciseId,
          response,
          is_correct: isCorrect,
          pronunciation_score: score
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
   * Complete a lesson
   */
  async completeLesson(
    userId: string,
    lessonId: string,
    score: number,
    timeSpent: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_lessons')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          score,
          completed_at: new Date().toISOString(),
          time_spent: timeSpent
        });

      if (error) {
        console.error('Error completing lesson:', error);
        return false;
      }

      // Update user stats
      await this.updateUserStats(userId, lessonId);

      return true;
    } catch (error) {
      console.error('Complete lesson error:', error);
      return false;
    }
  }

  /**
   * Update user statistics after lesson completion
   */
  private async updateUserStats(userId: string, lessonId: string) {
    try {
      // Get lesson details
      const { data: lesson } = await supabase
        .from('lessons')
        .select('xp_reward, cowrie_reward')
        .eq('id', lessonId)
        .single();

      if (!lesson) return;

      // Update user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp, cowrie_shells')
        .eq('id', userId)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            total_xp: (profile.total_xp || 0) + lesson.xp_reward,
            cowrie_shells: (profile.cowrie_shells || 0) + lesson.cowrie_reward
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
  async getLessonVocabulary(lessonId: string): Promise<Array<{
    word: string;
    translation: string;
    pronunciation?: string;
    audio_url?: string;
  }>> {
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
}

export const lessonService = new LessonService();
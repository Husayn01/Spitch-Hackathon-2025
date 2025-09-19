// reseedMissing.ts - Fixed version with direct environment variable loading
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Create Supabase client directly
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.log('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function reseedMissingData() {
  console.log('🔧 Adding missing exercises and achievements...\n');

  // Exercise data for each lesson
  const exercisesByLesson: Record<string, any[]> = {
    'Basic Greetings': [
      {
        question: 'What is the Yoruba greeting for "Good morning"?',
        correct_answer: 'Ẹ káàárọ̀',
        options: ['Ẹ káàárọ̀', 'Ẹ káàsán', 'Ẹ kúùrọ̀lẹ́', 'Báwo ni?'],
        exercise_type: 'multiple_choice',
        exercise_order: 1,
        points: 10
      },
      {
        question: 'Translate "How are you?" to Yoruba',
        correct_answer: 'Báwo ni?',
        exercise_type: 'translation',
        exercise_order: 2,
        points: 10
      },
      {
        question: 'When would you use "Ẹ kúùrọ̀lẹ́"?',
        correct_answer: 'In the evening',
        options: ['In the morning', 'At noon', 'In the evening', 'At night'],
        exercise_type: 'multiple_choice',
        explanation: 'Ẹ kúùrọ̀lẹ́ is used to greet people in the evening, typically after 4pm',
        exercise_order: 3,
        points: 10
      }
    ],
    'Numbers 1-10': [
      {
        question: 'What is "Five" in Yoruba?',
        correct_answer: 'Àrún',
        options: ['Ọ̀kan', 'Èjì', 'Àrún', 'Ẹ̀wá'],
        exercise_type: 'multiple_choice',
        exercise_order: 1,
        points: 10
      }
    ],
    'Family Members': [
      {
        question: 'How do you say "Mother" in Yoruba?',
        correct_answer: 'Ìyá',
        options: ['Bàbá', 'Ìyá', 'Ọmọ', 'Ẹ̀gbọ́n'],
        exercise_type: 'multiple_choice',
        exercise_order: 1,
        points: 10
      }
    ],
    'Igbo Greetings': [
      {
        question: 'What is "Good morning" in Igbo?',
        correct_answer: 'Ụtụtụ ọma',
        options: ['Ụtụtụ ọma', 'Ehihie ọma', 'Mgbede ọma', 'Kedụ?'],
        exercise_type: 'multiple_choice',
        exercise_order: 1,
        points: 10
      },
      {
        question: 'How do you respond to "Kedụ?"',
        correct_answer: 'Adị m mma',
        exercise_type: 'translation',
        exercise_order: 2,
        points: 10
      }
    ],
    'Igbo Numbers 1-10': [
      {
        question: 'What is "Three" in Igbo?',
        correct_answer: 'Atọ',
        options: ['Otu', 'Abụọ', 'Atọ', 'Anọ'],
        exercise_type: 'multiple_choice',
        exercise_order: 1,
        points: 10
      }
    ],
    'Hausa Greetings': [
      {
        question: 'How do you greet someone in the morning in Hausa?',
        correct_answer: 'Ina kwana',
        options: ['Ina kwana', 'Ina wuni', 'Ina yini', 'Nagode'],
        exercise_type: 'multiple_choice',
        exercise_order: 1,
        points: 10
      },
      {
        question: 'What is the difference between "Yaya kake?" and "Yaya kike?"',
        correct_answer: 'Gender - kake is for males, kike is for females',
        exercise_type: 'explanation',
        explanation: 'In Hausa, greetings change based on the gender of the person you\'re addressing',
        exercise_order: 2,
        points: 15
      }
    ],
    'Hausa Numbers 1-10': [
      {
        question: 'Count from 1 to 5 in Hausa',
        correct_answer: 'Ɗaya, Biyu, Uku, Huɗu, Biyar',
        exercise_type: 'fill_blank',
        exercise_order: 1,
        points: 15
      }
    ]
  };

  try {
    // 1. Add missing exercises
    console.log('📝 Adding exercises...');
    
    // Get all lessons
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title');
    
    if (lessons) {
      for (const lesson of lessons) {
        const exercises = exercisesByLesson[lesson.title];
        if (exercises) {
          // Check if exercises already exist
          const { data: existing } = await supabase
            .from('exercises')
            .select('id')
            .eq('lesson_id', lesson.id)
            .limit(1);
          
          if (!existing || existing.length === 0) {
            const exerciseData = exercises.map(ex => ({
              ...ex,
              lesson_id: lesson.id
            }));
            
            const { error } = await supabase
              .from('exercises')
              .insert(exerciseData);
            
            if (error) {
              console.error(`❌ Error adding exercises for ${lesson.title}:`, error);
            } else {
              console.log(`✅ Added ${exercises.length} exercises for ${lesson.title}`);
            }
          } else {
            console.log(`⏭️  Exercises already exist for ${lesson.title}`);
          }
        }
      }
    }
    
    // 2. Add achievements
    console.log('\n🏆 Adding achievements...');
    
    const achievements = [
      {
        name: 'First Steps',
        description: 'Complete your first lesson',
        xp_reward: 50,
        cowrie_reward: 10,
        requirement_type: 'lesson_completion',
        requirement_value: 1
      },
      {
        name: 'Week Warrior',
        description: 'Maintain a 7-day learning streak',
        xp_reward: 100,
        cowrie_reward: 25,
        requirement_type: 'streak_milestone',
        requirement_value: 7
      },
      {
        name: 'Perfect Score',
        description: 'Get 100% on any lesson',
        xp_reward: 75,
        cowrie_reward: 15,
        requirement_type: 'lesson_completion',  // Changed to valid type
        requirement_value: 100
      },
      {
        name: 'Language Explorer',
        description: 'Complete at least one lesson in each language',
        xp_reward: 200,
        cowrie_reward: 50,
        requirement_type: 'lesson_completion',  // Changed from 'languages_started'
        requirement_value: 3
      }
    ];
    
    for (const achievement of achievements) {
      const { data: existing } = await supabase
        .from('achievements')
        .select('id')
        .eq('name', achievement.name)
        .single();
      
      if (!existing) {
        const { error } = await supabase
          .from('achievements')
          .insert(achievement);
        
        if (error) {
          console.error(`❌ Error adding achievement ${achievement.name}:`, error);
        } else {
          console.log(`✅ Added achievement: ${achievement.name}`);
        }
      } else {
        console.log(`⏭️  Achievement already exists: ${achievement.name}`);
      }
    }
    
    console.log('\n✅ Missing data added successfully!');
    console.log('\n🎉 Your database is now complete! Start the app with: npm run dev');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
reseedMissingData();
// Load environment variables for Node.js
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// Create Supabase client directly
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please check your .env.local file contains:');
  console.error('VITE_SUPABASE_URL=your_supabase_url');
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Seed script to populate the database with initial lesson content
 * Run this once to set up all the lesson data
 */

interface SeedData {
  languages: Array<{
    code: string;
    name: string;
    native_name: string;
  }>;
  lessons: Record<string, Array<{
    title: string;
    description: string;
    lesson_order: number;
    lesson_type: string;
    exercises: Array<{
      question: string;
      correct_answer: string;
      options?: string[];
      exercise_type: string;
      explanation?: string;
    }>;
    vocabulary?: Array<{
      word: string;
      translation: string;
      pronunciation: string;
    }>;
  }>>;
}

const seedData: SeedData = {
  languages: [
    { code: 'yo', name: 'Yoruba', native_name: 'Yorùbá' },
    { code: 'ig', name: 'Igbo', native_name: 'Igbo' },
    { code: 'ha', name: 'Hausa', native_name: 'Hausa' }
  ],
  
  lessons: {
    yo: [
      {
        title: 'Basic Greetings',
        description: 'Learn essential Yoruba greetings for different times of day',
        lesson_order: 1,
        lesson_type: 'vocabulary',
        vocabulary: [
          { word: 'Ẹ káàárọ̀', translation: 'Good morning', pronunciation: 'eh-kaa-roh' },
          { word: 'Ẹ káàsán', translation: 'Good afternoon', pronunciation: 'eh-kaa-san' },
          { word: 'Ẹ kúùrọ̀lẹ́', translation: 'Good evening', pronunciation: 'eh-kuu-roh-leh' },
          { word: 'Ó dàárọ̀', translation: 'Good night', pronunciation: 'oh-daa-roh' },
          { word: 'Báwo ni?', translation: 'How are you?', pronunciation: 'baa-woh-nee' },
          { word: 'Mo wà pá', translation: 'I am fine', pronunciation: 'moh-wah-pah' }
        ],
        exercises: [
          {
            question: 'What is the Yoruba greeting for "Good morning"?',
            correct_answer: 'Ẹ káàárọ̀',
            options: ['Ẹ káàárọ̀', 'Ẹ káàsán', 'Ẹ kúùrọ̀lẹ́', 'Báwo ni?'],
            exercise_type: 'multiple_choice'
          },
          {
            question: 'Translate "How are you?" to Yoruba',
            correct_answer: 'Báwo ni?',
            exercise_type: 'translation'
          },
          {
            question: 'When would you use "Ẹ kúùrọ̀lẹ́"?',
            correct_answer: 'In the evening',
            options: ['In the morning', 'At noon', 'In the evening', 'At night'],
            exercise_type: 'multiple_choice',
            explanation: 'Ẹ kúùrọ̀lẹ́ is used to greet people in the evening, typically after 4pm'
          }
        ]
      },
      {
        title: 'Numbers 1-10',
        description: 'Count from one to ten in Yoruba',
        lesson_order: 2,
        lesson_type: 'vocabulary',
        vocabulary: [
          { word: 'Ọ̀kan', translation: 'One', pronunciation: 'oh-kan' },
          { word: 'Èjì', translation: 'Two', pronunciation: 'eh-jee' },
          { word: 'Ẹ̀ta', translation: 'Three', pronunciation: 'eh-tah' },
          { word: 'Ẹ̀rin', translation: 'Four', pronunciation: 'eh-reen' },
          { word: 'Àrún', translation: 'Five', pronunciation: 'ah-roon' },
          { word: 'Ẹ̀fà', translation: 'Six', pronunciation: 'eh-fah' },
          { word: 'Èje', translation: 'Seven', pronunciation: 'eh-jeh' },
          { word: 'Ẹ̀jọ', translation: 'Eight', pronunciation: 'eh-jaw' },
          { word: 'Ẹ̀sán', translation: 'Nine', pronunciation: 'eh-san' },
          { word: 'Ẹ̀wá', translation: 'Ten', pronunciation: 'eh-wah' }
        ],
        exercises: [
          {
            question: 'What is "Five" in Yoruba?',
            correct_answer: 'Àrún',
            options: ['Ọ̀kan', 'Èjì', 'Àrún', 'Ẹ̀wá'],
            exercise_type: 'multiple_choice'
          }
        ]
      },
      {
        title: 'Family Members',
        description: 'Learn words for family relationships in Yoruba',
        lesson_order: 3,
        lesson_type: 'vocabulary',
        vocabulary: [
          { word: 'Bàbá', translation: 'Father', pronunciation: 'bah-bah' },
          { word: 'Ìyá', translation: 'Mother', pronunciation: 'ee-yah' },
          { word: 'Ọmọ', translation: 'Child', pronunciation: 'oh-moh' },
          { word: 'Ọkùnrin', translation: 'Man/Male', pronunciation: 'oh-koon-reen' },
          { word: 'Obìnrin', translation: 'Woman/Female', pronunciation: 'oh-bee-reen' },
          { word: 'Ẹ̀gbọ́n', translation: 'Elder sibling', pronunciation: 'eh-bon' },
          { word: 'Àbúrò', translation: 'Younger sibling', pronunciation: 'ah-boo-roh' }
        ],
        exercises: [
          {
            question: 'How do you say "Mother" in Yoruba?',
            correct_answer: 'Ìyá',
            options: ['Bàbá', 'Ìyá', 'Ọmọ', 'Ẹ̀gbọ́n'],
            exercise_type: 'multiple_choice'
          }
        ]
      }
    ],
    
    ig: [
      {
        title: 'Igbo Greetings',
        description: 'Essential greetings in Igbo language',
        lesson_order: 1,
        lesson_type: 'vocabulary',
        vocabulary: [
          { word: 'Ụtụtụ ọma', translation: 'Good morning', pronunciation: 'oo-too-too oh-mah' },
          { word: 'Ehihie ọma', translation: 'Good afternoon', pronunciation: 'eh-hee-hee-eh oh-mah' },
          { word: 'Mgbede ọma', translation: 'Good evening', pronunciation: 'mm-beh-deh oh-mah' },
          { word: 'Kedụ?', translation: 'How are you?', pronunciation: 'keh-doo' },
          { word: 'Adị m mma', translation: 'I am fine', pronunciation: 'ah-dee mm mah' },
          { word: 'Dalụ', translation: 'Thank you', pronunciation: 'dah-loo' }
        ],
        exercises: [
          {
            question: 'What is "Good morning" in Igbo?',
            correct_answer: 'Ụtụtụ ọma',
            options: ['Ụtụtụ ọma', 'Ehihie ọma', 'Mgbede ọma', 'Kedụ?'],
            exercise_type: 'multiple_choice'
          },
          {
            question: 'How do you respond to "Kedụ?"',
            correct_answer: 'Adị m mma',
            exercise_type: 'translation'
          }
        ]
      },
      {
        title: 'Igbo Numbers 1-10',
        description: 'Learn to count in Igbo',
        lesson_order: 2,
        lesson_type: 'vocabulary',
        vocabulary: [
          { word: 'Otu', translation: 'One', pronunciation: 'oh-too' },
          { word: 'Abụọ', translation: 'Two', pronunciation: 'ah-boo-oh' },
          { word: 'Atọ', translation: 'Three', pronunciation: 'ah-toh' },
          { word: 'Anọ', translation: 'Four', pronunciation: 'ah-noh' },
          { word: 'Ise', translation: 'Five', pronunciation: 'ee-seh' },
          { word: 'Isii', translation: 'Six', pronunciation: 'ee-see' },
          { word: 'Asaa', translation: 'Seven', pronunciation: 'ah-sah' },
          { word: 'Asatọ', translation: 'Eight', pronunciation: 'ah-sah-toh' },
          { word: 'Itoolu', translation: 'Nine', pronunciation: 'ee-too-loo' },
          { word: 'Iri', translation: 'Ten', pronunciation: 'ee-ree' }
        ],
        exercises: [
          {
            question: 'What is "Three" in Igbo?',
            correct_answer: 'Atọ',
            options: ['Otu', 'Abụọ', 'Atọ', 'Anọ'],
            exercise_type: 'multiple_choice'
          }
        ]
      }
    ],
    
    ha: [
      {
        title: 'Hausa Greetings',
        description: 'Common greetings in Hausa',
        lesson_order: 1,
        lesson_type: 'vocabulary',
        vocabulary: [
          { word: 'Ina kwana', translation: 'Good morning', pronunciation: 'ee-nah kwa-nah' },
          { word: 'Ina wuni', translation: 'Good afternoon', pronunciation: 'ee-nah woo-nee' },
          { word: 'Ina yini', translation: 'Good evening', pronunciation: 'ee-nah yee-nee' },
          { word: 'Yaya kake?', translation: 'How are you? (to male)', pronunciation: 'yah-yah kah-keh' },
          { word: 'Yaya kike?', translation: 'How are you? (to female)', pronunciation: 'yah-yah kee-keh' },
          { word: 'Lafiya lau', translation: 'I am fine', pronunciation: 'lah-fee-yah low' },
          { word: 'Nagode', translation: 'Thank you', pronunciation: 'nah-goh-deh' }
        ],
        exercises: [
          {
            question: 'How do you greet someone in the morning in Hausa?',
            correct_answer: 'Ina kwana',
            options: ['Ina kwana', 'Ina wuni', 'Ina yini', 'Nagode'],
            exercise_type: 'multiple_choice'
          },
          {
            question: 'What is the difference between "Yaya kake?" and "Yaya kike?"',
            correct_answer: 'Gender - kake is for males, kike is for females',
            exercise_type: 'explanation',
            explanation: 'In Hausa, greetings change based on the gender of the person you\'re addressing'
          }
        ]
      },
      {
        title: 'Hausa Numbers 1-10',
        description: 'Counting in Hausa',
        lesson_order: 2,
        lesson_type: 'vocabulary',
        vocabulary: [
          { word: 'Ɗaya', translation: 'One', pronunciation: 'dah-yah' },
          { word: 'Biyu', translation: 'Two', pronunciation: 'bee-you' },
          { word: 'Uku', translation: 'Three', pronunciation: 'oo-koo' },
          { word: 'Huɗu', translation: 'Four', pronunciation: 'hoo-doo' },
          { word: 'Biyar', translation: 'Five', pronunciation: 'bee-yar' },
          { word: 'Shida', translation: 'Six', pronunciation: 'she-dah' },
          { word: 'Bakwai', translation: 'Seven', pronunciation: 'bak-why' },
          { word: 'Takwas', translation: 'Eight', pronunciation: 'tak-was' },
          { word: 'Tara', translation: 'Nine', pronunciation: 'tah-rah' },
          { word: 'Goma', translation: 'Ten', pronunciation: 'goh-mah' }
        ],
        exercises: [
          {
            question: 'Count from 1 to 5 in Hausa',
            correct_answer: 'Ɗaya, Biyu, Uku, Huɗu, Biyar',
            exercise_type: 'fill_blank'
          }
        ]
      }
    ]
  }
};

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    console.log('🔗 Connecting to Supabase...');

    // 1. Insert languages
    console.log('\n📚 Inserting languages...');
    const { data: existingLangs, error: langCheckError } = await supabase
      .from('languages')
      .select('code');
    
    if (langCheckError) {
      console.error('❌ Error checking languages:', langCheckError);
      return;
    }
    
    const existingCodes = existingLangs?.map(l => l.code) || [];
    const newLanguages = seedData.languages.filter(l => !existingCodes.includes(l.code));
    
    if (newLanguages.length > 0) {
      const { error: langError } = await supabase
        .from('languages')
        .insert(newLanguages);
      
      if (langError) {
        console.error('❌ Error inserting languages:', langError);
        return;
      }
      console.log(`✅ Inserted ${newLanguages.length} languages`);
    } else {
      console.log('✅ Languages already exist');
    }

    // 2. Get language IDs
    const { data: languages, error: langFetchError } = await supabase
      .from('languages')
      .select('id, code');
    
    if (langFetchError || !languages) {
      console.error('❌ Failed to fetch languages:', langFetchError);
      return;
    }

    const langMap = Object.fromEntries(
      languages.map(l => [l.code, l.id])
    );

    // 3. Insert lessons for each language
    for (const [langCode, lessons] of Object.entries(seedData.lessons)) {
      const languageId = langMap[langCode];
      if (!languageId) {
        console.log(`⚠️  Skipping ${langCode} - language not found`);
        continue;
      }

      console.log(`\n📖 Processing lessons for ${langCode}...`);

      for (const lesson of lessons) {
        // Check if lesson exists
        const { data: existingLesson } = await supabase
          .from('lessons')
          .select('id')
          .eq('language_id', languageId)
          .eq('title', lesson.title)
          .single();

        let lessonId: string;

        if (existingLesson) {
          lessonId = existingLesson.id;
          console.log(`   ✓ Lesson "${lesson.title}" already exists`);
        } else {
          // Insert lesson
          const { data: newLesson, error: lessonError } = await supabase
            .from('lessons')
            .insert({
              language_id: languageId,
              title: lesson.title,
              description: lesson.description,
              lesson_order: lesson.lesson_order,
              lesson_type: lesson.lesson_type,
              xp_reward: 20,
              cowrie_reward: 5,
              difficulty: 1,
              estimated_time: 10
            })
            .select()
            .single();

          if (lessonError || !newLesson) {
            console.error(`❌ Error inserting lesson "${lesson.title}":`, lessonError);
            continue;
          }

          lessonId = newLesson.id;
          console.log(`   ✓ Created lesson "${lesson.title}"`);

          // Insert vocabulary if exists
          if (lesson.vocabulary && lesson.vocabulary.length > 0) {
            const vocabData = lesson.vocabulary.map((v, idx) => ({
              lesson_id: lessonId,
              word: v.word,
              translation: v.translation,
              pronunciation: v.pronunciation,
              display_order: idx + 1
            }));

            const { error: vocabError } = await supabase
              .from('vocabulary')
              .insert(vocabData);

            if (vocabError) {
              console.error('❌ Error inserting vocabulary:', vocabError);
            } else {
              console.log(`   ✓ Added ${lesson.vocabulary.length} vocabulary items`);
            }
          }

          // Insert exercises
          if (lesson.exercises && lesson.exercises.length > 0) {
            const exerciseData = lesson.exercises.map((ex, idx) => ({
              lesson_id: lessonId,
              question: ex.question,
              correct_answer: ex.correct_answer,
              options: ex.options || [],
              exercise_type: ex.exercise_type,
              explanation: ex.explanation,
              exercise_order: idx + 1,
              points: 10
            }));

            const { error: exerciseError } = await supabase
              .from('exercises')
              .insert(exerciseData);

            if (exerciseError) {
              console.error('❌ Error inserting exercises:', exerciseError);
            } else {
              console.log(`   ✓ Added ${lesson.exercises.length} exercises`);
            }
          }
        }
      }
    }

    // 4. Insert achievements
    console.log('\n🏆 Inserting achievements...');
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
        name: 'Polyglot',
        description: 'Start learning all three languages',
        xp_reward: 200,
        cowrie_reward: 50,
        requirement_type: 'languages_started',
        requirement_value: 3
      },
      {
        name: 'Perfect Score',
        description: 'Get 100% on any lesson',
        xp_reward: 75,
        cowrie_reward: 15,
        requirement_type: 'perfect_score',
        requirement_value: 100
      }
    ];

    const { data: existingAchievements } = await supabase
      .from('achievements')
      .select('name');
    
    const existingNames = existingAchievements?.map(a => a.name) || [];
    const newAchievements = achievements.filter(a => !existingNames.includes(a.name));

    if (newAchievements.length > 0) {
      const { error: achieveError } = await supabase
        .from('achievements')
        .insert(newAchievements);

      if (achieveError) {
        console.error('❌ Error inserting achievements:', achieveError);
      } else {
        console.log(`✅ Inserted ${newAchievements.length} achievements`);
      }
    } else {
      console.log('✅ Achievements already exist');
    }

    console.log('\n🎉 Database seeding complete!');
    console.log('You can now run the app with actual content.');

  } catch (error) {
    console.error('❌ Seed script failed:', error);
  }
}

// Run the seed function
console.log('AfriLingo Database Seeder');
console.log('========================\n');
seedDatabase()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
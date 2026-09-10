// All constants use Lucide icon names (rendered via DynIcon component)
// NO EMOJIS anywhere in the app

export const CATEGORIES = [
  { name: 'Health', icon: 'Heart', color: '#ef4444' },
  { name: 'Fitness', icon: 'Dumbbell', color: '#f97316' },
  { name: 'Mindfulness', icon: 'Brain', color: '#8b5cf6' },
  { name: 'Learning', icon: 'BookOpen', color: '#3b82f6' },
  { name: 'Productivity', icon: 'Target', color: '#06b6d4' },
  { name: 'Social', icon: 'Users', color: '#ec4899' },
  { name: 'Creative', icon: 'Palette', color: '#f59e0b' },
  { name: 'Finance', icon: 'Wallet', color: '#84cc16' },
  { name: 'Self-Care', icon: 'Sparkles', color: '#14b8a6' },
  { name: 'Nature', icon: 'TreePine', color: '#22c55e' },
  { name: 'General', icon: 'Zap', color: '#6366f1' },
];

export const COLORS = [
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#e11d48', '#7c3aed', '#0891b2', '#65a30d',
];

// ── Habit Types ──
export const HABIT_TYPES = [
  { value: 'normal', label: 'Normal', desc: 'Check off when done', icon: 'CheckCircle' },
  { value: 'avoid', label: 'Avoid', desc: 'Track relapses to break a bad habit', icon: 'ShieldAlert' },
  { value: 'amount', label: 'Amount', desc: 'Track a quantity with a daily goal', icon: 'Gauge' },
];

// ── Schedule Types ──
export const SCHEDULE_TYPES = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays only' },
  { value: 'weekends', label: 'Weekends only' },
  { value: 'x_per_week', label: 'X times per week' },
  { value: 'x_per_month', label: 'X times per month' },
  { value: 'custom_days', label: 'Specific days' },
  { value: 'every_n_days', label: 'Every N days' },
];

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ── Moods ──
export const MOODS = [
  { value: 1, icon: 'Frown', label: 'Terrible', color: '#ef4444' },
  { value: 2, icon: 'Frown', label: 'Bad', color: '#f97316' },
  { value: 3, icon: 'Minus', label: 'Okay', color: '#f59e0b' },
  { value: 4, icon: 'Smile', label: 'Good', color: '#22c55e' },
  { value: 5, icon: 'Laugh', label: 'Amazing', color: '#3b82f6' },
];

export const ENERGY_LEVELS = [
  { value: 1, icon: 'BatteryLow', label: 'Exhausted', color: '#ef4444' },
  { value: 2, icon: 'Battery', label: 'Low', color: '#f97316' },
  { value: 3, icon: 'BatteryMedium', label: 'Normal', color: '#f59e0b' },
  { value: 4, icon: 'BatteryFull', label: 'High', color: '#22c55e' },
  { value: 5, icon: 'Zap', label: 'Supercharged', color: '#3b82f6' },
];

// ── Templates ──
export const HABIT_TEMPLATES = [
  { name: 'Drink Water', icon: 'Droplets', category: 'Health', description: 'Stay hydrated throughout the day', type: 'amount', unit: 'glasses', target: 8 },
  { name: 'Exercise', icon: 'Activity', category: 'Fitness', description: '30 minutes of physical activity', type: 'normal' },
  { name: 'Read', icon: 'BookOpen', category: 'Learning', description: 'Read for at least 20 minutes', type: 'amount', unit: 'pages', target: 20 },
  { name: 'Meditate', icon: 'Brain', category: 'Mindfulness', description: '10 minutes of mindfulness', type: 'normal' },
  { name: 'Journal', icon: 'PenLine', category: 'Mindfulness', description: 'Write down your thoughts', type: 'normal' },
  { name: 'Sleep 8 Hours', icon: 'Moon', category: 'Health', description: 'Get adequate rest', type: 'amount', unit: 'hours', target: 8 },
  { name: 'No Social Media', icon: 'Smartphone', category: 'Productivity', description: 'Avoid social media for the day', type: 'avoid' },
  { name: 'Walk 10,000 Steps', icon: 'Footprints', category: 'Fitness', description: 'Hit your daily step goal', type: 'amount', unit: 'steps', target: 10000 },
  { name: 'Practice Gratitude', icon: 'HeartHandshake', category: 'Mindfulness', description: 'List 3 things you are grateful for', type: 'normal' },
  { name: 'Eat Healthy', icon: 'Apple', category: 'Health', description: 'Eat nutritious meals', type: 'normal' },
  { name: 'Learn Something New', icon: 'Lightbulb', category: 'Learning', description: 'Spend time on a new skill', type: 'normal' },
  { name: 'No Sugar', icon: 'Ban', category: 'Health', description: 'Avoid added sugars', type: 'avoid' },
  { name: 'Code', icon: 'Code', category: 'Learning', description: 'Practice programming', type: 'amount', unit: 'minutes', target: 60 },
  { name: 'Draw / Create Art', icon: 'Paintbrush', category: 'Creative', description: 'Express yourself creatively', type: 'normal' },
  { name: 'Play Music', icon: 'Music', category: 'Creative', description: 'Practice an instrument', type: 'amount', unit: 'minutes', target: 30 },
  { name: 'Call Family', icon: 'Phone', category: 'Social', description: 'Connect with loved ones', type: 'normal' },
  { name: 'Budget Review', icon: 'Wallet', category: 'Finance', description: 'Review daily spending', type: 'normal' },
  { name: 'Clean / Tidy Up', icon: 'Sparkles', category: 'Productivity', description: 'Keep your space organized', type: 'normal' },
  { name: 'No Smoking', icon: 'Flame', category: 'Health', description: 'Stay smoke-free', type: 'avoid' },
  { name: 'Yoga', icon: 'StretchHorizontal', category: 'Fitness', description: 'Yoga practice session', type: 'normal' },
  { name: 'Deep Work', icon: 'Focus', category: 'Productivity', description: '2 hours of focused work', type: 'amount', unit: 'minutes', target: 120 },
  { name: 'Nature Walk', icon: 'TreePine', category: 'Nature', description: 'Spend time outdoors', type: 'normal' },
  { name: 'Cook at Home', icon: 'ChefHat', category: 'Health', description: 'Prepare a healthy meal', type: 'normal' },
  { name: 'Language Practice', icon: 'Languages', category: 'Learning', description: 'Practice a foreign language', type: 'amount', unit: 'minutes', target: 15 },
  { name: 'No Junk Food', icon: 'Ban', category: 'Health', description: 'Avoid fast food and snacks', type: 'avoid' },
  { name: 'Breathing Exercises', icon: 'Wind', category: 'Mindfulness', description: '4-7-8 breathing technique', type: 'normal' },
  { name: 'Plan Tomorrow', icon: 'CalendarClock', category: 'Productivity', description: 'Prepare for the next day', type: 'normal' },
  { name: 'Photography', icon: 'Camera', category: 'Creative', description: 'Capture moments', type: 'normal' },
  { name: 'Gardening', icon: 'Flower2', category: 'Nature', description: 'Tend to plants', type: 'normal' },
  { name: 'Strength Training', icon: 'Dumbbell', category: 'Fitness', description: 'Weight training session', type: 'amount', unit: 'exercises', target: 5 },
  { name: 'Swim', icon: 'Waves', category: 'Fitness', description: 'Swimming session', type: 'amount', unit: 'laps', target: 20 },
  { name: 'Push-ups', icon: 'Dumbbell', category: 'Fitness', description: 'Daily push-ups', type: 'amount', unit: 'reps', target: 50 },
  { name: 'Affirmations', icon: 'MessageCircleHeart', category: 'Self-Care', description: 'Positive self-talk', type: 'normal' },
  { name: 'Podcast / Audiobook', icon: 'Headphones', category: 'Learning', description: 'Listen and learn', type: 'amount', unit: 'minutes', target: 30 },
  { name: 'No Alcohol', icon: 'Wine', category: 'Health', description: 'Stay alcohol-free', type: 'avoid' },
  { name: 'Skin Care', icon: 'Sparkles', category: 'Self-Care', description: 'Morning or evening routine', type: 'checklist', steps: ['Cleanse', 'Tone', 'Moisturize', 'SPF'] },
  { name: 'Morning Routine', icon: 'Sun', category: 'Productivity', description: 'Start your day right', type: 'checklist', steps: ['Wake up early', 'Hydrate', 'Stretch', 'Healthy breakfast', 'Review goals'] },
  { name: 'Evening Routine', icon: 'Moon', category: 'Self-Care', description: 'Wind down properly', type: 'checklist', steps: ['No screens 1hr before bed', 'Journal', 'Prepare tomorrow', 'Read', 'Lights out by 10pm'] },
  { name: 'Save Money', icon: 'PiggyBank', category: 'Finance', description: 'Put aside daily savings', type: 'amount', unit: 'dollars', target: 10 },
  { name: 'Stretching', icon: 'Move', category: 'Fitness', description: 'Morning or evening stretching', type: 'amount', unit: 'minutes', target: 10 },
];

// ── Achievements ──
export const ACHIEVEMENTS = [
  { id: 'first_habit', name: 'First Step', icon: 'Sprout', desc: 'Create your first habit' },
  { id: 'five_habits', name: 'Habit Builder', icon: 'Layers', desc: 'Create 5 habits' },
  { id: 'ten_habits', name: 'Habit Master', icon: 'Crown', desc: 'Create 10 habits' },
  { id: 'first_checkin', name: 'Checked In', icon: 'CheckCircle', desc: 'Complete your first habit' },
  { id: 'streak_3', name: 'Getting Started', icon: 'Flame', desc: 'Get a 3-day streak' },
  { id: 'streak_7', name: 'One Week', icon: 'Calendar', desc: 'Get a 7-day streak' },
  { id: 'streak_30', name: 'Monthly Warrior', icon: 'Sword', desc: 'Get a 30-day streak' },
  { id: 'streak_100', name: 'Centurion', icon: 'Shield', desc: 'Get a 100-day streak' },
  { id: 'streak_365', name: 'Legendary', icon: 'Trophy', desc: 'Get a 365-day streak' },
  { id: 'journal_1', name: 'Dear Diary', icon: 'PenLine', desc: 'Write your first journal entry' },
  { id: 'journal_30', name: 'Reflection Master', icon: 'BookMarked', desc: 'Write 30 journal entries' },
  { id: 'completions_50', name: 'Consistent', icon: 'Dumbbell', desc: '50 total completions' },
  { id: 'completions_200', name: 'Dedicated', icon: 'Target', desc: '200 total completions' },
  { id: 'completions_1000', name: 'Unstoppable', icon: 'Rocket', desc: '1000 total completions' },
  { id: 'all_categories', name: 'Well Rounded', icon: 'Rainbow', desc: 'Have habits in 5+ categories' },
  { id: 'early_bird', name: 'Early Bird', icon: 'Bird', desc: 'Complete a habit before 7am' },
  { id: 'night_owl', name: 'Night Owl', icon: 'Moon', desc: 'Complete a habit after 10pm' },
  { id: 'perfect_week', name: 'Perfect Week', icon: 'Star', desc: 'Complete all habits for 7 days straight' },
  { id: 'focus_session', name: 'Focused', icon: 'Timer', desc: 'Complete a focus session' },
  { id: 'focus_10', name: 'Deep Worker', icon: 'Focus', desc: 'Complete 10 focus sessions' },
  { id: 'vacation_mode', name: 'Taking a Break', icon: 'Palmtree', desc: 'Use vacation mode' },
  { id: 'day_note', name: 'Storyteller', icon: 'StickyNote', desc: 'Write a day note' },
  { id: 'avoid_success', name: 'Breaking Free', icon: 'ShieldAlert', desc: 'Go 7 days without a relapse' },
  { id: 'amount_goal', name: 'Goal Crusher', icon: 'Gauge', desc: 'Hit an amount goal' },
  { id: 'checklist_done', name: 'Step by Step', icon: 'ListChecks', desc: 'Complete all checklist items' },
  { id: 'dark_mode', name: 'Dark Side', icon: 'MoonStar', desc: 'Switch to dark mode' },
  { id: 'export_data', name: 'Backup Pro', icon: 'HardDriveDownload', desc: 'Export your data' },
  { id: 'all_done', name: 'Perfect Day', icon: 'PartyPopper', desc: 'Complete all habits in a day' },
];

export const DAILY_QUOTES = [
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit. - Aristotle",
  "The secret of your future is hidden in your daily routine.",
  "Small daily improvements over time lead to stunning results.",
  "Motivation is what gets you started. Habit is what keeps you going.",
  "You'll never change your life until you change something you do daily.",
  "Success is the sum of small efforts repeated day in and day out.",
  "First we make our habits, then our habits make us.",
  "A journey of a thousand miles begins with a single step.",
  "The only way to do great work is to love what you do.",
  "Discipline is the bridge between goals and accomplishment.",
  "Don't watch the clock; do what it does. Keep going.",
  "Every day is a new beginning. Take a deep breath and start again.",
  "Your habits shape your identity, and your identity shapes your habits.",
  "Consistency is the true foundation of trust.",
  "It's not what we do once in a while that shapes our lives, but what we do consistently.",
  "The difference between ordinary and extraordinary is that little extra.",
  "Believe you can and you're halfway there.",
  "You don't have to be extreme, just consistent.",
  "Progress, not perfection.",
  "Every expert was once a beginner.",
  "What you do every day matters more than what you do once in a while.",
  "Habits are the compound interest of self-improvement.",
  "Be the change you wish to see in the world.",
  "Start where you are. Use what you have. Do what you can.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Champions keep playing until they get it right.",
  "Quality is not an act, it is a habit.",
  "Small steps every day lead to big changes.",
  "Don't count the days, make the days count.",
  "Today is a good day to have a good day.",
];

// ── Focus Timer Presets ──
export const FOCUS_PRESETS = [
  { name: 'Pomodoro', work: 25, shortBreak: 5, longBreak: 15, rounds: 4, icon: 'Timer' },
  { name: 'Deep Work', work: 50, shortBreak: 10, longBreak: 30, rounds: 3, icon: 'Focus' },
  { name: 'Quick Sprint', work: 15, shortBreak: 3, longBreak: 10, rounds: 4, icon: 'Zap' },
  { name: 'Study Block', work: 45, shortBreak: 10, longBreak: 20, rounds: 3, icon: 'BookOpen' },
  { name: 'Custom', work: 25, shortBreak: 5, longBreak: 15, rounds: 4, icon: 'Settings' },
];

export const FOCUS_SOUNDS = [
  { name: 'Silence', icon: 'VolumeX' },
  { name: 'Rain', icon: 'CloudRain' },
  { name: 'Brown Noise', icon: 'Waves' },
  { name: 'Warm Pad', icon: 'Music' },
  { name: 'Forest', icon: 'TreePine' },
  { name: 'Ocean', icon: 'Waves' },
];

// ── Lucide icon names for habits ──
export const HABIT_ICON_NAMES = [
  'Dumbbell', 'Activity', 'Brain', 'BookOpen', 'Droplets', 'Apple', 'Moon', 'Target',
  'PenLine', 'Palette', 'Music', 'Code', 'Sprout', 'Sun', 'MoonStar', 'Heart',
  'Lightbulb', 'GraduationCap', 'Briefcase', 'Home', 'Footprints', 'Bike', 'Waves', 'Zap',
  'Flame', 'Star', 'Sparkles', 'Award', 'PartyPopper', 'Trophy', 'Camera', 'Coffee',
  'Phone', 'Wallet', 'Wind', 'TreePine', 'Flower2', 'ChefHat', 'Headphones', 'Pill',
  'Shield', 'Gauge', 'Focus', 'Timer', 'Globe', 'Languages', 'Move', 'StretchHorizontal',
  'PiggyBank', 'HandHeart', 'MessageCircleHeart', 'Ban', 'Wine', 'Smartphone',
];

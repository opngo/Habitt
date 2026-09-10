// All constants use Lucide icon names (rendered as <IconName /> components)
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

// Templates use Lucide icon names
export const HABIT_TEMPLATES = [
  { name: 'Drink Water', icon: 'Droplets', category: 'Health', description: 'Stay hydrated throughout the day', target: 8 },
  { name: 'Exercise', icon: 'Activity', category: 'Fitness', description: '30 minutes of physical activity' },
  { name: 'Read', icon: 'BookOpen', category: 'Learning', description: 'Read for at least 20 minutes' },
  { name: 'Meditate', icon: 'Brain', category: 'Mindfulness', description: '10 minutes of mindfulness' },
  { name: 'Journal', icon: 'PenLine', category: 'Mindfulness', description: 'Write down your thoughts' },
  { name: 'Sleep 8 Hours', icon: 'Moon', category: 'Health', description: 'Get adequate rest' },
  { name: 'No Social Media', icon: 'Smartphone', category: 'Productivity', description: 'Avoid social media for the day' },
  { name: 'Walk 10,000 Steps', icon: 'Footprints', category: 'Fitness', description: 'Hit your daily step goal' },
  { name: 'Practice Gratitude', icon: 'HeartHandshake', category: 'Mindfulness', description: 'List 3 things you are grateful for' },
  { name: 'Eat Healthy', icon: 'Apple', category: 'Health', description: 'Eat nutritious meals' },
  { name: 'Learn Something New', icon: 'Lightbulb', category: 'Learning', description: 'Spend time on a new skill' },
  { name: 'Stretch', icon: 'Move', category: 'Fitness', description: 'Morning or evening stretching' },
  { name: 'No Sugar', icon: 'Ban', category: 'Health', description: 'Avoid added sugars' },
  { name: 'Code', icon: 'Code', category: 'Learning', description: 'Practice programming' },
  { name: 'Draw / Create Art', icon: 'Paintbrush', category: 'Creative', description: 'Express yourself creatively' },
  { name: 'Play Music', icon: 'Music', category: 'Creative', description: 'Practice an instrument' },
  { name: 'Call Family', icon: 'Phone', category: 'Social', description: 'Connect with loved ones' },
  { name: 'Budget Review', icon: 'Wallet', category: 'Finance', description: 'Review daily spending' },
  { name: 'Clean / Tidy Up', icon: 'Sparkles', category: 'Productivity', description: 'Keep your space organized' },
  { name: 'No Caffeine After 2pm', icon: 'Coffee', category: 'Health', description: 'Improve sleep quality' },
  { name: 'Take Vitamins', icon: 'Pill', category: 'Health', description: 'Daily supplement routine' },
  { name: 'Yoga', icon: 'StretchHorizontal', category: 'Fitness', description: 'Yoga practice session' },
  { name: 'Deep Work', icon: 'Focus', category: 'Productivity', description: '2 hours of focused work' },
  { name: 'Nature Walk', icon: 'TreePine', category: 'Nature', description: 'Spend time outdoors' },
  { name: 'Cook at Home', icon: 'ChefHat', category: 'Health', description: 'Prepare a healthy meal' },
  { name: 'Language Practice', icon: 'Languages', category: 'Learning', description: 'Practice a foreign language' },
  { name: 'Skin Care', icon: 'Sparkles', category: 'Self-Care', description: 'Morning or evening routine' },
  { name: 'Digital Detox', icon: 'WifiOff', category: 'Mindfulness', description: 'Unplug from screens' },
  { name: 'Save Money', icon: 'PiggyBank', category: 'Finance', description: 'Put aside savings' },
  { name: 'Volunteer', icon: 'HandHeart', category: 'Social', description: 'Do something kind' },
  { name: 'Podcast / Audiobook', icon: 'Headphones', category: 'Learning', description: 'Listen and learn' },
  { name: 'Cold Shower', icon: 'ShowerHead', category: 'Health', description: 'Build resilience' },
  { name: 'Breathing Exercises', icon: 'Wind', category: 'Mindfulness', description: '4-7-8 breathing technique' },
  { name: 'Plan Tomorrow', icon: 'CalendarClock', category: 'Productivity', description: 'Prepare for the next day' },
  { name: 'Photography', icon: 'Camera', category: 'Creative', description: 'Capture moments' },
  { name: 'Gardening', icon: 'Flower2', category: 'Nature', description: 'Tend to plants' },
  { name: 'Strength Training', icon: 'Dumbbell', category: 'Fitness', description: 'Weight training session' },
  { name: 'Swim', icon: 'Waves', category: 'Fitness', description: 'Swimming session' },
  { name: 'Limit Screen Time', icon: 'MonitorSmartphone', category: 'Productivity', description: 'Reduce digital consumption' },
  { name: 'Affirmations', icon: 'MessageCircleHeart', category: 'Self-Care', description: 'Positive self-talk' },
];

// Achievements use Lucide icon names
export const ACHIEVEMENTS = [
  { id: 'first_habit', name: 'First Step', icon: 'Sprout', desc: 'Create your first habit', condition: (s) => s.habits.length >= 1 },
  { id: 'five_habits', name: 'Habit Builder', icon: 'Layers', desc: 'Create 5 habits', condition: (s) => s.habits.length >= 5 },
  { id: 'ten_habits', name: 'Habit Master', icon: 'Crown', desc: 'Create 10 habits', condition: (s) => s.habits.length >= 10 },
  { id: 'first_checkin', name: 'Checked In', icon: 'CheckCircle', desc: 'Complete your first habit', condition: (s) => s.completions.length >= 1 },
  { id: 'streak_3', name: 'Getting Started', icon: 'Flame', desc: 'Get a 3-day streak', condition: (s) => s.streaks?.some(v => v >= 3) },
  { id: 'streak_7', name: 'One Week', icon: 'Calendar', desc: 'Get a 7-day streak', condition: (s) => s.streaks?.some(v => v >= 7) },
  { id: 'streak_30', name: 'Monthly Warrior', icon: 'Sword', desc: 'Get a 30-day streak', condition: (s) => s.streaks?.some(v => v >= 30) },
  { id: 'streak_100', name: 'Centurion', icon: 'Shield', desc: 'Get a 100-day streak', condition: (s) => s.streaks?.some(v => v >= 100) },
  { id: 'streak_365', name: 'Legendary', icon: 'Trophy', desc: 'Get a 365-day streak', condition: (s) => s.streaks?.some(v => v >= 365) },
  { id: 'journal_1', name: 'Dear Diary', icon: 'PenLine', desc: 'Write your first journal entry', condition: (s) => s.journalEntries.length >= 1 },
  { id: 'journal_30', name: 'Reflection Master', icon: 'BookMarked', desc: 'Write 30 journal entries', condition: (s) => s.journalEntries.length >= 30 },
  { id: 'completions_50', name: 'Consistent', icon: 'Dumbbell', desc: '50 total completions', condition: (s) => s.completions.length >= 50 },
  { id: 'completions_200', name: 'Dedicated', icon: 'Target', desc: '200 total completions', condition: (s) => s.completions.length >= 200 },
  { id: 'completions_1000', name: 'Unstoppable', icon: 'Rocket', desc: '1000 total completions', condition: (s) => s.completions.length >= 1000 },
  { id: 'all_categories', name: 'Well Rounded', icon: 'Rainbow', desc: 'Have habits in 5+ categories', condition: (s) => new Set(s.habits.map(h => h.category)).size >= 5 },
  { id: 'early_bird', name: 'Early Bird', icon: 'Bird', desc: 'Complete a habit before 7am' },
  { id: 'night_owl', name: 'Night Owl', icon: 'Moon', desc: 'Complete a habit after 10pm' },
  { id: 'perfect_week', name: 'Perfect Week', icon: 'Star', desc: 'Complete all habits for 7 days straight' },
  { id: 'dark_mode', name: 'Dark Side', icon: 'MoonStar', desc: 'Switch to dark mode' },
  { id: 'export_data', name: 'Backup Pro', icon: 'HardDriveDownload', desc: 'Export your data' },
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

// Moods use Lucide icon names
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

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays only' },
  { value: 'weekends', label: 'Weekends only' },
  { value: 'weekly', label: 'Once a week' },
  { value: 'custom', label: 'Custom days' },
];

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Lucide icon names for habits (used in icon picker)
export const HABIT_ICON_NAMES = [
  'Dumbbell', 'Activity', 'Brain', 'BookOpen', 'Droplets', 'Apple', 'Moon', 'Target',
  'PenLine', 'Palette', 'Music', 'Code', 'Sprout', 'Sun', 'MoonStar', 'Heart',
  'Lightbulb', 'GraduationCap', 'Briefcase', 'Home', 'Footprints', 'Bike', 'Waves', 'Zap',
  'Flame', 'Star', 'Sparkles', 'Award', 'PartyPopper', 'Trophy', 'Camera', 'Coffee', 'Smartphone',
  'Phone', 'Wallet', 'Wind', 'TreePine', 'Flower2', 'ChefHat', 'Headphones', 'Pill',
];

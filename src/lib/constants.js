// ── All icons are Lucide icon names, resolved dynamically by <DynIcon /> ──

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
  '#14b8a6', '#e11d48', '#7c3aed', '#0891b2', '#65a30d', '#334155',
];

// ── Habit Types ──
export const HABIT_TYPES = [
  { value: 'normal', label: 'Normal', desc: 'Check off when done', icon: 'CheckCircle2' },
  { value: 'amount', label: 'Amount', desc: 'Track a quantity against a daily goal', icon: 'Gauge' },
  { value: 'avoid', label: 'Avoid', desc: 'Break a bad habit — log slips, keep clean days', icon: 'ShieldAlert' },
];

// ── Schedules ──
export const SCHEDULE_TYPES = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays only' },
  { value: 'weekends', label: 'Weekends only' },
  { value: 'x_per_week', label: 'X times per week' },
  { value: 'x_per_month', label: 'X times per month' },
  { value: 'custom_days', label: 'Specific days' },
  { value: 'every_n_days', label: 'Every N days' },
];

export const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', icon: 'Leaf' },
  { value: 'medium', label: 'Medium', icon: 'Flame' },
  { value: 'hard', label: 'Hard', icon: 'Trophy' },
];

export const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ── Journal scales ──
export const MOODS = [
  { value: 1, label: 'Terrible', icon: 'Frown' },
  { value: 2, label: 'Bad', icon: 'Angry' },
  { value: 3, label: 'Okay', icon: 'Meh' },
  { value: 4, label: 'Good', icon: 'Smile' },
  { value: 5, label: 'Amazing', icon: 'Sun' },
];

export const ENERGIES = [
  { value: 1, label: 'Exhausted', icon: 'BatteryWarning' },
  { value: 2, label: 'Low', icon: 'BatteryLow' },
  { value: 3, label: 'Normal', icon: 'BatteryMedium' },
  { value: 4, label: 'High', icon: 'BatteryCharging' },
  { value: 5, label: 'Supercharged', icon: 'BatteryFull' },
];

// ── Habit Templates (one-click starts) ──
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
  { name: 'Yoga', icon: 'PersonStanding', category: 'Fitness', description: 'Yoga practice session', type: 'normal' },
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
  { name: 'Morning Routine', icon: 'Sunrise', category: 'Productivity', description: 'Start your day right', type: 'checklist', steps: ['Wake up early', 'Hydrate', 'Stretch', 'Healthy breakfast', 'Review goals'] },
  { name: 'Evening Routine', icon: 'Moon', category: 'Self-Care', description: 'Wind down properly', type: 'checklist', steps: ['No screens 1hr before bed', 'Journal', 'Prepare tomorrow', 'Read', 'Lights out by 10pm'] },
  { name: 'Save Money', icon: 'PiggyBank', category: 'Finance', description: 'Put aside daily savings', type: 'amount', unit: 'dollars', target: 10 },
  { name: 'Stretching', icon: 'Move', category: 'Fitness', description: 'Morning or evening stretching', type: 'amount', unit: 'minutes', target: 10 },
];

// ── Daily quotes ──
export const DAILY_QUOTES = [
  'We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle',
  'The secret of your future is hidden in your daily routine.',
  'Small daily improvements over time lead to stunning results.',
  'Motivation is what gets you started. Habit is what keeps you going.',
  "You'll never change your life until you change something you do daily.",
  'Success is the sum of small efforts repeated day in and day out.',
  'First we make our habits, then our habits make us.',
  'A journey of a thousand miles begins with a single step.',
  'The only way to do great work is to love what you do.',
  'Discipline is the bridge between goals and accomplishment.',
  "Don't watch the clock; do what it does. Keep going.",
  'Every day is a new beginning. Take a deep breath and start again.',
  'Your habits shape your identity, and your identity shapes your habits.',
  'Consistency is the true foundation of trust.',
  "It's not what we do once in a while that shapes our lives, but what we do consistently.",
  'The difference between ordinary and extraordinary is that little extra.',
  'Believe you can and you are halfway there.',
  'You do not have to be extreme, just consistent.',
  'Progress, not perfection.',
  'Every expert was once a beginner.',
  'What you do every day matters more than what you do once in a while.',
  'Habits are the compound interest of self-improvement.',
  'Be the change you wish to see in the world.',
  'Start where you are. Use what you have. Do what you can.',
  'The best time to plant a tree was 20 years ago. The second best time is now.',
  'Champions keep playing until they get it right.',
  'Quality is not an act, it is a habit.',
  'Small steps every day lead to big changes.',
  "Don't count the days, make the days count.",
  'Today is a good day to have a good day.',
];

// ── Focus timer presets ──
export const FOCUS_PRESETS = [
  { name: 'Pomodoro', work: 25, shortBreak: 5, longBreak: 15, rounds: 4, icon: 'Timer' },
  { name: 'Deep Work', work: 50, shortBreak: 10, longBreak: 30, rounds: 3, icon: 'Focus' },
  { name: 'Quick Sprint', work: 15, shortBreak: 3, longBreak: 10, rounds: 4, icon: 'Zap' },
  { name: 'Study Block', work: 45, shortBreak: 10, longBreak: 20, rounds: 3, icon: 'BookOpen' },
  { name: 'Custom', work: 25, shortBreak: 5, longBreak: 15, rounds: 4, icon: 'Settings' },
];

export const FOCUS_SOUNDS = [
  { name: 'Silence', icon: 'VolumeX', type: null },
  { name: 'Rain', icon: 'CloudRain', type: 'rain' },
  { name: 'Brown Noise', icon: 'Waves', type: 'brown' },
  { name: 'White Noise', icon: 'Cloud', type: 'white' },
  { name: 'Warm Pad', icon: 'Music', type: 'pad' },
  { name: 'Ocean', icon: 'Waves', type: 'ocean' },
];

// ── Icon pool for the icon picker ──
export const HABIT_ICON_NAMES = [
  'Dumbbell', 'Activity', 'Brain', 'BookOpen', 'Droplets', 'Apple', 'Moon', 'Target',
  'PenLine', 'Palette', 'Music', 'Code', 'Sprout', 'Sun', 'MoonStar', 'Heart',
  'Lightbulb', 'GraduationCap', 'Briefcase', 'Home', 'Footprints', 'Bike', 'Waves', 'Zap',
  'Flame', 'Star', 'Sparkles', 'Award', 'PartyPopper', 'Trophy', 'Camera', 'Coffee',
  'Phone', 'Wallet', 'Wind', 'TreePine', 'Flower2', 'ChefHat', 'Headphones', 'Pill',
  'Shield', 'Gauge', 'Focus', 'Timer', 'Globe', 'Languages', 'Move', 'StretchHorizontal',
  'PiggyBank', 'HandHeart', 'MessageCircleHeart', 'Ban', 'Wine', 'Smartphone',
  'BookMarked', 'BrainCircuit', 'CandlestickChart', 'Carrot', 'Cat', 'Dog',
  'Ear', 'Eye', 'Feather', 'Fish', 'Gamepad2', 'GitCommitHorizontal',
  'HeartPulse', 'Image', 'Keyboard', 'Leaf', 'Luggage', 'Mountain',
  'Paintbrush', 'Plane', 'Rocket', 'Shirt', 'Sofa', 'Sunrise', 'Sunset',
  'Tent', 'TentTree', 'Truck', 'UtensilsCrossed', 'Volleyball', 'Weight', 'Yoga',
];


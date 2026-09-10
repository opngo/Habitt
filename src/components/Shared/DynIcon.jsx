import React from 'react';
import {
  // Core
  Zap, Flame, Target, Trophy, Star, Award, Crown, Shield, Medal, Rocket,
  Check, CheckCircle, X, Minus, Plus, Circle, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ChevronRight as ArrowRight,
  // Navigation & UI
  LayoutDashboard, BookOpen, BarChart3, Settings, HelpCircle, Search, Filter,
  Calendar, CalendarClock, Clock, Timer,
  ArrowLeft, ArrowRight as ArrowForward, Move, Activity,
  // Habits
  Dumbbell, Activity as Run, Brain, Heart, HeartHandshake, Apple,
  Droplets, Moon, MoonStar, Sun, Wind, Footprints, Bike, Waves,
  StretchHorizontal, ShowerHead,
  // Learning & Creative
  BookMarked, BookOpen as Read, Code, Lightbulb, GraduationCap, Languages,
  Palette, Paintbrush, Music, Camera, Headphones, PenLine,
  // Social & Finance
  Users, Phone, Wallet, PiggyBank, HandHeart, MessageCircleHeart,
  // Productivity
  Briefcase, Home, Focus, MonitorSmartphone, Smartphone, WifiOff,
  // Self-care & Nature
  Sparkles, TreePine, Flower2, ChefHat, Coffee, Pill,
  // System
  Lock, Unlock, Eye, EyeOff, Download, Upload, HardDriveDownload,
  Sun as LightMode, Moon as DarkMode,
  Trash2, Archive, Edit2, Save, Copy, Share2,
  Bell, BellOff, Volume2, VolumeX,
  Maximize2, Minimize2, Square,
  Menu, MoreHorizontal, MoreVertical,
  AlertCircle, AlertTriangle, Info, CheckSquare,
  // Mood & Energy
  Frown, Smile, Laugh,
  BatteryLow, Battery, BatteryMedium, BatteryFull,
  BedDouble,
  // Misc
  Sprout, Layers, Sword, Rainbow, Bird, PartyPopper,
  Quote,
  // Additional
  TrendingUp, TrendingDown, PieChart, LineChart,
  Gift, MapPin, Link, ExternalLink,
  RefreshCw, RotateCcw, Undo2, Redo2,
  GripVertical, ArrowUpDown,
  User, LogOut,
  FileText, FileJson, FolderOpen,
  Play, Pause, StopCircle,
} from 'lucide-react';

// Icon registry - maps string names to components
const iconMap = {
  Zap, Flame, Target, Trophy, Star, Award, Crown, Shield, Medal, Rocket,
  Check, CheckCircle, X, Minus, Plus, Circle,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  LayoutDashboard, BookOpen, BarChart3, Settings, HelpCircle, Search, Filter,
  Calendar, CalendarClock, Clock, Timer,
  ArrowLeft, Move, Activity,
  Dumbbell, Brain, Heart, HeartHandshake, Apple,
  Droplets, Moon, MoonStar, Sun, Wind, Footprints, Bike, Waves,
  StretchHorizontal, ShowerHead,
  BookMarked, Code, Lightbulb, GraduationCap, Languages,
  Palette, Paintbrush, Music, Camera, Headphones, PenLine,
  Users, Phone, Wallet, PiggyBank, HandHeart, MessageCircleHeart,
  Briefcase, Home, Focus, MonitorSmartphone, SmartphoneOff, WifiOff,
  Sparkles, TreePine, Flower2, ChefHat, Coffee, Pill,
  Lock, Unlock, Eye, EyeOff, Download, Upload, HardDriveDownload,
  Trash2, Archive, Edit2, Save, Copy, Share2,
  Bell, BellOff, Volume2, VolumeX,
  Maximize2, Minimize2, Square,
  Menu, MoreHorizontal, MoreVertical,
  AlertCircle, AlertTriangle, Info, CheckSquare,
  Frown, Smile, Laugh,
  BatteryLow, Battery, BatteryMedium, BatteryFull,
  BedDouble,
  Sprout, Layers, Sword, Rainbow, Bird, PartyPopper,
  Quote,
  TrendingUp, TrendingDown, PieChart, LineChart,
  Gift, MapPin, Link, ExternalLink,
  RefreshCw, RotateCcw, Undo2, Redo2,
  GripVertical, ArrowUpDown,
  User, LogOut,
  FileText, FileJson, FolderOpen,
  Play, Pause, StopCircle,
  // Aliases
  SmartphoneOff: Smartphone,
  Run: Activity,
  Read: BookOpen,
  LightMode: Sun,
  DarkMode: Moon,
  ArrowForward: ChevronRight,
};

/**
 * Renders a Lucide icon by its string name.
 * Usage: <DynIcon name="Flame" size={16} color="#f97316" />
 */
export default function DynIcon({ name, size = 16, color, strokeWidth = 2, style, className, ...rest }) {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    return <Zap size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} {...rest} />;
  }
  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} {...rest} />;
}

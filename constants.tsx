
import { ActivityType, ActivityCategory } from './types';

export interface ActivityDefinition {
  name: ActivityType;
  icon: string;
  category: ActivityCategory;
}

export const ACTIVITY_LIST: ActivityDefinition[] = [
  // Competitive
  { name: 'Football', icon: '⚽', category: 'Competitive' },
  { name: 'Basketball', icon: '🏀', category: 'Competitive' },
  { name: 'Cricket', icon: '🏏', category: 'Competitive' },
  { name: 'Badminton', icon: '🏸', category: 'Competitive' },
  { name: 'Volleyball', icon: '🏐', category: 'Competitive' },
  { name: 'Tennis', icon: '🎾', category: 'Competitive' },
  // Recreational
  { name: 'Jogging', icon: '🏃', category: 'Recreational' },
  { name: 'Walking', icon: '🚶', category: 'Recreational' },
  { name: 'Cycling', icon: '🚴', category: 'Recreational' },
  { name: 'Gym', icon: '💪', category: 'Recreational' },
  { name: 'Yoga', icon: '🧘', category: 'Recreational' },
  { name: 'Trekking', icon: '⛰️', category: 'Recreational' },
  // Social
  { name: 'Group Study', icon: '📚', category: 'Social' },
  { name: 'Reading', icon: '📖', category: 'Social' },
  { name: 'Coding', icon: '💻', category: 'Social' },
  { name: 'Language', icon: '🗣️', category: 'Social' },
  { name: 'Discussion', icon: '💬', category: 'Social' },
];

export const MOCK_USERS: any[] = [
  {
    id: 'dishant_g',
    name: 'Dishant Gangurde',
    username: 'dishant_g',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dishant',
    bio: 'Tech enthusiast and football defender. Always ready for a match or a coding session.',
    interests: ['Football', 'Coding', 'Jogging'],
    skillLevel: 'Advanced',
    availability: 'Available',
    location: { lat: 19.076, lng: 72.877 }
  },
  {
    id: 'sahil_g',
    name: 'Sahil Ghorpade',
    username: 'sahil_g',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sahil',
    interests: ['Basketball', 'Gym', 'Cycling'],
    availability: 'Available Today',
    distance: '1.2 km away'
  },
  {
    id: 'vighnesh_j',
    name: 'Vighnesh Jadhav',
    username: 'vighnesh_j',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vighnesh',
    interests: ['Cricket', 'Group Study', 'Coding'],
    availability: 'Busy',
    distance: '2.5 km away'
  },
  {
    id: 'rani_r',
    name: 'Rani Raut',
    username: 'rani_r',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rani',
    interests: ['Badminton', 'Yoga', 'Reading'],
    availability: 'Available Today',
    distance: '0.8 km away'
  },
  {
    id: 'divya_s',
    name: 'Divya Sharma',
    username: 'divya_s',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Divya',
    interests: ['Tennis', 'Cycling', 'Discussion'],
    availability: 'Available Today',
    distance: '1.5 km away'
  },
  {
    id: 'rahul_k',
    name: 'Rahul Kulkarni',
    username: 'rahul_k',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
    interests: ['Football', 'Gym', 'Coding'],
    availability: 'Available Today',
    distance: '3.1 km away'
  }
];

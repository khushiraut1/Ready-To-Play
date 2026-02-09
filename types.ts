
export type ActivityCategory = 'Competitive' | 'Recreational' | 'Social';

export type ActivityType = 
  | 'Football' | 'Basketball' | 'Tennis' | 'Badminton' | 'Cricket' | 'Volleyball'
  | 'Jogging' | 'Walking' | 'Cycling' | 'Gym' | 'Yoga' | 'Trekking'
  | 'Group Study' | 'Reading' | 'Coding' | 'Language' | 'Discussion';

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar: string;
  bio: string;
  interests: ActivityType[]; // Expanded from preferredSports
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  availability?: 'Available' | 'Busy';
  location?: {
    lat: number;
    lng: number;
  };
}

export interface SportEvent {
  id: string;
  hostId: string;
  category: ActivityCategory;
  activity: ActivityType;
  title: string;
  description: string;
  startTime: number;
  durationMinutes: number;
  locationName: string;
  lat: number;
  lng: number;
  maxPlayers: number;
  joinedPlayerIds: string[];
  status: 'Open' | 'Full' | 'Completed';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
}

// Added ChatMessage interface to fix import error in storage.ts
export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

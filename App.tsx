import React, { useState, useEffect, useMemo } from 'react';
import { User, SportEvent, ActivityType, ActivityCategory } from './types';
import { StorageService } from './services/storage';
import { GeminiService } from './services/gemini';
import { ACTIVITY_LIST, MOCK_USERS } from './constants';
import Layout from './components/Layout';
import {
  MapPin, Calendar as CalendarIcon, Clock, ArrowLeft, Search,
  LogOut, PlusCircle, CheckCircle2,
  ChevronRight, Trophy, UserPlus, Info, Flame, AlertCircle, Timer, Settings,
  Save, Check, UserCircle, Camera, X, Users, Bell, Sparkles, LayoutGrid, Heart
} from 'lucide-react';

const AVATAR_SEEDS = ['Dishant', 'Felix', 'Buddy', 'Coco', 'Angel', 'Jasper'];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [createCategory, setCreateCategory] =
    useState<ActivityCategory>('Competitive');

  // ✅ SAFE LOCAL STORAGE INIT (FIXES WHITE SCREEN)
  useEffect(() => {
    try {
      const storedUser = StorageService.getCurrentUser();
      const storedEvents = StorageService.getEvents();
      setCurrentUser(storedUser);
      setEvents(storedEvents);
    } catch (e) {
      console.error('Storage init failed', e);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  /* ⬇️ YOUR EXISTING JSX LOGIC CONTINUES BELOW ⬇️ */

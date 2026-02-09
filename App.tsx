import React, { useState, useEffect, useMemo } from 'react';
import { User, SportEvent, ActivityType, ActivityCategory } from './types';
import { StorageService } from './services/storage';
import { GeminiService } from './services/gemini';
import { ACTIVITY_LIST, MOCK_USERS } from './constants';
import Layout from './components/Layout';
import {
  MapPin,
  Calendar as CalendarIcon,
  ArrowLeft,
  Search,
  LogOut,
  PlusCircle,
  ChevronRight,
  UserPlus,
  Settings,
  Save,
  Check,
  X,
  Users,
  Bell,
  Sparkles,
  Heart
} from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [aiAdvice, setAiAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [createCategory, setCreateCategory] =
    useState<ActivityCategory>('Competitive');

  /* ---------- SAFE STORAGE INIT (FIXES WHITE SCREEN) ---------- */
  useEffect(() => {
    try {
      setCurrentUser(StorageService.getCurrentUser());
      setEvents(StorageService.getEvents());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (currentUser && activeTab === 'home') {
      GeminiService.getAdvice('suggest activities').then(setAiAdvice);
    }
  }, [currentUser, activeTab]);

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <button
          className="bg-[#84cc16] text-black px-10 py-6 rounded-2xl font-black"
          onClick={() => {
            const u = MOCK_USERS[0];
            setCurrentUser(u);
            StorageService.setCurrentUser(u);
          }}
        >
          Access Platform
        </button>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'home' && (
        <div className="p-6 space-y-6">
          <h2 className="text-3xl font-black">
            Hi, {currentUser.name.split(' ')[0]}
          </h2>
          <div className="bg-[#1e293b] p-6 rounded-2xl">
            <p className="text-sm text-slate-400">
              {aiAdvice || 'Finding activities for you...'}
            </p>
            <button
              onClick={() => setActiveTab('sessions')}
              className="mt-4 bg-[#84cc16] text-black px-6 py-3 rounded-xl font-black"
            >
              Explore Sessions
            </button>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-black">Sessions</h2>
          {events.map(ev => (
            <div
              key={ev.id}
              className="bg-[#1e293b] p-6 rounded-2xl flex justify-between"
            >
              <div>
                <h4 className="font-black">{ev.title}</h4>
                <p className="text-xs text-slate-400">{ev.locationName}</p>
              </div>
              <button
                className="bg-[#84cc16] text-black px-4 py-2 rounded-xl font-black"
              >
                Join
              </button>
            </div>
          ))}
        </div>
      )}

     {activeTab === 'players' && (
  <div className="p-6 space-y-6">
    <h2 className="text-2xl font-black">Community</h2>

    {MOCK_USERS.filter(u => u.id !== currentUser.id).map(u => (
      <div
        key={u.id}
        className="bg-[#1e293b] p-6 rounded-2xl flex justify-between items-center"
      >
        <span className="font-black">{u.name}</span>
        <button
          disabled={invitedIds.includes(u.id)}
          onClick={() => setInvitedIds([...invitedIds, u.id])}
          className="bg-[#84cc16] text-black px-4 py-2 rounded-xl font-black"
        >
          {invitedIds.includes(u.id) ? 'Invited' : 'Invite'}
        </button>
      </div>
    ))}
  </div>
))}


      {activeTab === 'profile' && (
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-black">Profile</h2>
          <p className="text-slate-400">{currentUser.username}</p>
          <button
            onClick={() => {
              setCurrentUser(null);
              StorageService.setCurrentUser(null);
            }}
            className="bg-red-500 text-white px-6 py-3 rounded-xl font-black"
          >
            Logout
          </button>
        </div>
      )}
    </Layout>
  );
};

export default App;

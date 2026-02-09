import React, { useEffect, useMemo, useState } from 'react';
import { User, SportEvent, ActivityType, ActivityCategory } from './types';
import { StorageService } from './services/storage';
import { GeminiService } from './services/gemini';
import { ACTIVITY_LIST, MOCK_USERS } from './constants';
import Layout from './components/Layout';
import {
  ArrowLeft,
  Bell,
  Calendar as CalendarIcon,
  Check,
  ChevronRight,
  Heart,
  LogOut,
  MapPin,
  PlusCircle,
  Search,
  Settings,
  Sparkles,
  UserPlus,
  Users,
  X
} from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(
    StorageService.getCurrentUser()
  );
  const [activeTab, setActiveTab] = useState('home');
  const [events, setEvents] = useState<SportEvent[]>(
    StorageService.getEvents()
  );
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  /* ---------- CLOCK ---------- */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  /* ---------- SEED EVENTS ---------- */
  useEffect(() => {
    if (events.length === 0) {
      const base = Date.now();
      const seeded: SportEvent[] = [
        {
          id: 'e1',
          hostId: 'sahil',
          category: 'Competitive',
          activity: 'Football',
          title: 'Evening Football',
          description: '5v5 turf match',
          startTime: base + 3600000,
          durationMinutes: 90,
          locationName: 'Local Turf',
          lat: 0,
          lng: 0,
          maxPlayers: 10,
          joinedPlayerIds: ['sahil'],
          status: 'Open'
        }
      ];
      setEvents(seeded);
      StorageService.saveEvents(seeded);
    }
  }, [events.length]);

  /* ---------- AI ---------- */
  useEffect(() => {
    if (currentUser && activeTab === 'home') {
      GeminiService.getMatchmakingAdvice(currentUser, events).then(res => {
        if (res) setAiAdvice(res);
      });
    }
  }, [currentUser, activeTab, events]);

  /* ---------- DERIVED ---------- */
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => a.startTime - b.startTime);
  }, [events]);

  const interestMatchedEvents = useMemo(() => {
    if (!currentUser) return [];
    return sortedEvents.filter(e =>
      currentUser.interests.includes(e.activity)
    );
  }, [sortedEvents, currentUser]);

  /* ---------- AUTH ---------- */
  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <button
          className="bg-[#84cc16] text-black px-10 py-5 rounded-2xl font-black"
          onClick={() => {
            const user = MOCK_USERS[0];
            setCurrentUser(user);
            StorageService.setCurrentUser(user);
          }}
        >
          ENTER APP
        </button>
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {/* HOME */}
      {activeTab === 'home' && (
        <div className="p-6 space-y-6">
          <h2 className="text-3xl font-black">Hi, {currentUser.name}</h2>

          <div className="bg-[#1e293b] p-6 rounded-2xl">
            <Sparkles className="text-[#84cc16]" />
            <p className="text-slate-400 mt-2">
              {aiAdvice || 'Finding best matches for you...'}
            </p>
          </div>

          <div className="space-y-3">
            {interestMatchedEvents.map(e => (
              <div
                key={e.id}
                onClick={() => setSelectedEventId(e.id)}
                className="bg-[#1e293b] p-5 rounded-2xl cursor-pointer"
              >
                <h4 className="font-black">{e.title}</h4>
                <p className="text-xs text-slate-400">{e.locationName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="p-6 space-y-4">
          <h2 className="text-3xl font-black">Sessions</h2>

          {sortedEvents.map(e => (
            <div
              key={e.id}
              className="bg-[#1e293b] p-6 rounded-2xl flex justify-between"
            >
              <div>
                <h4 className="font-black">{e.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin size={12} /> {e.locationName}
                </div>
              </div>
              <button className="bg-[#84cc16] text-black px-4 py-2 rounded-xl font-black">
                Join
              </button>
            </div>
          ))}
        </div>
      )}

      {/* PLAYERS */}
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
                onClick={() =>
                  setInvitedIds(prev =>
                    prev.includes(u.id) ? prev : [...prev, u.id]
                  )
                }
                className="bg-[#84cc16] text-black px-4 py-2 rounded-xl font-black"
              >
                {invitedIds.includes(u.id) ? 'Invited' : 'Invite'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* PROFILE */}
      {activeTab === 'profile' && (
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-black">Profile</h2>
          <p className="text-slate-400">@{currentUser.username}</p>

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

      {/* EVENT MODAL */}
      {selectedEventId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-[#1e293b] p-8 rounded-3xl w-full max-w-md">
            <button
              className="mb-4 text-slate-400"
              onClick={() => setSelectedEventId(null)}
            >
              <X />
            </button>
            <h3 className="text-xl font-black">
              {events.find(e => e.id === selectedEventId)?.title}
            </h3>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;

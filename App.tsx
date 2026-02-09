
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
  const [currentUser, setCurrentUser] = useState<User | null>(StorageService.getCurrentUser());
  const [activeTab, setActiveTab] = useState('home');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<SportEvent[]>(StorageService.getEvents());
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [confirmAction, setConfirmAction] = useState<{title: string, message: string, onConfirm: () => void} | null>(null);

  // Form States
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [createCategory, setCreateCategory] = useState<ActivityCategory>('Competitive');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (events.length === 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const baseTime = today.getTime();

      const initialEvents: SportEvent[] = [
        {
          id: 'e1', hostId: 'sahil_g', category: 'Competitive', activity: 'Football', title: 'Midweek 5-a-Side',
          description: 'High intensity match for experienced players.', 
          startTime: baseTime + (18 * 60 * 60 * 1000), 
          durationMinutes: 90, locationName: 'Andheri Turf', lat: 19.11, lng: 72.85, maxPlayers: 10,
          joinedPlayerIds: ['sahil_g', 'dishant_g'], status: 'Open'
        },
        {
          id: 'e2', hostId: 'vighnesh_j', category: 'Social', activity: 'Coding', title: 'React Study Group',
          description: 'Peer learning for modern frontend engineering.', 
          startTime: baseTime + (20 * 60 * 60 * 1000), 
          durationMinutes: 120, locationName: 'Tech Hub Cafe', lat: 19.12, lng: 72.86, maxPlayers: 5,
          joinedPlayerIds: ['vighnesh_j'], status: 'Open'
        },
        {
          id: 'e3', hostId: 'divya_s', category: 'Recreational', activity: 'Jogging', title: 'Evening Park Run',
          description: 'Casual 5k run for fitness enthusiasts.', 
          startTime: baseTime + (17 * 60 * 60 * 1000), 
          durationMinutes: 45, locationName: 'Central Park', lat: 19.13, lng: 72.87, maxPlayers: 20,
          joinedPlayerIds: ['divya_s'], status: 'Open'
        }
      ];
      setEvents(initialEvents);
      StorageService.saveEvents(initialEvents);
    }
  }, []);

  useEffect(() => {
    if (currentUser && activeTab === 'home' && !aiAdvice) {
      GeminiService.getMatchmakingAdvice(currentUser, events).then(res => setAiAdvice(res || ''));
    }
  }, [currentUser, activeTab, events.length]);

  const getEventStatusInfo = (event: SportEvent) => {
    const end = event.startTime + (event.durationMinutes * 60 * 1000);
    if (currentTime > end) return { label: 'Completed', color: 'text-slate-500', bg: 'bg-slate-500/10' };
    if (currentTime > event.startTime) return { label: 'Ongoing', color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
    const diff = event.startTime - currentTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { 
      label: hours > 24 ? `Starts in ${Math.round(hours/24)}d` : `Starts in ${hours}h ${mins}m`, 
      color: 'text-[#84cc16]', bg: 'bg-[#84cc16]/10' 
    };
  };

  const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const timeValue = formData.get('time') as string;
    const [hours, mins] = timeValue.split(':').map(Number);
    const eventDate = new Date();
    eventDate.setHours(hours, mins, 0, 0);

    const newEvent: SportEvent = {
      id: `e-${Date.now()}`,
      hostId: currentUser.id,
      category: createCategory,
      activity: formData.get('activity') as ActivityType,
      title: formData.get('title') as string,
      description: 'Community session organized via coordination platform.',
      startTime: eventDate.getTime(),
      durationMinutes: 90,
      locationName: formData.get('location') as string,
      lat: 19.10, lng: 72.85, maxPlayers: 10,
      joinedPlayerIds: [currentUser.id],
      status: 'Open'
    };

    const newEvents = [newEvent, ...events];
    setEvents(newEvents);
    StorageService.saveEvents(newEvents);
    setActiveTab('sessions');
  };

  const handleInvite = (userId: string) => {
    if (!currentUser || invitedIds.includes(userId)) return;
    
    // Simulate loading for feedback
    setLoading(true);
    setTimeout(() => {
      setInvitedIds(prev => [...prev, userId]);
      const targetUser = MOCK_USERS.find(u => u.id === userId);
      
      StorageService.addNotification(currentUser.id, {
        id: Date.now().toString(),
        userId: currentUser.id,
        title: 'Invite Sent',
        message: `Your session invitation has been successfully transmitted to ${targetUser?.name}.`,
        read: false,
        timestamp: Date.now()
      });
      setLoading(false);
    }, 800);
  };

  const executeJoinLeave = (eventId: string) => {
    setLoading(true);
    setTimeout(() => {
      const updated = events.map(ev => {
        if (ev.id === eventId) {
          const isJoined = ev.joinedPlayerIds.includes(currentUser!.id);
          const newPlayers = isJoined 
            ? ev.joinedPlayerIds.filter(id => id !== currentUser!.id)
            : [...ev.joinedPlayerIds, currentUser!.id];
          return { ...ev, joinedPlayerIds: newPlayers };
        }
        return ev;
      });
      setEvents(updated);
      StorageService.saveEvents(updated);
      setLoading(false);
      setConfirmAction(null);
    }, 600);
  };

  const handleJoinLeave = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event?.joinedPlayerIds.includes(currentUser!.id)) {
      setConfirmAction({
        title: 'Withdrawal',
        message: 'Are you sure you want to leave this session?',
        onConfirm: () => executeJoinLeave(eventId)
      });
    } else {
      executeJoinLeave(eventId);
    }
  };

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const aEnd = a.startTime + (a.durationMinutes * 60 * 1000);
      const bEnd = b.startTime + (b.durationMinutes * 60 * 1000);
      const aDone = currentTime > aEnd;
      const bDone = currentTime > bEnd;
      if (aDone !== bDone) return aDone ? 1 : -1;
      return a.startTime - b.startTime;
    });
  }, [events, currentTime]);

  const interestMatchedEvents = useMemo(() => {
    return sortedEvents.filter(e => currentUser?.interests.includes(e.activity));
  }, [sortedEvents, currentUser?.interests]);

  const startEditing = () => {
    setEditFormData({
      name: currentUser!.name,
      interests: currentUser!.interests,
      availability: currentUser!.availability as any || 'Available',
      avatar: currentUser!.avatar
    });
    setIsEditingProfile(true);
  };

  const toggleInterest = (interest: ActivityType) => {
    const current = editFormData.interests || [];
    const updated = current.includes(interest) 
      ? current.filter(i => i !== interest)
      : [...current, interest];
    setEditFormData({ ...editFormData, interests: updated });
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = { ...currentUser!, ...editFormData } as User;
    setCurrentUser(updatedUser);
    StorageService.setCurrentUser(updatedUser);
    setIsEditingProfile(false);
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-8 bg-[#0f172a] text-white overflow-hidden relative">
        <div className="relative z-10 text-center space-y-8">
          <div className="bg-[#1e293b] p-8 rounded-[3rem] shadow-2xl border border-white/5 inline-block transform -rotate-2">
            <div className="bg-[#84cc16] px-10 py-6 rounded-3xl text-black font-black text-5xl italic tracking-tighter shadow-[0_0_50px_rgba(132,204,22,0.4)]">RTP</div>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4 leading-tight">Ready to Play</h1>
          <button onClick={() => {
            const user = MOCK_USERS[0];
            setCurrentUser(user);
            StorageService.setCurrentUser(user);
          }} className="w-full bg-[#84cc16] text-black font-black py-6 rounded-[2rem] shadow-xl flex items-center justify-center gap-4 uppercase tracking-widest italic">
            Access Platform
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      
      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConfirmAction(null)}></div>
          <div className="relative bg-[#1e293b] w-full max-w-sm rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-6">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">{confirmAction.title}</h3>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wide opacity-80">{confirmAction.message}</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmAction(null)} className="flex-1 py-4 rounded-2xl bg-[#0f172a] text-slate-400 font-black uppercase text-[10px] tracking-widest">Cancel</button>
              <button onClick={confirmAction.onConfirm} className="flex-1 py-4 rounded-2xl bg-[#84cc16] text-black font-black uppercase text-[10px] tracking-widest shadow-xl">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {selectedEventId && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-[#0f172a] animate-in slide-in-from-bottom-full duration-300">
          <div className="p-6 flex items-center gap-5 border-b border-white/5 bg-[#1e293b]">
            <button onClick={() => setSelectedEventId(null)} className="p-4 bg-[#0f172a] rounded-2xl text-slate-400"><X size={22} /></button>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter truncate">Session Info</h2>
          </div>
          {events.find(e => e.id === selectedEventId) && (
            <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
              <div className="bg-[#1e293b] p-8 rounded-[3rem] border border-white/5 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="bg-[#0f172a] w-16 h-16 rounded-2xl flex items-center justify-center text-4xl italic border border-white/5">
                    {ACTIVITY_LIST.find(a => a.name === events.find(ev => ev.id === selectedEventId)?.activity)?.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-xl">{events.find(ev => ev.id === selectedEventId)?.category}</span>
                </div>
                <h4 className="text-2xl font-black italic uppercase tracking-tighter">{events.find(ev => ev.id === selectedEventId)?.title}</h4>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-wide leading-relaxed">{events.find(ev => ev.id === selectedEventId)?.description}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'home' && (
        <div className="p-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[#84cc16] text-[10px] font-black uppercase tracking-[0.3em] mb-2">Authenticated Profile</p>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{currentUser.name.split(' ')[0]}</h2>
            </div>
            <img src={currentUser.avatar} className="w-16 h-16 rounded-2xl border-2 border-[#84cc16] shadow-xl" />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Suggested For You</h3>
              <Sparkles className="text-[#84cc16]" size={16} />
            </div>
            
            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-8">
                <div className="bg-[#84cc16]/10 px-4 py-2 rounded-xl inline-block">
                  <span className="text-[10px] font-black text-[#84cc16] uppercase tracking-widest">Intelligent Recommendation</span>
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide leading-relaxed">
                  {aiAdvice || "Synchronizing available activities with your defined interests..."}
                </p>
                <button onClick={() => setActiveTab('sessions')} className="flex items-center gap-2 bg-[#84cc16] text-black px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">
                  Explore Matches <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Interest-Matched Sessions</h3>
            <div className="space-y-4">
              {interestMatchedEvents.slice(0, 2).map(event => (
                <div key={event.id} onClick={() => setSelectedEventId(event.id)} className="bg-[#1e293b] p-6 rounded-[2rem] border border-white/5 flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{ACTIVITY_LIST.find(a => a.name === event.activity)?.icon}</div>
                    <div>
                      <h4 className="font-black italic uppercase tracking-tighter text-sm">{event.title}</h4>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{event.locationName}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-700 group-hover:text-[#84cc16] transition-colors" />
                </div>
              ))}
              {interestMatchedEvents.length === 0 && (
                <div className="p-8 text-center bg-[#1e293b]/50 rounded-[2rem] border border-dashed border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">No active matches found for your current interests</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="p-6 space-y-8 pb-20 animate-in fade-in duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Live Sessions</h2>
            <button onClick={() => setActiveTab('create')} className="bg-[#84cc16] text-black p-4 rounded-2xl shadow-xl active:scale-90"><PlusCircle size={22} /></button>
          </div>
          <div className="space-y-5">
            {sortedEvents.length === 0 ? (
               <div className="py-20 text-center opacity-40 bg-[#1e293b] rounded-[3rem] border border-dashed border-white/10">
                  <CalendarIcon size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No active sessions scheduled</p>
               </div>
            ) : (
              sortedEvents.map(event => {
                const info = getEventStatusInfo(event);
                const isJoined = event.joinedPlayerIds.includes(currentUser.id);
                return (
                  <div key={event.id} onClick={() => setSelectedEventId(event.id)} className="bg-[#1e293b] rounded-[2.5rem] p-7 border border-white/5 space-y-6 transition-all active:scale-[0.98]">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-5">
                        <div className="bg-[#0f172a] w-14 h-14 rounded-2xl flex items-center justify-center text-3xl italic border border-white/10 shadow-inner">
                          {ACTIVITY_LIST.find(a => a.name === event.activity)?.icon}
                        </div>
                        <div>
                          <h4 className="font-black italic uppercase tracking-tighter text-lg leading-tight truncate max-w-[140px]">{event.title}</h4>
                          <div className="flex items-center gap-2 mt-1 opacity-60">
                            <MapPin size={12} className="text-[#84cc16]" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{event.locationName}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-xl font-black uppercase text-[8px] tracking-[0.2em] ${info.bg} ${info.color}`}>{info.label}</div>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex -space-x-3">
                        {event.joinedPlayerIds.slice(0, 3).map(id => (
                          <img key={id} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`} className="w-10 h-10 rounded-xl border-4 border-[#1e293b] shadow-lg" />
                        ))}
                        {event.joinedPlayerIds.length > 3 && <div className="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center text-[8px] font-black border-2 border-dashed border-white/10">+{event.joinedPlayerIds.length - 3}</div>}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleJoinLeave(event.id); }} className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${isJoined ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#84cc16] text-black shadow-lg'}`}>
                        {isJoined ? 'Leave' : 'Join'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'players' && (
        <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-500 pb-24">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Community</h2>
            <div className="bg-[#1e293b] p-3 rounded-2xl text-[#84cc16] shadow-xl"><Search size={22} /></div>
          </div>
          
          <div className="space-y-4">
            {MOCK_USERS.filter(u => u.id !== currentUser.id).map((user) => {
              const sharedInterests = user.interests.filter((i: string) => currentUser.interests.includes(i as ActivityType));
              const isInvited = invitedIds.includes(user.id);
              
              return (
                <div key={user.id} className="bg-[#1e293b] p-6 rounded-[2.5rem] border border-white/5 flex items-center gap-6 group transition-all hover:bg-[#253247]">
                  <div className="relative shrink-0">
                    <img src={user.avatar} className="w-20 h-20 rounded-[2rem] border-2 border-white/10 group-hover:border-[#84cc16] transition-all" />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-[#1e293b] ${user.availability?.includes('Available') ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-black italic uppercase tracking-tighter text-lg truncate">{user.name}</h4>
                      {sharedInterests.length > 0 && (
                        <div className="bg-[#84cc16] p-1 rounded-lg text-black animate-pulse">
                          <Heart size={10} fill="currentColor" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {user.interests.map((int: string) => {
                        const isShared = currentUser.interests.includes(int as ActivityType);
                        return (
                          <span key={int} className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-all ${
                            isShared 
                              ? 'bg-[#84cc16] text-black border-[#84cc16]' 
                              : 'bg-[#0f172a] text-slate-500 border-white/5'
                          }`}>
                            {int}
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] mt-3">{user.distance || '1.0 km away'}</p>
                  </div>
                  <button 
                    onClick={() => handleInvite(user.id)} 
                    disabled={isInvited || loading}
                    className={`p-4 rounded-2xl shadow-xl active:scale-90 transition-all ${
                      isInvited 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-none' 
                        : 'bg-[#84cc16] text-black shadow-[#84cc16]/10'
                    }`}
                  >
                    {isInvited ? <Check size={22} strokeWidth={4} /> : <UserPlus size={22} strokeWidth={3} />}
                  </button>
                </div>
              );
            })}
            
            {MOCK_USERS.filter(u => u.id !== currentUser.id).length === 0 && (
              <div className="py-20 text-center opacity-40 bg-[#1e293b] rounded-[3rem] border border-dashed border-white/10">
                <Users size={48} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">No local athletes identified in your vicinity</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="p-6 space-y-8 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-5">
            <button onClick={() => setActiveTab('sessions')} className="p-4 bg-[#1e293b] rounded-2xl text-slate-400"><ArrowLeft size={22} /></button>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Host Session</h2>
          </div>
          <form onSubmit={handleCreateEvent} className="bg-[#1e293b] p-8 rounded-[3rem] border border-white/5 space-y-8 shadow-2xl">
            <div className="flex bg-[#0f172a] p-1.5 rounded-2xl">
              {(['Competitive', 'Recreational', 'Social'] as ActivityCategory[]).map(cat => (
                <button key={cat} type="button" onClick={() => setCreateCategory(cat)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${createCategory === cat ? 'bg-[#84cc16] text-black shadow-lg' : 'text-slate-500'}`}>{cat}</button>
              ))}
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Activity Type</label>
              <select name="activity" className="w-full px-6 py-6 bg-[#0f172a] rounded-[2rem] border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#84cc16] text-xs font-black uppercase appearance-none">
                {ACTIVITY_LIST.filter(a => a.category === createCategory).map(a => (
                  <option key={a.name} value={a.name}>{a.icon} {a.name.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Session Title</label>
              <input name="title" required placeholder="E.G. WEEKEND JOG" className="w-full px-6 py-6 bg-[#0f172a] rounded-[2rem] border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#84cc16] text-sm font-black uppercase tracking-widest" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Time</label>
                <input name="time" type="time" required className="w-full px-6 py-6 bg-[#0f172a] rounded-[2rem] border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#84cc16] text-xs font-black text-center" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Limit</label>
                <input name="maxPlayers" type="number" defaultValue="10" className="w-full px-6 py-6 bg-[#0f172a] rounded-[2rem] border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#84cc16] text-xs font-black text-center" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Location</label>
              <input name="location" required placeholder="VENUE OR ONLINE" className="w-full px-6 py-6 bg-[#0f172a] rounded-[2rem] border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#84cc16] text-sm font-black uppercase tracking-widest" />
            </div>

            <button type="submit" className="w-full bg-[#84cc16] text-black font-black py-6 rounded-[2rem] shadow-2xl active:scale-95 transition-all text-sm uppercase tracking-widest italic mt-4">Broadcast Session</button>
          </form>
        </div>
      )}

      {activeTab === 'profile' && !isEditingProfile && (
        <div className="p-6 space-y-12 pb-24 animate-in fade-in duration-500">
          <div className="flex flex-col items-center pt-10">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#84cc16] blur-[60px] opacity-30"></div>
              <img src={currentUser.avatar} className="w-44 h-44 rounded-[4rem] border-8 border-[#1e293b] shadow-2xl relative z-10" />
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-tight">{currentUser.name}</h2>
            <div className="flex items-center gap-3 mt-3">
              <span className="bg-[#84cc16] text-black text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest italic">Skill Level: {currentUser.skillLevel}</span>
              <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">@{currentUser.username}</span>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Active Interests</h3>
            <div className="flex flex-wrap gap-3">
              {currentUser.interests.map(int => (
                <div key={int} className="bg-[#1e293b] px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
                  <span className="text-lg">{ACTIVITY_LIST.find(a => a.name === int)?.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{int}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <button onClick={startEditing} className="w-full flex justify-between items-center bg-[#1e293b] px-8 py-6 rounded-[2rem] border border-white/5 text-white font-black text-[10px] uppercase tracking-widest shadow-xl">
              <div className="flex items-center gap-4"><Settings size={20} className="text-[#84cc16]" /><span>Edit Interest Profile</span></div>
              <ChevronRight size={16} />
            </button>
            <button onClick={() => { setCurrentUser(null); StorageService.setCurrentUser(null); }} className="w-full flex justify-center items-center gap-4 bg-[#0f172a] py-6 rounded-[2rem] border-2 border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95">
              <LogOut size={22} /><span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'profile' && isEditingProfile && (
        <div className="p-6 space-y-8 pb-24 animate-in slide-in-from-right-4 duration-500">
          <div className="flex items-center gap-5">
            <button onClick={() => setIsEditingProfile(false)} className="p-4 bg-[#1e293b] rounded-2xl text-slate-400"><ArrowLeft size={22} /></button>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Configure Profile</h2>
          </div>
          
          <form onSubmit={saveProfile} className="bg-[#1e293b] p-8 rounded-[3rem] border border-white/5 space-y-8 shadow-2xl">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Display Name</label>
              <input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} required className="w-full px-6 py-6 bg-[#0f172a] rounded-[2rem] border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#84cc16] text-sm font-black uppercase tracking-widest" />
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">My Interests & Activities</label>
              <div className="space-y-6">
                {(['Competitive', 'Recreational', 'Social'] as ActivityCategory[]).map(cat => (
                  <div key={cat} className="space-y-3">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">{cat} Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {ACTIVITY_LIST.filter(a => a.category === cat).map(a => (
                        <button key={a.name} type="button" onClick={() => toggleInterest(a.name)} className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${editFormData.interests?.includes(a.name) ? 'bg-[#84cc16] text-black border-[#84cc16] shadow-lg' : 'bg-[#0f172a] text-slate-500 border-white/5'}`}>
                          {a.icon} {a.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase text-slate-500">Availability</p>
                <select value={editFormData.availability} onChange={(e) => setEditFormData({ ...editFormData, availability: e.target.value as any })} className="w-full bg-[#0f172a] p-4 rounded-xl text-[10px] font-black uppercase border border-white/5">
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase text-slate-500">Skill Tier</p>
                <select value={editFormData.skillLevel} onChange={(e) => setEditFormData({ ...editFormData, skillLevel: e.target.value as any })} className="w-full bg-[#0f172a] p-4 rounded-xl text-[10px] font-black uppercase border border-white/5">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full bg-[#84cc16] text-black font-black py-6 rounded-[2rem] shadow-2xl active:scale-95 transition-all text-sm uppercase tracking-widest italic mt-6 flex items-center justify-center gap-3">
              <Save size={20} strokeWidth={3} />
              Commit Updates
            </button>
          </form>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="p-6 space-y-8 animate-in slide-in-from-left-4 duration-500">
          <div className="flex items-center gap-5">
            <button onClick={() => setActiveTab('home')} className="p-4 bg-[#1e293b] rounded-2xl text-slate-400"><ArrowLeft size={22} /></button>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">System Alerts</h2>
          </div>
          <div className="space-y-4">
            {StorageService.getNotifications(currentUser.id).length === 0 ? (
              <div className="py-20 text-center opacity-40"><Bell size={48} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-widest">No new alerts identified</p></div>
            ) : (
              StorageService.getNotifications(currentUser.id).map((n, i) => (
                <div key={i} className="bg-[#1e293b] p-7 rounded-[2.5rem] border border-white/5 flex gap-6 items-center shadow-lg group">
                  <div className="w-16 h-16 bg-[#0f172a] rounded-2xl flex items-center justify-center text-3xl shrink-0 italic">🏆</div>
                  <div>
                    <h4 className="font-black italic uppercase tracking-tighter text-sm mb-1 group-hover:text-[#84cc16] transition-colors">{n.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight opacity-70">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;

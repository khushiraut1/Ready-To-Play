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

  // Form States
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [createCategory, setCreateCategory] =
    useState<ActivityCategory>('Competitive');

  // ✅ SAFE BROWSER STORAGE LOAD (FIXES WHITE SCREEN)
  useEffect(() => {
    try {
      const storedUser = StorageService.getCurrentUser();
      const storedEvents = StorageService.getEvents();

      setCurrentUser(storedUser);
      setEvents(storedEvents);
    } catch (error) {
      console.error('Storage init failed', error);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

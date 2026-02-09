import React, { useEffect, useState } from "react";
import Layout from "./components/Layout";
import { StorageService } from "./services/storage";
import { MOCK_USERS } from "./constants";
import { User } from "./types";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("home");

  // restore user safely
  useEffect(() => {
    try {
      const savedUser = StorageService.getCurrentUser();
      if (savedUser) {
        setCurrentUser(savedUser);
      }
    } catch {
      setCurrentUser(null);
    }
  }, []);

  // login fallback
  const handleLogin = () => {
    const user = MOCK_USERS[0];
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
  };

  if (!currentUser) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <h1 className="text-4xl font-black mb-6">READY TO PLAY</h1>
        <button
          onClick={handleLogin}
          className="bg-[#84cc16] text-black px-8 py-4 rounded-xl font-black"
        >
          Enter App
        </button>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "home" && (
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-black">
            Hi, {currentUser.name.split(" ")[0]}
          </h2>
          <p className="text-slate-400 text-sm">
            Welcome back to Ready to Play.
          </p>
        </div>
      )}

      {activeTab === "players" && (
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-black">Community</h2>
          {MOCK_USERS.filter(u => u.id !== currentUser.id).map(u => (
            <div
              key={u.id}
              className="bg-[#1e293b] p-4 rounded-xl flex justify-between items-center"
            >
              <span className="font-bold">{u.name}</span>
              <button className="bg-[#84cc16] text-black px-4 py-2 rounded-lg font-bold">
                Invite
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "profile" && (
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-black">Profile</h2>
          <p className="text-slate-400">@{currentUser.username}</p>
          <button
            onClick={() => {
              StorageService.setCurrentUser(null);
              setCurrentUser(null);
            }}
            className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold"
          >
            Logout
          </button>
        </div>
      )}
    </Layout>
  );
};

export default App;

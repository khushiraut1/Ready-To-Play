import { User, SportEvent } from "../types";

const CURRENT_USER_KEY = "current_user";
const EVENTS_KEY = "events";

export const StorageService = {
  getCurrentUser(): User | null {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser(user: User) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  getEvents(): SportEvent[] {
    const data = localStorage.getItem(EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  setEvents(events: SportEvent[]) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }
};

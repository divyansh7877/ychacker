'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Story, SavedStory, StoryType } from '@/lib/types';

interface AppState {
  savedStories: SavedStory[];
  currentFeed: StoryType;
  theme: 'dark' | 'light';
}

type Action =
  | { type: 'SAVE_STORY'; payload: Story }
  | { type: 'UNSAVE_STORY'; payload: number }
  | { type: 'SET_FEED'; payload: StoryType }
  | { type: 'TOGGLE_THEME' }
  | { type: 'LOAD_SAVED'; payload: SavedStory[] };

const initialState: AppState = {
  savedStories: [],
  currentFeed: 'top',
  theme: 'dark',
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SAVE_STORY':
      const exists = state.savedStories.find(s => s.id === action.payload.id);
      if (exists) return state;
      return {
        ...state,
        savedStories: [{ ...action.payload, savedAt: Date.now() }, ...state.savedStories],
      };
    case 'UNSAVE_STORY':
      return {
        ...state,
        savedStories: state.savedStories.filter(s => s.id !== action.payload),
      };
    case 'SET_FEED':
      return { ...state, currentFeed: action.payload };
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'LOAD_SAVED':
      return { ...state, savedStories: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem('ychacker-saved');
    if (saved) {
      try {
        dispatch({ type: 'LOAD_SAVED', payload: JSON.parse(saved) });
      } catch {}
    }
    const theme = localStorage.getItem('ychacker-theme');
    if (theme === 'light') {
      dispatch({ type: 'TOGGLE_THEME' });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ychacker-saved', JSON.stringify(state.savedStories));
  }, [state.savedStories]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('ychacker-theme', state.theme);
  }, [state.theme]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

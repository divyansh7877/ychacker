'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { StoryType } from '@/lib/types';
import styles from './Header.module.css';

const tabs: { key: StoryType; label: string }[] = [
  { key: 'top', label: 'Top' },
  { key: 'new', label: 'New' },
  { key: 'best', label: 'Best' },
  { key: 'ask', label: 'Ask HN' },
  { key: 'show', label: 'Show HN' },
  { key: 'jobs', label: 'Jobs' },
];

interface HeaderProps {
  storyCount?: number;
  onSearch?: (query: string) => void;
}

export default function Header({ storyCount = 0, onSearch }: HeaderProps) {
  const { state, dispatch } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLFormElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    if (onSearch) {
      onSearch(query);
    }
  }, [dispatch, onSearch]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (inputValue.trim()) {
      setIsSearching(true);
      debounceRef.current = setTimeout(() => {
        handleSearch(inputValue.trim());
        setIsSearching(false);
      }, 300);
    } else {
      handleSearch('');
      setIsSearching(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, handleSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      dispatch({ type: 'ADD_RECENT_SEARCH', payload: inputValue.trim() });
      handleSearch(inputValue.trim());
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleRecentSearch = (query: string) => {
    setInputValue(query);
    handleSearch(query);
    setShowDropdown(false);
  };

  const handleClearRecent = () => {
    dispatch({ type: 'CLEAR_RECENT_SEARCHES' });
  };

  const handleClearInput = () => {
    setInputValue('');
    handleSearch('');
    inputRef.current?.focus();
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="/" className={styles.logo}>
            <span className={styles.logoIcon}>Y</span>
            <span>YCHacker</span>
          </a>

          <form onSubmit={handleSubmit} className={styles.searchContainer} ref={containerRef as React.RefObject<HTMLFormElement>}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search stories..."
              className={styles.searchInput}
            />
            {isSearching && (
              <svg className={styles.searchSpinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            )}
            {inputValue && !isSearching && (
              <button
                type="button"
                onClick={handleClearInput}
                className={styles.clearBtn}
                aria-label="Clear search"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
            {showDropdown && state.recentSearches.length > 0 && !inputValue && (
              <div className={styles.searchDropdown}>
                <div className={styles.dropdownHeader}>
                  <span>Recent searches</span>
                  <button type="button" onClick={handleClearRecent} className={styles.clearAllBtn}>
                    Clear all
                  </button>
                </div>
                {state.recentSearches.map((query, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleRecentSearch(query)}
                    className={styles.dropdownItem}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    {query}
                  </button>
                ))}
              </div>
            )}
          </form>

          <div className={styles.actions}>
            <button
              className={styles.themeToggle}
              onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
              aria-label="Toggle theme"
            >
              {state.theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <nav className={styles.nav}>
        <div className={styles.navInner}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.navTab} ${state.currentFeed === tab.key ? styles.active : ''}`}
              onClick={() => dispatch({ type: 'SET_FEED', payload: tab.key })}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{storyCount}</span> stories loaded
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{state.savedStories.length}</span> saved
        </div>
      </div>
    </>
  );
}

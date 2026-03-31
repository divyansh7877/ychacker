'use client';

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
}

export default function Header({ storyCount = 0 }: HeaderProps) {
  const { state, dispatch } = useApp();

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="/" className={styles.logo}>
            <span className={styles.logoIcon}>Y</span>
            <span>YCHacker</span>
          </a>

          <div className={styles.searchContainer}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search stories..."
              className={styles.searchInput}
            />
          </div>

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

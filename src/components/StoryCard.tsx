'use client';

import { Story } from '@/lib/types';
import { timeAgo, getDomain, formatNumber } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import styles from './StoryCard.module.css';

interface StoryCardProps {
  story: Story;
  onSelect?: (story: Story) => void;
}

export default function StoryCard({ story, onSelect }: StoryCardProps) {
  const { state, dispatch } = useApp();
  const isSaved = state.savedStories.some(s => s.id === story.id);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      dispatch({ type: 'UNSAVE_STORY', payload: story.id });
    } else {
      dispatch({ type: 'SAVE_STORY', payload: story });
    }
  };

  const handleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(story);
  };

  const handleOpenOriginal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (story.url) window.open(story.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>
          <a href="#" onClick={(e) => { e.preventDefault(); onSelect?.(story); }}>
            {story.title}
          </a>
        </h2>
        <div className={styles.score}>
          <svg className={styles.scoreIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {formatNumber(story.score)}
        </div>
      </div>

      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {story.by}
        </span>
        <span className={styles.metaItem}>
          <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
          {timeAgo(story.time)}
        </span>
        {story.url && (
          <span className={styles.domain}>{getDomain(story.url)}</span>
        )}
      </div>

      {story.text && (
        <p className={styles.excerpt}>
          {story.text.slice(0, 200)}
          {story.text.length > 200 && '...'}
        </p>
      )}

      <div className={styles.footer}>
        <button className={styles.comments} onClick={handleComments}>
          <svg className={styles.commentsIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {story.descendants || 0} comments
        </button>

        <div className={styles.actions}>
          {story.url && (
            <button className={styles.actionBtn} onClick={handleOpenOriginal}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15,3 21,3 21,9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Original
            </button>
          )}
          <button className={`${styles.actionBtn} ${isSaved ? styles.saved : ''}`} onClick={handleSave}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </article>
  );
}

export function StoryCardSkeleton() {
  return (
    <article className={`${styles.card} ${styles.skeleton}`}>
      <div className={styles.title} />
      <div className={styles.meta} />
      <div className={styles.footer} />
    </article>
  );
}

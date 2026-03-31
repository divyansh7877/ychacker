'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Story } from '@/lib/types';
import { fetchStory, timeAgo, getDomain, formatNumber } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import CommentThread from '@/components/CommentThread';
import styles from './page.module.css';

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  const storyId = parseInt(params.id as string);
  const isSaved = story && state.savedStories.some(s => s.id === story.id);

  useEffect(() => {
    if (storyId) {
      setLoading(true);
      fetchStory(storyId)
        .then(setStory)
        .finally(() => setLoading(false));
    }
  }, [storyId]);

  const handleSave = () => {
    if (!story) return;
    if (isSaved) {
      dispatch({ type: 'UNSAVE_STORY', payload: story.id });
    } else {
      dispatch({ type: 'SAVE_STORY', payload: story });
    }
  };

  const handleOpenOriginal = () => {
    if (story?.url) {
      window.open(story.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.storySection}>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading story...
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className={styles.container}>
        <div className={styles.storySection}>
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Story not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15,18 9,12 15,6" />
        </svg>
        Back to feed
      </Link>

      <div className={styles.mainContent}>
        <main>
          <article className={styles.storySection}>
            <header className={styles.storyHeader}>
              <h1 className={styles.title}>{story.title}</h1>
              
              <div className={styles.meta}>
                <span className={styles.metaItem}>
                  <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className={styles.author}>{story.by}</span>
                </span>
                <span className={styles.metaItem}>
                  <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                  {timeAgo(story.time)}
                </span>
                <span className={styles.metaItem}>
                  <svg className={styles.metaIcon} viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--score-high)' }}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className={styles.score}>{formatNumber(story.score)} points</span>
                </span>
                {story.url && (
                  <span className={styles.domain}>{getDomain(story.url)}</span>
                )}
              </div>

              <div className={styles.actions}>
                <button className={styles.actionBtn} onClick={handleOpenOriginal}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15,3 21,3 21,9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Open Original
                </button>
                <button 
                  className={`${styles.actionBtn} ${isSaved ? styles.saved : ''}`}
                  onClick={handleSave}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  {isSaved ? 'Saved' : 'Save Story'}
                </button>
              </div>
            </header>

            {story.text && (
              <div className={styles.storyContent}>
                <p className={styles.storyText}>{story.text}</p>
              </div>
            )}
          </article>

          {story.kids && story.kids.length > 0 && (
            <CommentThread 
              storyId={story.id} 
              commentIds={story.kids}
              initialCount={story.descendants}
            />
          )}
        </main>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>Story Stats</h3>
            <div className={styles.statGrid}>
              <div className={styles.stat}>
                <div className={styles.statValue}>{formatNumber(story.score)}</div>
                <div className={styles.statLabel}>Points</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>{story.descendants || 0}</div>
                <div className={styles.statLabel}>Comments</div>
              </div>
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>Quick Links</h3>
            <div className={styles.relatedList}>
              <a 
                href={`https://news.ycombinator.com/item?id=${story.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.relatedItem}
              >
                <div className={styles.relatedTitle}>View on Hacker News</div>
                <div className={styles.relatedMeta}>news.ycombinator.com</div>
              </a>
              {story.url && (
                <a 
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.relatedItem}
                >
                  <div className={styles.relatedTitle}>Visit Source</div>
                  <div className={styles.relatedMeta}>{getDomain(story.url)}</div>
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

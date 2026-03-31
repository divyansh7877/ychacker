'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import Fuse from 'fuse.js';
import { Story, StoryType } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import StoryCard, { StoryCardSkeleton } from '@/components/StoryCard';
import { fetchStoryIds } from '@/lib/api';
import styles from './page.module.css';

const PAGE_SIZE = 20;

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export default function Home() {
  const router = useRouter();
  const { state } = useApp();
  const [page, setPage] = useState(0);
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [allIds, setAllIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPage, setSearchPage] = useState(0);
  const [searchResults, setSearchResults] = useState<Story[]>([]);

  const feedUrl = `/api/stories?type=${state.currentFeed}&page=${page}`;
  const searchUrl = searchQuery ? `/api/search?q=${encodeURIComponent(searchQuery)}&page=${searchPage}` : null;

  const { data, error, isLoading, mutate } = useSWR(feedUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  const { data: searchData, isLoading: searchLoading } = useSWR(searchUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  const fuse = useMemo(() => {
    return new Fuse(allStories, {
      keys: ['title', 'by', 'url'],
      threshold: 0.4,
      includeScore: true,
    });
  }, [allStories]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSearchPage(0);
    setSearchResults([]);
  }, []);

  useEffect(() => {
    setPage(0);
    setAllStories([]);
    setAllIds([]);
    setSearchQuery('');
    setSearchResults([]);
    
    if (state.currentFeed) {
      fetchStoryIds(state.currentFeed).then(setAllIds);
    }
  }, [state.currentFeed]);

  useEffect(() => {
    if (data?.stories) {
      if (page === 0) {
        setAllStories(data.stories);
      } else {
        setAllStories(prev => [...prev, ...data.stories]);
      }
    }
  }, [data, page]);

  useEffect(() => {
    if (searchData?.stories) {
      if (searchPage === 0) {
        setSearchResults(searchData.stories);
      } else {
        setSearchResults(prev => [...prev, ...searchData.stories]);
      }
    }
  }, [searchData, searchPage]);

  const displayedStories = useMemo(() => {
    if (searchQuery && searchData?.stories) {
      return searchResults;
    }
    if (searchQuery && allStories.length > 0) {
      return fuse.search(searchQuery).map(result => result.item);
    }
    return allStories;
  }, [searchQuery, searchData, searchResults, allStories, fuse]);

  const handleSelectStory = useCallback((story: Story) => {
    router.push(`/story/${story.id}`);
  }, [router]);

  const handleLoadMore = () => {
    if (searchQuery) {
      setSearchPage(searchPage + 1);
    } else if (data?.nextPage !== null) {
      setPage(page + 1);
    }
  };

  const handleRetry = () => {
    mutate();
  };

  const isSearchMode = searchQuery.length > 0;
  const isLoadingContent = isLoading && page === 0;
  const hasMoreContent = searchQuery 
    ? searchData?.nextPage !== null
    : data?.nextPage !== null;

  return (
    <>
      <Header storyCount={allIds.length} onSearch={handleSearch} />
      
      <main className={styles.container}>
        <div className={styles.main}>
          {isSearchMode && searchLoading && searchPage === 0 ? (
            <div className={styles.storyGrid}>
              {Array.from({ length: 10 }).map((_, i) => (
                <StoryCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <h2 className={styles.errorTitle}>Something went wrong</h2>
              <p className={styles.errorText}>Failed to load stories. Please try again.</p>
              <button className={styles.retryBtn} onClick={handleRetry}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
                Try Again
              </button>
            </div>
          ) : displayedStories.length === 0 ? (
            <div className={styles.emptyState}>
              <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V9a2 2 0 0 0-2-2h-1" />
                <path d="M13 16h-2v-2" />
                <path d="M13 12h-2v-2" />
              </svg>
              <h2 className={styles.emptyTitle}>
                {isSearchMode ? `No results for "${searchQuery}"` : 'No stories found'}
              </h2>
              <p className={styles.emptyText}>
                {isSearchMode 
                  ? 'Try different keywords or check back later.'
                  : 'Try switching to a different feed or check back later.'}
              </p>
              {isSearchMode && (
                <button 
                  className={styles.emptyBtn} 
                  onClick={() => handleSearch('')}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              {isSearchMode && (
                <div className={styles.searchHeader}>
                  <span className={styles.searchResultsCount}>
                    {searchData?.total || 0} results for "{searchQuery}"
                  </span>
                </div>
              )}
              <div className={styles.storyGrid}>
                {displayedStories.map((story) => (
                  <StoryCard 
                    key={story.id} 
                    story={story} 
                    onSelect={handleSelectStory}
                  />
                ))}
              </div>

              {hasMoreContent && (
                <div className={styles.loadMoreContainer}>
                  <button 
                    className={styles.loadMoreBtn}
                    onClick={handleLoadMore}
                    disabled={isLoading || searchLoading}
                  >
                    {isLoading || searchLoading ? (
                      <>
                        <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6,9 12,15 18,9" />
                        </svg>
                        Load more stories
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

import { Story, Comment, StoryType } from './types';

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';

export async function fetchStoryIds(type: StoryType): Promise<number[]> {
  const endpoints: Record<StoryType, string> = {
    top: 'topstories',
    new: 'newstories',
    best: 'beststories',
    ask: 'askstories',
    show: 'showstories',
    jobs: 'jobstories',
  };

  const response = await fetch(`${HN_API_BASE}/${endpoints[type]}.json`);
  if (!response.ok) throw new Error('Failed to fetch story IDs');
  return response.json();
}

export async function fetchStory(id: number): Promise<Story> {
  const response = await fetch(`${HN_API_BASE}/item/${id}.json`);
  if (!response.ok) throw new Error(`Failed to fetch story ${id}`);
  return response.json();
}

export async function fetchComment(id: number, parentStory?: number): Promise<Comment | null> {
  try {
    const response = await fetch(`${HN_API_BASE}/item/${id}.json`);
    if (!response.ok) return null;
    const comment = await response.json();
    if (comment && parentStory !== undefined) {
      comment.parentStory = parentStory;
    }
    return comment;
  } catch {
    return null;
  }
}

export async function fetchStoriesByIds(ids: number[]): Promise<Story[]> {
  const stories = await Promise.all(ids.map(id => fetchStory(id)));
  return stories.filter((s): s is Story => s !== null && s.type === 'story');
}

export async function fetchCommentsByIds(ids: number[], parentStory?: number): Promise<Comment[]> {
  const comments = await Promise.all(ids.map(id => fetchComment(id, parentStory)));
  return comments.filter((c): c is Comment => c !== null && !c.deleted && !c.dead);
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

export function getDomain(url?: string): string {
  if (!url) return 'news.ycombinator.com';
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

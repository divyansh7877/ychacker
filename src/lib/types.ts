export interface Story {
  id: number;
  title: string;
  url?: string;
  text?: string;
  by: string;
  score: number;
  descendants: number;
  time: number;
  type: 'story' | 'job' | 'poll';
  kids?: number[];
}

export interface Comment {
  id: number;
  by: string;
  text: string;
  time: number;
  score?: number;
  kids?: number[];
  parent: number;
  deleted?: boolean;
  dead?: boolean;
  parentStory?: number;
}

export type StoryType = 'top' | 'new' | 'best' | 'ask' | 'show' | 'jobs';

export interface StoryState {
  stories: Story[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

export interface SavedStory extends Story {
  savedAt: number;
}

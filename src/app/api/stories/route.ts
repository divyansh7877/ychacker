import { NextResponse } from 'next/server';
import { fetchStoryIds, fetchStoriesByIds } from '@/lib/api';
import { StoryType } from '@/lib/types';

const STORY_LIMIT = 20;
const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get('type') || 'top') as StoryType;
  const page = parseInt(searchParams.get('page') || '0');

  try {
    const allIds = await fetchStoryIds(type);
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageIds = allIds.slice(start, end);
    
    const stories = await fetchStoriesByIds(pageIds);

    return NextResponse.json({
      stories,
      nextPage: end < allIds.length ? page + 1 : null,
      total: allIds.length,
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

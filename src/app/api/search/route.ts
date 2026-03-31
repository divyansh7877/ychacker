import { NextResponse } from 'next/server';

const HN_ALGOLIA_BASE = 'https://hn.algolia.com/api/v1';

interface AlgoliaHit {
  objectID: string;
  title: string;
  url?: string;
  author: string;
  points: number;
  num_comments: number;
  created_at: number;
  story_text?: string;
  _tags: string[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '0');
  const hitsPerPage = 20;

  if (!query) {
    return NextResponse.json({ hits: [], nbHits: 0 });
  }

  try {
    const url = `${HN_ALGOLIA_BASE}/search?query=${encodeURIComponent(query)}&tags=story&page=${page}&hitsPerPage=${hitsPerPage}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('HN Algolia API request failed');
    }

    const data = await response.json();

    const stories = data.hits.map((hit: AlgoliaHit) => ({
      id: parseInt(hit.objectID),
      title: hit.title,
      url: hit.url,
      by: hit.author,
      score: hit.points,
      descendants: hit.num_comments,
      time: Math.floor(new Date(hit.created_at).getTime() / 1000),
      type: 'story' as const,
      text: hit.story_text,
    }));

    return NextResponse.json({
      stories,
      nextPage: data.page < data.nbPages - 1 ? page + 1 : null,
      total: data.nbHits,
      query: query,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', stories: [], nextPage: null, total: 0 },
      { status: 500 }
    );
  }
}

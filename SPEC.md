# YCHacker - Hacker News Learning Platform

## Concept & Vision

A sophisticated learning platform that transforms Hacker News content into digestible, structured knowledge. Instead of endless scrolling, users discover, read, and learn from top stories with their most insightful comments. The experience feels like having a thoughtful research assistant curating the best tech discussions for you.

## Design Language

### Aesthetic Direction
Inspired by modern reading apps like Matter and Readwise—clean, typographic, with subtle warmth. Dark mode primary with cream/paper-like reading surfaces. The interface should feel like a premium digital magazine.

### Color Palette
```css
--bg-primary: #0d1117;        /* Deep dark */
--bg-secondary: #161b22;      /* Card backgrounds */
--bg-tertiary: #21262d;       /* Elevated surfaces */
--bg-reading: #faf8f5;       /* Cream for reading mode */
--text-primary: #e6edf3;      /* Primary text */
--text-secondary: #8b949e;    /* Secondary text */
--text-muted: #6e7681;        /* Muted text */
--accent-primary: #f97316;    /* Orange (HN brand) */
--accent-secondary: #ea580c;  /* Darker orange */
--accent-success: #22c55e;    /* Green for positive signals */
--border: #30363d;            /* Subtle borders */
--score-high: #fbbf24;        /* Gold for high scores */
```

### Typography
- **Headlines**: "Instrument Serif", Georgia, serif — elegant, readable
- **Body**: "Inter", system-ui, sans-serif — crisp, modern
- **Code/Technical**: "JetBrains Mono", monospace — developer-friendly
- **Reading Mode**: "Literata", serif — optimized for long-form

### Spatial System
- Base unit: 4px
- Content max-width: 720px for reading, 1200px for listings
- Card padding: 24px
- Section gaps: 48px
- Generous whitespace to reduce cognitive load

### Motion Philosophy
- Page transitions: fade + subtle slide (200ms ease-out)
- Card interactions: scale(1.01) + shadow lift on hover (150ms)
- Loading states: skeleton shimmer animation (1.5s infinite)
- Content reveals: staggered fade-in on scroll (100ms delay between items)
- Reading progress: smooth scroll-linked progress bar

### Visual Assets
- **Icons**: Lucide React (consistent, minimal stroke)
- **Images**: None needed — HN content is text-focused
- **Decorative**: Subtle gradient overlays, thin accent lines

## Layout & Structure

### Page Architecture

#### 1. Dashboard (Home)
- **Header**: Logo, search bar, filter toggles, theme switch
- **Stats Bar**: Live counts (stories fetched, comments analyzed)
- **Feed Tabs**: Top | New | Best | Ask | Show | Jobs
- **Story Cards**: Compact grid/list with key metrics visible
- **Sidebar** (desktop): Category filters, saved stories, reading history

#### 2. Story Detail View
- **Story Header**: Title, points, author, time, domain
- **Quick Actions**: Save, share, open original, toggle reading mode
- **Story Content**: Rendered HTML if available, link preview if not
- **Top Comments Section**: Threaded, collapsible, sorted by score
- **Related Stories**: Based on keywords/tags

#### 3. Reading Mode (Overlay)
- Distraction-free reading surface
- Cream background with serif typography
- Floating toolbar: font size, save, close
- Progress indicator

#### 4. Saved/History View
- Bookmarked stories organized by date
- Reading history with completion status
- Export options

### Responsive Strategy
- **Desktop (1024px+)**: Full layout with sidebar
- **Tablet (768-1023px)**: Collapsible sidebar, 2-column grid
- **Mobile (<768px)**: Single column, bottom nav, swipe gestures

## Features & Interactions

### Core Features

#### 1. Feed Aggregation
- Fetches from official HN API (Algolia)
- Endpoints: Top stories, New stories, Best stories, Ask HN, Show HN, Jobs
- Real-time updates without page refresh
- Infinite scroll with intersection observer
- Pull-to-refresh on mobile

#### 2. Intelligent Comment Analysis
- Fetches top N comments (configurable, default 10)
- Comments sorted by: score, thread depth, recency
- Highlights comments with code, links, or high engagement
- Displays comment count and total discussion metrics

#### 3. Search & Filter
- Full-text search across titles and content
- Filter by: time range, score threshold, domain, comment count
- Sort by: relevance, date, score, comments
- Saved search queries

#### 4. Reading Experience
- Clean reading mode for linked articles (when parseable)
- Syntax highlighting for code snippets
- Estimated reading time
- Font size adjustment
- Share exact positions in text

#### 5. Organization System
- Save stories to personal library
- Create collections/tags for grouping
- Reading history with progress
- Quick-access recent items

### Interaction Details

#### Story Card Hover
- Slight elevation (translateY -2px, shadow increase)
- Points badge pulses subtly
- Quick-action icons fade in (save, open, comments)

#### Comment Threading
- Click to expand/collapse threads
- Indentation with subtle left border color gradient
- "Load more replies" for deep threads
- Parent comment highlighted when viewing nested reply

#### Search Interaction
- Debounced input (300ms)
- Recent searches shown on focus
- Filter chips appear as selections made
- Clear all filters button

#### Loading States
- Skeleton cards matching actual layout
- Shimmer animation direction: left to right
- "Loading more..." indicator at bottom during pagination
- Optimistic UI for saves (immediate feedback)

#### Error States
- Network error: Retry button with offline indicator
- Empty results: Helpful illustration + suggestions
- Rate limited: Countdown timer displayed

## Component Inventory

### StoryCard
- **Default**: Title, points (orange badge), comment count, author, time, domain
- **Hover**: Elevated shadow, quick actions visible
- **Saved**: Bookmark icon filled, subtle border glow
- **Loading**: Skeleton with shimmer

### CommentThread
- **Default**: Avatar placeholder, author, time, score, content
- **Collapsed**: Shows "N replies" summary
- **Expanded**: Full threaded view
- **Highlighted**: Gold left border for top comments
- **With Code**: Syntax highlighted code blocks

### SearchBar
- **Default**: Icon + placeholder text
- **Focused**: Expanded width, suggestions dropdown
- **With Filters**: Active filter chips below
- **Loading**: Spinner replacing search icon

### FilterChip
- **Default**: Label with X icon
- **Hover**: Background darkens
- **Active**: Filled with accent color

### TabNavigation
- **Default**: Text with underline indicator
- **Active**: Bold text, accent underline
- **Hover**: Text color shift

### EmptyState
- Illustration (simple SVG)
- Headline + description
- Action button

### Toast/Notification
- **Success**: Green accent, checkmark icon
- **Error**: Red accent, X icon
- **Info**: Blue accent, info icon
- Auto-dismiss after 3s, manual dismiss available

## Technical Approach

### Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: CSS Modules + CSS Variables
- **State**: React Context + useReducer for global state
- **Data Fetching**: Server Components + client-side SWR for live updates
- **Storage**: localStorage for saved items, IndexedDB for history
- **API**: HN official API (https://hacker-news.firebaseio.com/v0/)

### API Design

#### Internal API Routes

```
GET /api/stories
  Query: type (top|new|best|ask|show|jobs), limit, page
  Response: { stories: Story[], nextPage: number | null }

GET /api/stories/[id]
  Response: Story with full details

GET /api/stories/[id]/comments
  Query: limit (default 20), sort (score|time)
  Response: { comments: Comment[], hasMore: boolean }
```

#### Data Models

```typescript
interface Story {
  id: number;
  title: string;
  url?: string;
  text?: string;
  by: string;
  score: number;
  descendants: number;
  time: number;
  type: 'story' | 'job' | 'poll';
  kids?: number[]; // comment IDs
}

interface Comment {
  id: number;
  by: string;
  text: string;
  time: number;
  score: number;
  kids?: number[];
  parent: number;
  deleted?: boolean;
  dead?: boolean;
}
```

### Performance Considerations
- ISR for initial story fetches (revalidate every 5 min)
- Client-side caching with SWR
- Lazy load comments on scroll
- Virtualized list for large feeds
- Preload next page during scroll

### Data Flow
1. Initial load: Server fetches top stories
2. Client hydrates with cached data
3. Background refresh checks for new stories
4. User interactions update local storage + optimistic UI
5. Comments fetched on-demand when story opened

# YCHacker

A sophisticated learning platform that transforms Hacker News content into digestible, structured knowledge. Instead of endless scrolling, discover, read, and learn from top stories with insightful comments.

![YCHacker](https://img.shields.io/badge/Built%20with-Next.js-000000?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript)
![Hacker News](https://img.shields.io/badge/API-Hacker%20News-fc6604?style=flat-square&logo=ycombinator)

## Features

- **Multiple Feeds**: Browse Top, New, Best, Ask HN, Show HN, and Jobs stories
- **Threaded Comments**: Collapsible comment threads sorted by score
- **Save Stories**: Bookmark stories for later reading (persisted to localStorage)
- **Dark/Light Theme**: Toggle between themes with automatic persistence
- **Infinite Scroll**: Load more stories as you scroll
- **Mobile Responsive**: Optimized for desktop, tablet, and mobile

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules with CSS Variables
- **Data Fetching**: SWR for client-side caching
- **API**: [Hacker News Firebase API](https://github.com/HackerNews/API)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ychacker.git
cd ychacker

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start browsing.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/stories/route.ts    # API route for fetching HN stories
│   ├── story/[id]/page.tsx     # Story detail page
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Main dashboard
│   └── globals.css              # Global styles & design system
├── components/
│   ├── Header.tsx               # Navigation & search bar
│   ├── StoryCard.tsx            # Story card component
│   └── CommentThread.tsx         # Threaded comment display
├── context/
│   └── AppContext.tsx           # Global state (saved, theme)
├── lib/
│   ├── api.ts                   # Hacker News API utilities
│   └── types.ts                 # TypeScript type definitions
└── types/
    └── declarations.d.ts         # CSS module declarations
```

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│  Browser                                            │
│  ┌──────────────┐    ┌──────────────┐               │
│  │   SWR Cache │◄────│  API Route   │              │
│  │  (in-memory) │     │ /api/stories │              │
│  └──────────────┘     └──────┬───────┘              │
│                              │                      │
│                     ┌────────▼────────┐             │
│                     │ Hacker News API│             │
│                     │  firebaseio.com │             │
│                     └─────────────────┘             │
└─────────────────────────────────────────────────────┘
```

- Stories are fetched from HN API and cached in memory via SWR
- Saved stories are persisted to `localStorage`
- Theme preference is persisted to `localStorage`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [Hacker News](https://news.ycombinator.com/) for providing the API
- [Y Combinator](https://www.ycombinator.com/) for supporting the startup community

# Frontend Extension Plan - Next.js Report Viewer

## 🎯 Goals

Create a Next.js web application that:

1. Displays the generated report in a clean, modern UI
2. Shows the social media image prominently
3. Uses existing cached data (no new API calls)
4. Provides a better reading experience than raw markdown

## 🏗️ Architecture

### Tech Stack

- **Next.js 15** (App Router)
- **TypeScript** (already configured)
- **Material-UI (MUI)** (for components and styling)
- **Emotion** (CSS-in-JS for MUI)

### File Structure

```
/
├── src/                      # Backend (existing)
│   ├── index.ts
│   └── types.ts
├── app/                      # Next.js frontend
│   ├── layout.tsx
│   ├── page.tsx             # Main report viewer
│   ├── api/
│   │   ├── report/
│   │   │   └── route.ts     # API to read cached data
│   │   └── static/
│   │       └── [...path]/
│   │           └── route.ts # Serve static files
│   └── components/
│       └── ReportViewer.tsx
├── output/                   # Generated files
│   ├── REPORT.md
│   └── social-media-image.png
└── cache/                    # Cached responses
```

## 📋 Implementation Overview

### 1. API Routes

**`app/api/report/route.ts`**

- Reads cached data from `cache/*.json` files
- Parses `data/flow.json` for flow metadata
- Returns structured JSON with interactions, summary, and image path

**`app/api/static/[...path]/route.ts`**

- Serves files from `output/` directory
- Handles images and markdown files
- Sets appropriate Content-Type headers

### 2. Frontend Components

**`app/page.tsx`**

- Sets up MUI ThemeProvider with custom theme
- Brand colors: primary (#2142e7), secondary (#9333ea)
- Renders ReportViewer component

**`app/components/ReportViewer.tsx`**

- Fetches data from `/api/report` endpoint
- Displays four main sections:
  1. Hero image (social media image)
  2. Flow overview (metadata cards)
  3. User interactions (numbered timeline list)
  4. Summary (gradient background card)
- Uses MUI components: Container, Card, Box, List, Typography
- Includes loading states and error handling

### 3. Styling Approach

- Material Design with MUI components
- Gradient backgrounds for visual interest
- Responsive layout with breakpoints
- Timeline visualization for interactions
- Numbered badges for step sequence
- Icon integration (Timeline, Assessment, CalendarToday, Insights)

## 🎨 UI Layout

```
┌─────────────────────────────────────────┐
│  Arcade Flow Analysis                   │
│  ─────────────────────────────────      │
│                                         │
│  [Social Media Image - Full Width]      │
│                                         │
│  Flow Overview Card                     │
│    • Flow Name, ID, Total Steps, Date   │
│                                         │
│  User Interactions Card                 │
│    1. Step one description              │
│    2. Step two description              │
│    ...                                  │
│                                         │
│  Summary Card (Gradient Background)     │
│    AI-generated summary text            │
│                                         │
└─────────────────────────────────────────┘
```

## 💡 Key Features

- **Zero API Costs**: Reads from cached files only
- **Fast Loading**: Static data from previous runs
- **Responsive Design**: Works on mobile and desktop
- **Professional UI**: Material Design components
- **Timeline View**: Visual representation of user journey
- **Error Handling**: Graceful fallbacks for missing data

## 🚀 Usage

### Development

```bash
npm run web        # Start Next.js dev server (port 3000)
npm run dev        # Run backend analysis (generates cache)
```

### Production

```bash
npm run web:build  # Build Next.js app
npm run web:start  # Start production server
```

## 🔄 Future Enhancements

- Add file upload for new flow.json
- Trigger backend analysis from UI
- Real-time progress updates with websockets
- Export report as PDF
- Multiple report history/comparison view
- Dark/light theme toggle

## � Configuration Notes

- **Separate TypeScript configs**: `tsconfig.json` for Next.js, `tsconfig.backend.json` for backend
- **Next.js rewrites**: `/output/*` → `/api/static/*` for image serving
- **Module resolution**: Uses bundler mode for Next.js compatibility
- **Git ignore**: `.next/`, `out/`, and debug logs excluded

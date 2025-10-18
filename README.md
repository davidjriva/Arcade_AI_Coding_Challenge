# Arcade AI Coding Challenge - Complete Solution

My submission for Arcade's AI Coding Challenge with backend analysis and web frontend.

## 🎯 Features

This solution analyzes Arcade flow recordings and generates:

1. **Human-readable user interactions** - Chronological list of all actions
2. **Flow summary** - AI-generated description of user goals
3. **Social media image** - Professional, brand-aware image for sharing
4. **Markdown report** - Complete analysis in `output/REPORT.md`
5. **Web interface** - Beautiful Material-UI frontend to view reports

## Quick Start

### Prerequisites

- Node.js (v18+)
- OpenAI API key saved in a file named `.env.local` as:

```
OPENAI_API_KEY=your-openai-key-here
```

### Installation

```bash
# Install dependencies
npm install

# Reminder: Make sure you created the file .env.local with your Open AI API key.
#           See above section "Prerequisites" for further details.
```

### Usage

#### Backend Analysis

```bash
# Run analysis (development mode)
npm run dev

# Or build and run
npm run build
npm start

# Or use the combined command
npm run analyze
```

#### Web Frontend

```bash
# Start the Next.js development server
npm run web

# Open http://localhost:3000 in your browser

# Build for production
npm run web:build
npm run web:start
```

### Output

- **output/REPORT.md** - Main deliverable with all analysis
- **output/social-media-image.png** - Generated image
- **cache/** – Cached API responses (included so you can inspect results without running the code)

## Cost Optimization

The solution includes smart caching:

- **First run**: ~$0.01-$0.03 (GPT-4o-mini + DALL-E 3 calls)
- **Subsequent runs**: $0.00 (uses cache)
- Clear cache: `rm -rf cache/`

## 📁 Project Structure

```
/
├── src/                      # Backend analysis
│   ├── index.ts             # Main analysis script
│   └── types.ts             # TypeScript interfaces
├── app/                      # Next.js frontend
│   ├── page.tsx             # Main page with MUI theme
│   ├── layout.tsx           # Root layout
│   ├── components/
│   │   └── ReportViewer.tsx # Report display component
│   └── api/
│       ├── report/
│       │   └── route.ts     # API to read cached data
│       └── static/
│           └── [...path]/
│               └── route.ts # Serve output files
├── data/
│   └── flow.json            # Input flow data
├── cache/                   # Cached API responses
├── output/                  # Generated files
│   ├── REPORT.md           # Markdown report
│   └── social-media-image.png # AI-generated image
├── docs/                    # Documentation
│   ├── MVP.md              # MVP implementation plan
│   ├── FRONTEND_PLAN.md    # Frontend architecture
│   └── INTERVIEW_SPECIFICATION.md
└── .env.local              # API keys (gitignored)
```

## 🛠️ Technology Stack

**Backend:**

- **TypeScript** - Type-safe code
- **OpenAI SDK** - GPT-4o-mini for analysis, DALL-E 3 for images
- **Node.js** - Runtime environment
- **File-based caching** - Cost optimization

**Frontend:**

- **Next.js 14** - React framework with App Router
- **Material-UI (MUI)** - React component library
- **Emotion** - CSS-in-JS styling
- **TypeScript** - Type safety across the stack

## 📜 Available Scripts

**Backend:**

- `npm run dev` - Run analysis with ts-node (development)
- `npm run build` - Compile TypeScript backend
- `npm start` - Run compiled JavaScript
- `npm run analyze` - Build and run backend

**Frontend:**

- `npm run web` - Start Next.js dev server (port 3000)
- `npm run web:build` - Build Next.js for production
- `npm run web:start` - Start Next.js production server

**Code Quality:**

- `npm run lint` - Check code quality with ESLint
- `npm run format` - Format code with Prettier

## Security

- API keys stored in `.env.local` (gitignored)
- No credentials committed to version control
- Pre-commit hooks ensure code quality

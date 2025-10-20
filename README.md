# Arcade AI Coding Challenge

My submission for Arcade's AI Coding Challenge. This analyzes Arcade flow recordings with OpenAI and provides a web interface to upload, view, and manage flow analysis reports.

## Quick Start

### Setup

```bash
# Install dependencies
npm install

# Add your OpenAI API key to .env.local
echo "OPENAI_API_KEY=your-key-here" > .env.local
```

### Run the App

```bash
npm run web
```

Open http://localhost:3000 and you'll see:

- Upload section to analyze new flow.json files
- Grid of existing reports with thumbnails
- Click any report to view detailed analysis

That's it! The app handles everything else.

## What It Does

Each flow analysis generates:

- **User interactions** - Chronological list of actions ("Clicked search", "Added to cart", etc.)
- **Summary** - AI description of what the user was trying to accomplish
- **Social media image** - DALL-E generated visualization
- **Markdown report** - Complete analysis saved to disk

## Cost Optimization

Smart caching means:

- First analysis: ~$0.01-$0.03 (GPT-4o-mini + DALL-E 3)
- Same file again: $0.00 (duplicate detection)
- Cached results: $0.00 (reuses API responses)

Clear cache with `rm -rf cache/` if needed.

## Backend CLI (Optional)

If you want to run the analysis script directly:

```bash
# Analyze the default example
npm run dev

# Or specify a custom flow file
FLOW_FILE=./data/your-flow.json npm start
```

## Project Structure

```
app/                    # Next.js frontend
  components/           # React components (HomePage, ReportViewer, etc.)
  api/                  # API routes (analyze, delete, reports)
  hooks/                # Custom React hooks
src/                    # Backend analysis script
  index.ts              # Main analysis logic
  types.ts              # TypeScript types
data/                   # Uploaded flow JSON files
output/                 # Generated reports and images
cache/                  # Cached API responses
examples/               # Sample flow files
```

## Tech Stack

- Next.js 15 + Material-UI + TypeScript
- OpenAI (GPT-4o-mini for analysis, DALL-E 3 for images)
- File-based caching with MD5 hashing
- Node.js backend with modular React components

## Future Improvements

- GPT-4 vision integration:
  - Analyze screenshots from flow steps instead of just metadata.
  - Provide much richer, more accurate analysis.
- Compare multiple flows:
  - Side-by-side comparison view.
  - Use AI to identify common patterns across different user journeys.
  - Useful for A/B testing or tracking UX changes over time.
- Search and filter reports.
- Export reports as PDF.
- Bulk upload multiple flows & process in parallel.

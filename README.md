# Arcade AI Coding Challenge - MVP Solution

My submission for Arcade's AI Coding Challenge.

## Features

This solution analyzes Arcade flow recordings and generates:

1. A human-readable list of interactions in chronological order.
2. An AI-generated description of user goals.
3. Professional image suitable for sharing across social media.

4. **Human-readable user interactions** - Chronological list of all actions
5. **Flow summary** - AI-generated description of user goals
6. **Social media image** - Professional image suitable for sharing
7. **Markdown report** - Complete analysis in `output/REPORT.md`

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

```bash
# Run analysis (development mode)
npm run dev

# Or build and run
npm run build
npm start

# Or use the combined (build + start) command
npm run analyze
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

## Project Structure

```
/
├── src/
│   ├── index.ts              # Main script
│   └── types.ts              # TypeScript interfaces
├── data/
│   └── flow.json            # Input flow data
├── cache/                    # Cached API responses
├── output/                   # Generated image and analysis report
├── docs/                     # Documentation
│   ├── MVP.md               # MVP plan
│   └── INTERVIEW_SPECIFICATION.md # Instructions for Arcade AI interview
├── .env.local               # API keys (not committed)
```

## Technology Stack

- **TypeScript** - Type-safe code
- **OpenAI SDK** - GPT-4o-mini for analysis, DALL-E 3 for images
- **Node.js** - Runtime environment
- **File-based caching** - Cost optimization

## Available Scripts

- `npm run dev` - Run with ts-node (development)
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled JavaScript
- `npm run analyze` - Build and run
- `npm run lint` - Check code quality
- `npm run format` - Format code with Prettier

## Security

- API keys stored in `.env.local` (gitignored)
- No credentials committed to version control
- Pre-commit hooks ensure code quality

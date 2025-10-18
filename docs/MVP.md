# Arcade AI Challenge - MVP Plan

## 🎯 MVP Goals

Build the **simplest solution** that meets all core requirements:

1. ✅ Parse flow.json
2. ✅ List user interactions (human-readable)
3. ✅ Generate summary of user goals
4. ✅ Create social media image
5. ✅ Output REPORT.md

## 🏗️ Simplified Architecture

### Tech Stack

- **TypeScript** (already configured)
- **OpenAI SDK** (GPT-4 for analysis, DALL-E 3 for images)
- **Simple file-based caching** (JSON files)
- **dotenv** for API key management

### Minimal File Structure

```
/
├── src/
│   ├── index.ts              # Main script (all logic here)
│   └── types.ts              # Flow data types
├── cache/                    # Cached responses (gitignored)
├── output/                   # Generated files
├── data/
│   └── flow.json            # Input data
├── .env                     # API key (gitignored)
├── .env.example             # Template
└── REPORT.md                # Final output
```

## 📝 Implementation Steps

### Step 1: Setup (15 min)

```bash
# Install dependencies
npm install openai dotenv fs-extra

# Create directories
mkdir -p src cache output data

# Setup environment
echo "OPENAI_API_KEY=your-key-here" > .env.example
```

**Update .gitignore:**

```
.env
cache/
output/*.png
```

**Create .env file** (not committed):

```
OPENAI_API_KEY=sk-...
```

### Step 2: Type Definitions (10 min)

**`src/types.ts`** - Just the essentials:

```typescript
export interface FlowData {
  id: string;
  title?: string;
  steps: FlowStep[];
  // Add other fields as discovered
}

export interface FlowStep {
  type: string; // IMAGE, CHAPTER, VIDEO, etc.
  data: any; // Keep flexible for now
  metadata?: {
    click?: any;
    timestamp?: number;
    // Add as needed
  };
}

export interface AnalysisResult {
  interactions: string[];
  summary: string;
  imageUrl: string;
}
```

### Step 3: Main Script (2-3 hours)

**`src/index.ts`** - Single file with all logic:

```typescript
import OpenAI from 'openai';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import dotenv from 'dotenv';
import { FlowData, AnalysisResult } from './types';

dotenv.config();

// Constants
const CACHE_DIR = './cache';
const OUTPUT_DIR = './output';
const FLOW_FILE = './data/flow.json';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple cache helpers
function getCacheKey(data: any): string {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

function getCache(key: string): any | null {
  try {
    const cachePath = path.join(CACHE_DIR, `${key}.json`);
    if (fs.existsSync(cachePath)) {
      return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    }
  } catch (e) {
    console.log('Cache miss:', key);
  }
  return null;
}

function setCache(key: string, data: any): void {
  fs.ensureDirSync(CACHE_DIR);
  const cachePath = path.join(CACHE_DIR, `${key}.json`);
  fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
}

// Core functions
async function analyzeInteractions(flowData: FlowData): Promise<string[]> {
  const cacheKey = getCacheKey({ fn: 'interactions', data: flowData });
  const cached = getCache(cacheKey);
  if (cached) {
    console.log('✓ Using cached interactions');
    return cached;
  }

  console.log('→ Analyzing user interactions...');

  const prompt = `Analyze this Arcade flow recording and list ALL user interactions in human-readable format.

Flow Data:
${JSON.stringify(flowData, null, 2)}

Instructions:
- List each user action chronologically
- Use natural language (e.g., "Clicked on checkout button", "Searched for 'laptop'")
- Be specific about what the user did
- Format as a numbered list

Return ONLY the numbered list, no other text.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  const content = response.choices[0].message.content || '';
  const interactions = content
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => line.replace(/^\d+\.\s*/, '').trim());

  setCache(cacheKey, interactions);
  return interactions;
}

async function generateSummary(
  flowData: FlowData,
  interactions: string[]
): Promise<string> {
  const cacheKey = getCacheKey({ fn: 'summary', data: flowData });
  const cached = getCache(cacheKey);
  if (cached) {
    console.log('✓ Using cached summary');
    return cached;
  }

  console.log('→ Generating summary...');

  const prompt = `Based on these user interactions, write a 2-3 sentence summary of what the user was trying to accomplish.

User Actions:
${interactions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

Write a clear, concise summary of the user's goal.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
  });

  const summary = response.choices[0].message.content || '';
  setCache(cacheKey, summary);
  return summary;
}

async function generateSocialImage(
  flowData: FlowData,
  summary: string
): Promise<string> {
  const cacheKey = getCacheKey({ fn: 'image', summary });
  const cached = getCache(cacheKey);
  if (cached && fs.existsSync(cached)) {
    console.log('✓ Using cached image');
    return cached;
  }

  console.log('→ Generating social media image...');

  const imagePrompt = `Create a professional social media image for this workflow:

${summary}

Style: Modern, clean, tech-focused, professional
Suitable for: LinkedIn, Twitter, product announcements
Include: Visual metaphor or illustration representing the workflow`;

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: imagePrompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  });

  const imageUrl = response.data[0].url;
  if (!imageUrl) throw new Error('No image URL returned');

  // Download image
  const imageResponse = await fetch(imageUrl);
  const buffer = Buffer.from(await imageResponse.arrayBuffer());

  fs.ensureDirSync(OUTPUT_DIR);
  const imagePath = path.join(OUTPUT_DIR, 'social-media-image.png');
  fs.writeFileSync(imagePath, buffer);

  setCache(cacheKey, imagePath);
  return imagePath;
}

function generateReport(
  flowData: FlowData,
  interactions: string[],
  summary: string,
  imagePath: string
): void {
  console.log('→ Generating report...');

  const report = `# Arcade Flow Analysis Report

## 📊 Flow Overview
- **Flow ID**: ${flowData.id || 'N/A'}
- **Total Steps**: ${flowData.steps?.length || 0}
- **Analysis Date**: ${new Date().toLocaleString()}

## 👤 User Interactions

${interactions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

## 🎯 Summary

${summary}

## 🖼️ Social Media Image

![Flow Visualization](${imagePath})

---

*Generated with GPT-4 and DALL-E 3*
`;

  fs.writeFileSync('REPORT.md', report);
  console.log('✓ Report saved to REPORT.md');
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting Arcade Flow Analysis...\n');

    // Load flow data
    console.log('→ Loading flow.json...');
    const flowData: FlowData = JSON.parse(fs.readFileSync(FLOW_FILE, 'utf-8'));
    console.log(`✓ Loaded ${flowData.steps?.length || 0} steps\n`);

    // Analyze
    const interactions = await analyzeInteractions(flowData);
    console.log(`✓ Found ${interactions.length} interactions\n`);

    const summary = await generateSummary(flowData, interactions);
    console.log(`✓ Generated summary\n`);

    const imagePath = await generateSocialImage(flowData, summary);
    console.log(`✓ Created image: ${imagePath}\n`);

    // Generate report
    generateReport(flowData, interactions, summary, imagePath);

    console.log('\n✅ Analysis complete! Check REPORT.md');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
```

### Step 4: Package.json Scripts (5 min)

Add to `package.json`:

```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js",
  "dev": "ts-node src/index.ts",
  "analyze": "npm run build && npm start"
}
```

Install ts-node for development:

```bash
npm install --save-dev ts-node
```

## 🚀 Usage

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env and add your OpenAI API key

# 2. Place flow.json in data/ directory

# 3. Run analysis
npm run dev

# 4. Check outputs
# - REPORT.md (main deliverable)
# - output/social-media-image.png
```

## 💰 Cost Optimization

### Simple Caching Strategy

- Cache based on MD5 hash of input
- Three cache types:
  1. `interactions-{hash}.json` - Parsed interactions
  2. `summary-{hash}.json` - Generated summary
  3. `image-{hash}.json` - Image file path (image saved separately)
- Manual cache clearing: `rm -rf cache/`

### Expected Costs (per run without cache)

- GPT-4 analysis: ~$0.10-0.30
- DALL-E 3: ~$0.04
- **Total: ~$0.14-0.34 per full run**
- **With cache: $0.00 for repeated runs** ✅

## ✅ Success Checklist

MVP is complete when:

- [ ] Script runs without errors
- [ ] REPORT.md is generated with all sections
- [ ] User interactions are human-readable
- [ ] Summary accurately describes user goal
- [ ] Social media image is created and saved
- [ ] Second run uses cache (faster, no API calls)
- [ ] No .env file in git
- [ ] Clean commit history

## 🔄 Extension Points (If Time Permits)

### Easy Additions:

1. **Better error handling** - Try/catch with fallbacks
2. **CLI arguments** - `--no-cache`, `--output-dir`
3. **Image metadata in steps** - Use GPT-4 Vision for screenshots
4. **Prettier formatting** - Format the REPORT.md output
5. **Multiple flows** - Process array of flows

### Medium Additions:

1. **Separate service files** - Split into modules
2. **Better type safety** - Strict flow.json types after seeing structure
3. **Progress indicators** - Spinners for long operations
4. **HTML report** - Alternative output format

## 📦 Final Dependencies

```bash
npm install openai dotenv fs-extra
npm install --save-dev @types/fs-extra ts-node
```

## ⏱️ Time Estimate

- **Setup & dependencies**: 15 min
- **Core implementation**: 2 hours
- **Testing & refinement**: 30 min
- **Documentation**: 15 min
- **Total: ~3 hours for MVP**

## 🎯 Key Simplifications from Full Plan

1. **Single file** instead of multiple services
2. **Simple MD5 caching** instead of complex cache manager
3. **Basic types** instead of comprehensive interfaces
4. **Inline logic** instead of separate utilities
5. **Focus on working code** over perfect architecture

This MVP can be extended later without rewriting!

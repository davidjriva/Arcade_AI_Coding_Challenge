import OpenAI from 'openai';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import dotenv from 'dotenv';
import { FlowData } from './types';

dotenv.config({ path: '.env.local' });

const CACHE_DIR = './cache';
const OUTPUT_DIR = './output';
const FLOW_FILE = './data/flow.json';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Creates a cache key based on input data
function getCacheKey(data: unknown): string {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

// Retrieves a file from the cache if it exists based on the key
function getCache(key: string): unknown {
  try {
    const cachePath = path.join(CACHE_DIR, `${key}.json`);
    if (fs.existsSync(cachePath)) {
      console.log(`  ↻ Cache hit: ${key.substring(0, 8)}...`);
      return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    }
  } catch {
    console.log(`  ⊘ Cache miss: ${key.substring(0, 8)}...`);
  }
  return null;
}

// Saves data to cache with the given key
function setCache(key: string, data: unknown): void {
  fs.ensureDirSync(CACHE_DIR);
  const cachePath = path.join(CACHE_DIR, `${key}.json`);
  fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
  console.log(`  ✓ Cached result: ${key.substring(0, 8)}...`);
}

async function analyzeInteractions(flowData: FlowData): Promise<string[]> {
  const cacheKey = getCacheKey({ fn: 'interactions', data: flowData });
  const cached = getCache(cacheKey);
  if (cached) {
    return cached as string[];
  }

  console.log('  → Calling GPT-4o-mini to analyze interactions...');

  const prompt = `Analyze this Arcade flow recording and list ALL user interactions in human-readable format.

    Flow Data:
    ${JSON.stringify(flowData, null, 2)}

    Instructions:
    - List each user action chronologically
    - Use natural language (e.g., "Clicked on checkout button", "Searched for 'laptop'")
    - Be specific about what the user did
    - Include page navigation, clicks, searches, form inputs
    - Format as a numbered list

    Return ONLY the numbered list, no other text.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  const content = response.choices[0].message.content || '';
  const interactions = content
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter((line) => line.length > 0);

  setCache(cacheKey, interactions);
  return interactions;
}

async function generateSummary(
  flowData: FlowData,
  interactions: string[]
): Promise<string> {
  const cacheKey = getCacheKey({ fn: 'summary', interactions });
  const cached = getCache(cacheKey);
  if (cached) {
    return cached as string;
  }

  console.log('  → Calling GPT-4o-mini to generate summary...');

  const prompt = `Based on these user interactions, write a 2-3 sentence summary of what the user was trying to accomplish.

    Flow Title: ${flowData.name || 'Unknown'}
    Flow Description: ${flowData.description || 'N/A'}

    User Actions:
    ${interactions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

    Write a clear, concise summary of the user's goal and what they accomplished.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5, // Higher temperature than analyzeInteractions() for a more creative summary leading to a more engaging, human-like response.
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
  if (cached && typeof cached === 'string' && fs.existsSync(cached)) {
    return cached;
  }

  console.log('  → Calling DALL-E 3 to generate social media image...');

  const imagePrompt = `Create a modern social media graphic about: ${summary}

    IMPORTANT: USE ONLY VISUAL SYMBOLS AND ICONS - **ABSOLUTELY NO TEXT, LETTERS, OR NUMBERS**.
    Style: Clean, minimalist, use the brand colors of the company mentioned above (i.e. Target has brand colors of red & white).
    Composition: Simple icons and geometric shapes floating on a gradient background
    Aesthetic: Professional tech startup illustration, abstract and symbolic

    Create an eye-catching abstract illustration.`;

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: imagePrompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) throw new Error('No image URL returned');

  console.log('  → Downloading image...');
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
  summary: string
): void {
  console.log('  → Generating markdown report...');

  const createdDate = flowData.created
    ? new Date(flowData.created._seconds * 1000).toLocaleString()
    : 'Unknown';

  const report = `# Arcade Flow Analysis Report

    ## 📊 Flow Overview

    - **Flow Name**: ${flowData.name || 'N/A'}
    - **Flow ID**: ${flowData.uploadId || 'N/A'}
    - **Description**: ${flowData.description || 'N/A'}
    - **Total Steps**: ${flowData.steps?.length || 0}
    - **Created**: ${createdDate}
    - **Analysis Date**: ${new Date().toLocaleString()}

    ## 👤 User Interactions

    ${interactions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

    ## 🎯 Summary

    ${summary}

    ## 🖼️ Social Media Image

    ![Flow Visualization](social-media-image.png)

    ---

    *Generated with GPT-4o-mini and DALL-E 3*
    `;

  const outputPath = path.join(OUTPUT_DIR, 'REPORT.md');
  fs.writeFileSync(outputPath, report);
  console.log(`  ✓ Report saved to ${outputPath}`);
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting Arcade Flow Analysis...\n');

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        'OPENAI_API_KEY not found in environment variables. Please check your .env file.'
      );
    }

    // Load flow data
    console.log('📂 Loading flow.json...');
    if (!fs.existsSync(FLOW_FILE)) {
      throw new Error(`Flow file not found: ${FLOW_FILE}`);
    }

    const flowData: FlowData = JSON.parse(fs.readFileSync(FLOW_FILE, 'utf-8'));
    console.log(`  ✓ Loaded flow: "${flowData.name || 'Untitled'}"`);
    console.log(`  ✓ Found ${flowData.steps?.length || 0} steps\n`);

    // Analyze interactions
    console.log('🔍 Analyzing user interactions...');
    const interactions = await analyzeInteractions(flowData);
    console.log(`  ✓ Extracted ${interactions.length} interactions\n`);

    // Generate summary
    console.log('📝 Generating summary...');
    const summary = await generateSummary(flowData, interactions);
    console.log(`  ✓ Generated summary\n`);

    // Generate social media image
    console.log('🎨 Creating social media image...');
    const imagePath = await generateSocialImage(flowData, summary);
    console.log(`  ✓ Image saved: ${imagePath}\n`);

    // Generate report
    console.log('📄 Generating report...');
    generateReport(flowData, interactions, summary);

    console.log('\n✅ Analysis complete! Check REPORT.md for results.');
    console.log('💡 Run again to use cached results (no API calls needed).\n');
  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error instanceof Error) {
      console.error('   ', error.message);
    }
    process.exit(1);
  }
}

main();

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate JSON
    const text = await file.text();
    let flowData;
    try {
      flowData = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON file' }, { status: 400 });
    }

    // Validate it has the expected structure
    if (!flowData.steps || !Array.isArray(flowData.steps)) {
      return NextResponse.json(
        { error: 'Invalid flow.json structure - missing steps array' },
        { status: 400 }
      );
    }

    // Check for duplicates by uploadId or content hash
    const dataDir = path.join(process.cwd(), 'data');
    const uploadId = flowData.uploadId;
    const contentHash = crypto.createHash('md5').update(text).digest('hex');

    // Check existing files for duplicates
    if (fs.existsSync(dataDir)) {
      const existingFiles = fs
        .readdirSync(dataDir)
        .filter((f) => f.endsWith('.json') && f.startsWith('flow-'));

      for (const existingFile of existingFiles) {
        const existingPath = path.join(dataDir, existingFile);
        const existingData = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
        const existingHash = crypto
          .createHash('md5')
          .update(fs.readFileSync(existingPath, 'utf-8'))
          .digest('hex');

        // Check if uploadId matches or content is identical
        if (
          (uploadId && existingData.uploadId === uploadId) ||
          existingHash === contentHash
        ) {
          const existingReportId = existingFile.replace('.json', '');
          console.log(
            `Duplicate detected: ${existingReportId}. Skipping analysis.`
          );
          return NextResponse.json({
            success: true,
            reportId: existingReportId,
            message: 'Report already exists',
            isDuplicate: true,
          });
        }
      }
    }

    // Generate unique ID based on timestamp
    const reportId = `flow-${Date.now()}`;
    const outputDir = path.join(process.cwd(), 'output', reportId);

    // Ensure directories exist
    fs.ensureDirSync(dataDir);
    fs.ensureDirSync(outputDir);

    // Save the flow file
    const flowPath = path.join(dataDir, `${reportId}.json`);
    fs.writeFileSync(flowPath, text);

    // Run the analysis script with the specific file
    console.log(`Starting analysis for ${reportId}...`);

    // First compile the TypeScript if dist doesn't exist or is outdated
    const distPath = path.join(process.cwd(), 'dist', 'index.js');
    if (!fs.existsSync(distPath)) {
      console.log('Compiling TypeScript backend...');
      await execAsync('npm run build', {
        cwd: process.cwd(),
        timeout: 30000,
      });
    }

    // Run the compiled JavaScript
    const { stdout, stderr } = await execAsync(
      `FLOW_FILE="${flowPath}" OUTPUT_DIR="${outputDir}" CACHE_DIR="${path.join(process.cwd(), 'cache')}" node dist/index.js`,
      {
        cwd: process.cwd(),
        timeout: 120000, // 2 minute timeout
        env: {
          ...process.env,
          FLOW_FILE: flowPath,
          OUTPUT_DIR: outputDir,
          CACHE_DIR: path.join(process.cwd(), 'cache'),
        },
      }
    );

    if (stderr && !stderr.includes('DeprecationWarning')) {
      console.error('Analysis stderr:', stderr);
    }

    console.log('Analysis output:', stdout);

    // Verify output was generated
    const reportPath = path.join(outputDir, 'REPORT.md');

    if (!fs.existsSync(reportPath)) {
      throw new Error('Report generation failed - no output file created');
    }

    return NextResponse.json({
      success: true,
      reportId,
      message: 'Analysis complete',
    });
  } catch (error) {
    console.error('Error during analysis:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze flow',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

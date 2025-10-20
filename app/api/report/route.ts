import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get reportId from query params (e.g., /api/report?id=flow-123456)
    const searchParams = request.nextUrl.searchParams;
    const reportId = searchParams.get('id') || 'flow'; // Default to 'flow' for legacy support

    // Determine paths based on reportId
    const flowPath = path.join(process.cwd(), 'data', `${reportId}.json`);
    const outputDir = path.join(
      process.cwd(),
      'output',
      reportId === 'flow' ? '' : reportId
    );
    const metadataPath = path.join(outputDir, 'cache-metadata.json');
    const cacheDir = path.join(process.cwd(), 'cache');

    // Check if flow file exists
    if (!fs.existsSync(flowPath)) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Read flow data
    const flowData = JSON.parse(fs.readFileSync(flowPath, 'utf-8'));

    // Read cached interaction data using metadata
    let interactions: string[] = [];
    let summary = '';

    if (fs.existsSync(metadataPath)) {
      // New method: read from metadata file
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

      const interactionsPath = path.join(
        cacheDir,
        `${metadata.interactionsCacheKey}.json`
      );
      const summaryPath = path.join(
        cacheDir,
        `${metadata.summaryCacheKey}.json`
      );

      if (fs.existsSync(interactionsPath)) {
        interactions = JSON.parse(fs.readFileSync(interactionsPath, 'utf-8'));
      }

      if (fs.existsSync(summaryPath)) {
        summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
      }
    } else {
      // Fallback: old method for legacy reports
      const cacheFiles = fs.readdirSync(cacheDir);

      for (const file of cacheFiles) {
        const filePath = path.join(cacheDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        if (Array.isArray(data)) {
          interactions = data;
        } else if (typeof data === 'string' && data.length > 100) {
          summary = data;
        }
      }
    }

    return NextResponse.json({
      flowName: flowData.name || 'Unknown Flow',
      flowId: flowData.uploadId || 'N/A',
      totalSteps: flowData.steps?.length || 0,
      interactions,
      summary,
      imagePath: `/output/${reportId === 'flow' ? '' : `${reportId}/`}social-media-image.png`,
      createdAt: flowData.created
        ? new Date(flowData.created._seconds * 1000).toISOString()
        : null,
    });
  } catch (error) {
    console.error('Error loading report data:', error);
    return NextResponse.json(
      { error: 'Failed to load report data' },
      { status: 500 }
    );
  }
}

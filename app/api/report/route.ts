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
    const cacheDir = path.join(process.cwd(), 'cache');

    // Check if flow file exists
    if (!fs.existsSync(flowPath)) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Read cached interaction data
    const cacheFiles = fs.readdirSync(cacheDir);

    // Find interaction and summary caches
    let interactions: string[] = [];
    let summary = '';

    for (const file of cacheFiles) {
      const filePath = path.join(cacheDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      if (Array.isArray(data)) {
        interactions = data;
      } else if (typeof data === 'string' && data.length > 100) {
        summary = data;
      }
    }

    // Read flow data
    const flowData = JSON.parse(fs.readFileSync(flowPath, 'utf-8'));

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

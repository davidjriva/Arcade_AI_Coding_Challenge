import { NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

interface ReportMetadata {
  id: string;
  flowName: string;
  flowId: string;
  totalSteps: number;
  createdAt: string;
  imagePath: string;
}

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const files = fs.readdirSync(dataDir);

    // Find all flow JSON files (supporting multiple reports)
    const flowFiles = files.filter(
      (file) => file.endsWith('.json') && file.startsWith('flow')
    );

    // If no numbered files exist, check for the original flow.json
    if (
      flowFiles.length === 0 &&
      fs.existsSync(path.join(dataDir, 'flow.json'))
    ) {
      flowFiles.push('flow.json');
    }

    const reports: ReportMetadata[] = [];

    for (const file of flowFiles) {
      try {
        const flowData = JSON.parse(
          fs.readFileSync(path.join(dataDir, file), 'utf-8')
        );

        // Generate a unique ID from the filename
        const id = file.replace('.json', '');

        // Check if corresponding output files exist
        const outputDir = path.join(
          process.cwd(),
          'output',
          id === 'flow' ? '' : id
        );
        const imagePath = fs.existsSync(
          path.join(outputDir, 'social-media-image.png')
        )
          ? `/output/${id === 'flow' ? '' : `${id}/`}social-media-image.png`
          : null;

        reports.push({
          id,
          flowName: flowData.name || 'Unknown Flow',
          flowId: flowData.uploadId || 'N/A',
          totalSteps: flowData.steps?.length || 0,
          createdAt: flowData.created
            ? new Date(flowData.created._seconds * 1000).toISOString()
            : new Date().toISOString(),
          imagePath: imagePath || '/placeholder.png',
        });
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }

    // Sort by creation date, newest first
    reports.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error listing reports:', error);
    return NextResponse.json(
      { error: 'Failed to list reports' },
      { status: 500 }
    );
  }
}

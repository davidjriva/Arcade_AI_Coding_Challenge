import { NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filePath = path.join(process.cwd(), 'output', ...pathSegments);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = fs.readFileSync(filePath);
    const ext = path.extname(filePath);

    const contentTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.md': 'text/markdown',
    };

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentTypes[ext] || 'application/octet-stream',
      },
    });
  } catch (error) {
    console.error('Error serving static file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}

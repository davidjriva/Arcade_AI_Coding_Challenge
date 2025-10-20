import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const OUTPUT_DIR = path.join(process.cwd(), 'output');

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // Construct file paths
    const dataFile = path.join(DATA_DIR, `${id}.json`);
    const outputDir = path.join(OUTPUT_DIR, id);

    // Check if files exist
    const dataExists = await fs.pathExists(dataFile);
    const outputExists = await fs.pathExists(outputDir);

    if (!dataExists && !outputExists) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Delete the data file
    if (dataExists) {
      await fs.remove(dataFile);
    }

    // Delete the output directory
    if (outputExists) {
      await fs.remove(outputDir);
    }

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}

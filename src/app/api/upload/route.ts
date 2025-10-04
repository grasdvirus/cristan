'use server';

import { writeFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file found' });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Define the upload directory and ensure it exists
  const uploadDir = join(process.cwd(), 'public/uploads');
  if (!existsSync(uploadDir)) {
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
       console.error('Error creating directory:', error);
       return NextResponse.json({ success: false, error: 'Error creating directory' }, { status: 500 });
    }
  }

  // Use a timestamp to make the filename unique
  const filename = `${Date.now()}-${file.name}`;
  const path = join(uploadDir, filename);


  try {
    await writeFile(path, buffer);
    console.log(`File saved to ${path}`);

    // Return the public URL
    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ success: false, error: 'Error saving file' }, { status: 500 });
  }
}

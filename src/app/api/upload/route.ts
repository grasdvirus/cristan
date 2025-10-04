
import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file found' });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename to avoid overwriting
    const filename = `${Date.now()}-${file.name}`;
    const path = join(process.cwd(), 'public/uploads', filename);
    
    await writeFile(path, buffer);
    console.log(`File saved to ${path}`);

    // Return the public path to the file
    const publicPath = `/uploads/${filename}`;
    return NextResponse.json({ success: true, path: publicPath });
  } catch (error: any) {
     console.error('Error saving file:', error);
     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file found' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `uploads/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const storageRef = ref(storage, filename);
  
  try {
    // Upload file to Firebase Storage
    await uploadBytes(storageRef, buffer, {
      contentType: file.type,
    });
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log(`File uploaded to Firebase Storage: ${downloadURL}`);
    return NextResponse.json({ success: true, url: downloadURL });
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
  }
}

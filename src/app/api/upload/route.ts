'use server';

import { writeFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'Aucun fichier trouvé.' }, { status: 400 });
  }

  // Vérifier la taille du fichier (12MB)
  if (file.size > 12 * 1024 * 1024) {
    return NextResponse.json({ success: false, error: 'Le fichier dépasse la limite de 12 Mo.' }, { status: 413 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), 'public/uploads');
  
  try {
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
  } catch (error) {
     console.error('Erreur lors de la création du dossier:', error);
     return NextResponse.json({ success: false, error: 'Erreur lors de la création du dossier sur le serveur.' }, { status: 500 });
  }

  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const path = join(uploadDir, filename);

  try {
    await writeFile(path, buffer);
    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du fichier:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la sauvegarde du fichier sur le serveur.' }, { status: 500 });
  }
}

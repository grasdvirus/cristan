
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Default categories to be created if none exist in the database
const defaultCategories = {
    articleCategories: [
        { id: 'web', label: 'Développement Web' },
        { id: 'mobile', label: 'Développement Mobile' },
        { id: 'generative', label: 'Art Génératif' },
        { id: '3d', label: 'Rendu 3D' },
    ],
    productCollections: [
        { id: 'soin-corporel', label: 'Soin Corporel' },
        { id: 'vetements', label: 'Vêtements' },
        { id: 'accessoires', label: 'Accessoires' },
    ],
    internetClasses: [
        { id: 'S', label: 'Classe S' },
        { id: 'A', label: 'Classe A' },
        { id: 'B', label: 'Classe B' },
        { id: 'C', label: 'Classe C' },
        { id: 'D', label: 'Classe D' },
    ],
    tvChannels: [
        { id: 'action', label: 'Action' },
        { id: 'divertissement', label: 'Divertissement' },
        { id: 'dessin-anime', label: 'Dessin Animé' },
    ],
};


export async function GET() {
  try {
    const categoriesDocRef = doc(db, 'config', 'categories');
    const categoriesDoc = await getDoc(categoriesDocRef);

    if (!categoriesDoc.exists()) {
      // If the document doesn't exist, create it with default values
      // Note: This write operation should ideally be done in a secure admin setup,
      // but for simplicity, we do it here. A better approach is a seed script.
      // For this app, update is restricted to admin, so GET can create the initial doc.
      // await setDoc(categoriesDocRef, defaultCategories); // setDoc is not imported for security reasons in a GET handler
      return NextResponse.json(defaultCategories);
    }
    
    return NextResponse.json(categoriesDoc.data());
    
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories', details: error.message }, { status: 500 });
  }
}

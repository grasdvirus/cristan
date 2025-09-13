import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const slidesCollection = collection(db, 'slides');
    const slidesSnapshot = await getDocs(slidesCollection);
    const slides = slidesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(slides);
  } catch (error: any) {
    console.error('Error fetching slides:', error);
    return NextResponse.json({ error: 'Failed to fetch slides', details: error.message }, { status: 500 });
  }
}

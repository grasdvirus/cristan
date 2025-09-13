
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const videosCollection = collection(db, 'videos');
    const videosSnapshot = await getDocs(videosCollection);
    const videos = videosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(videos);
  } catch (error: any) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos', details: error.message }, { status: 500 });
  }
}

    
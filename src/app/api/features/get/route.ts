
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export async function GET() {
  try {
    const featuresCollection = query(collection(db, 'features'), orderBy('createdAt', 'desc'));
    const featuresSnapshot = await getDocs(featuresCollection);
    const features = featuresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(features);
  } catch (error: any) {
    console.error('Error fetching features:', error);
    return NextResponse.json({ error: 'Failed to fetch features', details: error.message }, { status: 500 });
  }
}

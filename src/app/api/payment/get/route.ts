
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET() {
  try {
    const paymentDocRef = doc(db, 'config', 'payment');
    const paymentDoc = await getDoc(paymentDocRef);

    if (!paymentDoc.exists() || !paymentDoc.data().methods) {
      // Return default structure if not configured
      return NextResponse.json({
        methods: [
            { id: '1', name: 'ORANGE MONEY', details: '0102030405 (Admin)', color: '#FFA500' },
            { id: '2', name: 'WAVE', details: '0102030405', color: '#4DD2FF' },
        ]
      });
    }
    
    return NextResponse.json(paymentDoc.data());
    
  } catch (error: any) {
    console.error('Error fetching payment details:', error);
    return NextResponse.json({ error: 'Failed to fetch payment details', details: error.message }, { status: 500 });
  }
}

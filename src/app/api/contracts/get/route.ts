
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export async function GET() {
  try {
    const contractsCollection = query(collection(db, 'contracts'), orderBy('createdAt', 'desc'));
    const contractsSnapshot = await getDocs(contractsCollection);
    const contracts = contractsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(contracts);
  } catch (error: any) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json({ error: 'Failed to fetch contracts', details: error.message }, { status: 500 });
  }
}

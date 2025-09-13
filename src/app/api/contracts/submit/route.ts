
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, firstname, email, phone, reason } = body;

    if (!name || !firstname || !email || !phone || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    await addDoc(collection(db, 'contracts'), {
      name,
      firstname,
      email,
      phone,
      reason,
      createdAt: serverTimestamp(),
      status: 'pending',
    });

    return NextResponse.json({ success: true, message: 'Contract submitted successfully' });

  } catch (error: any) {
    console.error('Error submitting contract:', error);
    return NextResponse.json({ error: 'Failed to submit contract', details: error.message }, { status: 500 });
  }
}

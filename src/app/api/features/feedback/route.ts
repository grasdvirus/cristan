
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import type { FeatureFeedback } from '@/lib/features';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { featureId, text, authorId, authorEmail } = body;

    if (!featureId || !text || !authorId || !authorEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const featureRef = doc(db, 'features', featureId);

    const newFeedback: FeatureFeedback = {
      id: uuidv4(),
      text,
      authorId,
      authorEmail,
      createdAt: Timestamp.now(),
    };

    await updateDoc(featureRef, {
        feedback: arrayUnion(newFeedback)
    });
    
    const responseFeedback = {
        ...newFeedback,
        createdAt: {
            seconds: newFeedback.createdAt.seconds,
            nanoseconds: newFeedback.createdAt.nanoseconds
        }
    };

    return NextResponse.json({ success: true, message: 'Feedback submitted successfully', feedback: responseFeedback });

  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Failed to submit feedback', details: error.message }, { status: 500 });
  }
}

    
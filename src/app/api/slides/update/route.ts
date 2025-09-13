import { NextResponse } from 'next/server';

// This route is no longer used for writing data. 
// Firestore writes are now done directly from the client in the admin page
// to leverage the authenticated user's permissions.
// This file is kept to avoid breaking any potential old references, but it does nothing.

export async function POST(request: Request) {
  return NextResponse.json({ 
      success: false, 
      message: "This endpoint is deprecated. Writes are handled client-side." 
    }, 
    { status: 405 }
  );
}

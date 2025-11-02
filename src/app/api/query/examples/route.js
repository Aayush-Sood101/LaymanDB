import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { schema } = body;

    // Validate required fields
    if (!schema) {
      return NextResponse.json(
        { error: 'Schema is required' },
        { status: 400 }
      );
    }

    // Get backend URL from environment or default
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    
    // Forward request to backend
    const response = await fetch(`${backendUrl}/api/query/examples`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ schema }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to generate examples' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in query examples API route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

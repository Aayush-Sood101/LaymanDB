import { NextResponse } from 'next/server';

/**
 * Handle POST request to generate ER diagram using Gemini
 * @param {Request} req - The request object
 * @returns {Promise<NextResponse>} - The response object
 */
export async function POST(req) {
  try {
    const body = await req.json();
    
    if (!body.input) {
      return NextResponse.json(
        { success: false, error: 'Input text is required' },
        { status: 400 }
      );
    }
    
    // Forward the request to our backend API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/gemini/generate`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: body.input }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to generate ER diagram' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Gemini API route:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
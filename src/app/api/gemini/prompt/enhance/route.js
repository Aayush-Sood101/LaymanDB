import { NextResponse } from 'next/server';

/**
 * Handle POST request to enhance prompts using Gemini
 * @param {Request} req - The request object
 * @returns {Promise<NextResponse>} - The response object
 */
export async function POST(req) {
  try {
    const body = await req.json();
    
    if (!body.prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt text is required' },
        { status: 400 }
      );
    }
    
    // Forward the request to our backend API
    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/gemini/prompt/enhance`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: body.prompt }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Failed to enhance prompt' 
        },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Gemini prompt enhance API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred while enhancing your prompt' 
      },
      { status: 500 }
    );
  }
}
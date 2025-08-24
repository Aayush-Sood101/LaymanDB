import { getAuth } from "@clerk/nextjs/server";
import { Clerk } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

// Initialize Clerk with your secret key
const clerkClient = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get the prompt from the request body
    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    
    // Get user data from Clerk
    const user = await clerkClient.users.getUser(userId);
    const privateMetadata = user.privateMetadata || {};
    
    // Initialize if no metadata exists
    if (Object.keys(privateMetadata).length === 0) {
      await clerkClient.users.updateUser(userId, {
        privateMetadata: {
          freeTrialCount: 0,
          isPro: false,
          paidSchemaCredits: 0,
          subscriptionPlan: "Free"
        }
      });
    }
    
    // Check if the user has free trials left or is a pro user
    const freeTrialCount = privateMetadata.freeTrialCount || 0;
    const isPro = privateMetadata.isPro || false;
    const paidSchemaCredits = privateMetadata.paidSchemaCredits || 0;
    
    // If not a pro user and out of free trials
    if (!isPro && freeTrialCount >= 10) {
      return NextResponse.json({ 
        error: "You have used all your free trials. Please upgrade to continue."
      }, { status: 403 });
    }
    
    // If pro user but out of credits
    if (isPro && paidSchemaCredits <= 0) {
      return NextResponse.json({ 
        error: "You have used all your credits. Please purchase more to continue."
      }, { status: 403 });
    }
    
    // Forward the request to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${backendUrl}/api/schema/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    
    // Update the user's usage stats
    if (isPro) {
      // Decrement paid credits for pro users
      await clerkClient.users.updateUser(userId, {
        privateMetadata: {
          ...privateMetadata,
          paidSchemaCredits: Math.max(0, paidSchemaCredits - 1)
        }
      });
    } else {
      // Increment free trial count for free users
      await clerkClient.users.updateUser(userId, {
        privateMetadata: {
          ...privateMetadata,
          freeTrialCount: freeTrialCount + 1
        }
      });
    }
    
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error generating schema:", err);
    
    // Handle different types of errors
    if (err.name === 'AbortError') {
      return NextResponse.json({ 
        error: "Request timed out. Please try again with a simpler prompt."
      }, { status: 408 });
    }
    
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

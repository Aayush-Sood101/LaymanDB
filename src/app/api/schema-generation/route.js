import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { Clerk } from "@clerk/clerk-sdk-node";

// Initialize Clerk with your secret key
const clerkClient = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ 
        allowed: false,
        error: "Authentication required" 
      }, { status: 401 });
    }

    // Get user data from Clerk
    const user = await clerkClient.users.getUser(userId);

    // Get the user's private metadata from Clerk
    let privateMetadata = user.privateMetadata || {};
    
    // Check if this is a user with no metadata (existing user before the payment system)
    // If they have no metadata at all, initialize it with free access
    if (Object.keys(privateMetadata).length === 0) {
      await clerkClient.users.updateUser(userId, {
        privateMetadata: {
          freeTrialCount: 0, // Start with 0 so they get full 10 free trials
          isPro: false,
          paidSchemaCredits: 0,
          subscriptionPlan: "Free"
        }
      });
      
      // Get updated user with initialized metadata
      const updatedUser = await clerkClient.users.getUser(userId);
      privateMetadata = updatedUser.privateMetadata || {};
    }
    
    const freeTrialCount = privateMetadata.freeTrialCount || 0;
    const isPro = privateMetadata.isPro || false;
    const paidSchemaCredits = privateMetadata.paidSchemaCredits || 0;

    // Check if the user can generate a schema
    let allowed = false;
    let updatedMetadata = { ...privateMetadata };
    
    if (isPro && paidSchemaCredits > 0) {
      // Pro user with credits
      allowed = true;
      updatedMetadata.paidSchemaCredits = paidSchemaCredits - 1;
    } else if (freeTrialCount < 10) {
      // Free user with trials left
      allowed = true;
      updatedMetadata.freeTrialCount = freeTrialCount + 1;
    }
    
    // Update user metadata in Clerk
    await clerkClient.users.updateUser(user.id, {
      privateMetadata: updatedMetadata
    });
    
    // Return appropriate response
    if (allowed) {
      return NextResponse.json({ 
        allowed: true,
        message: isPro ? 
          `Schema generation successful. You have ${updatedMetadata.paidSchemaCredits} paid credits remaining.` :
          `Schema generation successful. You have used ${updatedMetadata.freeTrialCount} out of 10 free trials.`
      });
    } else {
      // User cannot generate schema (no trials or credits left)
      return NextResponse.json({
        allowed: false,
        isPro,
        freeTrialCount,
        paidSchemaCredits,
        message: isPro ? 
          "You have used all your credits. Please purchase more to continue." :
          "You have used all your free trials. Please subscribe to continue."
      }, { status: 403 });
    }
  } catch (error) {
    console.error("Schema generation check error:", error);
    return NextResponse.json({ 
      allowed: false,
      error: error.message 
    }, { status: 500 });
  }
}

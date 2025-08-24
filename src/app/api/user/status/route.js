import { getAuth } from "@clerk/nextjs/server";
import { Clerk } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

// Initialize Clerk with your secret key
const clerkClient = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get user data from Clerk
    const user = await clerkClient.users.getUser(userId);
    
    const privateMetadata = user.privateMetadata || {};
    
    // Check if this is a new or existing user with no metadata
    // If they have no metadata at all, initialize it with free access
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
    
    // Prepare subscription status
    const subscriptionStatus = {
      freeTrialCount: privateMetadata.freeTrialCount || 0,
      freeTrialLimit: 10,
      isPro: privateMetadata.isPro || false,
      paidSchemaCredits: privateMetadata.paidSchemaCredits || 0,
      subscriptionPlan: privateMetadata.subscriptionPlan || "Free",
      hasFreeTrialsLeft: (privateMetadata.freeTrialCount || 0) < 10
    };
    
    return NextResponse.json(subscriptionStatus);
  } catch (err) {
    console.error("Error fetching user status:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

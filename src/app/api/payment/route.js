import { getAuth } from "@clerk/nextjs/server";
import { Clerk } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

// Initialize Clerk with your secret key
const clerkClient = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// Dynamically import Razorpay to avoid bundling issues
let Razorpay;
if (typeof window === "undefined") {
  // Only import on the server side
  Razorpay = require("razorpay");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get user data from Clerk
    const user = await clerkClient.users.getUser(userId);

    // Get plan details
    const { plan } = body;
    let amount = 0;
    let planName = "";
    let credits = 0;

    if (plan === "basic") {
      amount = 30;
      planName = "Basic Plan";
      credits = 100;
    } else if (plan === "premium") {
      amount = 50;
      planName = "Premium Plan";
      credits = 200;
    } else {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!Razorpay) {
      throw new Error("Razorpay module can only be used on the server side");
    }
    
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create order
    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_${user.id}_${Date.now()}`,
      notes: {
        userId: user.id,
        plan: planName,
        credits: credits
      }
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: planName,
      credits: credits
    });
  } catch (err) {
    console.error("Payment creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

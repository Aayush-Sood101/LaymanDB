import { getAuth } from "@clerk/nextjs/server";
import { Clerk } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

// Initialize Clerk with your secret key
const clerkClient = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// Function to generate a valid receipt ID for Razorpay (must be <= 40 chars)
function generateReceiptId() {
  // Format: rcpt_[timestamp]_[random]
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const receiptId = `rcpt_${timestamp}_${random}`;
  
  // Ensure it's no more than 40 characters
  return receiptId.slice(0, 40);
}

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
      console.error("Razorpay initialization failed - server-side only module");
      return NextResponse.json({ error: "Payment system initialization failed" }, { status: 500 });
    }
    
    // Initialize Razorpay with environment variable validation
    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret) {
      console.error("Missing Razorpay API keys", { hasKeyId: !!key_id, hasKeySecret: !!key_secret });
      return NextResponse.json({ error: "Payment system configuration error" }, { status: 500 });
    }
    
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });
    
    if (!razorpay) {
      console.error("Razorpay instance creation failed");
      return NextResponse.json({ error: "Payment system configuration error" }, { status: 500 });
    }

    // Create order
    const receiptId = generateReceiptId();
    console.log(`Creating Razorpay order with receipt ID: ${receiptId} (length: ${receiptId.length})`);
    
    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: receiptId,
      notes: {
        userId: user.id,
        plan: planName,
        credits: credits
      }
    };

    try {
      const order = await razorpay.orders.create(options);
      
      return NextResponse.json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        plan: planName,
        credits: credits
      });
    } catch (razorpayErr) {
      console.error("Razorpay order creation failed:", razorpayErr);
      
      // Extract detailed error information
      const errorDetails = razorpayErr.error?.error || {};
      const errorDescription = errorDetails.description || razorpayErr.message || "Unknown Razorpay error";
      
      return NextResponse.json({ 
        error: `Payment gateway error: ${errorDescription}`,
        code: razorpayErr.statusCode || 500,
        field: errorDetails.field || null
      }, { status: razorpayErr.statusCode || 500 });
    }
  } catch (err) {
    console.error("Payment creation error:", err);
    
    // Provide more detailed error message for Razorpay-specific errors
    if (err.statusCode === 400 && err.error) {
      return NextResponse.json({ 
        error: `Razorpay error: ${err.error.description || err.error.code || 'Unknown error'}` 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import crypto from "crypto";
import { Clerk } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

// Initialize Clerk with your secret key
const clerkClient = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(req) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId,
      plan,
      credits
    } = await req.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      console.error("Missing required payment verification fields", { 
        hasOrderId: !!razorpay_order_id,
        hasPaymentId: !!razorpay_payment_id,
        hasSignature: !!razorpay_signature,
        hasUserId: !!userId
      });
      return NextResponse.json({ 
        success: false, 
        message: "Missing required payment information" 
      }, { status: 400 });
    }

    // Verify the payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is verified, update user metadata
      const user = await clerkClient.users.getUser(userId);
      
      // Get current metadata or initialize it
      const privateMetadata = user.privateMetadata || {};
      
      // Initialize metadata fields if they don't exist (for existing users)
      const initializedMetadata = {
        ...privateMetadata,
        freeTrialCount: privateMetadata.freeTrialCount || 0,
        isPro: privateMetadata.isPro || false,
        paidSchemaCredits: privateMetadata.paidSchemaCredits || 0,
        subscriptionPlan: privateMetadata.subscriptionPlan || "Free",
        paymentHistory: privateMetadata.paymentHistory || []
      };
      
      // Add this payment to history
      initializedMetadata.paymentHistory.push({
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        plan: plan,
        amount: plan === "Basic Plan" ? 30 : 50,
        credits: parseInt(credits),
        date: new Date().toISOString()
      });
      
      // Update subscription info
      initializedMetadata.isPro = true;
      initializedMetadata.subscriptionPlan = plan;
      
      // Add credits to existing or set new
      initializedMetadata.paidSchemaCredits = (initializedMetadata.paidSchemaCredits || 0) + parseInt(credits);
      
      // Update metadata in Clerk
      await clerkClient.users.updateUser(userId, {
        privateMetadata: initializedMetadata
      });
      
      return NextResponse.json({ 
        success: true,
        message: "Payment verified and user updated successfully"
      });
    } else {
      return NextResponse.json({ 
        success: false,
        message: "Payment verification failed"
      }, { status: 400 });
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    return NextResponse.json({ 
      success: false,
      error: err.message 
    }, { status: 500 });
  }
}

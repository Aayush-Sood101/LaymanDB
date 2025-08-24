import { NextResponse } from 'next/server';

export async function GET() {
  // This is a simple health check endpoint
  // It returns 200 OK if the payment API is available
  
  try {
    // Add any necessary checks for external dependencies
    // For example, you could check if Razorpay API keys are set
    
    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      // If keys are missing, we'll still return a 200 response
      // but include a warning in the response
      return NextResponse.json({
        status: 'warning',
        message: 'Payment system is available but configuration is incomplete',
      });
    }
    
    // If everything looks good
    return NextResponse.json({
      status: 'ok',
      message: 'Payment API is available',
    });
  } catch (error) {
    console.error('Payment API health check failed:', error);
    
    // Return a 200 response even on error, with error details
    // This prevents the usePaymentAPIStatus hook from failing
    // but allows for debugging
    return NextResponse.json({
      status: 'error',
      message: 'Payment system encountered an error',
      error: error.message,
    });
  }
}

// Also handle HEAD requests
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

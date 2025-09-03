import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    
    // Call the backend API for prompt enhancement
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    
    try {
      const response = await fetch(`${backendUrl}/api/schema/enhance-prompt`, {
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
      return NextResponse.json(data);
    } catch (error) {
      // If the backend doesn't support prompt enhancement, 
      // implement a simple fallback enhancement here
      console.log("Backend enhancement failed, using fallback:", error);
      
      // Simple fallback enhancement - add minimal details
      let enhancedPrompt = prompt;
      
      // Add basic hints about what might be needed
      if (!enhancedPrompt.toLowerCase().includes("attributes") && 
          !enhancedPrompt.toLowerCase().includes("fields")) {
        enhancedPrompt += " Include necessary attributes for each entity.";
      }
      
      if (!enhancedPrompt.toLowerCase().includes("relationship")) {
        enhancedPrompt += " Consider relationships between entities.";
      }
      
      return NextResponse.json({ enhancedPrompt });
    }
  } catch (err) {
    console.error("Error enhancing prompt:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

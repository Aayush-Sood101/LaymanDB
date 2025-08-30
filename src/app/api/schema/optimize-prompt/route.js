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
    
    // Call the backend API for prompt optimization
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    
    try {
      const response = await fetch(`${backendUrl}/api/schema/optimize-prompt`, {
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
      // If the backend doesn't support prompt optimization, 
      // implement a simple fallback optimization here
      console.log("Backend optimization failed, using fallback:", error);
      
      // Simple fallback optimization - add structure hints
      let optimizedPrompt = prompt;
      
      // Add entity identification if missing
      if (!prompt.toLowerCase().includes("entities") && !prompt.toLowerCase().includes("tables")) {
        optimizedPrompt = "Define the following entities: " + optimizedPrompt;
      }
      
      // Add relationship hints if missing
      if (!prompt.toLowerCase().includes("relationship") && !prompt.toLowerCase().includes("connect")) {
        optimizedPrompt += "\n\nSpecify the relationships between these entities clearly.";
      }
      
      // Add attributes hint if missing
      if (!prompt.toLowerCase().includes("attribute") && !prompt.toLowerCase().includes("field") && !prompt.toLowerCase().includes("column")) {
        optimizedPrompt += "\n\nFor each entity, include relevant attributes with data types.";
      }
      
      return NextResponse.json({ optimizedPrompt });
    }
  } catch (err) {
    console.error("Error optimizing prompt:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// src/app/sign-in/[[...sign-in]]/page.js

"use client";

import { SignIn } from "@clerk/nextjs";
import { WavyBackground } from "@/components/ui/wavy-background";

export default function SignInPage() {
  return (
    // The WavyBackground now fills its parent (<main>), not the whole screen.
    <WavyBackground
      colors={["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"]}
      backgroundFill="black"
      blur={10}
      speed="slow"
      waveOpacity={0.5}
      // We use flexbox to perfectly center the sign-in card inside the available space.
      containerClassName="h-full flex items-center justify-center p-4"
    >
      <div className="flex flex-col items-center justify-center px-4 py-8 rounded-lg bg-black/30 backdrop-blur-sm max-w-md w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Sign In</h1>
        <SignIn
          signUpUrl="/sign-up"
          afterSignInUrl="/generate"
          redirectUrl="/generate"
          appearance={{
            elements: {
              rootBox: "w-full mx-auto",
              card: "bg-transparent shadow-none w-full",
              formButtonPrimary: "bg-blue-500 hover:bg-blue-600",
              formFieldInput: "bg-black/40 text-white border-gray-700",
              formFieldLabel: "text-gray-300",
              footerActionLink: "text-blue-400 hover:text-blue-300",
            },
          }}
        />
      </div>
    </WavyBackground>
  );
}
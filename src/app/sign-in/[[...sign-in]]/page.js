"use client";

import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <SignIn 
        signUpUrl="/sign-up" 
        afterSignInUrl="/generate" 
        redirectUrl="/generate"
      />
    </div>
  );
}

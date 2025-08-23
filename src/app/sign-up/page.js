"use client";

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <SignUp 
        signInUrl="/sign-in" 
        afterSignUpUrl="/generate" 
        redirectUrl="/generate"
      />
    </div>
  );
}

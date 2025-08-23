"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RouteProtection({ children }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/"); // Redirect to homepage if not signed in
    }
  }, [isLoaded, isSignedIn, router]);

  // Show nothing while loading, or if not authenticated
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-pulse text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  // If authenticated, show the protected content
  return <>{children}</>;
}

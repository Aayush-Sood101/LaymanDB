"use client";

import GeminiPlayground from "@/components/gemini/GeminiPlayground";
import RouteProtection from "@/components/RouteProtection";

export default function GeminiPlaygroundPage() {
  return (
    <RouteProtection>
      <div className="w-full px-3 pt-24 pb-4 sm:px-6">
        <GeminiPlayground />
      </div>
    </RouteProtection>
  );
}
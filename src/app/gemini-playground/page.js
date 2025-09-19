"use client";

import GeminiPlayground from "@/components/gemini/GeminiPlayground";
import RouteProtection from "@/components/RouteProtection";

export default function GeminiPlaygroundPage() {
  return (
    <RouteProtection>
      <GeminiPlayground />
    </RouteProtection>
  );
}
"use client";

import GeminiPlayground from "@/components/gemini/GeminiPlayground";
import RouteProtection from "@/components/RouteProtection";
import { SchemaProvider } from '@/contexts/SchemaContext';

export default function GeminiPlaygroundPage() {
  return (
    <RouteProtection>
      <SchemaProvider>
        <GeminiPlayground />
      </SchemaProvider>
    </RouteProtection>
  );
}
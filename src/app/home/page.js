// src/app/home/page.js
"use client";

import { FeatureCard } from "./FeatureCard";
import { Hero } from "./hero"; // Assuming Hero is in a subfolder
import { TextRevealSection } from "./TextRevealSection";
import { Connect } from "./connect";  // This now imports the named export
export default function HomePage() {
  return (
    // Set the black background on the main container
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <TextRevealSection text="LaymanDB changes the way you design and build. " />
      <section id="features" className="py-12">
        <FeatureCard />
      </section>
      <Connect />
    </main>
  );
}
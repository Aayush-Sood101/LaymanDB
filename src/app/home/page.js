// src/app/page.js (or your home page file)
"use client";

import { Hero } from "./hero"; // Assuming Hero is in a subfolder
import { TextRevealSection } from "./TextRevealSection";

export default function HomePage() {
  return (
    // Set the black background on the main container
    <main className="bg-black text-white">
      <Hero />
      <TextRevealSection text="LaymanDB will change the way you design and build. alkjfd adsldkfjads; lfjadslkdjf ladskjf lksdjf lsaj fladskjsl;fj alkasdj flksj" />
      
      {/* You can add more content here that will appear after the scroll animation */}
      <div className="h-screen flex items-center justify-center">
          <p className="text-3xl">More content follows here.</p>
      </div>
    </main>
  );
}
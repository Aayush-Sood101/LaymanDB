"use client";

import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";

export function Hero() {
  return (
    <section className="relative w-full min-h-screen bg-black overflow-hidden flex flex-col lg:flex-row items-center justify-center">
      {/* Spotlight background */}
      <Spotlight
        className="-top-40 left-0 md:left-40 md:-top-20"
        fill="white"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-12">
        {/* Left Content */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
            Interactive 3D Experiences
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-neutral-300 max-w-xl">
            Bring your UI to life with immersive 3D scenes that capture attention,
            enhance engagement, and elevate your design beyond the ordinary.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 transition-colors w-full sm:w-auto">
              Get Started
            </button>
            <button className="px-6 py-3 rounded-lg border border-neutral-500 text-neutral-300 hover:bg-neutral-800 transition-colors w-full sm:w-auto">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Content — No box */}
        <div className="flex-1 w-full h-[300px] sm:h-[400px] lg:h-[500px] relative">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>
    </section>
  );
}

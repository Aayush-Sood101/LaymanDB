// components/FeaturesHero.js
"use client"
import { motion } from "framer-motion"
import { MeshGradient } from "@paper-design/shaders-react"

export default function FeaturesHero() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center p-8 text-center">
      {/* SVG Definitions for Filters and Gradients */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Animated Background Gradients */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#000000", "#06b6d4", "#0891b2", "#164e63", "#f97316"]}
        speed={0.3}
        backgroundColor="#000000"
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={["#000000", "#ffffff", "#06b6d4", "#f97316"]}
        speed={0.2}
        wireframe={true}
        backgroundColor="transparent"
      />

      {/* Main Heading */}
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span
            className="font-black text-white drop-shadow-2xl"
            style={{ filter: "url(#text-glow)" }}
          >
            Explore Our Powerful Features
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-2xl text-gray-200 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Designed to simplify, accelerate, and supercharge your database experience.
        </motion.p>
      </div>
    </div>
  )
}

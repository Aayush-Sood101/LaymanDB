"use client";
import { motion } from "framer-motion";
import { MeshGradient } from "@paper-design/shaders-react";
import { FiArrowRight } from "react-icons/fi";

export default function FeaturesHero() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black flex flex-col items-center justify-center p-8 text-center">
      {/* Background Gradients */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#000000", "#06b6d4", "#0891b2", "#164e63", "#f97316"]}
        speed={0.3}
        style={{ backgroundColor: "#000000" }}
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={["#000000", "#ffffff", "#06b6d4", "#f97316"]}
        speed={0.2}
        wireframe="true"
        style={{ backgroundColor: "transparent" }}
      />

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.h1
          className="text-5xl md:text-8xl font-black text-white mb-6 leading-tight tracking-tighter"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
        >
          {/* Applying a gradient to the text for a more dynamic look */}
          <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Explore Our Powerful Features
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-2xl text-neutral-300 max-w-3xl mx-auto mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Designed to simplify, accelerate, and supercharge your database
          experience.
        </motion.p>

      </div>
    </div>
  );
}
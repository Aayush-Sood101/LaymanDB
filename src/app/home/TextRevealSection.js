// src/app/home/TextRevealSection.jsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// The main component that orchestrates the scroll animation
export function TextRevealSection({ text }) {
  const targetRef = useRef(null);

  // useScroll tracks the scroll progress of the targetRef element
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const words = text.split(" ");

  return (
    <div ref={targetRef} className="relative z-10 h-[150vh]">
      {/* This div is sticky, so it stays in view while the parent scrolls */}
      {/* MODIFICATION: Changed max-w-5xl to max-w-7xl to increase horizontal space. */}
      <div className="sticky top-0 mx-auto flex h-screen max-w-7xl items-center justify-center">
        <p className="flex flex-wrap justify-center p-8 text-4xl font-bold md:p-10 md:text-5xl lg:p-12 lg:text-6xl">
          {words.map((word, i) => {
            // Calculate the start and end point for each word's animation
            const start = i / words.length;
            const end = start + 1 / words.length;

            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </p>
      </div>
    </div>
  );
}

// The Word component animates a single word based on scroll progress
const Word = ({ children, progress, range }) => {
  // useTransform maps the scroll progress (0 to 1) to an opacity value.
  const opacity = useTransform(progress, range, [0.1, 1]);

  return (
    <span className="relative mx-1 lg:mx-2.5">
      <motion.span style={{ opacity }} className="text-white">
        {children}
      </motion.span>
    </span>
  );
};
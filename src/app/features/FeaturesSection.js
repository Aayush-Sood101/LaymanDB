"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";

/**
 * ## FeaturesSection Component
 *
 * This is the main component that you will import into your page.
 * It showcases three distinct features using a parallax scroll effect.
 * The content, including images, headings, and subheadings, is hardcoded
 * to fit a sleek, modern, black-and-white theme.
 */
const FeaturesSection = () => {
  return (
    <div className="bg-white">
      {/* Feature 1: Design */}
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        subheading="Design"
        heading="Unparalleled Aesthetics."
      >
        <FeatureContent />
      </TextParallaxContent>

      {/* Feature 2: Performance */}
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1542438408-abb260109939?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        subheading="Performance"
        heading="Engineered for Speed."
      >
        <FeatureContent />
      </TextParallaxContent>

      {/* Feature 3: Simplicity */}
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        subheading="Simplicity"
        heading="Intuitively Yours."
      >
        <FeatureContent />
      </TextParallaxContent>
    </div>
  );
};

const IMG_PADDING = 12;

/**
 * ## Helper Components
 *
 * These components are used internally by `FeaturesSection` to create the parallax effect.
 * You won't need to interact with them directly.
 */

const TextParallaxContent = ({ imgUrl, subheading, heading, children }) => {
  return (
    <div
      style={{
        paddingLeft: IMG_PADDING,
        paddingRight: IMG_PADDING,
      }}
    >
      <div className="relative h-[150vh]">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy heading={heading} subheading={subheading} />
      </div>
      {children}
    </div>
  );
};

const StickyImage = ({ imgUrl }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: `calc(100vh - ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING,
        scale,
      }}
      ref={targetRef}
      className="sticky z-0 overflow-hidden rounded-3xl"
    >
      <motion.div
        className="absolute inset-0 bg-neutral-950/70"
        style={{
          opacity,
        }}
      />
    </motion.div>
  );
};

const OverlayCopy = ({ subheading, heading }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  return (
    <motion.div
      style={{
        y,
        opacity,
      }}
      ref={targetRef}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white"
    >
      <p className="mb-2 text-center text-xl md:mb-4 md:text-3xl">
        {subheading}
      </p>
      <p className="text-center text-4xl font-bold md:text-7xl">{heading}</p>
    </motion.div>
  );
};

const FeatureContent = () => (
  <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
    <h2 className="col-span-1 text-3xl font-bold md:col-span-4">
      Built for the future.
    </h2>
    <div className="col-span-1 md:col-span-8">
      <p className="mb-4 text-xl text-neutral-600 md:text-2xl">
        Our product is meticulously crafted to blend form and function, providing a seamless user experience that feels both powerful and natural. We've obsessed over every detail to ensure it meets the highest standards of quality and elegance.
      </p>
      <p className="mb-8 text-xl text-neutral-600 md:text-2xl">
        Experience the difference that thoughtful design and robust engineering can make. It's not just a tool; it's an extension of your creativity and productivity.
      </p>
    </div>
  </div>
);

export default FeaturesSection;
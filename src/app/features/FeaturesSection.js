"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";

const FEATURES = [
  {
    id: 1,
    subheading: "Design",
    heading: "Unparalleled Aesthetics.",
    imgUrl:
      "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%33",
    content: {
      title: "Built for the future.",
      description:
        "Our product is meticulously crafted to blend form and function, providing a seamless user experience that feels both powerful and natural.",
      
    },
  },
  {
    id: 2,
    subheading: "Performance",
    heading: "Engineered for Speed.",
    imgUrl:
      "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%33",
    content: {
      title: "Lightning-fast operations.",
      description:
        "Experience the difference that robust engineering can make. It's not just a tool; it's an extension of your productivity, optimized for peak performance.",
      
    },
  },
  {
    id: 3,
    subheading: "Simplicity",
    heading: "Intuitively Yours.",
    imgUrl:
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%33",
    content: {
      title: "Effortless to master.",
      description:
        "We've obsessed over every detail to ensure the interface is clean and the workflow is intuitive, enabling you to focus on what truly matters.",
      
    },
  },
];

const FeaturesSection = () => {
  return (
    <div className="bg-neutral-950 text-white">
      {FEATURES.map((feature) => (
        <TextParallaxContent
          key={feature.id}
          imgUrl={feature.imgUrl}
          subheading={feature.subheading}
          heading={feature.heading}
        >
          <FeatureContent {...feature.content} />
        </TextParallaxContent>
      ))}
    </div>
  );
};

const IMG_PADDING = 12;

const TextParallaxContent = ({ imgUrl, subheading, heading, children }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  return (
    // CHANGE: Reduced height from 300vh to 200vh to shorten the scroll duration
    <section ref={targetRef} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div
          style={{ paddingLeft: IMG_PADDING, paddingRight: IMG_PADDING }}
          className="relative h-[calc(100vh_-_24px)] w-full rounded-3xl"
        >
          <StickyImage imgUrl={imgUrl} scrollYProgress={scrollYProgress} />
          <OverlayCopy
            heading={heading}
            subheading={subheading}
            scrollYProgress={scrollYProgress}
          />
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 w-full">{children}</div>
    </section>
  );
};

const StickyImage = ({ imgUrl, scrollYProgress }) => {
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.6, 0.6]);

  return (
    <motion.div
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        scale,
      }}
      className="absolute inset-0 z-0"
    >
      <motion.div
        className="absolute inset-0 bg-neutral-950"
        style={{
          opacity: overlayOpacity,
        }}
      />
    </motion.div>
  );
};

const OverlayCopy = ({ subheading, heading, scrollYProgress }) => {
  const y = useTransform(scrollYProgress, [0, 1], ["50vh", "-50vh"]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      style={{ y, opacity }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center"
    >
      <p className="mb-2 text-center text-xl font-semibold text-neutral-300 md:mb-4 md:text-3xl">
        {subheading}
      </p>
      <p className="text-center text-5xl font-bold md:text-7xl bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
        {heading}
      </p>
    </motion.div>
  );
};

const FeatureContent = ({ title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeInOut" },
      }}
      viewport={{ once: true, amount: 0.5 }}
      className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-24 md:grid-cols-12 md:gap-12"
    >
      <div className="col-span-1 md:col-span-4">
        <h3 className="text-3xl font-bold text-white md:text-4xl">{title}</h3>
      </div>
      <div className="col-span-1 md:col-span-8">
        <p className="mb-8 text-xl text-neutral-300 md:text-2xl">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default FeaturesSection;
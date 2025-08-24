import React from "react";
import Image from "next/image";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card";

export function FeatureCard() {
  const items = [
    {
      title: "AI Prompt Refinement",
      image: "/images/Prompt-Refinement.png",
      className: "absolute top-24 left-[15%] w-72 p-5 rotate-[-9deg] z-10",
    },
    {
      title: "ERD Visualisation",
      image: "/images/ER-Diagram.png",
      className: "absolute top-52 left-[30%] w-72 p-5 rotate-[-4deg] z-10",
    },
    {
      title: "Mermaid Diagram",
      image: "/images/Mermaid-Diagram.png",
      className: "absolute top-16 left-[42%] w-72 p-5 rotate-[8deg] z-10",
    },
    {
      title: "SQL Export",
      image: "/images/SQL.png",
      className: "absolute top-60 left-[55%] w-72 p-5 rotate-[12deg] z-10",
    },
    {
      title: "Documentation",
      image: "/images/Documentation.png",
      className: "absolute top-24 right-[15%] w-72 p-5 rotate-[6deg] z-10",
    },
  ];
  return (
    <DraggableCardContainer id="features" className="relative flex h-[45rem] w-full items-center justify-center overflow-clip">
      <p
        className="absolute z-0 mx-auto max-w-sm text-center text-xl font-black text-neutral-400 md:text-3xl dark:text-neutral-800"
      >
        What else you might want? We're two steps ahead 😉
      </p>
      {items.map((item) => (
        <DraggableCardBody key={item.title} className={item.className}>

          {/* 1. WRAPPER DIV ADDED */}
          {/* This container sets a fixed boundary for the image. */}
          <div className="relative h-56 w-full">
            {/* 2. IMAGE COMPONENT MODIFIED */}
            <Image
              src={item.image}
              alt={item.title}
              fill // Replaces width and height
              className="pointer-events-none rounded-xl object-cover" // object-cover is key
            />
          </div>

          <h3
            className="mt-4 text-center text-xl font-bold text-neutral-700 dark:text-neutral-300"
          >
            {item.title}
          </h3>
        </DraggableCardBody>
      ))}
    </DraggableCardContainer>
  );
}
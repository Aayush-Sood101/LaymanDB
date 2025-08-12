import React from "react";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card";

export function FeatureCard() {
  const items = [
    {
      title: "Tyler Durden",
      image:
        "https://images.unsplash.com/photo-1732310216648-603c0255c000?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      // New size: w-72 (288px) with p-5 padding for better spacing.
      className: "absolute top-24 left-[15%] w-72 p-5 rotate-[-9deg] z-10",
    },
    {
      title: "The Narrator",
      image:
        "https://images.unsplash.com/photo-1697909623564-3dae17f6c20b?q=80&w=2667&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      className: "absolute top-52 left-[30%] w-72 p-5 rotate-[-4deg] z-10",
    },
    {
      title: "Iceland",
      image:
        "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=2600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      className: "absolute top-16 left-[42%] w-72 p-5 rotate-[8deg] z-10",
    },
    {
      title: "Japan",
      image:
        "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=3648&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      className: "absolute top-60 left-[55%] w-72 p-5 rotate-[12deg] z-10",
    },
    {
      title: "Norway",
      image:
        "https://images.unsplash.com/photo-1421789665209-c9b2a435e3dc?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      className: "absolute top-24 right-[15%] w-72 p-5 rotate-[6deg] z-10",
    },
  ];
  return (
    // Increased height to h-[45rem] to give the larger cards more room
    <DraggableCardContainer className="relative flex h-[45rem] w-full items-center justify-center overflow-clip">
      <p
        className="absolute z-0 mx-auto max-w-sm text-center text-xl font-black text-neutral-400 md:text-3xl dark:text-neutral-800"
      >
        What else you might want...?
      </p>
      {items.map((item) => (
        <DraggableCardBody key={item.title} className={item.className}>
          <img
            src={item.image}
            alt={item.title}
            // Taller image (h-56) for better visual impact
            className="pointer-events-none h-56 w-full rounded-xl object-cover"
          />
          <h3
            // Larger text (text-xl) and more margin-top (mt-4)
            className="mt-4 text-center text-xl font-bold text-neutral-700 dark:text-neutral-300"
          >
            {item.title}
          </h3>
        </DraggableCardBody>
      ))}
    </DraggableCardContainer>
  );
}
// src/components/ui/beams-background-static.jsx

"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// createBeam function is simplified as speed and pulse are no longer needed
function createBeam(width, height) {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle: angle,
    opacity: 0.12 + Math.random() * 0.16,
    hue: 190 + Math.random() * 70,
  };
}

export function BeamsBackgroundStatic({
  children,
  className,
  intensity = "strong"
}) {
  const canvasRef = useRef(null);
  const contentRef = useRef(null);
  const beamsRef = useRef([]);
  const MINIMUM_BEAMS = 15; // You can adjust this for density

  const opacityMap = {
    subtle: 0.7,
    medium: 0.85,
    strong: 1,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const contentEl = contentRef.current;
    if (!contentEl) return;

    // This function draws a single beam
    function drawBeam(ctx, beam) {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);
      
      const staticOpacity = beam.opacity * opacityMap[intensity];
      
      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
      gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
      gradient.addColorStop(0.1, `hsla(${beam.hue}, 85%, 65%, ${staticOpacity * 0.5})`);
      gradient.addColorStop(0.4, `hsla(${beam.hue}, 85%, 65%, ${staticOpacity})`);
      gradient.addColorStop(0.6, `hsla(${beam.hue}, 85%, 65%, ${staticOpacity})`);
      gradient.addColorStop(0.9, `hsla(${beam.hue}, 85%, 65%, ${staticOpacity * 0.5})`);
      gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    // This function sets up and draws everything ONCE
    const drawStaticBeams = () => {
        const dpr = window.devicePixelRatio || 1;
        const newWidth = contentEl.scrollWidth;
        const newHeight = contentEl.scrollHeight;

        canvas.width = newWidth * dpr;
        canvas.height = newHeight * dpr;
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
        ctx.scale(dpr, dpr);
        
        ctx.clearRect(0, 0, newWidth, newHeight);
        ctx.filter = "blur(35px)";

        // Create a new set of beams
        const totalBeams = MINIMUM_BEAMS * 1.5;
        beamsRef.current = Array.from({ length: totalBeams }, () =>
            createBeam(newWidth, newHeight)
        );

        // Draw all the beams
        beamsRef.current.forEach((beam) => {
            drawBeam(ctx, beam);
        });
    };
    
    // Use ResizeObserver to redraw only when content size changes
    const resizeObserver = new ResizeObserver(drawStaticBeams);
    resizeObserver.observe(contentEl);

    // REMOVED: The animate() function and requestAnimationFrame loop are gone.

    return () => {
      resizeObserver.disconnect();
    };
  }, [intensity]);

  return (
    <div className={cn("relative w-full overflow-hidden bg-neutral-950", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ filter: "blur(15px)" }} />
        
      <div
        className="absolute inset-0 bg-neutral-950/10"
        style={{ backdropFilter: "blur(50px)" }} />

      <div ref={contentRef} className="relative z-10">
        {children}
      </div>
    </div>
  );
}
"use client";

import { motion } from "framer-motion";
import ContactForm from './ContactForm';
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function ContactPage() {
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        // Use flexbox utilities to center the form on the page
        className="relative flex flex-col items-center justify-center h-full"
      >
        <ContactForm />
      </motion.div>
    </AuroraBackground>
  );
}
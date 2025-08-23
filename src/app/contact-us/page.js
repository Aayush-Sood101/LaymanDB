"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { motion } from "framer-motion";
import ContactForm from "./ContactForm"; // Your existing form component

export default function ContactPage() {
  return (
    <BeamsBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative w-full min-h-screen p-4 antialiased"
      >
        <div className="container mx-auto py-16 px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Side: Contact Us Heading */}
            <div className="space-y-8 pr-0 lg:pr-12 max-w-xl pt-8">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-5xl font-bold tracking-tight text-white leading-tight"
              >
                Contact Us
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-xl text-gray-300 leading-relaxed font-medium"
              >
                We are available for questions, feedback, or collaboration opportunities. Let us know how we can help you
                achieve your goals!
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="space-y-6 text-gray-300 pt-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.95a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-lg font-medium">laymandb@gmail.com</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-lg font-medium">+91 9882715895</span>
                </div>
              </motion.div>
            </div>

            {/* Right Side: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </BeamsBackground>
  );
}
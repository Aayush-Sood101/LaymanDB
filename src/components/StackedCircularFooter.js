"use client"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Github, Instagram, Linkedin, ArrowUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

// --- Refined Professional StackedCircularFooter Component ---

function StackedCircularFooter() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Effect to show/hide the scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Function to smoothly scroll to the top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // --- Data for Links (Updated) ---
  const navLinks = [
    { href: "/home", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact-us", label: "Contact Us" },
  ]

  const socialLinks = [
    {
      Icon: Github,
      label: "GitHub",
      href: "https://github.com/Aayush-Sood101",
    },
    {
      Icon: Instagram,
      label: "Instagram",
      href: "https://www.instagram.com/aayush__sood",
    },
    {
      Icon: Linkedin,
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/aayush-sood-493257267/",
    },
  ]

  return (
    <TooltipProvider delayDuration={100}>
      <footer className="relative bg-gradient-to-b from-neutral-950 to-black text-white overflow-hidden">
        {/* Restored the original, subtle aurora background effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-20 -left-20 w-[30rem] h-[30rem] bg-purple-600 rounded-full filter blur-[150px] opacity-30"></div>
          <div className="absolute -bottom-20 -right-10 w-[25rem] h-[25rem] bg-blue-600 rounded-full filter blur-[120px] opacity-30"></div>
        </div>

        <motion.div
          // ADJUSTMENT: Reduced vertical padding for a more compact footer
          className="relative container mx-auto px-4 md:px-6 py-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center">
            {/* --- Navigation Links --- */}
            <nav className="mb-8">
              <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                {navLinks.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="relative text-lg font-medium text-gray-300 hover:text-white transition-colors duration-300 group"
                  >
                    {link.label}
                    {/* ADJUSTMENT: Underline is now a simple white line on hover */}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </a>
                ))}
              </div>
            </nav>

            {/* --- Social Media Icons --- */}
            <div className="mb-8 flex space-x-4">
              {socialLinks.map(({ Icon, label, href }) => (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        // Restored original professional button styling
                        className="rounded-full border-2 border-neutral-700 hover:border-white hover:bg-neutral-800 transition-all duration-300 bg-transparent h-12 w-12 group"
                      >
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                        >
                          <Icon className="h-6 w-6 text-neutral-400 transition-transform duration-300 group-hover:text-white group-hover:scale-110" />
                          <span className="sr-only">{label}</span>
                        </a>
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* --- Divider --- */}
            <div className="w-1/3 max-w-xs h-px bg-gradient-to-r from-transparent via-neutral-600 to-transparent mb-6"></div>

            {/* --- Copyright Notice --- */}
            <div className="text-center">
              <p className="text-sm text-neutral-400 font-light tracking-wide">
                © {new Date().getFullYear()} LaymanDB. All rights reserved.
              </p>
            </div>
          </div>
        </motion.div>

        {/* --- Scroll to Top Button --- */}
        <AnimatePresence>
          {showScrollTop && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={scrollToTop}
                  aria-label="Scroll to top"
                  // Restored original professional styling for the button
                  className="fixed bottom-8 right-8 bg-neutral-800 text-white border border-neutral-700 p-3 rounded-full shadow-lg hover:shadow-xl hover:bg-white hover:text-black transition-all duration-300 z-50"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ArrowUp className="h-5 w-5" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Scroll to top</p>
              </TooltipContent>
            </Tooltip>
          )}
        </AnimatePresence>
      </footer>
    </TooltipProvider>
  )
}

export { StackedCircularFooter }
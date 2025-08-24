"use client"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Github, Instagram, Linkedin, ArrowUp } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

// --- Improved StackedCircularFooter Component ---

function StackedCircularFooter() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Effect to show/hide the scroll-to-top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Function to smoothly scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // --- Animation Variants for Framer Motion ---
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  // --- Data for Links (Improved Readability) ---
  const navLinks = [
    { href: "/home", label: "Home" },
    { href: "/features", label: "Features" },
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
    // TooltipProvider is necessary for shadcn Tooltips to work
    <TooltipProvider delayDuration={100}>
      <footer className="relative bg-gradient-to-b from-neutral-950 to-black text-white overflow-hidden">
        {/* IMPROVEMENT: More subtle and modern background aurora effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-20 -left-20 w-[30rem] h-[30rem] bg-purple-600 rounded-full filter blur-[150px] opacity-30"></div>
          <div className="absolute -bottom-20 -right-10 w-[25rem] h-[25rem] bg-blue-600 rounded-full filter blur-[120px] opacity-30"></div>
        </div>

        <motion.div
          className="relative container mx-auto px-4 md:px-6 py-20" // IMPROVEMENT: Increased vertical padding for more whitespace
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="flex flex-col items-center">
            {/* --- Navigation Links --- */}
            <motion.nav className="mb-8" variants={itemVariants}>
              <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    className="relative text-lg font-medium text-gray-300 hover:text-white transition-all duration-300 group"
                    whileHover={{ y: -2 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </motion.a>
                ))}
              </div>
            </motion.nav>

            {/* --- Social Media Icons --- */}
            <motion.div
              className="mb-8 flex space-x-4" // IMPROVEMENT: Slightly reduced space for a tighter group
              variants={itemVariants}
            >
              {socialLinks.map(({ Icon, label, href }, index) => (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                  }}
                >
                  {/* IMPROVEMENT: Added Tooltip for better UX */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {/* IMPROVEMENT: Used `asChild` prop for semantic HTML.
                        This renders the Button as an anchor tag `<a>` directly.
                      */}
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="rounded-full border-2 border-neutral-700 hover:border-white hover:bg-neutral-800 transition-all duration-300 bg-transparent h-14 w-14 group"
                      >
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                        >
                          <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                          <span className="sr-only">{label}</span>
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{label}</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              ))}
            </motion.div>

            {/* --- Divider --- */}
            <motion.div
              // IMPROVEMENT: Wider, more proportional divider
              className="w-1/3 max-w-xs h-px bg-gradient-to-r from-transparent via-neutral-600 to-transparent mb-6"
              variants={itemVariants}
            ></motion.div>

            {/* --- Copyright Notice --- */}
            <motion.div className="text-center" variants={itemVariants}>
              <p className="text-sm text-neutral-400 font-light tracking-wide">
                © {new Date().getFullYear()} LaymanDB. All rights reserved.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* --- Scroll to Top Button --- */}
        {showScrollTop && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={scrollToTop}
                // IMPROVEMENT: Styling now matches the dark theme better
                className="fixed bottom-8 right-8 bg-neutral-800 text-white border border-neutral-700 p-3 rounded-full shadow-lg hover:shadow-xl hover:bg-white hover:text-black transition-all duration-300 z-50"
                aria-label="Scroll to top"
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
      </footer>
    </TooltipProvider>
  )
}

export { StackedCircularFooter }
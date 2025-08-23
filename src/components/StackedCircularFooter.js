"use client"

import { Button } from "@/components/ui/button"
import { Twitter, Instagram, Linkedin, ArrowUp } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

function StackedCircularFooter() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

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

  return (
    <footer className="relative bg-gradient-to-b from-neutral-900 to-black text-white overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
      </div>

      <motion.div
        className="relative container mx-auto px-4 md:px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="flex flex-col items-center">
          <motion.nav className="mb-6" variants={itemVariants}>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              {[
                { href: "/home", label: "Home" },
                { href: "/features", label: "Features" },
                { href: "/contact-us", label: "Contact Us" },
              ].map((link, index) => (
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

          <motion.div className="mb-6 flex space-x-6" variants={itemVariants}>
            {[
              { Icon: Twitter, label: "Twitter" },
              { Icon: Instagram, label: "Instagram" },
              { Icon: Linkedin, label: "LinkedIn" },
            ].map(({ Icon, label }, index) => (
              <motion.div
                key={label}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-2 border-gray-600 hover:bg-white hover:text-black hover:border-white transition-all duration-300 bg-transparent h-12 w-12 group"
                >
                  <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  <span className="sr-only">{label}</span>
                </Button>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="w-24 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent mb-4"
            variants={itemVariants}
          ></motion.div>

          <motion.div className="text-center" variants={itemVariants}>
            <p className="text-sm text-gray-400 font-light tracking-wide">© 2025 LaymanDB. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.div>

      {showScrollTop && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-white text-black p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </footer>
  )
}

export { StackedCircularFooter }

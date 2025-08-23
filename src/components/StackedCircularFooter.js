import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Twitter, Instagram, Linkedin } from "lucide-react"

function StackedCircularFooter() {
  return (
    // Changed: Using a dark charcoal background (#1A1A1A) with white text.
    <footer className="bg-[#1A1A1A] text-white py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center">
          {/* Changed: Logo background to a subtle, lighter dark gray for contrast. */}
          <div className="mb-8 rounded-full bg-neutral-800 p-8">
            <Icons.logo className="icon-class w-6" />
          </div>
          <nav className="mb-8 flex flex-wrap justify-center gap-6">
            {/* Changed: Hover color to a light gray for a subtle effect. */}
            <a href="/home" className="hover:text-gray-300">Home</a>
            <a href="/features" className="hover:text-gray-300">Features</a>
            <a href="/contact-us" className="hover:text-gray-300">Contact Us</a>
          </nav>
          <div className="mb-8 flex space-x-4">
            {/* Changed: Button borders and hover effect to match the dark theme. */}
            <Button variant="outline" size="icon" className="rounded-full border-gray-600 hover:bg-neutral-800">
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Twitter</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full border-gray-600 hover:bg-neutral-800">
              <Instagram className="h-4 w-4" />
              <span className="sr-only">Instagram</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full border-gray-600 hover:bg-neutral-800">
              <Linkedin className="h-4 w-4" />
              <span className="sr-only">LinkedIn</span>
            </Button>
          </div>
          <div className="text-center">
            {/* Changed: Muted text color to a lighter gray for readability. */}
            <p className="text-sm text-gray-400">
              © 2025 LaymanDB. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { StackedCircularFooter }
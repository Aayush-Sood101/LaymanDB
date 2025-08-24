"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState, useEffect } from "react";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";

export function NavbarComponent() {
  const router = useRouter();
  const navItems = [
    { name: "Home", link: "/home" },
    { name: "Features", link: "/features" },
    { name: "Pricing", link: "/pricing" },
    { name: "Contact Us", link: "/contact-us" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Effect to handle scroll detection
  useEffect(() => {
    // Only run on the client side
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      // Set isScrolled to true if user scrolls more than 10px
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Add event listener when the component mounts
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Navbar
      // Apply dynamic classes based on the isScrolled state
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
        ${isScrolled ? "py-2" : "py-4"}
      `}
      suppressHydrationWarning
    >
      {/* --- Desktop Navigation --- */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-3 relative z-10">
          <SignedOut>
            <LinkButton href="/sign-in" variant="secondary">Sign In</LinkButton>
            <LinkButton href="/sign-up" variant="primary">Sign Up</LinkButton>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-4 relative z-10">
              {/* Pricing Button */}
              <Link 
                href="/pricing"
                className="relative z-20 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-zinc-900 border border-zinc-800 rounded-md shadow-sm hover:bg-zinc-800 transition-colors duration-200 cursor-pointer"
              >
                Pricing
              </Link>
              {/* Professional Workspace Button */}
              <Link 
                href="/generate"
                className="relative z-20 inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors duration-200 cursor-pointer"
              >
                Workspace
              </Link>
              <div className="relative z-20">
                <UserButton afterSignOutUrl="/home" />
              </div>
            </div>
          </SignedIn>
        </div>
      </NavBody>

      {/* --- Mobile Navigation --- */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <span className="block py-2">{item.name}</span>
            </a>
          ))}
          <div className="flex w-full flex-col gap-4 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700 relative z-10">
            <SignedOut>
              <LinkButton 
                href="/sign-in" 
                variant="secondary"
                className="w-full relative z-20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </LinkButton>
              <LinkButton 
                href="/sign-up" 
                variant="primary"
                className="w-full relative z-20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </LinkButton>
            </SignedOut>
            <SignedIn>
              {/* Pricing Mobile Button */}
              <Link
                href="/pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative z-20 inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-white bg-zinc-900 border border-zinc-800 rounded-md shadow-sm hover:bg-zinc-800 transition-colors duration-200 cursor-pointer"
              >
                Pricing
              </Link>
              {/* Workspace Mobile Button */}
              <Link
                href="/generate"
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative z-20 inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors duration-200 cursor-pointer mt-2"
              >
                Go to Workspace
              </Link>
              <div className="mt-4 flex justify-center relative z-20">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
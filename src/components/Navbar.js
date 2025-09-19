"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState, useEffect } from "react";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";
// Removed unused Button and DropdownMenu imports
import { IconLayoutGrid, IconSparkles, IconChevronDown } from "@tabler/icons-react";

export function NavbarComponent() {
  const navItems = [
    { name: "Home", link: "/home" },
    { name: "Features", link: "/features" },
    { name: "Pricing", link: "/pricing" },
    { name: "Contact Us", link: "/contact-us" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Navbar
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
        border-b
        ${isScrolled 
          ? "py-2 bg-white/80 backdrop-blur-sm border-neutral-200" 
          : "py-4 bg-white border-transparent"
        }
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
            <div className="flex items-center gap-4">

              {/* === UPDATED HOVER-TO-OPEN DROPDOWN === */}
              <div className="relative group">
                {/* Trigger Button: No border, no direct hover effect */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-neutral-700 cursor-pointer">
                  Workspace
                  <IconChevronDown className="h-4 w-4 text-neutral-500 transition-transform duration-200 group-hover:rotate-180" />
                </div>

                {/* Dropdown Panel: Opens on parent group hover */}
                <div className="absolute left-0 mt-2 w-56 p-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-20">
                    <Link
                      href="/generate"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-800 rounded-md hover:bg-neutral-100"
                    >
                      <IconLayoutGrid className="h-4 w-4 text-neutral-500" />
                      <span>Main Workspace</span>
                    </Link>
                    <Link
                      href="/gemini-playground"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-800 rounded-md hover:bg-neutral-100"
                    >
                      <IconSparkles className="h-4 w-4 text-neutral-500" />
                      <span>Gemini Playground</span>
                    </Link>
                </div>
              </div>
              {/* === END OF DROPDOWN === */}
              
              <UserButton afterSignOutUrl="/home" />

            </div>
          </SignedIn>
        </div>
      </NavBody>

      {/* --- Mobile Navigation (Unchanged) --- */}
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
              <div className="mt-2 space-y-2">
                <Link
                  href="/generate"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative z-20 inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-neutral-900 bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors duration-200 cursor-pointer"
                >
                  Main Workspace
                </Link>
                <Link
                  href="/gemini-playground"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative z-20 inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-neutral-900 bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors duration-200 cursor-pointer"
                >
                  Gemini Playground
                </Link>
              </div>
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
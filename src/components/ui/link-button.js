"use client";

import Link from "next/link";
import { NavbarButton } from "@/components/ui/resizable-navbar";
import { forwardRef } from "react";

// Create a LinkButton component that can be used with Next.js Link
export const LinkButton = forwardRef(function LinkButton(
  { href, variant, className, onClick, children, ...props },
  ref
) {
  // The actual button rendered inside the Link
  const button = (
    <NavbarButton
      as="span" // Use span instead of anchor
      ref={ref}
      variant={variant}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </NavbarButton>
  );

  // If href is provided, wrap with Link, otherwise just return the button
  return href ? (
    <Link href={href}>
      {button}
    </Link>
  ) : (
    button
  );
});

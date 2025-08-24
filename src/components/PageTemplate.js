// src/components/PageTemplate.js

export default function PageTemplate({ children }) {
  // This component now just acts as a simple wrapper.
  // The Navbar, main tag, and padding are all handled by your root layout.js.
  return <>{children}</>;
}
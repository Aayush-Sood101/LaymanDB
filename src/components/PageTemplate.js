"use client";

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PageTemplate({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}

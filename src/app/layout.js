import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Import required css for React Flow
import 'reactflow/dist/style.css';
// Import the monkey patch to fix React Flow Object.keys error
import '@/lib/reactFlowMonkeyPatch';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Database Creator - Intelligent Database Design Platform",
  description: "Create database schemas from natural language descriptions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Import required css for React Flow
import 'reactflow/dist/style.css';
// Import the monkey patch to fix React Flow Object.keys error
import '@/lib/reactFlowMonkeyPatch';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Database Creator - Intelligent Database Design Platform",
  description: "Create database schemas from natural language descriptions using AI",
  keywords: "database design, schema generation, SQL, database visualization, ERD, entity relationship diagram",
  authors: [{ name: "Database Creator Team" }],
  openGraph: {
    title: "Database Creator - Intelligent Database Design Platform",
    description: "Create database schemas from natural language descriptions using AI",
    url: "https://database-creator.vercel.app",
    siteName: "Database Creator",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Database Creator - Intelligent Database Design Platform",
    description: "Create database schemas from natural language descriptions using AI",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
          <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Navbar and children will be client components */}
            {children}
          </div>
      </body>
    </html>
  );
}

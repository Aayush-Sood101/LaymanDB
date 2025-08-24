// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'reactflow/dist/style.css';
import '@/lib/reactFlowMonkeyPatch';
import { NavbarComponent } from "@/components/Navbar"; // Import your Navbar
import { StackedCircularFooter } from "@/components/StackedCircularFooter"; // Import Footer
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"; // 1. Import SpeedInsights

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
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
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
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
          <script dangerouslySetInnerHTML={{
            __html: `
              window.RAZORPAY_KEY_ID = "${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''}";
            `
          }} />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
          suppressHydrationWarning
        >
          <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-blue-50">
            <NavbarComponent />
            <main className="flex-1 pt-[80px] relative">
              {children}
            </main>
            <StackedCircularFooter />
          </div>
          
          <Analytics />
          <SpeedInsights /> 
        </body>
      </html>
    </ClerkProvider>
  );
}
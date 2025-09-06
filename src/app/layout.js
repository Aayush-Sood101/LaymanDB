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
  title: "LaymanDB - AI-Powered Database Design Made Simple",
  description:
    "LaymanDB helps you create, visualize, and manage database schemas effortlessly from natural language. Generate ERDs, SQL schemas, and database designs instantly using AI.",
  keywords:
    "LaymanDB, database design, schema generation, AI database tool, SQL generator, database visualization, ERD, entity relationship diagram, database modeling, intelligent DB design",
  authors: [{ name: "LaymanDB Team" }],
  openGraph: {
    title: "LaymanDB - AI-Powered Database Design Made Simple",
    description:
      "Transform natural language into database schemas with LaymanDB. Instantly generate ER diagrams, SQL schemas, and visualize your databases using AI.",
    url: "https://layman-db.vercel.app/",
    siteName: "LaymanDB",
    images: [
      {
        url: "/images/logo.png", // logo in public/images
        width: 1200,
        height: 630,
        alt: "LaymanDB Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LaymanDB - AI-Powered Database Design Made Simple",
    description:
      "Use AI to create and visualize database schemas instantly. With LaymanDB, database design becomes effortless.",
    images: ["/images/logo.png"],
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
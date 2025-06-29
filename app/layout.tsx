import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from '@/lib/utils'
import { ThemeProvider } from "@/components/theme-provider";

const font = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  display: "swap", // Ensures font class names are stable[5]
});

export const metadata: Metadata = {
  title: "ArogyaCompass",
  description: "A Smarter path for faster Care",
  icons: {
    icon: "/favicon.png", 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(font.variable, 'font-sans')}
      style={{ backgroundColor: '#131619' }}
      suppressHydrationWarning={true} // Optional, only if you still get warnings[6]
    >
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

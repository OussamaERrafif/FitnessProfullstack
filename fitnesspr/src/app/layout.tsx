import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ReduxProvider } from "@/lib/store/ReduxProvider";

export const metadata: Metadata = {
  title: "FitnessPro - Professional Fitness Training Platform",
  description: "The complete platform for fitness trainers to manage clients, training programs, meal plans, and grow their business.",
  keywords: ["fitness", "trainer", "client management", "workout plans", "meal planning"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ReduxProvider>
          {children}
        </ReduxProvider>
        <Toaster />
      </body>
    </html>
  );
}

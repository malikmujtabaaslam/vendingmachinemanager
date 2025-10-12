import "@/css/satoshi.css";
import "@/css/style.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../globals.css";

import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    template: "%s | Vending Machine Manager",
    default: "Vending Machine Manager",
  },
  description: "Manage and run scripts on vending machines running Ubuntu.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {/* Global page loader */}
          <NextTopLoader color="#5750F1" showSpinner={false} />

          {/* Only main content here */}
          <main className="isolate w-full min-h-screen bg-gray-50 dark:bg-gray-950">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

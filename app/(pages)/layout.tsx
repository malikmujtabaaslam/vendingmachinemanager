import "@/css/satoshi.css";
import "@/css/style.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../globals.css"; // keep your global theme after

import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";

import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
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
            {/* Page loading bar */}
            <NextTopLoader color="#5750F1" showSpinner={false} />

            {/* Layout Structure */}
            <div className="flex min-h-screen">
              {/* Sidebar (from NextAdmin) */}
              <Sidebar />

              <div className="flex-1 w-full">
                {/* Header (from NextAdmin) */}
                <Header />

                {/* Main content */}
                <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
                  {children}
                </main>
              </div>
            </div>
        </Providers>
      </body>
    </html>
  );
}

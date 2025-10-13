"use client";

import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import NextTopLoader from "nextjs-toploader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#020d1a]">
      {/* Page Loader */}
      <NextTopLoader color="#5750F1" showSpinner={false} />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        {/* Scroll only this area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8 2xl:px-10">
          <div className="rounded-xl bg-white dark:bg-gray-900 shadow-md border border-gray-200 dark:border-gray-800 p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

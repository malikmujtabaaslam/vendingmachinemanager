"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/app/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getNavData } from "./data";
import { ArrowLeftIcon, ChevronUp, BookOpen, Mail } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole ? storedRole.toLowerCase() : null);
  }, []);

  const NAV_DATA = getNavData(role);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));
  };

  useEffect(() => {
    NAV_DATA.some((section) =>
      section.items.some((item) =>
        item.items.some((subItem) => {
          if ((subItem as any).url === pathname) {
            if (!expandedItems.includes(item.title)) {
              toggleExpanded(item.title);
            }
            return true;
          }
        })
      )
    );
  }, [pathname]);

  return (
    <>
      {/* Overlay for Mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "max-w-[290px] overflow-hidden border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-dark transition-[width] duration-200 ease-linear",
          isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen",
          isOpen ? "w-full" : "w-0"
        )}
      >
        <div className="flex h-full flex-col py-8 pl-6 pr-3">
          {/* Logo & Close Button */}
          <div className="relative pr-4.5">
            <Link
              href="/"
              onClick={() => isMobile && toggleSidebar()}
              className="px-0 py-2.5"
            >
              <Logo />
            </Link>

            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right"
              >
                <ArrowLeftIcon className="ml-auto size-7" />
              </button>
            )}
          </div>

          {/* Main Navigation */}
          <div className="custom-scrollbar mt-8 flex-1 overflow-y-auto pr-3">
            {NAV_DATA.map((section) => (
              <div key={section.label} className="mb-6">
                <ul className="space-y-1.5 p-0">
                  {section.items.map((item) => (
                    <li key={item.title}>
                      <MenuItem
                        as="link"
                        href={item.url}
                        isActive={pathname === item.url}
                        className="flex flex-row items-center gap-2 py-2"
                      >
                        <item.icon className="size-6 shrink-0" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </MenuItem>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer Links */}
          <div className="mt-auto border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Link
                href="/docs"
                target="_blank"
                className="flex items-center gap-2 hover:text-primary"
              >
                <BookOpen className="size-4" /> API Explorer
              </Link>

              <a
                href="mailto:zoneinvictus@gmail.com"
                className="flex items-center gap-2 hover:text-primary"
              >
                <Mail className="size-4" /> Contact Support
              </a>

              <p className="mt-2 text-xs text-gray-400">
                © {new Date().getFullYear()} Invictus Zone
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/shared/logo";
import { LiveDot } from "@/components/shared/indicators";
import { NAV_GROUPS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Slide-in navigation drawer for tablet/mobile (< lg). */
export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-muted-foreground hover:bg-white/[0.06] lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Portal to <body> so `position: fixed` is relative to the viewport,
          not the backdrop-blurred header (which would trap + clip the drawer). */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/[0.06] bg-base-primary/95 backdrop-blur-xl lg:hidden"
            >
              <div className="flex h-16 items-center justify-between px-4">
                <Logo />
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/[0.06]"
                  aria-label="Close navigation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 no-scrollbar">
                {NAV_GROUPS.map((group) => (
                  <div key={group.title}>
                    <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {group.title}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const active =
                          pathname === item.href ||
                          pathname.startsWith(item.href + "/");
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              active
                                ? "bg-white/[0.06] text-foreground"
                                : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                            )}
                          >
                            <item.icon
                              className={cn("h-[18px] w-[18px]", active && "text-brand")}
                            />
                            <span className="flex-1">{item.label}</span>
                            {item.live && <LiveDot />}
                            {item.badge && (
                              <span className="rounded-full bg-brand/15 px-1.5 py-0.5 text-[10px] font-medium text-brand-soft">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </motion.aside>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

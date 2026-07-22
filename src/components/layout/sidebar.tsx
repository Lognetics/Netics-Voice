"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, PanelLeftClose, Sparkles } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { LiveDot } from "@/components/shared/indicators";
import { NAV_GROUPS } from "@/lib/navigation";
import { useAppStore } from "@/hooks/use-app-store";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggle = useAppStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/[0.06] bg-base-primary/40 backdrop-blur-xl transition-[width] duration-300 lg:flex",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      {/* header */}
      <div className="flex h-16 items-center justify-between px-4">
        {collapsed ? (
          <Link href="/dashboard" className="mx-auto">
            <Logo showText={false} />
          </Link>
        ) : (
          <Link href="/dashboard">
            <Logo />
          </Link>
        )}
        {!collapsed && (
          <button
            onClick={toggle}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* nav */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 no-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const content = (
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-white/[0.06] text-foreground"
                        : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand"
                      />
                    )}
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        active && "text-brand"
                      )}
                    />
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                    {!collapsed && item.live && <LiveDot />}
                    {!collapsed && item.badge && (
                      <span className="rounded-full bg-brand/15 px-1.5 py-0.5 text-[10px] font-medium text-brand-soft">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );

                return collapsed ? (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{content}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                ) : (
                  <React.Fragment key={item.href}>{content}</React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* AI status card */}
      {!collapsed ? (
        <div className="p-3">
          <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-brand/10 to-success/5 p-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              <span className="text-xs font-medium">AI Employee active</span>
              <LiveDot className="ml-auto" />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Handling 5 live calls · 89% resolution
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={toggle}
          className="mx-auto mb-4 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
        </button>
      )}
    </aside>
  );
}

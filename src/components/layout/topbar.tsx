"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search, Bell, Command as CmdIcon, ChevronDown, Building2, Check,
  Settings, LogOut, User as UserIcon, Pause, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LiveDot } from "@/components/shared/indicators";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/hooks/use-app-store";
import { MobileNav } from "@/components/layout/mobile-nav";
import { currentOrg, currentUser, branches, notifications } from "@/lib/mock/db";
import { initials } from "@/lib/utils";
import { toast } from "sonner";

export function Topbar() {
  const router = useRouter();
  const setCommandOpen = useAppStore((s) => s.setCommandOpen);
  const activeBranch = useAppStore((s) => s.activeBranchId);
  const setActiveBranch = useAppStore((s) => s.setActiveBranch);
  const aiPaused = useAppStore((s) => s.aiPaused);
  const toggleAI = useAppStore((s) => s.toggleAI);

  const unread = notifications.filter((n) => !n.read).length;
  const branchLabel =
    activeBranch === "all"
      ? "All branches"
      : branches.find((b) => b.id === activeBranch)?.name ?? "All branches";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.06] bg-base-bg/70 px-4 backdrop-blur-xl sm:px-6">
      <MobileNav />

      {/* Org + branch switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.04]">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-danger to-gold text-xs font-bold text-white">
              {initials(currentOrg.name)}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight">{currentOrg.name}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">{branchLabel}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Branches</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setActiveBranch("all")}>
            <Building2 /> All branches
            {activeBranch === "all" && <Check className="ml-auto text-brand" />}
          </DropdownMenuItem>
          {branches.map((b) => (
            <DropdownMenuItem key={b.id} onClick={() => setActiveBranch(b.id)}>
              <Building2 /> {b.city}
              {activeBranch === b.id && <Check className="ml-auto text-brand" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Search */}
      <button
        onClick={() => setCommandOpen(true)}
        className="ml-auto flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] sm:w-72 sm:justify-between"
      >
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search everything…</span>
        </span>
        <kbd className="hidden items-center gap-0.5 rounded border border-white/10 px-1.5 py-0.5 text-[10px] sm:flex">
          <CmdIcon className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* AI pause toggle */}
      <Button
        variant={aiPaused ? "destructive" : "outline"}
        size="sm"
        onClick={() => {
          toggleAI();
          toast[aiPaused ? "success" : "warning"](
            aiPaused ? "AI resumed - now answering calls" : "AI paused - calls route to staff"
          );
        }}
        className="hidden sm:inline-flex"
      >
        {aiPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        {aiPaused ? "AI Paused" : "AI Active"}
      </Button>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            Notifications <Badge variant="secondary">{unread} new</Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.slice(0, 5).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex-col items-start gap-0.5"
              onClick={() => router.push("/notifications")}
            >
              <div className="flex w-full items-center gap-2">
                {!n.read && <LiveDot color="#3A86FF" className="h-2 w-2" />}
                <span className="text-sm font-medium">{n.title}</span>
              </div>
              <span className="text-xs text-muted-foreground">{n.body}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/notifications")} className="justify-center text-brand">
            View all
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full transition-opacity hover:opacity-90">
            <Avatar className="h-9 w-9">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback>{initials(currentUser.name)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2.5 py-2">
            <p className="text-sm font-medium">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            <Badge variant="gold" className="mt-1.5 capitalize">{currentUser.role}</Badge>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <UserIcon /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/")} className="text-danger">
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

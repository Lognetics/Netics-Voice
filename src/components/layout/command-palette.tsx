"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search, ArrowRight, Sparkles, Phone, ShoppingCart, CalendarCheck, Users,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ALL_NAV_ITEMS } from "@/lib/navigation";
import { useAppStore } from "@/hooks/use-app-store";
import { customers, orders } from "@/lib/mock/db";

const quickActions = [
  { label: "Start a test call", icon: Phone, href: "/calls" },
  { label: "Create an order", icon: ShoppingCart, href: "/orders" },
  { label: "New booking", icon: CalendarCheck, href: "/bookings" },
  { label: "Add a customer", icon: Users, href: "/customers" },
];

export function CommandPalette() {
  const router = useRouter();
  const open = useAppStore((s) => s.commandOpen);
  const setOpen = useAppStore((s) => s.setCommandOpen);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const go = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground/70">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Command.Input
              placeholder="Search or jump to…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            />
            <kbd className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Quick actions">
              {quickActions.map((a) => (
                <Command.Item
                  key={a.label}
                  onSelect={() => go(a.href)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-white/[0.06]"
                >
                  <div className="grid h-7 w-7 place-items-center rounded-md bg-brand/12">
                    <a.icon className="h-4 w-4 text-brand" />
                  </div>
                  {a.label}
                  <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Navigate">
              {ALL_NAV_ITEMS.map((item) => (
                <Command.Item
                  key={item.href}
                  value={item.label}
                  onSelect={() => go(item.href)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-white/[0.06]"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Customers">
              {customers.slice(0, 5).map((c) => (
                <Command.Item
                  key={c.id}
                  value={`customer ${c.name}`}
                  onSelect={() => go("/customers")}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-white/[0.06]"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {c.name}
                  <span className="ml-auto text-xs text-muted-foreground">{c.phone}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Recent orders">
              {orders.slice(0, 4).map((o) => (
                <Command.Item
                  key={o.id}
                  value={`order ${o.reference}`}
                  onSelect={() => go("/orders")}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-white/[0.06]"
                >
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  {o.reference}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {o.customerName}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
          <div className="flex items-center gap-2 border-t border-white/[0.06] px-4 py-2.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            Tip: press <kbd className="rounded border border-white/10 px-1">⌘K</kbd> anywhere
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

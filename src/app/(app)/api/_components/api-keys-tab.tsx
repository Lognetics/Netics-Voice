"use client";

import * as React from "react";
import { KeyRound, Plus, Copy, Eye, EyeOff, Ban } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiKeys as seedKeys } from "@/lib/mock";
import { timeAgo } from "@/lib/utils";
import type { ApiKey } from "@/types";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ApiKeysTab() {
  const [keys, setKeys] = React.useState<ApiKey[]>(seedKeys);
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [generated, setGenerated] = React.useState<string | null>(null);
  const [revealed, setRevealed] = React.useState(false);

  function createKey() {
    const secret = `nvk_live_${Math.random().toString(36).slice(2, 10)}${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    setGenerated(secret);
    setRevealed(false);
    setKeys((prev) => [
      {
        id: `key_${Date.now()}`,
        name: name || "Untitled key",
        prefix: secret.slice(0, 13),
        scopes: ["calls:read", "orders:read"],
        createdAt: new Date().toISOString(),
        lastUsed: undefined,
        status: "active",
      },
      ...prev,
    ]);
    toast.success("API key created");
  }

  function closeDialog() {
    setOpen(false);
    setName("");
    setGenerated(null);
    setRevealed(false);
  }

  function revoke(id: string) {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "revoked" } : k))
    );
    toast.message("API key revoked");
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>API keys</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Authenticate requests to the NETICS Voice API.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Create key
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs text-muted-foreground">
                <th className="px-6 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Key</th>
                <th className="px-4 py-2 font-medium">Scopes</th>
                <th className="px-4 py-2 font-medium">Created</th>
                <th className="px-4 py-2 font-medium">Last used</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-6 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr
                  key={k.id}
                  className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-3 font-medium">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {k.prefix}••••••••
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {k.scopes.map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(k.createdAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {k.lastUsed ? timeAgo(k.lastUsed) : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={k.status === "active" ? "success" : "secondary"} className="capitalize">
                      {k.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-right">
                    {k.status === "active" && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => revoke(k.id)}
                        title="Revoke"
                      >
                        <Ban className="h-4 w-4 text-danger" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : closeDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Create API key
            </DialogTitle>
            <DialogDescription>
              {generated
                ? "Copy your key now - you won't be able to see it again."
                : "Give your key a descriptive name."}
            </DialogDescription>
          </DialogHeader>

          {generated ? (
            <div className="space-y-2">
              <Label>Your new API key</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={revealed ? generated : `${generated.slice(0, 12)}${"•".repeat(16)}`}
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRevealed((r) => !r)}
                >
                  {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard?.writeText(generated).catch(() => {});
                    toast.success("Key copied to clipboard");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="key-name">Key name</Label>
              <Input
                id="key-name"
                placeholder="e.g. Production Server"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <DialogFooter>
            {generated ? (
              <Button onClick={closeDialog}>Done</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button onClick={createKey}>Generate key</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

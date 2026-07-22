"use client";

import * as React from "react";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { Integration } from "@/types";

export function ConfigureDialog({
  integration,
  open,
  onOpenChange,
}: {
  integration: Integration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [syncEnabled, setSyncEnabled] = React.useState(true);
  const [twoWay, setTwoWay] = React.useState(true);
  const apiKey = React.useMemo(
    () => `int_${(integration?.id ?? "key").replace("int_", "")}_${"sk"}_9f4a2c8b71d0e6`,
    [integration]
  );

  if (!integration) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configure {integration.name}</DialogTitle>
          <DialogDescription>
            Manage how NETICS syncs data with {integration.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="int-api-key">API key</Label>
            <div className="flex gap-2">
              <Input
                id="int-api-key"
                readOnly
                value={apiKey}
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard?.writeText(apiKey).catch(() => {});
                  toast.success("API key copied to clipboard");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="int-webhook">Webhook endpoint</Label>
            <Input
              id="int-webhook"
              defaultValue={`https://api.bellacucina.com/hooks/${integration.id}`}
              className="font-mono text-xs"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Automatic sync</p>
              <p className="text-xs text-muted-foreground">
                Sync records every 5 minutes.
              </p>
            </div>
            <Switch checked={syncEnabled} onCheckedChange={setSyncEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Two-way sync</p>
              <p className="text-xs text-muted-foreground">
                Push changes back to {integration.name}.
              </p>
            </div>
            <Switch checked={twoWay} onCheckedChange={setTwoWay} />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              toast.success(`${integration.name} re-synced`);
            }}
          >
            <RefreshCw className="h-4 w-4" /> Sync now
          </Button>
          <Button
            onClick={() => {
              toast.success(`${integration.name} settings saved`);
              onOpenChange(false);
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

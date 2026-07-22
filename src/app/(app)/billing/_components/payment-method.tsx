"use client";

import * as React from "react";
import { CreditCard, Plus, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PaymentMethodCard() {
  const [open, setOpen] = React.useState(false);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Payment method</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add method
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="grid h-11 w-16 place-items-center rounded-lg bg-gradient-to-br from-brand/30 to-brand/10 text-brand">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Visa •••• 4471</p>
              <Badge variant="secondary">Default</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Expires 09 / 2027</p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
            <MapPin className="h-4 w-4 text-muted-foreground" /> Billing address
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Bella Cucina Group
            <br />
            488 Park Avenue, Suite 1200
            <br />
            New York, NY 10022
            <br />
            United States
          </p>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add payment method</DialogTitle>
            <DialogDescription>
              Cards are securely tokenized - we never store raw numbers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="pm-name">Cardholder name</Label>
              <Input id="pm-name" placeholder="Jane Doe" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pm-number">Card number</Label>
              <Input id="pm-number" placeholder="1234 5678 9012 3456" inputMode="numeric" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pm-exp">Expiry</Label>
                <Input id="pm-exp" placeholder="MM / YY" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pm-cvc">CVC</Label>
                <Input id="pm-cvc" placeholder="123" inputMode="numeric" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Payment method added");
                setOpen(false);
              }}
            >
              Add card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

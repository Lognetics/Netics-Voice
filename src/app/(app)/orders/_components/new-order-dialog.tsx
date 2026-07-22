"use client";

import * as React from "react";
import { Plus, Minus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import type { Order, Product } from "@/types";

interface Props {
  products: Product[];
  onCreate: (order: Order) => void;
  orgId: string;
  branchId: string;
}

export function NewOrderDialog({ products, onCreate, orgId, branchId }: Props) {
  const [open, setOpen] = React.useState(false);
  const [productId, setProductId] = React.useState<string>(products[0]?.id ?? "");
  const [qty, setQty] = React.useState(1);
  const [customerName, setCustomerName] = React.useState("");
  const [type, setType] = React.useState<Order["type"]>("delivery");

  const product = products.find((p) => p.id === productId);
  const total = product ? product.price * qty : 0;

  function reset() {
    setProductId(products[0]?.id ?? "");
    setQty(1);
    setCustomerName("");
    setType("delivery");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    const name = customerName.trim() || "Walk-in customer";
    const ref = `BC-${Math.floor(10000 + Math.random() * 89999)}`;
    const order: Order = {
      id: `ord_new_${Date.now()}`,
      orgId,
      branchId,
      customerId: "cus_manual",
      customerName: name,
      reference: ref,
      items: [
        {
          id: `oi_new_${Date.now()}`,
          productId: product.id,
          name: product.name,
          quantity: qty,
          price: product.price,
        },
      ],
      total: parseFloat((product.price * qty).toFixed(2)),
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: "Cash",
      type,
      channel: "webchat",
      createdAt: new Date().toISOString(),
      eta: type === "delivery" ? "30 min" : "15 min",
      address: type === "delivery" ? "—" : undefined,
      aiCreated: false,
    };
    onCreate(order);
    toast.success(`Order ${ref} created`, {
      description: `${qty} × ${product.name} · ${formatCurrency(order.total)}`,
    });
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="gold">
          <Plus className="h-4 w-4" /> New order
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create order</DialogTitle>
          <DialogDescription>
            Manually log an order. It enters the pipeline as{" "}
            <span className="text-foreground">Pending</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="product">Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger id="product">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} · {formatCurrency(p.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-sm font-semibold tabular">
                  {qty}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as Order["type"])}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="dine_in">Dine-in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customer">Customer name</Label>
            <Input
              id="customer"
              placeholder="e.g. Jordan Ellis"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <span className="text-sm text-muted-foreground">Order total</span>
            <span className="text-lg font-semibold tabular">
              {formatCurrency(total)}
            </span>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!product}>
              <Sparkles className="h-4 w-4" /> Create order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

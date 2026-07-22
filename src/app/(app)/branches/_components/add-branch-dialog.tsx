"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";

export interface NewBranchInput {
  name: string;
  city: string;
  phone: string;
  managerName: string;
}

export function AddBranchDialog({
  onAdd,
}: {
  onAdd: (b: NewBranchInput) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<NewBranchInput>({
    name: "",
    city: "",
    phone: "",
    managerName: "",
  });

  const valid = form.name.trim() && form.city.trim();

  const set = (k: keyof NewBranchInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    if (!valid) return;
    onAdd(form);
    toast.success("Branch added", {
      description: `${form.name || form.city} is now live in your network.`,
    });
    setForm({ name: "", city: "", phone: "", managerName: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gold">
          <Plus className="h-4 w-4" /> Add branch
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a branch</DialogTitle>
          <DialogDescription>
            Spin up a new location. Your AI employee inherits the org personality
            automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="br-name">Branch name</Label>
            <Input
              id="br-name"
              placeholder="Bella Cucina — Downtown"
              value={form.name}
              onChange={set("name")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="br-city">City</Label>
              <Input
                id="br-city"
                placeholder="New York"
                value={form.city}
                onChange={set("city")}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="br-phone">Phone</Label>
              <Input
                id="br-phone"
                placeholder="+1 (212) 555-0100"
                value={form.phone}
                onChange={set("phone")}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="br-manager">Manager</Label>
            <Input
              id="br-manager"
              placeholder="Jordan Rivera"
              value={form.managerName}
              onChange={set("managerName")}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button variant="gold" disabled={!valid} onClick={submit}>
            Create branch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Account created - let's set up your workspace");
      router.push("/onboarding");
    }, 1000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-semibold tracking-tight">Start your free trial</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        14 days free. No credit card required.
      </p>

      <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {["Full platform access", "Cancel anytime", "Setup in minutes"].map((f) => (
          <span key={f} className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-success" /> {f}
          </span>
        ))}
      </div>

      <Separator className="my-6" />

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="first">First name</Label>
            <Input id="first" placeholder="James" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last">Last name</Label>
            <Input id="last" placeholder="Okafor" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">Company</Label>
          <Input id="company" placeholder="Bella Cucina Group" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" placeholder="you@company.com" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Create a strong password" required />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}

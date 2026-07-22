"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Welcome back to NETICS Voice");
      router.push("/dashboard");
    }, 900);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Welcome back. Enter your details to access your workspace.
      </p>

      <div className="mt-7 grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12 11v2h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 2.7 14.7 1.8 12 1.8 6.8 1.8 2.6 6 2.6 11.2S6.8 20.6 12 20.6c6 0 9.4-4.2 9.4-9.1 0-.6-.1-1.1-.2-1.5H12z"/></svg>
          Google
        </Button>
        <Button variant="outline" onClick={() => toast.info("SSO is a placeholder in this prototype")}>
          <ShieldCheck className="h-4 w-4" /> SSO
        </Button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" defaultValue="owner@bellacucina.com" className="pl-9" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-brand hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type="password" defaultValue="demo1234" className="pl-9" required />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&rsquo;t have an account?{" "}
        <Link href="/register" className="font-medium text-brand hover:underline">
          Start free trial
        </Link>
      </p>
    </motion.div>
  );
}

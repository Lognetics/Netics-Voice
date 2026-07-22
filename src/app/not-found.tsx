import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-[500px] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px]" />
      <div className="relative">
        <Logo size="lg" />
        <p className="mt-10 text-7xl font-semibold tracking-tight text-gradient-brand">404</p>
        <h1 className="mt-4 text-xl font-semibold">This line went quiet.</h1>
        <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
          The page you&rsquo;re looking for doesn&rsquo;t exist - but your AI employee is still
          answering every call.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="h-4 w-4" /> Landing</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard"><Home className="h-4 w-4" /> Go to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

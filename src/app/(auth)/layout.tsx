import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { VoiceWaveform } from "@/components/shared/voice-waveform";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          © 2026 NETICS Voice · Prototype with mock data
        </p>
      </div>

      {/* Right — brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="pointer-events-none absolute left-1/2 top-1/4 h-72 w-[500px] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]" />

        <div className="relative flex h-full flex-col justify-center px-14">
          <Badge variant="gold" className="mb-6 w-fit">
            <Sparkles className="h-3 w-3" /> AI Customer Operations
          </Badge>
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
            The AI Employee that never misses a customer.
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Answer every call, book every table, take every order — in 150+ languages,
            across every channel, 24/7.
          </p>

          <div className="mt-10 glass w-fit rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-success" />
              <span className="text-sm text-muted-foreground">Live call · Aria AI</span>
            </div>
            <VoiceWaveform active bars={32} className="mt-3 h-8 w-64" />
            <p className="mt-3 text-sm">
              &ldquo;Perfect — I&rsquo;ve booked your table for four at 7pm. 🎉&rdquo;
            </p>
          </div>

          <div className="mt-10 flex gap-8 text-sm">
            <div>
              <p className="text-2xl font-semibold">89%</p>
              <p className="text-muted-foreground">Resolved by AI</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">150+</p>
              <p className="text-muted-foreground">Languages</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">24/7</p>
              <p className="text-muted-foreground">Always on</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

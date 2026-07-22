"use client";

import * as React from "react";
import { Copy, Terminal, Braces } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { docEndpoints, methodTone, sampleCurl, sampleResponse } from "./data";

function CodeBlock({
  label,
  code,
  icon: Icon,
}: {
  label: string;
  code: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-black/30">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2">
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> {label}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            navigator.clipboard?.writeText(code).catch(() => {});
            toast.success("Copied to clipboard");
          }}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground/90">
        {code}
      </pre>
    </div>
  );
}

export function DocsTab() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>API reference</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Base URL <span className="font-mono text-foreground">https://api.netics.ai</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {docEndpoints.map((e) => (
            <div
              key={`${e.method}-${e.path}`}
              className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
            >
              <span
                className={cn(
                  "w-14 shrink-0 rounded-md px-2 py-0.5 text-center font-mono text-[11px] font-semibold",
                  methodTone[e.method].badge
                )}
              >
                {e.method}
              </span>
              <span className="font-mono text-xs">{e.path}</span>
              <span className="ml-auto hidden truncate text-xs text-muted-foreground sm:block">
                {e.description}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quickstart</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Place an outbound AI call in one request.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <CodeBlock label="Request · cURL" code={sampleCurl} icon={Terminal} />
          <CodeBlock label="Response · 200 OK" code={sampleResponse} icon={Braces} />
        </CardContent>
      </Card>
    </div>
  );
}

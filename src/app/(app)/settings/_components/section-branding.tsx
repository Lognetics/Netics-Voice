"use client";

import * as React from "react";
import { toast } from "sonner";
import { Upload, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { currentOrg } from "@/lib/mock/db";
import { initials, cn } from "@/lib/utils";
import { SettingsSection, Field } from "./settings-primitives";

const SWATCHES = [
  "#3A86FF",
  "#00C896",
  "#C9A227",
  "#FF4D4F",
  "#8B5CF6",
  "#EC4899",
  "#F97316",
  "#06B6D4",
];

export function SectionBranding({ onDirty }: { onDirty: () => void }) {
  const [color, setColor] = React.useState(currentOrg.brandColor);
  const [greeting, setGreeting] = React.useState(currentOrg.greeting);

  const touch = () => onDirty();

  return (
    <SettingsSection
      title="Branding"
      description="How your workspace and AI employee present themselves."
    >
      {/* Logo */}
      <Field label="Logo">
        <div className="flex items-center gap-4">
          <div
            className="grid h-16 w-16 place-items-center rounded-2xl text-lg font-bold text-white shadow-glow"
            style={{ backgroundColor: color }}
          >
            {initials(currentOrg.name)}
          </div>
          <div className="space-y-1">
            <Button
              variant="outline"
              onClick={() =>
                toast("Logo upload", {
                  description: "Drag a PNG or SVG here (demo placeholder).",
                })
              }
            >
              <Upload className="h-4 w-4" /> Upload logo
            </Button>
            <p className="text-xs text-muted-foreground">
              PNG or SVG, at least 256×256px.
            </p>
          </div>
        </div>
      </Field>

      {/* Brand color */}
      <Field label="Brand color" hint="Used across highlights, buttons and charts.">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative h-10 w-14 overflow-hidden rounded-lg border border-white/10">
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                touch();
              }}
              className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0"
              aria-label="Pick brand color"
            />
          </div>
          <Input
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              touch();
            }}
            className="w-32 font-mono uppercase"
          />
          <div className="flex flex-wrap gap-1.5">
            {SWATCHES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setColor(s);
                  touch();
                }}
                className={cn(
                  "h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-transparent transition-transform hover:scale-110",
                  color.toLowerCase() === s.toLowerCase()
                    ? "ring-white/60"
                    : "ring-transparent"
                )}
                style={{ backgroundColor: s }}
                aria-label={`Use ${s}`}
              />
            ))}
          </div>
        </div>
      </Field>

      {/* Greeting */}
      <Field label="AI greeting" hint="The first thing customers hear.">
        <Textarea
          value={greeting}
          onChange={(e) => {
            setGreeting(e.target.value);
            touch();
          }}
        />
      </Field>

      {/* Live preview */}
      <Field label="Preview">
        <div className="overflow-hidden rounded-xl border border-white/[0.06]">
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ backgroundColor: `${color}1f` }}
          >
            <div
              className="grid h-9 w-9 place-items-center rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {initials(currentOrg.name)}
            </div>
            <div>
              <p className="text-sm font-semibold">{currentOrg.name}</p>
              <p className="text-[11px] text-muted-foreground">
                AI employee · online
              </p>
            </div>
            <Badge
              className="ml-auto border-transparent text-white"
              style={{ backgroundColor: color }}
            >
              <Sparkles className="h-3 w-3" /> Live
            </Badge>
          </div>
          <div className="bg-white/[0.02] px-4 py-3">
            <div
              className="inline-block max-w-[85%] rounded-2xl rounded-tl-sm px-3.5 py-2 text-sm text-white"
              style={{ backgroundColor: color }}
            >
              {greeting}
            </div>
          </div>
        </div>
      </Field>
    </SettingsSection>
  );
}

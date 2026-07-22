"use client";

import * as React from "react";
import { Globe, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES } from "@/lib/constants";
import { currentOrg } from "@/lib/mock/db";
import { SettingsSection, Field } from "./settings-primitives";

const DATE_FORMATS = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "D MMM YYYY"];
const NUMBER_FORMATS = [
  { value: "1,234.56", label: "1,234.56 (US)" },
  { value: "1.234,56", label: "1.234,56 (EU)" },
  { value: "1 234,56", label: "1 234,56 (FR)" },
];
const CURRENCIES = ["USD", "EUR", "GBP", "AED", "NGN", "INR", "BRL", "CNY"];

export function SectionLocalization({ onDirty }: { onDirty: () => void }) {
  const [defaultLang, setDefaultLang] = React.useState(
    currentOrg.languages[0] ?? "English"
  );
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const l of LANGUAGES) map[l] = currentOrg.languages.includes(l);
    return map;
  });
  const [dateFormat, setDateFormat] = React.useState(DATE_FORMATS[0]);
  const [numberFormat, setNumberFormat] = React.useState(NUMBER_FORMATS[0].value);
  const [currency, setCurrency] = React.useState("USD");

  const enabledCount = Object.values(enabled).filter(Boolean).length;

  const toggleLang = (lang: string) => {
    setEnabled((prev) => ({ ...prev, [lang]: !prev[lang] }));
    onDirty();
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Languages"
        description="Languages your AI employee can speak and understand."
        actions={
          <Badge variant="secondary">
            <Globe className="h-3 w-3" /> {enabledCount} enabled
          </Badge>
        }
      >
        <Field label="Default language" className="max-w-xs">
          <Select
            value={defaultLang}
            onValueChange={(v) => {
              setDefaultLang(v);
              onDirty();
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.filter((l) => enabled[l]).map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="grid gap-2 sm:grid-cols-2">
          {LANGUAGES.map((lang) => {
            const isDefault = lang === defaultLang;
            return (
              <div
                key={lang}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{lang}</span>
                  {isDefault && (
                    <Badge variant="default" className="px-1.5 py-0 text-[10px]">
                      <Check className="h-2.5 w-2.5" /> Default
                    </Badge>
                  )}
                </div>
                <Switch
                  checked={!!enabled[lang]}
                  disabled={isDefault}
                  onCheckedChange={() => toggleLang(lang)}
                />
              </div>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Formats"
        description="Regional formatting for dates, numbers and currency."
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Date format">
            <Select
              value={dateFormat}
              onValueChange={(v) => {
                setDateFormat(v);
                onDirty();
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMATS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Number format">
            <Select
              value={numberFormat}
              onValueChange={(v) => {
                setNumberFormat(v);
                onDirty();
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NUMBER_FORMATS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Currency">
            <Select
              value={currency}
              onValueChange={(v) => {
                setCurrency(v);
                onDirty();
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </SettingsSection>
    </div>
  );
}

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Library,
  Files,
  CheckCircle2,
  Gauge,
  Boxes,
  Loader2,
  Search,
  MoreVertical,
  Eye,
  RefreshCw,
  History,
  Trash2,
  Plus,
  FileText,
  Link2,
  Brain,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfidenceMeter } from "@/components/shared/indicators";
import { Donut, BarSeries } from "@/components/shared/charts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { knowledgeDocs, currentUser } from "@/lib/mock";
import { cn, formatNumber, timeAgo } from "@/lib/utils";
import type { DocType, KnowledgeDocument } from "@/types";

import {
  DocTypeIcon,
  formatSize,
  statusMeta,
  docTint,
} from "./_components/doc-utils";
import { UploadZone } from "./_components/upload-zone";

const DOC_TYPES: DocType[] = [
  "pdf",
  "word",
  "excel",
  "powerpoint",
  "csv",
  "image",
  "menu",
  "policy",
  "faq",
  "catalog",
  "pricelist",
  "contract",
  "url",
  "text",
];

const STATUS_COLORS: Record<KnowledgeDocument["status"], string> = {
  indexed: "#00C896",
  processing: "#C9A227",
  queued: "#6BA5FF",
  failed: "#FF4D4F",
};

let mockCounter = 0;

export default function KnowledgePage() {
  const [docs, setDocs] = React.useState<KnowledgeDocument[]>(() =>
    knowledgeDocs.slice(0, 24)
  );
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  const [historyDoc, setHistoryDoc] =
    React.useState<KnowledgeDocument | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);

  const categories = React.useMemo(() => {
    const set = new Set(knowledgeDocs.map((d) => d.category));
    return ["all", ...Array.from(set)];
  }, []);

  /* --------------------------- Derived stats --------------------------- */
  const stats = React.useMemo(() => {
    const total = docs.length;
    const indexed = docs.filter((d) => d.status === "indexed").length;
    const processing = docs.filter(
      (d) => d.status === "processing" || d.status === "queued"
    ).length;
    const chunks = docs.reduce((s, d) => s + d.chunks, 0);
    const avgConf =
      total > 0
        ? docs.reduce((s, d) => s + d.confidence, 0) / total
        : 0;
    return { total, indexed, processing, chunks, avgConf };
  }, [docs]);

  const statusDist = React.useMemo(() => {
    const order: KnowledgeDocument["status"][] = [
      "indexed",
      "processing",
      "queued",
      "failed",
    ];
    return order
      .map((s) => ({
        name: statusMeta(s).label,
        value: docs.filter((d) => d.status === s).length,
        color: STATUS_COLORS[s],
      }))
      .filter((d) => d.value > 0);
  }, [docs]);

  const perCategory = React.useMemo(() => {
    const map = new Map<string, number>();
    docs.forEach((d) => map.set(d.category, (map.get(d.category) ?? 0) + 1));
    return Array.from(map.entries())
      .map(([cat, count]) => ({ cat, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [docs]);

  /* ----------------------------- Filtering ----------------------------- */
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return docs.filter((d) => {
      if (category !== "all" && d.category !== category) return false;
      if (typeFilter !== "all" && d.type !== typeFilter) return false;
      if (q) {
        const hay = `${d.name} ${d.category} ${d.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [docs, search, category, typeFilter]);

  /* ------------------------------ Actions ------------------------------ */
  function simulateIndexing(id: string) {
    // processing -> indexed after a beat
    window.setTimeout(() => {
      setDocs((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, status: "indexed", confidence: 0.9 + Math.random() * 0.09 }
            : d
        )
      );
      toast.success("Document indexed", {
        description: "AI comprehension complete - now searchable.",
      });
    }, 2600);
  }

  function addDoc(partial: Partial<KnowledgeDocument>) {
    mockCounter += 1;
    const doc: KnowledgeDocument = {
      id: `doc_new_${mockCounter}`,
      orgId: "org_0001",
      name: partial.name ?? `Uploaded Document ${mockCounter}.pdf`,
      type: partial.type ?? "pdf",
      category: partial.category ?? "Uploads",
      sizeKb: partial.sizeKb ?? 120 + Math.floor(Math.random() * 3200),
      status: "processing",
      confidence: 0,
      chunks: partial.chunks ?? 8 + Math.floor(Math.random() * 120),
      version: 1,
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString(),
      usageCount: 0,
      tags: partial.tags ?? [partial.category ?? "Uploads"],
    };
    setDocs((prev) => [doc, ...prev]);
    toast("Uploading…", { description: doc.name, icon: "📄" });
    simulateIndexing(doc.id);
    return doc;
  }

  function reindex(doc: KnowledgeDocument) {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === doc.id ? { ...d, status: "processing", confidence: 0 } : d
      )
    );
    toast("Re-indexing", { description: doc.name, icon: "🔄" });
    simulateIndexing(doc.id);
  }

  function remove(doc: KnowledgeDocument) {
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    toast.success("Document removed", { description: doc.name });
  }

  const hasFilters =
    search.trim() !== "" || category !== "all" || typeFilter !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base"
        description="Everything your AI knows - documents, policies and menus, auto-indexed."
        icon={<Library className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" /> Add text / URL
            </Button>
            <Button onClick={() => addDoc({})}>
              <Plus className="h-4 w-4" /> Upload document
            </Button>
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total documents" value={stats.total} icon={Files} />
        <StatCard
          label="Indexed"
          value={stats.indexed}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Avg. confidence"
          value={Math.round(stats.avgConf * 100)}
          suffix="%"
          icon={Gauge}
          accent="gold"
        />
        <StatCard
          label="Total chunks"
          value={stats.chunks}
          icon={Boxes}
          compact
        />
        <StatCard
          label="Processing"
          value={stats.processing}
          icon={Loader2}
          accent={stats.processing > 0 ? "gold" : "brand"}
        />
      </div>

      {/* Upload zone */}
      <UploadZone onUpload={() => addDoc({})} />

      {/* Analytics panel */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Index status</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Distribution across your library
            </p>
          </CardHeader>
          <CardContent>
            {statusDist.length > 0 ? (
              <>
                <Donut
                  data={statusDist}
                  centerValue={`${stats.total}`}
                  centerLabel="documents"
                />
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {statusDist.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: s.color }}
                      />
                      <span className="text-muted-foreground">{s.name}</span>
                      <span className="ml-auto font-medium">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No documents yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Docs per category</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Where your knowledge lives
            </p>
          </CardHeader>
          <CardContent>
            {perCategory.length > 0 ? (
              <BarSeries
                data={perCategory.map((c) => ({
                  cat:
                    c.cat.length > 8 ? `${c.cat.slice(0, 8)}…` : c.cat,
                  docs: c.count,
                }))}
                xKey="cat"
                series={[{ key: "docs", color: "#3A86FF", name: "Documents" }]}
                height={220}
              />
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No data.
              </p>
            )}
          </CardContent>
        </Card>

        {/* AI comprehension highlight */}
        <Card className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(90% 70% at 100% 0%, rgba(0,200,150,0.12), transparent 60%)",
            }}
          />
          <CardHeader className="relative flex-row items-center gap-2">
            <Brain className="h-4 w-4 text-success" />
            <CardTitle>AI comprehension</CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-semibold tabular text-success">
                  {Math.round(stats.avgConf * 100)}%
                </span>
                <Badge variant="success">
                  <Sparkles className="h-3 w-3" /> Healthy
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Average comprehension confidence across all indexed knowledge.
              </p>
            </div>
            <Separator />
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Indexed coverage</span>
                <span className="font-medium tabular">
                  {stats.total > 0
                    ? Math.round((stats.indexed / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
              <Progress
                value={
                  stats.total > 0 ? (stats.indexed / stats.total) * 100 : 0
                }
                indicatorClassName="bg-success"
              />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Searchable chunks</span>
                <span className="font-medium tabular">
                  {formatNumber(stats.chunks)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters + document list */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Documents</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search documents…"
                  className="w-full pl-9 sm:w-64"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {DOC_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-brand/50 bg-brand/15 text-brand-soft"
                      : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-foreground"
                  )}
                >
                  {c === "all" ? "All categories" : c}
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState
              icon={Files}
              title={hasFilters ? "No matching documents" : "No documents yet"}
              description={
                hasFilters
                  ? "Try adjusting your search or filters."
                  : "Upload your first document to build your AI's knowledge."
              }
              action={
                hasFilters ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setCategory("all");
                      setTypeFilter("all");
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button onClick={() => addDoc({})}>
                    <Plus className="h-4 w-4" /> Upload document
                  </Button>
                )
              }
            />
          ) : (
            <div className="space-y-2">
              {/* Header row (md+) */}
              <div className="hidden grid-cols-12 gap-3 px-3 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:grid">
                <div className="col-span-4">Document</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Confidence</div>
                <div className="col-span-1 text-right">Chunks</div>
                <div className="col-span-2">Uploaded</div>
                <div className="col-span-1 text-right">Usage</div>
              </div>

              <AnimatePresence initial={false}>
                {filtered.map((doc) => {
                  const meta = statusMeta(doc.status);
                  const busy =
                    doc.status === "processing" || doc.status === "queued";
                  return (
                    <motion.div
                      key={doc.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-12 items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.015] p-3 transition-colors hover:border-white/[0.1] hover:bg-white/[0.03]"
                    >
                      {/* Name + type */}
                      <div className="col-span-12 flex min-w-0 items-center gap-3 md:col-span-4">
                        <span
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
                          style={{ backgroundColor: `${docTint(doc.type)}1f` }}
                        >
                          <DocTypeIcon type={doc.type} className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {doc.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {formatSize(doc.sizeKb)} · v{doc.version} ·{" "}
                            {doc.uploadedBy}
                          </p>
                        </div>
                      </div>

                      {/* Category + status */}
                      <div className="col-span-6 flex flex-wrap items-center gap-1.5 md:col-span-2">
                        <Badge variant="outline">{doc.category}</Badge>
                        <Badge variant={meta.variant}>
                          {busy && (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          )}
                          {meta.label}
                        </Badge>
                      </div>

                      {/* Confidence */}
                      <div className="col-span-6 md:col-span-2">
                        {busy ? (
                          <Progress
                            value={doc.status === "processing" ? 55 : 15}
                            indicatorClassName="bg-gold"
                          />
                        ) : doc.status === "failed" ? (
                          <span className="text-xs text-danger-soft">
                            Index failed
                          </span>
                        ) : (
                          <ConfidenceMeter value={doc.confidence} />
                        )}
                      </div>

                      {/* Chunks */}
                      <div className="col-span-4 text-left text-sm tabular text-muted-foreground md:col-span-1 md:text-right">
                        {doc.chunks}
                      </div>

                      {/* Uploaded */}
                      <div className="col-span-4 text-xs text-muted-foreground md:col-span-2">
                        {timeAgo(doc.uploadedAt)}
                      </div>

                      {/* Usage + actions */}
                      <div className="col-span-4 flex items-center justify-end gap-2 md:col-span-1">
                        <span className="text-sm tabular text-muted-foreground">
                          {formatNumber(doc.usageCount, true)}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                toast(`Opening ${doc.name}`, { icon: "👁️" })
                              }
                            >
                              <Eye /> View document
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => reindex(doc)}>
                              <RefreshCw /> Re-index
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setHistoryDoc(doc)}
                            >
                              <History /> Version history
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => remove(doc)}
                              className="text-danger-soft focus:bg-danger/10"
                            >
                              <Trash2 /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Version history dialog */}
      <VersionHistoryDialog
        doc={historyDoc}
        onOpenChange={(open) => !open && setHistoryDoc(null)}
      />

      {/* Add text / URL dialog */}
      <AddSourceDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={addDoc}
      />
    </div>
  );
}

/* ------------------------- Version history dialog ------------------------ */

function VersionHistoryDialog({
  doc,
  onOpenChange,
}: {
  doc: KnowledgeDocument | null;
  onOpenChange: (open: boolean) => void;
}) {
  const versions = React.useMemo(() => {
    if (!doc) return [];
    return Array.from({ length: doc.version }, (_, i) => {
      const v = doc.version - i;
      return {
        v,
        current: v === doc.version,
        by: doc.uploadedBy,
        note:
          v === doc.version
            ? "Current version - indexed and live."
            : v === 1
            ? "Initial upload."
            : "Content updated and re-indexed.",
      };
    });
  }, [doc]);

  return (
    <Dialog open={!!doc} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Version history</DialogTitle>
          <DialogDescription>{doc?.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {versions.map((ver, i) => (
            <div key={ver.v} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-full text-xs font-semibold",
                    ver.current
                      ? "bg-brand text-white"
                      : "bg-white/[0.06] text-muted-foreground"
                  )}
                >
                  v{ver.v}
                </span>
                {i < versions.length - 1 && (
                  <span className="my-1 w-px flex-1 bg-white/10" />
                )}
              </div>
              <div className="pb-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Version {ver.v}</p>
                  {ver.current && <Badge variant="success">Current</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{ver.note}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                  by {ver.by}
                </p>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              toast.success("Restored version", {
                description: `${doc?.name} rolled back.`,
              });
              onOpenChange(false);
            }}
          >
            Restore selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- Add source dialog --------------------------- */

function AddSourceDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (partial: Partial<KnowledgeDocument>) => void;
}) {
  const [mode, setMode] = React.useState<"text" | "url">("text");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [cat, setCat] = React.useState("Uploads");

  function submit() {
    if (mode === "text") {
      if (!title.trim() || !body.trim()) {
        toast.error("Add a title and some content first.");
        return;
      }
      onAdd({
        name: `${title.trim()}.txt`,
        type: "text",
        category: cat,
        sizeKb: Math.max(1, Math.round(body.length / 1024) + 1),
        chunks: Math.max(1, Math.ceil(body.length / 400)),
        tags: [cat],
      });
    } else {
      if (!url.trim()) {
        toast.error("Enter a URL to crawl.");
        return;
      }
      onAdd({
        name: url.trim().replace(/^https?:\/\//, ""),
        type: "url",
        category: cat,
        tags: [cat, "web"],
      });
    }
    setTitle("");
    setBody("");
    setUrl("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add knowledge source</DialogTitle>
          <DialogDescription>
            Paste raw text or point the AI at a URL to crawl and index.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("text")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              mode === "text"
                ? "border-brand/50 bg-brand/10 text-brand-soft"
                : "border-white/10 text-muted-foreground hover:bg-white/[0.04]"
            )}
          >
            <FileText className="h-4 w-4" /> Add text
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              mode === "url"
                ? "border-brand/50 bg-brand/10 text-brand-soft"
                : "border-white/10 text-muted-foreground hover:bg-white/[0.04]"
            )}
          >
            <Link2 className="h-4 w-4" /> Add URL
          </button>
        </div>

        {mode === "text" ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ks-title">Title</Label>
              <Input
                id="ks-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Holiday Hours 2026"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ks-body">Content</Label>
              <Textarea
                id="ks-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder="Paste the knowledge you want your AI to learn…"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="ks-url">URL</Label>
            <Input
              id="ks-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourcompany.com/faq"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Uploads", "FAQ", "Policies", "Menu", "Pricing", "Brand"].map(
                (c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>
            <Plus className="h-4 w-4" /> Add &amp; index
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

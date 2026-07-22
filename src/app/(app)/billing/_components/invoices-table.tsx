"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Invoice } from "@/types";

const statusVariant: Record<
  Invoice["status"],
  React.ComponentProps<typeof Badge>["variant"]
> = {
  paid: "success",
  due: "warning",
  overdue: "danger",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs text-muted-foreground">
                <th className="px-6 py-2 font-medium">Invoice</th>
                <th className="px-4 py-2 font-medium">Period</th>
                <th className="px-4 py-2 font-medium">Issued</th>
                <th className="px-4 py-2 font-medium">Due</th>
                <th className="px-4 py-2 text-right font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-6 py-2 text-right font-medium">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-3 font-mono text-xs">{inv.number}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.period}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(inv.issuedAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(inv.dueAt)}</td>
                  <td className="px-4 py-3 text-right font-medium tabular">
                    {formatCurrency(inv.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[inv.status]} className="capitalize">
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => toast.success(`Downloading ${inv.number}.pdf`)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

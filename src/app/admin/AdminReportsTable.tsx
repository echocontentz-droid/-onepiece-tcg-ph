"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { REPORT_REASONS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";

interface Report {
  id: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
  reporter?: { username: string; display_name: string };
  reported_user?: { username: string } | null;
  reported_listing_id?: string | null;
  reported_transaction_id?: string | null;
}

export function AdminReportsTable({ reports }: { reports: Report[] }) {
  const router = useRouter();
  const [resolving, setResolving] = useState<string | null>(null);

  const handleResolve = async (reportId: string, resolution: "resolved" | "dismissed") => {
    setResolving(reportId);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: resolution }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Report ${resolution}`);
      router.refresh();
    } catch {
      toast.error("Failed to update report");
    } finally {
      setResolving(null);
    }
  };

  if (!reports.length) {
    return (
      <div className="px-5 py-8 text-center text-sm text-muted-foreground">
        No pending reports
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {reports.map((report) => {
        const reasonInfo = REPORT_REASONS[report.reason as keyof typeof REPORT_REASONS];
        return (
          <div key={report.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="destructive" className="text-[10px]">
                    {reasonInfo?.label ?? report.reason}
                  </Badge>
                  {report.reported_user && (
                    <span className="text-xs text-muted-foreground">
                      against @{report.reported_user.username}
                    </span>
                  )}
                  {report.reported_listing_id && (
                    <Link
                      href={`/listings/${report.reported_listing_id}`}
                      target="_blank"
                      className="text-xs text-primary flex items-center gap-0.5"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Listing
                    </Link>
                  )}
                </div>
                <p className="text-sm text-foreground line-clamp-2">{report.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  By @{report.reporter?.username} · {timeAgo(report.created_at)}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  loading={resolving === report.id}
                  onClick={() => handleResolve(report.id, "resolved")}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground"
                  loading={resolving === report.id}
                  onClick={() => handleResolve(report.id, "dismissed")}
                >
                  <XCircle className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

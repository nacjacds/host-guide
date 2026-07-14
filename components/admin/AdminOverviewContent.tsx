"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHostsTable, type AdminHostRow } from "@/components/admin/AdminHostsTable";
import { AdminTicketsSection, type AdminTicketRow } from "@/components/admin/AdminTicketsSection";

export function AdminOverviewContent({
  totalHosts,
  totalProperties,
  totalPublished,
  totalDraft,
  hosts,
  ticketRows,
}: {
  totalHosts: number;
  totalProperties: number;
  totalPublished: number;
  totalDraft: number;
  hosts: AdminHostRow[];
  ticketRows: AdminTicketRow[];
}) {
  const t = useTranslations("dashboard.admin");

  return (
    <>
      <h1 className="mb-8 text-center text-2xl font-semibold text-[#1A1A18]">{t("title")}</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.hosts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalHosts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.properties")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalProperties}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.published")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalPublished}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.draft")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalDraft}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t("hostsCard.title")}
            <Link
              href="/admin/properties"
              className="text-sm font-normal text-primary underline-offset-2 hover:underline"
            >
              {t("hostsCard.viewAllProperties")}
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminHostsTable hosts={hosts} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("supportCard.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminTicketsSection tickets={ticketRows} />
        </CardContent>
      </Card>
    </>
  );
}

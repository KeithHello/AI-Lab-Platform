"use client";

import { BriefcaseBusiness, ClipboardList } from "lucide-react";
import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DashboardWorkspaceTabsProps = {
  clientSummary: ReactNode;
  clientContent: ReactNode;
  freelancerSummary: ReactNode;
  freelancerContent: ReactNode;
  defaultValue?: "client" | "freelancer";
};

export default function DashboardWorkspaceTabs({
  clientSummary,
  clientContent,
  freelancerSummary,
  freelancerContent,
  defaultValue = "client",
}: DashboardWorkspaceTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">工作模式</h2>
          <p className="text-sm text-muted-foreground">
            你同時擁有發案與接案能力，切換後只看當下最需要處理的內容。
          </p>
        </div>

        <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl bg-muted/40 p-1 sm:w-[420px]">
          <TabsTrigger
            value="client"
            className="flex min-h-[72px] flex-col items-start gap-1 rounded-lg px-4 py-3 text-left data-[state=active]:shadow-none"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <BriefcaseBusiness className="h-4 w-4" />
              發案工作台
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              管理案件、申請與驗收節奏
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="freelancer"
            className="flex min-h-[72px] flex-col items-start gap-1 rounded-lg px-4 py-3 text-left data-[state=active]:shadow-none"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <ClipboardList className="h-4 w-4" />
              接案工作台
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              查看申請、合作與收藏追蹤
            </span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="client" className="space-y-6">
        {clientSummary}
        {clientContent}
      </TabsContent>

      <TabsContent value="freelancer" className="space-y-6">
        {freelancerSummary}
        {freelancerContent}
      </TabsContent>
    </Tabs>
  );
}

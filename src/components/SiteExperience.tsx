"use client";

import React from "react";
import { SiteProvider, useSite } from "@/components/SiteProvider";
import { AdminToolbar } from "@/components/AdminToolbar";
import { SecurityGuard } from "@/components/SecurityGuard";
import { ViewTracker } from "@/components/ViewTracker";
import { LuxuryDarkTemplate } from "@/templates/LuxuryDarkTemplate";
import { ModernCleanTemplate } from "@/templates/ModernCleanTemplate";
import { WarmBoutiqueTemplate } from "@/templates/WarmBoutiqueTemplate";

function TemplateRenderer() {
  const { data } = useSite();
  switch (data.templateId) {
    case "modern-clean":
      return <ModernCleanTemplate />;
    case "warm-boutique":
      return <WarmBoutiqueTemplate />;
    case "luxury-dark":
    default:
      return <LuxuryDarkTemplate />;
  }
}

function ExperienceShell() {
  return (
    <>
      <ViewTracker />
      <TemplateRenderer />
      <AdminToolbar />
      <SecurityGuard />
    </>
  );
}

export function SiteExperience() {
  return (
    <SiteProvider>
      <ExperienceShell />
    </SiteProvider>
  );
}

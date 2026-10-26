"use client";

import React from "react";
import { SiteProvider, useSite } from "@/components/SiteProvider";
import { AdminToolbar } from "@/components/AdminToolbar";
import { SecurityGuard } from "@/components/SecurityGuard";
import { ViewTracker } from "@/components/ViewTracker";
import { AppleSpatialTemplate } from "@/templates/AppleSpatialTemplate";
import { WhiskyObsidianTemplate } from "@/templates/WhiskyObsidianTemplate";
import { CyberQuantumTemplate } from "@/templates/CyberQuantumTemplate";
import { AtelierBoutiqueTemplate } from "@/templates/AtelierBoutiqueTemplate";

function TemplateRenderer() {
  const { data } = useSite();
  switch (data.templateId) {
    case "whisky-obsidian":
      return <WhiskyObsidianTemplate />;
    case "cyber-quantum":
      return <CyberQuantumTemplate />;
    case "atelier-boutique":
      return <AtelierBoutiqueTemplate />;
    case "apple-spatial":
    default:
      // Unknown/legacy template ids also render the flagship spatial design.
      return <AppleSpatialTemplate />;
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

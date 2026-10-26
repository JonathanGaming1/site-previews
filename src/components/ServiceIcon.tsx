"use client";

import {
  Armchair,
  Bath,
  Camera,
  ChefHat,
  DoorClosed,
  Hammer,
  Laptop,
  Palette,
  Scissors,
  Sparkles,
  Store,
  Utensils,
  Wrench,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

const iconMap: Record<string, ComponentType<LucideProps>> = {
  Armchair,
  Bath,
  Camera,
  ChefHat,
  DoorClosed,
  Hammer,
  Laptop,
  Palette,
  Scissors,
  Store,
  Utensils,
  Wrench,
};

interface ServiceIconProps {
  name: string;
  className?: string;
}

export function ServiceIcon({ name, className }: ServiceIconProps) {
  const Icon = iconMap[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}

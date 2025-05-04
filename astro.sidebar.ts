// astro.sidebar.ts
import type { ComponentType } from "preact";
import type { StarlightUserConfig } from "@astrojs/starlight/types";
import { group } from "./config/sidebar";
import { FaJs, FaPython } from "react-icons/fa";

// 1) Define exactly which labels you support:
export type SidebarLabel = "start" | "guides";

// 2) The icon-aware type:
export interface IconGroup {
  label: SidebarLabel;
  items: string[];
  icon: ComponentType<{ className?: string }>;
}

// 3) Your single source of truth:
const raw: IconGroup[] = [
  { label: "start", items: ["reference/example"], icon: FaJs },
  { label: "guides", items: ["guides/example"], icon: FaPython },
];

// 4a) What Starlight actually wants (no icons):
export const sidebar: StarlightUserConfig["sidebar"] = [
  group("start", { items: ["reference/example"] }),
  group("guides", { items: ["guides/example"] }),
];

// 4b) What your client island wants:
export const sidebarWithIcons = raw;

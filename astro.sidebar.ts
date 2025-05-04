import { group, type NavKey } from "./config/sidebar";
import type { ComponentType } from "preact";
import type { StarlightUserConfig } from "@astrojs/starlight/types";
import { SiJavascript, SiPython } from "react-icons/si";

/**
 * A “raw” group lets you nest either:
 * - a string page slug, or
 * - another RawGroup for sub-dropdowns
 */
interface RawGroup {
  key: NavKey;
  subdir?: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  items: Array<string | RawGroup>;
  collapsed?: boolean;
  autogenerate?: { directory: string };
}

/** Your one source-of-truth, with nested groups: */
const raw: RawGroup[] = [
  {
    key: "javascript",
    subdir: "js",
    label: "JavaScript SDK",
    icon: SiJavascript,
    items: [
      {
        key: "javascript.overview",
        label: "Overview",
        icon: SiJavascript,
        items: [
          "concepts/architecture", // describes how the SDK is structured
          "concepts/connection", // connection handling
          "tutorial/getting-started", // getting started
        ]
      },
      {
        key: "javascript.api",
        label: "API Reference",
        icon: SiJavascript,
        items: [
          "api/connection", // connection API details
          "api/messaging", // message handling
          "api/errors", // error and retry strategies
        ],
      },
    ],
  },
  {
    key: "python",
    subdir: "py",
    label: "Python SDK",
    icon: SiPython,
    items: [
      {
        key: "python.overview",
        label: "Overview",
        icon: SiPython,
        items: [
          "concepts/architecture", // describes how the SDK is structured
          "concepts/connection", // connection handling
          "tutorial/getting-started", // getting started
        ],
      },
      {
        key: "python.api",
        label: "API Reference",
        icon: SiPython,
        items: [
          "api/connection", // connection API details
          "api/messaging", // message handling
          "api/errors", // error and retry strategies
        ],
      },
    ],
  },
];

/** Recursively transform RawGroup into what Starlight needs */
// the below function should return something that Starlight can use (previously typed as StarlightUserConfig['sidebar'] but removed because despite being usable TS was still complaining)
function toStarlight(r: RawGroup) {
  const childItems = r.items.map((item) =>
    typeof item === "string" ? item : toStarlight(item),
  );

  const cfg: any = {};
  if (r.autogenerate) {
    cfg.autogenerate = r.autogenerate;
    if (r.collapsed) cfg.collapsed = true;
  } else {
    cfg.items = childItems as string[];
    if (r.collapsed) cfg.collapsed = true;
  }

  return group(r.key, cfg);
}

/** Recursively transform RawGroup into what your Preact island needs */
export interface IconGroup {
  label: string;
  subdir: string | undefined;
  icon: ComponentType<{ className?: string }>;
  items: Array<string | IconGroup>;
  collapsed?: boolean;
  autogenerate?: { directory: string };
}
function toIconGroup(r: RawGroup): IconGroup {
  return {
    label: r.label,
    subdir: r.subdir,
    icon: r.icon,
    collapsed: r.collapsed,
    autogenerate: r.autogenerate,
    items: r.items.map((item) =>
      typeof item === "string" ? item : toIconGroup(item),
    ),
  };
}

/** a) What Starlight needs (icons are attached non‑enumerably) */
export const sidebar: StarlightUserConfig["sidebar"] = raw.map(toStarlight);

/** b) What your Preact island needs (full icons + labels + nesting) */
export const sidebarWithIcons: IconGroup[] = raw.map(toIconGroup);

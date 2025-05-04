import { group } from "./config/sidebar";
import type { ComponentType } from "preact";
import type { StarlightUserConfig } from "@astrojs/starlight/types";
import { SiJavascript, SiPython } from "react-icons/si";
import { FaRobot, FaWifi } from "react-icons/fa";

/**
 * A “raw” group lets you nest either:
 * - a string page slug, or
 * - another RawGroup for sub-dropdowns, or
 * - a PageButton for simple link pages.
 */
interface RawGroup {
  key: string;
  subdir?: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  items: Array<string | RawGroup | PageButton>;
  collapsed?: boolean;
  autogenerate?: { directory: string };
}

export interface PageButton {
  key: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  slug: string;
}

/** Your one source-of-truth, with nested groups: */
const raw: RawGroup[] = [
  {
    key: "protocol",
    subdir: "base",
    label: "WebSocket protocol",
    icon: FaWifi,
    items: [
      {
        key: "actions",
        label: "Actions",
        items: [
          "actions/register"
        ]
      }
    ]
  },
  {
    key: "simulators",
    subdir: "sim",
    label: "Neuro Simulators",
    icon: FaRobot,
    items: [
      "Randy",
      "Tony",
      "Jippity",
      "Gary"
    ]
  },
  {
    key: "javascript",
    subdir: "js",
    label: "JavaScript SDK",
    icon: SiJavascript,
    items: [
      {
        key: "javascript.typescript",
        label: "TypeScript",
        slug: "typescript"
      },
      {
        key: "javascript.overview",
        label: "Overview",
        icon: SiJavascript,
        items: [
          "concepts/architecture",
          "concepts/connection",
          "tutorial/getting-started",
        ]
      },
      {
        key: "javascript.api",
        label: "API Reference",
        icon: SiJavascript,
        items: [
          "api/connection",
          "api/messaging",
          "api/errors",
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
          "concepts/architecture",
          "concepts/connection",
          "tutorial/getting-started",
        ],
      },
      {
        key: "python.api",
        label: "API Reference",
        icon: SiPython,
        items: [
          "api/connection",
          "api/messaging",
          "api/errors",
        ],
      },
    ],
  },
];

/** 
 * Recursively transform a RawGroup into what Starlight needs.
 * If an item is a string or a PageButton (detected via its slug property),
 * convert it into a path. (Do not add the parent’s subdir here.)
 */
function toStarlight(r: RawGroup) {
  const childItems = r.items.map((item) => {
    if (typeof item === "string") {
      // Process plain strings.
      const slug = item.toLowerCase();
      // Prefix with the parent subdir (if it exists).
      return r.subdir ? `${r.subdir.toLowerCase()}/${slug}` : slug;
    } else if (typeof item === "object" && "slug" in item && typeof item.slug === "string") {
      // Process PageButton objects.
      const slug = item.slug.toLowerCase();
      return r.subdir ? `${r.subdir.toLowerCase()}/${slug}` : slug;
    } else {
      // Process nested RawGroup.
      const newGroup = item as RawGroup;
      const newItem: RawGroup = { ...newGroup, subdir: newGroup.subdir || r.subdir };
      return toStarlight(newItem);
    }
  });

  const cfg: any = {};
  if (r.autogenerate) {
    cfg.autogenerate = r.autogenerate;
    if (r.collapsed) cfg.collapsed = true;
  } else {
    cfg.items = childItems;
    if (r.collapsed) cfg.collapsed = true;
  }

  return group(r.key, cfg);
}

/**
 * Recursively transform a RawGroup into what your Preact island needs.
 * For each item, if it's a string or a PageButton, return a string path.
 * Otherwise, recursively transform a nested group.
 */
export interface IconGroup {
  label: string;
  subdir: string | undefined;
  icon: ComponentType<{ className?: string }> | undefined;
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
    items: r.items.map((item) => {
      if (typeof item === "string") {
        return item.toLowerCase();
      } else if (typeof item === "object" && "slug" in item && typeof item.slug === "string") {
        // Convert PageButton objects to string path.
        return item.slug.toLowerCase();
      } else {
        return toIconGroup(item as RawGroup);
      }
    }),
  };
}

/** a) What Starlight needs (icons are attached non‑enumerably) */
export const sidebar: StarlightUserConfig["sidebar"] = raw.map(toStarlight);

/** b) What your Preact island needs (full icons + labels + nesting) */
export const sidebarWithIcons: IconGroup[] = raw.map(toIconGroup);

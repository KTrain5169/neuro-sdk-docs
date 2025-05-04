import { group } from "./config/sidebar";
import type { ComponentType } from "preact";
import type { StarlightUserConfig } from "@astrojs/starlight/types";
import {
  SiC,
  SiGamemaker,
  SiGodotengine,
  SiHtml5,
  SiJavascript,
  SiLua,
  SiOpenai,
  SiPython,
  SiRust,
  SiTypescript,
  SiUnity,
} from "react-icons/si";
import {
  FaRobot,
  FaWifi,
  FaWrench,
  FaGamepad,
  FaQuestionCircle,
  FaJava,
  FaFileArchive,
  FaHandPointLeft,
  FaPlusCircle,
  FaMinusCircle,
  FaServer,
  FaDice,
  FaKeyboard,
  FaBrain,
  FaHardHat,
} from "react-icons/fa";

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
        subdir: "base/actions",
        label: "Actions",
        icon: FaHandPointLeft,
        items: [
          {
            key: "register",
            label: "Register",
            icon: FaPlusCircle,
            slug: "register",
          },
          {
            key: "unregister",
            label: "Unregister",
            icon: FaMinusCircle,
            slug: "unregister",
          },
          "force",
        ],
      },
      {
        key: "context",
        label: "Context",
        icon: FaFileArchive,
        slug: "context",
      },
      {
        key: "proposals",
        subdir: "proposals",
        label: "API Proposals",
        icon: FaQuestionCircle,
        items: [],
      },
    ],
  },
  {
    key: "simulators",
    subdir: "sim",
    label: "Neuro Simulators",
    icon: FaRobot,
    items: [
      {
        key: "randy",
        label: "Randy",
        icon: FaDice,
        slug: "randy",
      },
      {
        key: "tony",
        label: "Tony",
        icon: FaKeyboard,
        slug: "tony",
      },
      {
        key: "jippity",
        label: "Jippity",
        icon: SiOpenai,
        slug: "jippity",
      },
      {
        key: "gary",
        label: "Gary",
        icon: FaBrain,
        slug: "gary",
      },
    ],
  },
  {
    key: "game_engines",
    subdir: "engines",
    label: "SDKs for Game Engines",
    icon: FaGamepad,
    items: [
      {
        key: "unity",
        subdir: "unity",
        label: "Unity SDK",
        icon: SiUnity,
        items: [],
      },
      {
        key: "godot",
        subdir: "gdot",
        label: "Godot SDK (GDScript)",
        icon: SiGodotengine,
        items: [],
      },
      {
        key: "gamemaker",
        subdir: "gmaker",
        label: "Gamemaker SDK",
        icon: SiGamemaker,
        items: [],
      },
    ],
  },
  {
    key: "rust",
    subdir: "rs",
    label: "Rust SDK",
    icon: SiRust,
    items: [],
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
        icon: SiTypescript,
        slug: "typescript",
      },
      {
        key: "javascript.browser",
        label: "Browser HTML",
        icon: SiHtml5,
        slug: "browser",
      },
      {
        key: "javascript.overview",
        label: "Overview",
        items: [
          "concepts/architecture",
          "concepts/connection",
          "tutorial/getting_started",
        ],
      },
      {
        key: "javascript.api",
        label: "API Reference",
        items: ["api/connection", "api/messaging", "api/errors"],
      },
    ],
  },
  {
    key: "java",
    subdir: "jar",
    label: "Java SDK",
    icon: FaJava,
    items: [],
  },
  {
    key: "lua",
    subdir: "lua",
    label: "Lua SDK",
    icon: SiLua,
    items: [],
  },
  {
    key: "c",
    subdir: "c",
    label: "C SDK",
    icon: SiC,
    items: ["overview"],
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
        items: [
          "concepts/architecture",
          "concepts/connection",
          "tutorial/getting-started",
        ],
      },
      {
        key: "python.api",
        label: "API Reference",
        items: ["api/connection", "api/messaging", "api/errors"],
      },
    ],
  },
  {
    key: "more_tools",
    subdir: "tools",
    label: "Other tools",
    icon: FaWrench,
    items: [
      {
        key: "web_game_runner",
        label: "Web Game Runner",
        icon: FaServer,
        slug: "webgamerunner",
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
    } else if (
      typeof item === "object" &&
      "slug" in item &&
      typeof item.slug === "string"
    ) {
      // Process PageButton objects.
      const slug = item.slug.toLowerCase();
      return r.subdir ? `${r.subdir.toLowerCase()}/${slug}` : slug;
    } else {
      // Process nested RawGroup.
      const newGroup = item as RawGroup;
      const newItem: RawGroup = {
        ...newGroup,
        subdir: newGroup.subdir || r.subdir,
      };
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
 * Update the IconGroup interface to allow PageButton objects.
 */
export interface IconGroup {
  label: string;
  subdir: string | undefined;
  icon: ComponentType<{ className?: string }> | undefined;
  items: Array<string | PageButton | IconGroup>;
  collapsed?: boolean;
  autogenerate?: { directory: string };
}

/**
 * Recursively transform a RawGroup into what your Preact island needs.
 * For PageButton objects, return the full object (preserving label, slug, icon).
 */
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
      } else if (
        typeof item === "object" &&
        "slug" in item &&
        typeof item.slug === "string"
      ) {
        // Instead of returning only the slug, return the object to preserve the label.
        return item as PageButton;
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

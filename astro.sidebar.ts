import { group as makeGroup } from "./config/sidebar"; // renamed import to avoid shadowing
import type { ComponentType } from "preact";
import type { StarlightUserConfig } from "@astrojs/starlight/types";
import {
  SiC,
  SiGamemaker,
  SiGodotengine,
  SiHtml5,
  SiJavascript,
  SiKotlin,
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
  FaExclamationCircle,
  FaInfoCircle,
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
const raw: (RawGroup | PageButton)[] = [
  {
    key: "overview",
    label: "API Overview",
    icon: FaInfoCircle,
    slug: "overview",
  },
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
          {
            key: "force",
            label: "Force",
            icon: FaExclamationCircle,
            slug: "force",
          },
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
    key: "kotlin",
    subdir: "kt",
    label: "Kotlin SDK",
    icon: SiKotlin,
    items: [],
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
 * Create a helper that transforms a RawGroup | PageButton or string into a Starlight path.
 */
function transformToStarlight(
  item: string | RawGroup | PageButton,
  parentSubdir?: string,
): any {
  if (typeof item === "string") {
    const slug = item.toLowerCase();
    // Use parent's subdir if it exists.
    return parentSubdir ? `${parentSubdir.toLowerCase()}/${slug}` : slug;
  }
  if ("slug" in item && typeof item.slug === "string") {
    const slug = item.slug.toLowerCase();
    return parentSubdir ? `${parentSubdir.toLowerCase()}/${slug}` : slug;
  }
  // Else, it's a RawGroup.
  const rawGroup = item as RawGroup;
  const childItems = rawGroup.items.map((child) =>
    transformToStarlight(child, rawGroup.subdir || parentSubdir),
  );
  const cfg: any = {};
  if (rawGroup.autogenerate) {
    cfg.autogenerate = rawGroup.autogenerate;
    if (rawGroup.collapsed) cfg.collapsed = true;
  } else {
    cfg.items = childItems;
    if (rawGroup.collapsed) cfg.collapsed = true;
  }
  return makeGroup(rawGroup.key, cfg);
}

/**
 * New toStarlight: transforms a top-level union (RawGroup | PageButton) to what Starlight needs.
 */
function toStarlightUnion(item: RawGroup | PageButton): any {
  return transformToStarlight(item);
}

/** a) What Starlight needs */
export const sidebar: StarlightUserConfig["sidebar"] =
  raw.map(toStarlightUnion);

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
 * Similarly, transform for your Preact island.
 * For page buttons, return the object as is.
 */
function transformToIconGroup(
  item: string | RawGroup | PageButton,
): IconGroup | PageButton | string {
  if (typeof item === "string") {
    return item.toLowerCase();
  }
  if ("slug" in item && typeof item.slug === "string") {
    // Return the PageButton object to preserve label, icon, etc.
    return item as PageButton;
  }
  const group = item as RawGroup;
  return {
    label: group.label,
    subdir: group.subdir,
    icon: group.icon,
    collapsed: group.collapsed,
    autogenerate: group.autogenerate,
    items: group.items.map((child) => transformToIconGroup(child)),
  };
}

/** b) What your Preact island needs */
export const sidebarWithIcons: (IconGroup | PageButton | string)[] =
  raw.map(transformToIconGroup);

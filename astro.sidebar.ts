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
  FaExclamationCircle,
  FaInfoCircle,
  FaPowerOff,
  FaList,
  FaScrewdriver,
  FaHands,
} from "react-icons/fa";
import { FaBoxArchive, FaClockRotateLeft, FaRotateLeft } from "react-icons/fa6";
import { FiCheckSquare } from "react-icons/fi";
import { LuPower } from "react-icons/lu";

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
        key: "startup",
        label: "Startup",
        icon: LuPower,
        slug: "startup",
      },
      {
        key: "actions",
        subdir: "actions",
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
            key: "handling",
            label: "Handling actions",
            icon: FaHands,
            slug: "handle",
          },
          {
            key: "result",
            label: "Results",
            icon: FiCheckSquare,
            slug: "result",
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
        key: "techniques",
        subdir: "techniques",
        label: "Techniques",
        icon: FaScrewdriver,
        items: [
          {
            key: "async_action_results",
            label: "Asynchronous results",
            icon: FaClockRotateLeft,
            slug: "async_action_results",
          },
          {
            key: "disposables",
            label: "Disposable actions",
            icon: FaBoxArchive,
            slug: "disposable_actions",
          },
        ],
      },
      {
        key: "proposals",
        subdir: "proposals",
        label: "API Proposals",
        icon: FaQuestionCircle,
        items: [
          {
            key: "list-of-proposals",
            label: "Full list",
            icon: FaList,
            slug: "",
          },
          {
            key: "shutdown",
            label: "Shutdowns by Neuro",
            icon: FaPowerOff,
            slug: "shutdown",
          },
          {
            key: "reregister",
            label: "Re-register commands",
            icon: FaRotateLeft,
            slug: "reregister",
          },
        ],
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
    key: "javascript",
    subdir: "js",
    label: "(WIP section) JavaScript SDK",
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
          "concepts/handler",
          "concepts/connection",
        ],
      },
      {
        key: "javascript.api",
        label: "API Reference",
        items: ["api/client", "api/messaging", "api/errors"],
      },
    ],
  },
  {
    key: "python",
    subdir: "py",
    label: "(WIP section) Python SDK",
    icon: SiPython,
    items: [
      {
        key: "python.overview",
        label: "Overview",
        items: [
          "concepts/handler",
          "concepts/connection",
        ],
      },
      {
        key: "python.api",
        label: "API Reference",
        items: ["api/client", "api/messaging", "api/errors"],
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
 * Create a helper that transforms a RawGroup | PageButton or string into a Starlight path.
 */
function transformToStarlight(
  item: string | RawGroup | PageButton,
  parentSubdir?: string,
): any {
  // Helper to normalize & strip slashes
  const normalize = (path: string) => path.replace(/\/+$/, "");

  if (typeof item === "string") {
    const slug = item.toLowerCase();
    const path = parentSubdir ? `${parentSubdir.toLowerCase()}/${slug}` : slug;
    return normalize(path);
  }

  // PageButton (has a slug)
  if ("slug" in item && typeof item.slug === "string") {
    const raw = item.slug.toLowerCase();

    let path: string;
    if (raw === "" && parentSubdir) {
      // empty slug → map to exactly the parent directory
      path = parentSubdir.toLowerCase();
    } else {
      path = parentSubdir ? `${parentSubdir.toLowerCase()}/${raw}` : raw;
    }

    return normalize(path);
  }

  // Otherwise, it's a nested RawGroup
  const rawGroup = item as RawGroup;

  // Build the combined subdir (e.g. "base/actions", not dropping "base")
  const combinedSubdir = rawGroup.subdir
    ? parentSubdir
      ? `${parentSubdir.toLowerCase()}/${rawGroup.subdir.toLowerCase()}`
      : rawGroup.subdir.toLowerCase()
    : parentSubdir?.toLowerCase();

  // Recurse into children
  const childItems = rawGroup.items.map((child) =>
    transformToStarlight(child, combinedSubdir),
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
 * IconGroup interface for the Sidebar Preact component
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

/** b) What the Preact island needs */
export const sidebarWithIcons: (IconGroup | PageButton | string)[] =
  raw.map(transformToIconGroup);

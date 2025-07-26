import { useState, useEffect } from "preact/hooks";
import {
  sidebarWithIcons,
  type IconGroup,
  type PageButton,
} from "../../astro.sidebar";
import "../styles/Sidebar.css";

const baseURL = import.meta.env.BASE_URL || ""

// Allow SidebarComponent to accept arbitrary extra props (like client:load)
export interface SidebarProps {
  [key: string]: any;
}

// Union type for sidebar items: classic string, PageButton, or nested IconGroup
export type SidebarItem = string | PageButton | IconGroup;

function isPageButton(item: SidebarItem): item is PageButton {
  return (
    typeof item === "object" &&
    "slug" in item &&
    typeof (item as PageButton).slug === "string"
  );
}

function isIconGroup(item: SidebarItem): item is IconGroup {
  return typeof item === "object" && (item as IconGroup).items !== undefined;
}

function normalizePath(path: string): string {
  return path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;
}

/**
 * Render a list of items (for dropdowns, etc.)
 */
function renderItems(
  items: SidebarItem[],
  prefix: string,
  depth = 0,
  currentPath: string,
): preact.JSX.Element[] {
  const normCurrent = normalizePath(currentPath);
  return items
    .map((item: SidebarItem) => {
      if (typeof item === "string") {
        const slug = item.toLowerCase();
        const rawLabel = item.split("/").pop() || item;
        const label = rawLabel.replace(/_/g, " ");
        const href = normalizePath(`/${prefix}/${slug}`);
        const isActive =
          normCurrent === href || normCurrent.startsWith(href + "/");
        return (
          <a
            key={`str-${depth}-${item}`}
            href={baseURL ? baseURL + href : href}
            className={`sidebar-item${isActive ? " active" : ""}`}
          >
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </a>
        );
      } else if (isPageButton(item)) {
        const slug = item.slug.toLowerCase();
        const href = normalizePath(`/${prefix}/${slug}`);
        let isActive: boolean;

        if (slug === "") {
          isActive = normCurrent === href || normCurrent === href + "/";
        } else {
          isActive = normCurrent === href || normCurrent.startsWith(href + "/");
        }

        return (
          <a
            key={`pb-${depth}-${item.key}`}
            href={baseURL ? baseURL + href : href}
            className={`sidebar-item${isActive ? " active" : ""}`}
          >
            {item.icon && <item.icon className="sidebar-icon page" />}
            {item.label}
          </a>
        );
      } else if (isIconGroup(item)) {
        return (
          <DropdownGroup
            key={`grp-${depth}-${item.label}`}
            item={item}
            prefix={prefix}
            depth={depth}
            currentPath={normCurrent}
          />
        );
      }
      return null;
    })
    .filter((elem): elem is preact.JSX.Element => elem !== null);
}

interface DropdownGroupProps {
  item: IconGroup;
  prefix: string;
  depth: number;
  currentPath: string;
}

function DropdownGroup({
  item,
  prefix,
  depth,
  currentPath,
}: DropdownGroupProps): preact.JSX.Element {
  const [open, setOpen] = useState(true);
  const Icon = item.icon;
  const newPrefix = item.subdir
    ? `${prefix}/${item.subdir.toLowerCase()}`
    : prefix;
  return (
    <div className={`sidebar-group ${depth > 0 ? "dropdown" : ""}`}>
      <div className="sidebar-group-header" onClick={() => setOpen(!open)}>
        {Icon && <Icon className="sidebar-icon category" />}
        <span className="sidebar-group-label">{item.label}</span>
        <span className="dropdown-toggle">{open ? "▼" : "►"}</span>
      </div>
      {open && (
        <div className="sidebar-group-items">
          {renderItems(
            item.items as SidebarItem[],
            newPrefix,
            depth + 1,
            currentPath,
          )}
        </div>
      )}
    </div>
  );
}

export default function SidebarComponent(
  props: SidebarProps,
): preact.JSX.Element {
  // Now we treat sidebarWithIcons as an array of SidebarItem (which may be groups or page buttons)
  const config: SidebarItem[] = sidebarWithIcons;
  const [mounted, setMounted] = useState<boolean>(false);
  // For activeGroup, only groups have a label so we filter the groups.
  const groups = config.filter(isIconGroup) as IconGroup[];
  const [activeGroup, setActiveGroup] = useState<string>("");
  const [currentPath, setCurrentPath] = useState<string>("");

  // Run only once on mount: set current path and determine active group from URL.
  useEffect(() => {
    // 1) Mark mounted and grab the path
    setMounted(true);
    let rawPath = window.location.pathname;
    if (baseURL && baseURL !== "" && rawPath.startsWith(baseURL)) {
      rawPath = rawPath.slice(baseURL.length)
    }
    const path = rawPath.toLowerCase();
    setCurrentPath(rawPath);

    // 2) Find the group whose `subdir` matches the first segment
    const match = groups.find((g) => {
      if (!g.subdir) return false;
      const seg = g.subdir.toLowerCase();
      return path === `/${seg}` || path.startsWith(`/${seg}/`);
    });

    // 3) If found, highlight it; otherwise none
    setActiveGroup(match ? match.label : "");
  }, []); // ← run only once, on mount

  // Render top-level buttons: if an item is a group, clicking it sets activeGroup manually.
  return (
    <div className="sidebar" {...props}>
      <div className="sidebar-buttons">
        {config.map((item: SidebarItem) => {
          if (isIconGroup(item)) {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`sidebar-button${item.label === activeGroup ? " active" : ""}`}
                onClick={() => setActiveGroup(item.label)}
              >
                {mounted && Icon ? <Icon className="sidebar-icon group" /> : ""}
                {item.label}
              </button>
            );
          } else if (isPageButton(item)) {
            const href = normalizePath(`/${item.slug}`);
            const isActive =
              currentPath === href || currentPath.startsWith(href + "/");
            return (
              <a
                key={item.key}
                href={href}
                className={`sidebar-button standalone${isActive ? " active" : ""}`}
              >
                {item.icon && (
                  <item.icon className="sidebar-icon standalone-page" />
                )}
                {item.label}
              </a>
            );
          } else if (typeof item === "string") {
            const slug = item.toLowerCase();
            const label = item.split("/").pop() || item;
            const href = normalizePath(`/${slug}`);
            const isActive =
              currentPath === href || currentPath.startsWith(href + "/");
            return (
              <a
                key={item}
                href={href}
                className={`sidebar-button${isActive ? " active" : ""}`}
              >
                {label.charAt(0).toUpperCase() + label.slice(1)}
              </a>
            );
          }
          return null;
        })}
      </div>
      <div className="sidebar-dropdown">
        {groups.find((g) => g.label === activeGroup)
          ? renderItems(
              groups.find((g) => g.label === activeGroup)!
                .items as SidebarItem[],
              groups.find((g) => g.label === activeGroup)!.subdir
                ? groups
                    .find((g) => g.label === activeGroup)!
                    .subdir!.toLowerCase()
                : "",
              0,
              currentPath,
            )
          : null}
      </div>
    </div>
  );
}

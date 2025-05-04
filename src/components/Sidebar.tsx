import { useState, useEffect } from "preact/hooks";
import {
  sidebarWithIcons,
  type IconGroup,
  type PageButton,
} from "../../astro.sidebar";
import "../styles/Sidebar.css";

// Allow SidebarComponent to accept arbitrary extra props (like client:load)
export interface SidebarProps {
  [key: string]: any;
}

// Union type for sidebar items: classic string, PageButton, or nested IconGroup
export type SidebarItem = string | PageButton | IconGroup;

// Type guard to check if an item is a PageButton
function isPageButton(item: SidebarItem): item is PageButton {
  return (
    typeof item === "object" &&
    "slug" in item &&
    typeof (item as PageButton).slug === "string"
  );
}

// Type guard to check if an item is an IconGroup (nested group)
function isIconGroup(item: SidebarItem): item is IconGroup {
  return typeof item === "object" && Array.isArray((item as any).items);
}

function normalizePath(path: string): string {
  // Remove trailing slash if present (except if the path is just "/")
  return path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;
}

/**
 * Render either a link (PageButton or auto-generated from string) or a nested dropdown (IconGroup).
 * Now accepts the currentPath to add an "active" class if a link matches.
 */
function renderItems(
  items: SidebarItem[],
  prefix: string,
  depth = 0,
  currentPath: string,
): preact.JSX.Element[] {
  // Normalize currentPath once
  const normCurrent = normalizePath(currentPath);
  return items
    .map((item) => {
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
            href={href}
            className={`sidebar-item${isActive ? " active" : ""}`}
          >
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </a>
        );
      } else if (isPageButton(item)) {
        const slug = item.slug.toLowerCase();
        const href = normalizePath(`/${prefix}/${slug}`);
        const isActive =
          normCurrent === href || normCurrent.startsWith(href + "/");
        return (
          <a
            key={`pb-${depth}-${item.key}`}
            href={href}
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
      } else {
        return null;
      }
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
}: DropdownGroupProps) {
  const [open, setOpen] = useState(true);
  const Icon = item.icon;
  // Use the nested group's subdir if provided; otherwise, inherit the parent's prefix.
  const newPrefix = item.subdir ? item.subdir.toLowerCase() : prefix;

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

export default function SidebarComponent(props: SidebarProps) {
  const config = sidebarWithIcons;
  const [mounted, setMounted] = useState(false);
  const [activeGroup, setActiveGroup] = useState(config[0].label);
  // Initialize currentPath safely (empty string on the server)
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setMounted(true);
    // Now on the client it's safe to set the current path
    setCurrentPath(window.location.pathname);
  }, []);

  useEffect(() => {
    const onLocationChange = () => {
      const path = window.location.pathname;
      console.log("location path:", path);
      setCurrentPath(path);
      const match = config.find((g) => {
        const groupPrefix = g.subdir ? `${g.subdir.toLowerCase()}/` : "";
        let found = g.items.some((item) => {
          if (typeof item === "string") {
            const slug = item.toLowerCase();
            const full = `/${groupPrefix}${slug}`;
            console.log("comparing", full);
            return path === full || path.startsWith(full);
          } else if (isPageButton(item)) {
            const slug = item.slug.toLowerCase();
            const full = `/${groupPrefix}${slug}`;
            console.log("comparing", full);
            return path === full || path.startsWith(full);
          } else if (isIconGroup(item)) {
            return (item.items as SidebarItem[]).some((i) => {
              if (typeof i === "string") {
                const slug = i.toLowerCase();
                const full = `/${groupPrefix}${slug}`;
                console.log("nested comparing", full);
                return path === full || path.startsWith(full);
              } else if (isPageButton(i)) {
                const slug = i.slug.toLowerCase();
                const full = `/${groupPrefix}${slug}`;
                console.log("nested comparing", full);
                return path === full || path.startsWith(full);
              }
              return false;
            });
          }
          return false;
        });
        console.log("match for group", g.label, "is", found);
        return found;
      });
      console.log("matched group:", match ? match.label : "none");
      setActiveGroup(match ? match.label : config[0].label);
    };
    onLocationChange();
    window.addEventListener("popstate", onLocationChange);
    return () => window.removeEventListener("popstate", onLocationChange);
  }, [config]);

  const activeGroupData =
    config.find((g) => g.label === activeGroup) || config[0];
  const prefix = activeGroupData.subdir
    ? activeGroupData.subdir.toLowerCase()
    : "";

  return (
    <div className="sidebar" {...props}>
      <div className="sidebar-buttons">
        {config.map((g) => {
          const Icon = g.icon;
          return (
            <button
              key={g.label}
              className={`sidebar-button${g.label === activeGroup ? " active" : ""}`}
              onClick={() => setActiveGroup(g.label)}
            >
              {mounted && Icon ? <Icon className="sidebar-icon group" /> : ""}
              {g.label}
            </button>
          );
        })}
      </div>
      <div className="sidebar-dropdown">
        {renderItems(
          activeGroupData.items as SidebarItem[],
          prefix,
          0,
          currentPath,
        )}
      </div>
    </div>
  );
}

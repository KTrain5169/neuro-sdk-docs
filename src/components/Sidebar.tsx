import { useState, useEffect } from "preact/hooks";
import { sidebarWithIcons, type IconGroup, type PageButton } from "../../astro.sidebar";
import "../styles/Sidebar.css";

// Allow SidebarComponent to accept arbitrary extra props (like client:load)
export interface SidebarProps {
  [key: string]: any;
}

// Union type for sidebar items: classic string, PageButton, or nested IconGroup
export type SidebarItem = string | PageButton | IconGroup;

// Type guard to check if an item is a PageButton
function isPageButton(item: SidebarItem): item is PageButton {
  return typeof item === "object" && "slug" in item && typeof (item as PageButton).slug === "string";
}

// Type guard to check if an item is an IconGroup (nested group)
function isIconGroup(item: SidebarItem): item is IconGroup {
  return typeof item === "object" && Array.isArray((item as any).items);
}

/**
 * Render either a link (PageButton or auto-generated from string) or a nested dropdown (IconGroup).
 */
function renderItems(
  items: SidebarItem[],
  prefix: string,
  depth = 0,
): preact.JSX.Element[] {
  return items.map((item) => {
    if (typeof item === "string") {
      const slug = item.toLowerCase();
      const rawLabel = item.split("/").pop() || item;
      const label = rawLabel.replace(/_/g, " ");
      return (
        <a
          key={`str-${depth}-${item}`}
          href={`/${prefix}/${slug}`}
          className="sidebar-item"
        >
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </a>
      );
    } else if (isPageButton(item)) {
      const slug = item.slug.toLowerCase();
      return (
        <a
          key={`pb-${depth}-${item.key}`}
          href={`/${prefix}/${slug}`}
          className="sidebar-item"
        >
          {item.icon && <item.icon className="sidebar-icon" />}
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
        />
      );
    } else {
      return null;
    }
  }).filter((element): element is preact.JSX.Element => element !== null);
}

interface DropdownGroupProps {
  item: IconGroup;
  prefix: string;
  depth: number;
}

function DropdownGroup({ item, prefix, depth }: DropdownGroupProps) {
  const [open, setOpen] = useState<boolean>(true);
  const Icon = item.icon;
  return (
    <div className={`sidebar-group ${depth > 0 ? "dropdown" : ""}`}>
      <div className="sidebar-group-header" onClick={() => setOpen(!open)}>
        {Icon && <Icon className="sidebar-icon" />}
        <span className="sidebar-group-label">{item.label}</span>
        <span className="dropdown-toggle">{open ? "▼" : "►"}</span>
      </div>
      {open && (
        <div className="sidebar-group-items">
          {renderItems(item.items as SidebarItem[], prefix, depth + 1)}
        </div>
      )}
    </div>
  );
}

export default function SidebarComponent(props: SidebarProps) {
  const config = sidebarWithIcons;
  const [mounted, setMounted] = useState(false);
  const [activeGroup, setActiveGroup] = useState(config[0].label);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onLocationChange = () => {
      const path = window.location.pathname.replace(/^\/+/, ""); // e.g. "js/typescript"
      const match = config.find((g) => {
        // Build the prefix from the group's subdir
        const prefix = g.subdir ? `${g.subdir.toLowerCase()}/` : "";
        return g.items.some((item) => {
          if (typeof item === "string") {
            const slug = item.toLowerCase();
            return path === `${prefix}${slug}` || path.startsWith(`${prefix}${slug}`);
          } else if (isPageButton(item)) {
            const slug = item.slug.toLowerCase();
            return path === `${prefix}${slug}` || path.startsWith(`${prefix}${slug}`);
          } else if (isIconGroup(item)) {
            // Check nested items similarly.
            return (item.items as SidebarItem[]).some((i) => {
              if (typeof i === "string") {
                const slug = i.toLowerCase();
                return path === `${prefix}${slug}` || path.startsWith(`${prefix}${slug}`);
              } else if (isPageButton(i)) {
                const slug = i.slug.toLowerCase();
                return path === `${prefix}${slug}` || path.startsWith(`${prefix}${slug}`);
              }
              return false;
            });
          }
          return false;
        });
      });
      setActiveGroup(match ? match.label : config[0].label);
    };
    onLocationChange();
    window.addEventListener("popstate", onLocationChange);
    return () => window.removeEventListener("popstate", onLocationChange);
  }, [config]);

  const activeGroupData = config.find((g) => g.label === activeGroup)!;

  return (
    <div className="sidebar" {...props}>
      <div className="sidebar-buttons">
        {config.map((g) => {
          const Icon = g.icon;
          return (
            <button
              key={g.label}
              className={`sidebar-button ${g.label === activeGroup ? "active" : ""}`}
              onClick={() => setActiveGroup(g.label)}
            >
              {mounted && Icon ? <Icon className="sidebar-icon" /> : ""}
              {g.label}
            </button>
          );
        })}
      </div>
      <div className="sidebar-dropdown">
        {renderItems(activeGroupData.items as SidebarItem[], activeGroupData.subdir || "")}
      </div>
    </div>
  );
}

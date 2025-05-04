import { useState, useEffect } from "preact/hooks";
import { sidebarWithIcons, type IconGroup } from "../../astro.sidebar";
import "../styles/Sidebar.css";

/**
 * Render either a link or a nested dropdown.
 */
function renderItems(
  items: Array<string | IconGroup>,
  prefix: string,
  depth = 0,
): preact.JSX.Element[] {
  return items.map((item) => {
    if (typeof item === "string") {
      // simple page link
      return (
        <a key={`${depth}-${item}`} href={`/${prefix}/${item}`} className="sidebar-item">
          {item
            .split("/")
            .pop()!
            .replace(/^\w/, (c) => c.toUpperCase())}
        </a>
      );
    } else {
      // nested group → show its label and its own list
      return (
        <div
          key={`${depth}-${item.label}`}
          className={`sidebar-group depth-${depth}`}
        >
          <div className="sidebar-group-label">{item.label}</div>
          <div className="sidebar-group-items">
            {renderItems(item.items, prefix, depth + 1)}
          </div>
        </div>
      );
    }
  });
}

export default function SidebarComponent() {
  const config = sidebarWithIcons;
  const [mounted, setMounted] = useState(false);
  const [activeGroup, setActiveGroup] = useState(config[0].label);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onLocationChange = () => {
      const path = window.location.pathname.replace(/^\/+/, "");
      const match = config.find((g) =>
        g.items.some((item) =>
          typeof item === "string"
            ? path === item || path.startsWith(item)
            : // check nested group's own items flattened:
              (item.items as string[]).some(
                (i) => path === i || path.startsWith(i),
              ),
        ),
      );
      setActiveGroup(match ? match.label : config[0].label);
    };
    onLocationChange();
    window.addEventListener("popstate", onLocationChange);
    return () => window.removeEventListener("popstate", onLocationChange);
  }, [config]);

  const activeGroupData = config.find((g) => g.label === activeGroup)!;

  return (
    <div className="sidebar">
      <div className="sidebar-buttons">
        {config.map((g) => {
          const Icon = g.icon;
          return (
            <button
              key={g.label}
              className={`sidebar-button ${g.label === activeGroup ? "active" : ""}`}
              onClick={() => setActiveGroup(g.label)}
            >
              {mounted && <Icon className="sidebar-icon" />}
              {g.label}
            </button>
          );
        })}
      </div>
      <div className="sidebar-dropdown">
        {renderItems(activeGroupData.items, activeGroupData.subdir || "")}
      </div>
    </div>
  );
}

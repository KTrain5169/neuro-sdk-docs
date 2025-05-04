import { useState, useEffect } from "preact/hooks";
import { sidebarWithIcons, type IconGroup } from "../../astro.sidebar";
import "../styles/Sidebar.css";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const formatSlug = (slug: string) => {
  const parts = slug.split("/");
  return parts.length > 1 ? capitalize(parts[1]) : capitalize(parts[0]);
};

export default function SidebarComponent() {
  // Import the full icon-aware config directly, avoiding serialization
  const config: IconGroup[] = sidebarWithIcons;

  const [activeGroup, setActiveGroup] = useState<string>(config[0].label);

  useEffect(() => {
    const onLocationChange = () => {
      const path = window.location.pathname.replace(/^\/+/, "");
      const match = config.find((g) =>
        g.items.some((item) => path === item || path.startsWith(item)),
      );
      setActiveGroup(match ? match.label : config[0].label);
    };
    onLocationChange();
    window.addEventListener("popstate", onLocationChange);
    return () => window.removeEventListener("popstate", onLocationChange);
  }, [config]);

  const activeItems = config.find((g) => g.label === activeGroup)?.items || [];

  return (
    <div className="sidebar">
      <div className="sidebar-buttons">
        {config.map((group) => {
          const Icon = group.icon;
          return (
            <button
              key={group.label}
              className={`sidebar-button ${group.label === activeGroup ? "active" : ""}`}
              onClick={() => setActiveGroup(group.label)}
            >
              {Icon && <Icon className="sidebar-icon" />}
              {group.label}
            </button>
          );
        })}
      </div>
      <div className="sidebar-dropdown">
        {activeItems.map((item) => (
          <a key={item} href={`/${item}`} className="sidebar-item">
            {formatSlug(item)}
          </a>
        ))}
      </div>
    </div>
  );
}

import type starlight from "@astrojs/starlight";
import enLabels from "./titles";
import type { ComponentType } from "react";

type StarlightSidebarConfig = NonNullable<
  Parameters<typeof starlight>[0]["sidebar"]
>;
type StarlightSidebarEntry = StarlightSidebarConfig[number];
type StarlightManualSidebarGroup = Extract<
  StarlightSidebarEntry,
  { items: any[] }
>;
type StarlightAutoSidebarGroup = Extract<
  StarlightSidebarEntry,
  { autogenerate: any }
>;

type NavKey = keyof typeof enLabels;
type NavDict = Record<NavKey, string>;

const translations = Object.entries(
  import.meta.glob<{ default: NavDict }>("../src/content/nav/*.ts", {
    eager: true,
  }),
)
  .map(
    ([path, mod]) =>
      [path.split("/").pop()!.replace(".ts", ""), mod.default] as const,
  )
  .reduce(
    (translations, [lang, dict]) => {
      for (const _k in dict) {
        const key = _k as NavKey;
        translations[key] ??= {};
        translations[key][lang] = dict[key];
      }
      return translations;
    },
    {} as Record<NavKey, Record<string, string>>,
  );

/**
 * Extend the group helper to accept an optional `icon` property.
 * This function attaches `icon` as a non‑enumerable property so it won't be seen by Starlight.
 */
export function group(
  key: NavKey,
  group: (
    | Omit<StarlightManualSidebarGroup, "label">
    | Omit<StarlightAutoSidebarGroup, "label">
  ) & { icon?: ComponentType },
): (StarlightManualSidebarGroup | StarlightAutoSidebarGroup) & {
  icon?: ComponentType;
} {
  const result = {
    label: enLabels[key],
    translations: translations[key],
    ...group,
  } as any;
  if (group.icon) {
    Object.defineProperty(result, "icon", {
      value: group.icon,
      enumerable: false, // this keeps icon hidden from key enumeration
      configurable: true,
      writable: true,
    });
  }
  return result;
}

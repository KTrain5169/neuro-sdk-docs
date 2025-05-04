// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { sidebar } from "./astro.sidebar";

import mdx from "@astrojs/mdx";

import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Unofficial Neuro Game SDK docs",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/KTrain5169/neuro-sdk-docs",
        },
      ],
      sidebar,
      components: {
        Sidebar: "./src/components/Sidebar.astro",
      },
    }),
    mdx(),
    preact(),
  ],
  vite: {
    resolve: {
      alias: {
        react: "preact/compat",
        "react-dom/test-utils": "preact/test-utils",
        "react-dom": "preact/compat",
        "react/jsx-runtime": "preact/jsx-runtime",
      },
    },
  },
});

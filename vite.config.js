// @ts-check

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { escape } from "html-escaper";
import { mdsvex } from "mdsvex";
import shiki from "shiki";
import { defineConfig } from "vite";

/**
 * @param {string} html
 */
function htmlToSvelte(html) {
  return `{@html \`${html.replace(/([`$])/g, "\\$1")}\`}`;
}

const processorGroup = mdsvex({
  highlight: {
    /**
     * You can use the highlighter you prefer.
     * We use shiki for example.
     */
    highlighter: async (code, lang) => {
      /**
       * Only highlight if the lang is supported.
       */
      if (
        shiki.BUNDLED_LANGUAGES.some(
          ({ id, aliases }) => id === lang || aliases?.includes(lang)
        )
      ) {
        // You can choose the highlighter you want to use.
        const highlighter = await shiki.getHighlighter({
          theme: "dracula",
        });
        return htmlToSvelte(highlighter.codeToHtml(code, { lang }));
      } else {
        // If the lang is not supported, just return the code.
        return htmlToSvelte(`<pre><code>${escape(code)}</code></pre>`);
      }
    },
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    /**
     * Separating individual svx preprocessor because it cannot parse ts correctly.
     */
    svelte({
      extensions: [".svx"],
      /**
       * Spreading processorGroup and wrap markup function because the filename
       * argument is optional in svelte but required in mdsvex.
       */
      preprocess: {
        ...processorGroup,
        markup: ({ content, filename }) =>
          processorGroup.markup({ content, filename: filename || "" }),
      },
    }),
    svelte(),
  ],
});

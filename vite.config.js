// @ts-check

import { svelte } from "@sveltejs/vite-plugin-svelte";
import cheerio from "cheerio";
import escapeHTML from "escape-html";
import { mdsvex } from "mdsvex";
import shiki from "shiki";
import { defineConfig } from "vite";

/**
 * Prevent removing leading and tailing spaces.
 * Transform `<div> foo </div>` into `<div>{' foo '}</div>`
 */
function saveSvelteHtmlText(html) {
  const $ = cheerio.load(html, {}, false);
  $("*:not(:has(*))").each(function () {
    const $el = $(this);
    const text = $el.text();
    if (!text) return;
    $el.text('{"' + text.replace(/"/, '\\"') + '"}');
  });
  return $.root().toString();
}

const processorGroup = mdsvex({
  highlight: {
    highlighter: async (code, lang) => {
      /**
       * only highlight if the lang is supported
       */
      if (shiki.BUNDLED_LANGUAGES.some(({ id }) => id === lang)) {
        const highlighter = await shiki.getHighlighter({
          theme: "dracula",
        });
        return saveSvelteHtmlText(highlighter.codeToHtml(code, { lang }));
      } else {
        return escapeHTML(code);
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

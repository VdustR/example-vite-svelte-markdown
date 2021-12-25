// @ts-check

import { svelte } from "@sveltejs/vite-plugin-svelte";
import cheerio from "cheerio";
import { mdsvex } from "mdsvex";
import shiki from "shiki";
import { defineConfig } from "vite";

const $ = cheerio.load("<div />", {}, false);

/**
 * Prevent removing leading and tailing spaces.
 * Transform `<div> foo </div>` into `<div>{' foo '}</div>`
 * @param {string} html
 */
function saveSvelteHtmlText(html) {
  return html.replace(/>( *[^<\n\r]+ *)</g, (match) => {
    const text = match.substring(1, match.length - 1);
    const unescapeText = $("<div />").html(text).text();
    return '>{"' + unescapeText.replace(/"/g, '\\"') + '"}<';
  });
}

console.log(shiki.BUNDLED_LANGUAGES);

const processorGroup = mdsvex({
  highlight: {
    highlighter: async (code, lang) => {
      /**
       * only highlight if the lang is supported
       */
      if (
        shiki.BUNDLED_LANGUAGES.some(
          ({ id, aliases }) => id === lang || aliases?.includes(lang)
        )
      ) {
        const highlighter = await shiki.getHighlighter({
          theme: "dracula",
        });
        return saveSvelteHtmlText(highlighter.codeToHtml(code, { lang }));
      } else {
        return "<pre><code>{`" + code.replace(/`/g, "\\`") + "`}</code></pre>";
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

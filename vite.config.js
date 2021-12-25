// @ts-check

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { unescape } from "html-escaper";
import { mdsvex } from "mdsvex";
import shiki from "shiki";
import { defineConfig } from "vite";

/**
 * Prevent removing leading and tailing spaces.
 * Transform `<div> foo </div>` into `<div>{' foo '}</div>`
 * @param {string} html
 */
function saveSvelteHtmlText(html) {
  return html.replace(/>( *[^<\n\r]+ *)</g, (match) => {
    const text = match.substring(1, match.length - 1);
    /**
     * We don't need escape text here but we have to transform it into a svelte
     * string.
     *
     * For example:
     *   <div> &lt;div&gt; </div>
     *   should be transformed to
     *   <div>{" <div> "}</div>
     */
    const unescapeText = unescape(text);
    return '>{"' + unescapeText.replace(/"/g, '\\"') + '"}<';
  });
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
        return saveSvelteHtmlText(highlighter.codeToHtml(code, { lang }));
      } else {
        // If the lang is not supported, just return the code.
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

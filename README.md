# Example for Svelte + TS + Vite + MDsveX

This is an example for importing Markdown files as Svelte components.

We'll use [`MDsveX`](https://github.com/pngwn/MDsveX) as our markdown pre-processor. Although there are some issues, it works pretty great for me with some workarounds.

Demo: <https://vdustr.github.io/example-vite-svelte-markdown/>

## Dependencies

- `vscode`@`1.63.2` (for example. The editor for better DX.)
- `pnpm`@`^6.24.2` (for example. Replace it with any other package manager you like)
- `vite`@`^2.7.2` (for example)
- `svelte`@`^3.44.0`
- `mdsvex`@`^0.9.8`
- `shiki`@`^0.9.15` (optional, for highlight)
- `html-escaper`@`^3.0.3` (optional, for highlight)

## Steps

You can pick any things you need only and skip the others.

### Initial

Initial a vite repo with `svelte` or `svelte-ts` template

```bash
pnpm create vite
```

### Setup MDsveX

You can append this into `vite.config.js` simply for basic functions:

```js
export default defineConfig({
  plugins: [
    svelte({
      extensions: [".svx"],
      preprocess: mdsvex(),
    }),
    svelte(),
  ],
});
```

Here the example for highlight with `shiki`. I got some problems and resolved them with workarounds.

Please check [`vite.config.js`](./vite.config.js) for more information. It might be the **MOST IMPORTANT** section in this example.

### `.svx` Extension Name Association

MDsveX use `.svx` as the default filename extension.

It's maybe not supported by the editor by default. It's a good choice that editing them in Markdown mode. Check [`.vscode/settings.json`](.vscode/settings.json) and append:

```json
{
  "files.associations": {
    "*.svx": "markdown"
  }
}
```

If you use typescript for better DX, you can also make it import `.svx` files as Svelte component. Check [`./src/vite-env.d.ts`](./src/vite-env.d.ts) and append:

```ts
declare module "*.svx" {
  export { SvelteComponentDev as default } from "svelte/internal";
}
```

## License

- Code: `mit`
- README: `cc-by-sa-4.0`

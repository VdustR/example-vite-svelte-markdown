/// <reference types="svelte" />
/// <reference types="vite/client" />

declare module "*.svx" {
  export { SvelteComponentDev as default } from "svelte/internal";
}

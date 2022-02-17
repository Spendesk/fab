'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
// language=JavaScript
exports.default = (fab_src, assets_url, env_overrides, server_context) => `
  ${fab_src}; // makes globalThis.__fab
  globalThis.__assets_url = ${JSON.stringify(assets_url)};
  globalThis.__server_context = ${JSON.stringify(server_context)};
  globalThis.__env_overrides = ${JSON.stringify(Object.fromEntries(env_overrides))}
`
//# sourceMappingURL=templateInjections.js.map

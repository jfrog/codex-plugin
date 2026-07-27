# JFrog Plugin for OpenAI Codex

Delivers the JFrog skills **and the JFrog MCP server** to OpenAI Codex.

## Install (git marketplace)

```
/plugin marketplace add jfrog/codex-plugin
/plugin install jfrog@codex-plugin
/reload-plugins
```

## MCP server

The plugin bundles the `jfrog` MCP server ([`.mcp.json`](.mcp.json)). After
installing, do two things:

1. **Set your host.** Find the install path with `codex plugin list` (the
   `jfrog@codex-plugin` row) and edit `<PATH>/.mcp.json`. Replace `<SERVER_ID>`
   in the `url` with your JFrog subdomain - for `https://mycompany.jfrog.io`
   use `mycompany` (self-hosted: replace the whole host).
2. **Log in (OAuth).** Run `codex mcp login jfrog` and finish the browser
   sign-in.

Restart Codex; `/mcp` now lists `jfrog` with its tools.

## Skills

- `jfrog` - interact with the JFrog Platform (CLI, MCP, REST/GraphQL).
- `jfrog-ai-catalog-skills` - discover, install, manage, and publish agent skills from the JFrog AI Catalog via `jf skills` and Agent Guard.
- `jfrog-package-safety-and-download` - package safety checks and Artifactory-routed downloads.

Skills are vendored from [`jfrog/jfrog-skills`](https://github.com/jfrog/jfrog-skills), pinned in `scripts/sync-skills-vendor.json`. Bump the pin and run `npm run sync-skills` to update. See [`VENDOR.md`](VENDOR.md) for the full picture.

## Development

```
npm test        # unit tests for the validator
npm run validate # lint manifests + skill frontmatter
```

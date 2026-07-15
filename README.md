# JFrog Plugin for OpenAI Codex

Delivers the JFrog skills to OpenAI Codex. **Phase 1: skills only** (no MCP yet).

## Install (git marketplace)

```
/plugin marketplace add jfrog/codex-plugin
/plugin install jfrog@codex-plugin
/reload-plugins
```

## Skills

- `jfrog` — interact with the JFrog Platform (CLI, MCP, REST/GraphQL).
- `jfrog-ai-catalog-skills` — discover, install, manage, and publish agent skills from the JFrog AI Catalog via `jf skills` and Agent Guard.
- `jfrog-package-safety-and-download` — package safety checks and Artifactory-routed downloads.

Skills are vendored from [`jfrog/jfrog-skills`](https://github.com/jfrog/jfrog-skills), pinned in `scripts/sync-skills-vendor.json`. Bump the pin and run `npm run sync-skills` to update. See [`VENDOR.md`](VENDOR.md) for the full picture.

## Development

```
npm test        # unit tests for the validator
npm run validate # lint manifests + skill frontmatter
```

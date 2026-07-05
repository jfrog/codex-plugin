# JFrog Plugin for OpenAI Codex

Delivers the JFrog skills to OpenAI Codex. **Phase 1: skills only** (no MCP yet).

## Install (git marketplace)

```
/plugin marketplace add michaelfrog/codex-jfrog-plugin
/plugin install jfrog@jfrog-codex-plugins
/reload-plugins
```

## Skills

- `jfrog` — interact with the JFrog Platform (CLI, MCP, REST/GraphQL).
- `jfrog-package-safety-and-download` — package safety checks and Artifactory-routed downloads.

Skills are vendored from [`jfrog/jfrog-skills`](https://github.com/jfrog/jfrog-skills), pinned in `sync-skills-vendor.json`. Bump the pin and run `npm run sync-skills` to update.

## Development

```
npm test        # unit tests for the validator
npm run validate # lint manifests + skill frontmatter
```

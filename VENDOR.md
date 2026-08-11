# Vendored skills

The skill packages under `skills/` are vendored from **[jfrog/jfrog-skills](https://github.com/jfrog/jfrog-skills)** and committed to `main`.

| | |
| --- | --- |
| **Repository** | https://github.com/jfrog/jfrog-skills |
| **Pinned release** | see `pin` in [`scripts/sync-skills-vendor.json`](scripts/sync-skills-vendor.json) |

Included skill directories (as of the pinned release): `jfrog/`,
`jfrog-package-safety-and-download/`, `jfrog-setup-package-managers/`,
`jfrog-ai-catalog-skills/`, `jfrog-mcp-management/` (JFrog Agent Guard MCP
management, including the Codex harness), and `jfrog-reference-architecture/`.

## Refreshing

When the upstream repo publishes a new release, refresh the vendored tree via a PR that:

1. Bumps `pin` in [`scripts/sync-skills-vendor.json`](scripts/sync-skills-vendor.json) to the new tag.
2. Re-syncs and commits the refreshed `skills/` tree.
3. Bumps `version` in [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json) so the published plugin version reflects the new skills bundle.

To regenerate the tree locally before opening the PR:

```bash
node scripts/sync-skills.mjs
```

The script reads its sibling [`sync-skills-vendor.json`](scripts/sync-skills-vendor.json), downloads the pinned upstream tarball from `codeload.github.com`, and replaces the directories listed in `paths` (today: `skills/`).

# Vendored skills

The skill packages under `skills/` are vendored from **[jfrog/jfrog-skills](https://github.com/jfrog/jfrog-skills)** and committed to `main`.

| | |
| --- | --- |
| **Repository** | https://github.com/jfrog/jfrog-skills |
| **Pinned release** | see `pin` in [`scripts/sync-skills-vendor.json`](scripts/sync-skills-vendor.json) |
| **Plugin version** | see `version` in [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json) and [`package.json`](package.json) |

Included skill directories (as of the pinned release): `jfrog/`,
`jfrog-package-curation/`, `jfrog-setup-package-managers/`,
`jfrog-ai-catalog-skills/`, `jfrog-mcp-management/` (JFrog Agent Guard MCP
management, including the Codex harness), and `jfrog-reference-architecture/`.

The README deliberately omits release numbers. The matching manifests and GitHub tags/releases are the authoritative plugin-version sources; the vendor configuration is the authoritative skills pin.

## Refreshing

When the upstream repo publishes a new release, refresh the vendored tree via a PR that:

1. Bumps `pin` in [`scripts/sync-skills-vendor.json`](scripts/sync-skills-vendor.json) to the new tag.
2. Re-syncs and commits the refreshed `skills/` tree.
3. Bumps `version` in **both** [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json) and [`package.json`](package.json) — they must match (CI enforces this) — so the published plugin version reflects the new skills bundle.

Merging the PR does not publish on its own: the version in [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json) must be bumped to a value newer than the latest release tag, which [`.github/workflows/release.yml`](.github/workflows/release.yml) enforces on every push to `main`. See the README's [Releasing](README.md#releasing) and [Updating the vendored skills](README.md#updating-the-vendored-skills) sections for the full workflow.

To regenerate the tree locally before opening the PR:

```bash
node scripts/sync-skills.mjs
```

The script reads its sibling [`sync-skills-vendor.json`](scripts/sync-skills-vendor.json), downloads the pinned upstream tarball from `codeload.github.com`, and replaces the directories listed in `paths` (today: `skills/`).

---

# Vendored modules

The `modules/` bundle is vendored from **jfrog-agent-hooks** (GHE) and committed to `main`.

| | |
| --- | --- |
| **Repository** | `github.jfrog.info/JFROG/jfrog-agent-hooks` |
| **Pinned release** | see `pin` in [`.github/scripts/sync-modules-vendor.json`](.github/scripts/sync-modules-vendor.json) |

The bundle contains harness runners (`core/`, `*-session-start.mjs`), the `package-resolution/` capability, and `assets/agents-default-conf.json`. Automated sync PRs (`chore/sync-modules-v*`) update this tree on each `jfrog-agent-hooks` release.

`hooks/hooks.json` is **not** part of the vendor slice. Sync replaces `modules/` only; this plugin owns the Codex SessionStart assembly (APR only — no Agent Guard / MCP-align scripts).

## Refreshing modules

```bash
JFROG_AGENT_HOOKS_PATH=/path/to/jfrog-agent-hooks node .github/scripts/sync-modules.mjs
```

The script reads `paths` from `sync-modules-vendor.json` (today: `["modules"]`) and replaces the whole `modules/` tree. After a local refresh, stamp `PKG_VERSION` and the pin with the official copy script if you are matching a Sync Plugins drop. A hand refresh copies bytes only; it does not bump plugin versions.

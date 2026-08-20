# Contributing to the JFrog Plugin for OpenAI Codex

Thank you for your interest in contributing! This project is maintained by JFrog and licensed under the [Apache License 2.0](LICENSE).

## Contributor License Agreement (CLA)

All contributors must sign the [JFrog CLA](https://jfrog.com/cla/) before contributions can be merged. A CLA check runs automatically on every pull request — follow the prompts to sign if you haven't already.

## How to Contribute

1. **Fork** the repository and create a feature branch from `main`.
2. Make your changes, ensuring they follow the existing code style and project conventions.
3. **Validate** locally:

```bash
npm test         # unit tests for the manifest/skill validator
npm run validate # lint the plugin manifests + skill frontmatter
```

1. **Test** by loading your clone as the plugin. The repo root is the marketplace root (`.agents/plugins/marketplace.json` registers the `jfrog` plugin):

```bash
codex plugin marketplace add /path/to/codex-plugin
codex plugin add jfrog@codex-plugin
```

Exercise the skills you changed, then browse installed plugins in the Codex TUI with `/plugins`.

1. **Commit** with a clear, descriptive message.
2. Open a **pull request** against `main` with a summary of what changed and why.

### Updating the vendored skills

The `skills/` tree is vendored from [jfrog/jfrog-skills](https://github.com/jfrog/jfrog-skills) and committed to `main` — see [`VENDOR.md`](VENDOR.md) for the full flow. To regenerate the tree locally against the pin in [`scripts/sync-skills-vendor.json`](scripts/sync-skills-vendor.json):

```bash
node scripts/sync-skills.mjs
```

This downloads the pinned upstream tarball and replaces the contents of `skills/`. Commit the result alongside the pin bump and the matching version bump (see [Releasing](#releasing)).

## Pre-release checklist

- [ ] `npm test` and `npm run validate` pass.
- [ ] `version` bumped and **identical** in both [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json) and [`package.json`](package.json) (CI enforces the match).
- [ ] No secrets, credentials, or API keys committed.
- [ ] If the skill tree changed: `pin` in [`scripts/sync-skills-vendor.json`](scripts/sync-skills-vendor.json) matches the upstream tag the new tree was generated from, and the README Prerequisites link points at that tag.
- [ ] Smoke-test: install locally with `codex plugin marketplace add /path/to/codex-plugin && codex plugin add jfrog@codex-plugin`.

## Releasing

To cut a release:

1. In your PR, bump `version` in **both** [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json) and [`package.json`](package.json) to the same, not-yet-released value. `plugin.json` is canonical; `package.json` carries its own copy, and the two are cross-checked.
2. Merge to `main`. Every push to `main` compares the manifest version against the latest release tag: if the version is newer, a release proceeds; if it matches the latest tag, the workflow fails with a clear "already released" error; if it is older, it fails with a revert warning.

The bump is reviewed in the PR that makes it. Merging without bumping the manifests fails the release rather than silently skipping or re-tagging a shipped version.

[`.github/workflows/release.yml`](.github/workflows/release.yml) reads the version from `.codex-plugin/plugin.json` (cross-checked against `package.json`), re-runs the same validation as the PR workflow, packages the tracked files at `HEAD` (minus `.github/`) into `release.zip`, and creates the `vX.Y.Z` tag as part of publishing the GitHub Release.

A PR that does not bump the version (docs, chores, or fixes that don't ship a new plugin version) will fail the release workflow on merge — bump the version only when you intend to cut a release.

## Reporting Issues

Open a [GitHub issue](https://github.com/jfrog/codex-plugin/issues) with:

- A clear title and description of the problem.
- Steps to reproduce (if applicable).
- Expected vs. actual behavior.

## Code Guidelines

- Keep changes focused — one logical change per PR.
- Follow existing patterns and naming conventions in the codebase.
- Do not commit secrets, credentials, or API keys.

## Code of Conduct

Be respectful and constructive. We are committed to providing a welcoming and inclusive experience for everyone.

## Questions?

For questions about this project's OSS status or licensing, contact ossgov@jfrog.com.

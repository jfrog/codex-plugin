# JFrog Plugin for OpenAI Codex

JFrog plugin for [OpenAI Codex](https://developers.openai.com/codex/): artifact
management, security scanning, supply-chain best practices, and Agent Guard.

## Features

The JFrog plugin provides the following capabilities, grouped by component:

| Component | Feature | Description |
| --- | --- | --- |
| **MCP** | JFrog MCP server | Bundled `jfrog` MCP server ([`.mcp.json`](.mcp.json)) at `https://<JFROG_PLATFORM_URL>/mcp`; this server signs in via OAuth (`codex mcp login jfrog`), so it needs no API key. |
| **Skill** | JFrog Platform | Interact with Artifactory repositories, builds, permissions, users, access tokens, projects, release bundles, and platform administration via the JFrog CLI and REST/GraphQL APIs. Also covers security audits, CVE lookups, and Advanced Security exposure queries. |
| **Skill** | Package curation | Check whether npm, Maven, PyPI, Go, and other packages are safe, curated, or allowed, then download them through Artifactory remote caches or curation-aware package managers. |
| **Skill** | Agent Guard | Codex manages MCPs through the JFrog Agent Guard. Through the Agent Guard you can discover, install, configure, update, and remove MCP servers from the JFrog AI Catalog approved for your project, and authenticate to remote HTTP MCPs via OAuth, API key, or bearer token. |

---

## Prerequisites

Before installing, make sure you have:

- **JFrog host URL and access token** — Your JFrog platform URL and a valid access token.
- **OpenAI Codex** — Installed, with plugin support (`codex plugin` CLI commands available).
- **Node.js** (≥ 18) — with `npx` on your `PATH` (used by the Agent Guard).
- **Skill runtime requirements** — `jf` CLI, `jq`, and `curl` on `PATH`, plus a configured JFrog instance. For the minimum versions, see the upstream skills [`Requirements`](https://github.com/jfrog/jfrog-skills/blob/v0.22.0/README.md#requirements). Configure the CLI with `jf config add` — see [Authentication](#authentication).
- **JFrog AI Catalog** (optional) — If you want to use the Agent Guard feature, your JFrog subscription needs to include the AI Catalog entitlement. Contact your JFrog account team if you're unsure whether it's enabled.
- **JFrog CLI ≥ 2.105.0** (optional) — If you want the Agent Guard to auto-resolve the credentials/server ID from the JFrog CLI configuration.
- **JFrog project** (optional) — If you want to use the Agent Guard feature.

---

## Installation

### Install the Codex plugin

Add the JFrog marketplace and install the plugin with the Codex CLI:

```bash
codex plugin marketplace add jfrog/codex-plugin
codex plugin add jfrog@codex-plugin
```

Browse installed plugins in the Codex TUI with `/plugins`.

### Local development

Test an uncommitted checkout without publishing. From (or pointing at) your clone
— the repo root is the marketplace root; `.agents/plugins/marketplace.json`
registers the `jfrog` plugin:

```bash
codex plugin marketplace add /path/to/codex-plugin
codex plugin add jfrog@codex-plugin
```

---

## Authentication

Configure the JFrog CLI so the skills and Agent Guard can reach your platform. Run
`jf login` for browser-based setup, or if you have never configured the JFrog CLI
on this machine:

1. Open your terminal.
2. Run:

   ```bash
   jf config add
   ```

3. Follow the interactive prompts to enter your JFrog platform URL and access token.

---

## JFrog Platform MCP server

The plugin bundles the `jfrog` MCP server ([`.mcp.json`](.mcp.json)). After
installing, do two things:

1. **Set your host.** Find the install path with `codex plugin list` (the
   `jfrog@codex-plugin` row) and edit `<PATH>/.mcp.json`. Replace
   `<JFROG_PLATFORM_URL>` in the `url` with your full JFrog Platform host — e.g.
   `mycompany.jfrog.io` (or your self-hosted / custom domain).
2. **Log in (OAuth).** Run `codex mcp login jfrog` and finish the browser
   sign-in.

Restart Codex; the `jfrog` MCP server and its tools are now available (verify with
`codex mcp list`).

---

## Usage

Once configured, interact with the JFrog plugin through natural language.
Examples are grouped by capability.

### JFrog Platform skill

| Ask the agent… | What happens |
| --- | --- |
| "List my Artifactory repositories." | Returns repositories via the JFrog CLI. |
| "Upload this build to Artifactory." | Publishes build artifacts and metadata. |
| "Run a security audit on this project." | Runs an Xray / Advanced Security audit and summarizes findings. |
| "Show me details on CVE-2021-23337." | Looks up CVE details in JFrog Advanced Security. |
| "Create a scoped access token for CI." | Creates an access token with the requested scope. |
| "Promote this release bundle to production." | Uses Lifecycle / Distribution APIs to promote the bundle. |

### Package curation skill

| Ask the agent… | What happens |
| --- | --- |
| "Is `lodash@4.17.21` safe to install?" | Checks JFrog Public Catalog signals and curation policy for the package. |
| "Is this Maven package approved for use?" | Checks curation entitlement and policy for the requested package. |
| "Download `requests` via JFrog." | Resolves the package through an Artifactory remote cache or curation-aware package manager. |

### MCP server management (Agent Guard)

| Ask the agent… | What happens |
| --- | --- |
| "Which MCP servers can I install?" | Returns all MCP servers approved for your current project that you can install. |
| "What MCP servers do I already have?" | Returns only the MCP servers already installed on your machine. |
| "Show me the details for the filesystem MCP server." | Returns detailed metadata, required configuration (environment variables, runtime arguments), and active tool policies for a given server. |
| "Add the GitHub MCP server." | Installs an approved MCP server and syncs its tool policies locally. Secrets are requested via a CLI command — never in chat. |
| "Update the environment variables for the Slack MCP." | Replaces the configuration for an already-installed server without removing and reinstalling it. |
| "Remove the Slack MCP server." | Removes the server and its stored credentials from your local setup. Changes apply immediately. |
| "Log in to the remote Jira MCP server using OAuth." | Authenticates with a remote HTTP-based MCP server (OAuth, API key, or bearer token). |

### How secrets are handled

When an MCP server requires a sensitive configuration value, the agent cannot set
it directly. Instead, it returns a CLI command for you to copy and run in your
terminal. Secrets such as API keys, tokens, and connection strings are never
exposed in the agent chat history.

---

## Troubleshooting

See the [JFrog MCP Registry troubleshooting guide](https://docs.jfrog.com/ai-ml/docs/mcp-registry-troubleshooting).

---

## Updating the vendored skills

The `skills/` tree is vendored from
[`jfrog/jfrog-skills`](https://github.com/jfrog/jfrog-skills) at the version
pinned in [`scripts/sync-skills-vendor.json`](scripts/sync-skills-vendor.json).
To pull a newer upstream release into this repo:

1. Bump `pin` in `scripts/sync-skills-vendor.json` to the new tag (e.g. `v0.23.0`).
2. Re-sync and commit the refreshed tree:

   ```bash
   node scripts/sync-skills.mjs
   ```

   It downloads the pinned tarball from `codeload.github.com` and replaces the
   directories listed in `paths` (today: `skills/`).
3. Bump `version` in both [`.codex-plugin/plugin.json`](.codex-plugin/plugin.json)
   and [`package.json`](package.json) (they must match — CI enforces this) so the
   published plugin reflects the new skills bundle.
4. Update the pinned-version link in the [Prerequisites](#prerequisites) section so the
   skill runtime requirements point at the new tag.
5. Commit the pin bump, the regenerated `skills/` tree, the version bump, and the
   README link bump together, and open a PR whose merge commit subject carries a
   `[patch]` / `[minor]` / `[major]` marker (see [Releasing](#releasing)).

See [`VENDOR.md`](VENDOR.md) for the full picture.

---

## Releasing

Releases are cut automatically by [`.github/workflows/release.yml`](.github/workflows/release.yml)
when a commit lands on `main` whose **subject line** contains a
`[major]` / `[minor]` / `[patch]` marker. The workflow reads the version from
`.codex-plugin/plugin.json` (cross-checked against `package.json`), refuses to
re-release an existing tag, and publishes a GitHub Release `v<version>` with a
zipped artifact. A version is released only when both a manifest bump **and** a
marker commit reach `main`.

---

## Development

```
npm test         # unit tests for the validator
npm run validate # lint manifests + skill frontmatter
```

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for development workflow and
pull-request expectations.

## Security

See [`SECURITY.md`](SECURITY.md) for how to report vulnerabilities.

## License

Licensed under the [Apache License 2.0](LICENSE).

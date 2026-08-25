# Install JFrog Agent Plugin for OpenAI Codex

> **Web publication source.** Publish to `https://docs.jfrog.com/ai-ml/docs/codex` (and add to the JFrog Agent Plugins index). Canonical shared flow: [Shared install, verify, and recovery](https://github.com/jfrog/claude-plugin/blob/main/docs/shared-install-and-verify.md).

Install and configure the JFrog Agent Plugin for [OpenAI Codex](https://developers.openai.com/codex/), including JFrog Agent Skills, the bundled JFrog Platform MCP server, and Agent Guard.

## What's included

| Component | Description |
| --- | --- |
| **JFrog Skills** | Vendored from [jfrog/jfrog-skills](https://github.com/jfrog/jfrog-skills): platform operations, package safety, and AI Catalog workflows. |
| **`jfrog-init`** | Guided setup and readiness check — detects the JFrog CLI, config, MCP, and project, and reports what is missing. |
| **JFrog Platform MCP** | Bundled remote MCP at `https://<your-host>/mcp` (OAuth via `codex mcp login jfrog`). |
| **Agent Guard** | Discover, install, and manage MCP servers approved in the JFrog AI Catalog. |

## Prerequisites

See the [shared prerequisites](https://github.com/jfrog/claude-plugin/blob/main/docs/shared-install-and-verify.md#common-prerequisites-all-harnesses). Codex-specific additions:

- **OpenAI Codex CLI** with plugin support (`codex plugin` commands available).
- **Node.js ≥ 18** with `npx` on `PATH`.

## Install the JFrog Agent Plugin for Codex

The plugin is served from the public GitHub repo as a **Git marketplace** (`jfrog/codex-plugin`).

1. In a regular terminal (not inside the Codex TUI), add the marketplace and install:

   ```bash
   codex plugin marketplace add jfrog/codex-plugin
   codex plugin add jfrog@codex-plugin
   ```

2. **Restart Codex** so the plugin and bundled MCP load.

3. **Run initialization.** Invoke the `jfrog-init` skill in Codex. It detects Node.js,
   the JFrog CLI, your server config, the MCP registration, and project resolution,
   then walks you through whatever is missing. This is the same initialization step
   described in the [shared guide](https://github.com/jfrog/claude-plugin/blob/main/docs/shared-install-and-verify.md).

   If you prefer to configure manually, the equivalent steps are:

   ```bash
   jf config add
   ```

   then find the install path with `codex plugin list` (row `jfrog@codex-plugin`), edit
   `<install-path>/.mcp.json` to replace `<JFROG_PLATFORM_URL>` with your platform host
   (for example `mycompany.jfrog.io`), and run `codex mcp login jfrog` to complete
   browser OAuth.

4. **Restart Codex again** after initialization or MCP edits.

## Verify (required)

Do not skip verification — treat this as part of installation.

1. `codex plugin list` — `jfrog@codex-plugin` is installed and enabled.
2. In the Codex TUI, run `/plugins` — the JFrog plugin lists its skills (`jfrog` and others).
3. `codex mcp list` — server `jfrog` is listed and connected after OAuth.
4. `jf rt ping` — succeeds for your configured JFrog server.

## Codex-specific notes

- Run `codex plugin list` from a **regular terminal**, not from inside the Codex session, when you need filesystem paths for `.mcp.json`.
- Browse installed plugins and their skills in the Codex TUI with `/plugins`.
- The bundled MCP host is set by editing the plugin's `.mcp.json`, not by exporting a shell variable — Codex reads `<JFROG_PLATFORM_URL>` from that file.

## Recovery

If MCP tools are missing after install, follow the [shared recovery playbook](https://github.com/jfrog/claude-plugin/blob/main/docs/shared-install-and-verify.md#recovery-playbook). Setting `JFROG_URL` alone after a partial setup does **not** replace editing the bundled `.mcp.json` and completing `codex mcp login jfrog`.

## Related topics

- [JFrog Agent Plugins](https://docs.jfrog.com/ai-ml/docs/jfrog-plugins)
- [Claude Code](https://docs.jfrog.com/ai-ml/docs/claude-code)
- [VS Code](https://docs.jfrog.com/ai-ml/docs/vs-code)
- [Cursor](https://docs.jfrog.com/ai-ml/docs/cursor)
- [OpenCode](https://docs.jfrog.com/ai-ml/docs/opencode)
- [Troubleshoot Plugins](https://docs.jfrog.com/ai-ml/docs/troubleshoot-plugins)
- [Using the MCP Registry with Agent Guard](https://docs.jfrog.com/ai-ml/docs/configure-coding-agents)

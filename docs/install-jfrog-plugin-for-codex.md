# Install JFrog Agent Plugin for OpenAI Codex

> **Web publication source.** Publish to `https://docs.jfrog.com/ai-ml/docs/codex` (and add to the JFrog Agent Plugins index).

Install and configure the JFrog Agent Plugin for [OpenAI Codex](https://developers.openai.com/codex/), including JFrog Agent Skills, the bundled JFrog Platform MCP server, and Agent Guard.

## What's included

| Component | Description |
| --- | --- |
| **JFrog Skills** | Vendored from [jfrog/jfrog-skills](https://github.com/jfrog/jfrog-skills): platform operations, package safety, and AI Catalog workflows. |
| **`jfrog-init`** | Guided setup and readiness check — detects the JFrog CLI, config, MCP, and project, and reports what is missing. |
| **JFrog Platform MCP** | Bundled remote MCP at `https://<your-host>/mcp` (OAuth via `codex mcp login jfrog`). |
| **Agent Guard** | Discover, install, and manage MCP servers approved in the JFrog AI Catalog. |

## Prerequisites

| Requirement | Notes |
| --- | --- |
| JFrog Platform instance | You can authenticate against it (URL + token or browser login). |
| OpenAI Codex CLI | Plugin support (`codex plugin` commands) must be available. |
| Node.js ≥ 18 | With `npx` on `PATH` (used by Agent Guard and `jfrog-init`). |
| `jf`, `jq`, `curl` on `PATH` | Required for JFrog skills at runtime. Configure the CLI with `jf config add` or `jf login`. |
| JFrog AI Catalog (optional) | Required only for Agent Guard MCP catalog features. |

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
   then walks you through whatever is missing.

   If you prefer to configure manually, the equivalent steps are:

   ```bash
   jf config add
   ```

   then find the install path with `codex plugin list` (row `jfrog@codex-plugin`), edit
   `<install-path>/.mcp.json` to replace `<JFROG_PLATFORM_URL>` with your platform host
   (for example `mycompany.jfrog.io`), and run `codex mcp login jfrog` to complete
   browser OAuth.

4. **Restart Codex again** after initialization or MCP edits.

The bundled MCP host is set by editing the plugin's `.mcp.json`, not by exporting a
shell variable. Setting `JFROG_URL` or `JFROG_PLATFORM_URL` in the environment does
not substitute that placeholder, and does not repair a failed `jfrog-init`.

## Verify (required)

Do not skip verification — treat this as part of installation.

1. `codex plugin list` — `jfrog@codex-plugin` is installed and enabled.
2. In the Codex TUI, run `/plugins` — the JFrog plugin lists its skills (`jfrog` and others).
3. `codex mcp list` — server `jfrog` is listed and connected after OAuth.
4. `jf rt ping` — succeeds for your configured JFrog server.

## Codex notes

- Run `codex plugin list` from a **regular terminal**, not from inside the Codex session, when you need filesystem paths for `.mcp.json`.
- Browse installed plugins and their skills in the Codex TUI with `/plugins`.

## Recovery

| Symptom | Do this | Do **not** do this |
| --- | --- | --- |
| MCP missing after install | Run `jfrog-init`, edit `<install-path>/.mcp.json` if the host is still a placeholder, run `codex mcp login jfrog`, **restart Codex**, then `codex mcp list`. | Assume exporting `JFROG_URL` will register MCP. |
| `jfrog-init` stopped at CLI/auth | Follow the skill prompt (`jf config add`, web login, or token path), then **re-run `jfrog-init`**. | Skip init and only export env vars. |
| Placeholder still in `.mcp.json` | Replace `<JFROG_PLATFORM_URL>` with your host, run `codex mcp login jfrog`, restart. | Reinstall the plugin when only the host placeholder is wrong. |
| Plugin not listed | Re-run `codex plugin add jfrog@codex-plugin` from a regular terminal, then restart Codex. | Run install commands from inside the Codex TUI. |

## Related topics

- [JFrog Agent Plugins](https://docs.jfrog.com/ai-ml/docs/jfrog-plugins)
- [Troubleshoot Plugins](https://docs.jfrog.com/ai-ml/docs/troubleshoot-plugins)
- [Using the MCP Registry with Agent Guard](https://docs.jfrog.com/ai-ml/docs/configure-coding-agents)
